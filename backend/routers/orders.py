from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from models.user import UserDB
from schemas.order import (
    CheckoutRequest, OrderRead, OrderItemRead,
    OrderSummary, OrderStatusUpdate, OrderItemQuantityUpdate,
    ShipperDeliverRequest, ShipperLocation,
)
from auth.deps import get_current_user, require_admin, require_shipper
from services.shipping_strategy import get_shipping_strategy, ShippingProviderNotConfigured

router = APIRouter(prefix="/orders", tags=["orders"])


# ── Helper: convert OrderDB → OrderRead ──────────────────────
def order_to_read(order: OrderDB, db: Session) -> OrderRead:
    shipper_name = None
    if order.shipper_id:
        shipper = db.query(UserDB).filter(UserDB.id == order.shipper_id).first()
        shipper_name = shipper.full_name if shipper else None

    return OrderRead(
        id=order.id,
        status=order.status,
        total_amount=order.total_amount,
        created_at=str(order.created_at),
        items=[
            OrderItemRead(
                id=oi.id,
                product_id=oi.product_id,
                product_name=oi.product_name,
                product_price=oi.product_price,
                quantity=oi.quantity,
                line_total=oi.line_total,
            )
            for oi in order.items
        ],
        shipping_provider=order.shipping_provider,
        tracking_code=order.tracking_code,
        shipping_fee=order.shipping_fee,
        shipper_id=order.shipper_id,
        shipper_name=shipper_name,
        delivery_lat=order.delivery_lat,
        delivery_lng=order.delivery_lng,
    )


# ── POST /orders/checkout ────────────────────────────────────
@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payload: CheckoutRequest,
    db:      Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role == "SHIPPER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản Shipper không thể đặt hàng",
        )

    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # Tính tổng tiền hàng + phí ship
    items_total = sum(item.price * item.quantity for item in payload.items)
    total_amount = items_total + payload.shipping_fee

    # Trường hợp GHN: tạo đơn bên đối tác để lấy tracking_code (Task 3, docx Session 16)
    tracking_code = None
    if payload.shipping_provider == "GHN":
        strategy = get_shipping_strategy("GHN")
        try:
            result = strategy.create_order(items=[i.dict() for i in payload.items])
            tracking_code = result.get("tracking_code")
        except ShippingProviderNotConfigured as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        # Tạo order
        order = OrderDB(
            user_id=user.id,
            status="PROCESSING",
            total_amount=total_amount,
            shipping_provider=payload.shipping_provider,
            shipping_fee=payload.shipping_fee,
            tracking_code=tracking_code,
        )
        db.add(order)
        db.flush()  # lấy order.id trước khi commit

        # Tạo order items
        for item in payload.items:
            order_item = OrderItemDB(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.name,
                product_price=item.price,
                quantity=item.quantity,
                line_total=item.price * item.quantity,
            )
            db.add(order_item)

        db.commit()
        db.refresh(order)

    except Exception:
        db.rollback()
        raise

    return order_to_read(order, db)


# ── GET /orders/my – lịch sử đơn hàng ──────────────────────
@router.get("/my", response_model=List[OrderSummary])
def get_my_orders(
    db:   Session = Depends(get_db),
    user=Depends(get_current_user),
):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.user_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [
        OrderSummary(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=str(o.created_at),
            shipping_provider=o.shipping_provider,
            tracking_code=o.tracking_code,
        )
        for o in orders
    ]


# ── GET /orders/admin/all – ADMIN xem tất cả ────────────────
@router.get(
    "/admin/all",
    response_model=List[OrderSummary],
    dependencies=[Depends(require_admin)],
)
def get_all_orders_for_admin(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(desc(OrderDB.created_at)).all()
    return [
        OrderSummary(
            id=o.id,
            status=o.status,
            total_amount=o.total_amount,
            created_at=str(o.created_at),
            shipping_provider=o.shipping_provider,
            tracking_code=o.tracking_code,
        )
        for o in orders
    ]


# ── PATCH /orders/{id}/status – ADMIN đổi trạng thái ────────
@router.patch(
    "/{order_id}/status",
    response_model=OrderRead,
    dependencies=[Depends(require_admin)],
)
def admin_update_order_status(
    order_id: int,
    payload:  OrderStatusUpdate,
    db:       Session = Depends(get_db),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order_to_read(order, db)


# ── PATCH /orders/{id}/items/quantity – ADMIN đổi số lượng ──
@router.patch(
    "/{order_id}/items/quantity",
    response_model=OrderRead,
    dependencies=[Depends(require_admin)],
)
def admin_update_order_item_quantity(
    order_id: int,
    payload:  OrderItemQuantityUpdate,
    db:       Session = Depends(get_db),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    item = db.query(OrderItemDB).filter(
        OrderItemDB.id == payload.item_id,
        OrderItemDB.order_id == order_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    # Cập nhật quantity + line_total
    item.quantity   = payload.quantity
    item.line_total = item.quantity * item.product_price

    # Tính lại tổng tiền
    order.total_amount = sum(oi.line_total for oi in order.items)

    db.commit()
    db.refresh(order)
    return order_to_read(order, db)


# ── GET /orders/shipper/available – SHIPPER xem đơn IN_HOUSE đang chờ nhận ──
@router.get(
    "/shipper/available",
    response_model=List[OrderSummary],
    dependencies=[Depends(require_shipper)],
)
def get_available_orders_for_shipper(db: Session = Depends(get_db)):
    orders = (
        db.query(OrderDB)
        .filter(
            OrderDB.shipping_provider == "IN_HOUSE",
            OrderDB.status == "PROCESSING",
            OrderDB.shipper_id.is_(None),
        )
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [
        OrderSummary(
            id=o.id, status=o.status, total_amount=o.total_amount,
            created_at=str(o.created_at), shipping_provider=o.shipping_provider,
            tracking_code=o.tracking_code,
        )
        for o in orders
    ]


# ── GET /orders/shipper/my – Đơn Shipper đang/đã giao ──────
@router.get(
    "/shipper/my",
    response_model=List[OrderSummary],
    dependencies=[Depends(require_shipper)],
)
def get_my_shipper_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = (
        db.query(OrderDB)
        .filter(OrderDB.shipper_id == user.id)
        .order_by(desc(OrderDB.created_at))
        .all()
    )
    return [
        OrderSummary(
            id=o.id, status=o.status, total_amount=o.total_amount,
            created_at=str(o.created_at), shipping_provider=o.shipping_provider,
            tracking_code=o.tracking_code,
        )
        for o in orders
    ]


# ── PATCH /orders/{id}/claim – SHIPPER nhận đơn (PROCESSING → SHIPPED) ──
@router.patch(
    "/{order_id}/claim",
    response_model=OrderRead,
    dependencies=[Depends(require_shipper)],
)
def claim_order(
    order_id: int,
    payload:  ShipperLocation,
    db:       Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.shipping_provider != "IN_HOUSE":
        raise HTTPException(status_code=400, detail="Đơn hàng không thuộc đội xe nội bộ")
    if order.shipper_id is not None:
        raise HTTPException(status_code=400, detail="Đơn hàng đã có Shipper khác nhận")
    if order.status != "PROCESSING":
        raise HTTPException(status_code=400, detail=f"Không thể nhận đơn ở trạng thái {order.status}")

    order.shipper_id = user.id
    order.status = "SHIPPED"
    if payload.lat is not None: order.delivery_lat = payload.lat
    if payload.lng is not None: order.delivery_lng = payload.lng

    db.commit()
    db.refresh(order)
    return order_to_read(order, db)


# ── PATCH /orders/{id}/deliver – SHIPPER báo kết quả giao hàng ──
@router.patch(
    "/{order_id}/deliver",
    response_model=OrderRead,
    dependencies=[Depends(require_shipper)],
)
def deliver_order(
    order_id: int,
    payload:  ShipperDeliverRequest,
    db:       Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.shipper_id != user.id:
        raise HTTPException(status_code=403, detail="Bạn không phải Shipper phụ trách đơn này")
    if order.status != "SHIPPED":
        raise HTTPException(status_code=400, detail=f"Không thể cập nhật đơn ở trạng thái {order.status}")

    order.status = "COMPLETED" if payload.success else "FAILED"
    if payload.location:
        if payload.location.lat is not None: order.delivery_lat = payload.location.lat
        if payload.location.lng is not None: order.delivery_lng = payload.location.lng

    db.commit()
    db.refresh(order)
    return order_to_read(order, db)


# ── GET /orders/{id} – chi tiết 1 đơn ───────────────────────
@router.get("/{order_id}", response_model=OrderRead)
def get_order_by_id(
    order_id: int,
    db:       Session = Depends(get_db),
    user=Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Chỉ chính chủ, Shipper phụ trách, hoặc ADMIN được xem
    is_owner   = order.user_id == user.id
    is_shipper = order.shipper_id == user.id
    if not is_owner and not is_shipper and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")

    return order_to_read(order, db)