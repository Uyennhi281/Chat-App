import hashlib
import hmac
import urllib.parse
import uuid
from datetime import datetime, timezone, timedelta

import httpx
import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Any
from sqlalchemy.orm import Session


from auth.deps import get_current_user
from config import settings
from database import get_db
from models.order import OrderDB
from models.payment import PaymentDB

router = APIRouter(prefix="/payments", tags=["payments"])
stripe.api_key = settings.stripe_secret_key


# ── Schemas ──────────────────────────────────────────────────
class PaymentRequest(BaseModel):
    order_id: int


class ConfirmRequest(BaseModel):
    order_id: Any        # Đổi thành Any hoặc str để chấp nhận cả số "7" lẫn chuỗi dài "7175714" từ Frontend
    provider: str
    amount: Optional[float] = None  # Thêm Optional nếu có để không bị lỗi 422 khi thiếu
    status: Optional[str] = None


# ── Helper: validate order ───────────────────────────────────
def get_validated_order(order_id: int, user, db: Session) -> OrderDB:
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")
    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Order already paid")
    return order


# ────────────────────────────────────────────────────────────
# STRIPE
# ────────────────────────────────────────────────────────────
@router.post("/stripe/create-session")
def create_stripe_session(
    body: PaymentRequest,
    db:   Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = get_validated_order(body.order_id, user, db)

    try:
        # Tạo line_items từ order items
        line_items = [
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": item.product_name},
                    "unit_amount": int(item.product_price * 0.04),  # VND → USD (approximate)
                },
                "quantity": item.quantity,
            }
            for item in order.items
        ]

        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{settings.stripe_success_url}?order_id={order.id}",
            cancel_url=f"{settings.stripe_cancel_url}?order_id={order.id}",
        )

        # Lưu payment record
        payment = PaymentDB(
            order_id=order.id,
            provider="stripe",
            amount=order.total_amount,
            status="PENDING",
            provider_session_id=session.id,
        )
        db.add(payment)
        db.commit()

        return {"url": session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ────────────────────────────────────────────────────────────
# PAYPAL
# ────────────────────────────────────────────────────────────
async def get_paypal_token() -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.paypal_base_url}/v1/oauth2/token",
            auth=(settings.paypal_client_id, settings.paypal_client_secret),
            data={"grant_type": "client_credentials"},
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


@router.post("/paypal/create-order")
async def create_paypal_order(
    body: PaymentRequest,
    db:   Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = get_validated_order(body.order_id, user, db)

    try:
        token = await get_paypal_token()
        amount_usd = round(order.total_amount * 0.000042, 2)  # VND → USD (rough)

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.paypal_base_url}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "intent": "CAPTURE",
                    "purchase_units": [{
                        "amount": {
                            "currency_code": "USD",
                            "value": str(amount_usd),
                        },
                        "description": f"ShopHub Order #{order.id}",
                    }],
                    "application_context": {
                        "return_url": f"{settings.paypal_return_url}?order_id={order.id}",
                        "cancel_url": f"{settings.paypal_cancel_url}?order_id={order.id}",
                    },
                },
            )
            resp.raise_for_status()
            paypal_order = resp.json()

        # Tìm approve URL
        approve_url = next(
            (link["href"] for link in paypal_order["links"] if link["rel"] == "approve"),
            None,
        )
        if not approve_url:
            raise HTTPException(status_code=500, detail="Cannot get PayPal approve URL")

        # Lưu payment record
        payment = PaymentDB(
            order_id=order.id,
            provider="paypal",
            amount=order.total_amount,
            status="PENDING",
            provider_session_id=paypal_order["id"],
        )
        db.add(payment)
        db.commit()

        return {"approve_url": approve_url, "paypal_order_id": paypal_order["id"]}

    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"PayPal error: {str(e)}")


# ────────────────────────────────────────────────────────────
# VNPAY
# ────────────────────────────────────────────────────────────
def hmac_sha512(key: str, data: str) -> str:
    byte_key = key.encode("utf-8")
    byte_data = data.encode("utf-8")
    return hmac.new(byte_key, byte_data, hashlib.sha512).hexdigest()


@router.post("/vnpay/create-url")
def create_vnpay_url(
    body: PaymentRequest,
    db:   Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = get_validated_order(body.order_id, user, db)

    # 1. Cấu hình múi giờ Việt Nam (GMT+7) để tránh lỗi lệch giờ trên server
    tz_vn = timezone(timedelta(hours=7))
    now_vn = datetime.now(tz_vn)

    # Tạo các tham số
    vnp_TxnRef = f"ORD_{order.id}_{int(now_vn.timestamp())}"

    vnp_CreateDate = now_vn.strftime("%Y%m%d%H%M%S")
    vnp_Amount = int(order.total_amount * 100)  # VNPay nhân 100
    

    # 2. Build params dictionary
    vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': settings.vnpay_tmn_code,
        'vnp_Amount': str(vnp_Amount),  # Ép về string để đồng nhất kiểu dữ liệu
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': f"Thanh toan don hang {order.id}",
        'vnp_OrderType': 'other',
        'vnp_Locale': 'vn',
        'vnp_ReturnUrl': settings.vnpay_return_url,
        'vnp_IpAddr': '127.0.0.1',
        'vnp_CreateDate': vnp_CreateDate,
    }

    # 3. Sắp xếp params theo alphabet (A-Z)
    sorted_params = sorted(vnp_Params.items())
    
    # Dùng quote_plus để biến khoảng trắng thành dấu + (Khắc phục lỗi lệch hash vnp_OrderInfo)
    hash_data = urllib.parse.urlencode(sorted_params, quote_via=urllib.parse.quote_plus)
    
    # 5. Tạo secure hash với HMACSHA512
    secure_hash = hmac.new(
        settings.vnpay_hash_secret.encode('utf-8'),
        hash_data.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

    # 6. Build final URL: Ghép trực tiếp hash_data (đã sắp xếp & encode) và secure_hash
    payment_url = f"{settings.vnpay_base_url}?{hash_data}&vnp_SecureHash={secure_hash}"

    # Lưu DB
    payment = PaymentDB(
    order_id=order.id,
    provider="vnpay",
    amount=order.total_amount,
    status="PENDING",
    provider_session_id=f"{order.id}|{vnp_TxnRef}",  # Lưu cả 2 ID
)
    db.add(payment)
    db.commit()


    return {"url": payment_url, "txn_ref": vnp_TxnRef}


# ────────────────────────────────────────────────────────────
# CONFIRM (Manual webhook - update order status)
# ────────────────────────────────────────────────────────────
@router.post("/confirm")  # (Hoặc /payments/confirm)
def confirm_payment(
    body: ConfirmRequest,
    db:   Session = Depends(get_db),
    user=Depends(get_current_user),
):
    print("=== DEBUG ĐÃ VÀO ĐƯỢC HÀM CONFIRM ===")
    print("Mã Frontend gửi lên:", body.order_id)

    # 1. Tra cứu thử trong PaymentDB bằng nguyên chuỗi gửi lên
    payment = (
        db.query(PaymentDB)
        .filter(PaymentDB.provider_session_id == str(body.order_id))
        .order_by(PaymentDB.id.desc())
        .first()
    )
    
    real_order_id = None
    if payment:
        real_order_id = payment.order_id
    else:
        # 2. BÓC TÁCH ID SIÊU THÔNG MINH (Xử lý chuẩn cho "ORD_8_1784200390")
        str_id = str(body.order_id)
        if str_id.startswith("ORD_"):
            # Cắt bỏ chữ "ORD_", sau đó lấy số đứng trước dấu "_" tiếp theo
            # "ORD_8_1784200390" -> lấy được số 8
            parts = str_id.split("_")
            if len(parts) >= 2 and parts[1].isdigit():
                real_order_id = int(parts[1])
        elif str_id.isdigit():
            real_order_id = int(str_id)
        else:
            # Nếu không tách được số thì không được query vào bảng order (Tránh lỗi PostgreSQL 500)
            raise HTTPException(status_code=400, detail=f"Mã giao dịch không hợp lệ: {str_id}")

    print("ID đơn hàng thật sau khi bóc tách là:", real_order_id)

    # 3. Query đơn hàng số 8 (Chuẩn Integer 100%, PostgreSQL không thể báo lỗi nữa!)
    order = db.query(OrderDB).filter(OrderDB.id == real_order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order ID {real_order_id} not found in DB")

    if order.status == "PAID":
        return {"message": "Order already paid", "order_id": order.id}

    # Cập nhật trạng thái
    order.status = "PAID"
    
    if not payment:
        payment = (
            db.query(PaymentDB)
            .filter(PaymentDB.order_id == real_order_id)
            .order_by(PaymentDB.id.desc())
            .first()
        )
        
    if payment:
        payment.status = "SUCCEEDED"

    db.commit()
    return {"message": "Payment confirmed", "order_id": order.id, "provider": body.provider}