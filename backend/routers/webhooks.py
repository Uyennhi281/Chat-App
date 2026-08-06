"""
Webhook nhận cập nhật trạng thái real-time từ GHN (Session 16 - Yêu cầu nâng cao 1).

LƯU Ý: dự án chưa có tài khoản GHN thật nên endpoint này chưa được GHN gọi thật sự.
Endpoint đã viết đầy đủ logic (tra cứu đơn theo tracking_code, map trạng thái, cập nhật DB)
và có thể test thủ công bằng curl - xem ví dụ payload bên dưới. Khi có tài khoản GHN,
chỉ cần cấu hình URL này (qua Ngrok) trên trang quản trị GHN là chạy được ngay.

Ví dụ test thủ công:
curl -X POST http://localhost:8000/webhooks/ghn \
  -H "Content-Type: application/json" \
  -d '{"OrderCode": "GHN123", "Status": "delivered"}'
"""

from fastapi import APIRouter, Header, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from database import SessionLocal
from models.order import OrderDB
from config import settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger("ghn_webhook")

# Map trạng thái GHN → trạng thái nội bộ ShopHub
GHN_STATUS_MAP = {
    "ready_to_pick":  "PROCESSING",
    "picking":        "PROCESSING",
    "picked":         "SHIPPED",
    "storing":        "SHIPPED",
    "transporting":   "SHIPPED",
    "delivering":     "SHIPPED",
    "delivered":      "COMPLETED",
    "delivery_fail":  "FAILED",
    "return":         "FAILED",
    "cancel":         "CANCELED",
}


@router.post("/ghn", status_code=status.HTTP_200_OK)
async def ghn_webhook(
    request: Request,
    x_ghn_signature: Optional[str] = Header(None),
):
    # Xác thực bằng khóa bí mật nếu đã cấu hình (đặt cùng giá trị trên trang quản trị GHN)
    if settings.ghn_webhook_secret:
        if x_ghn_signature != settings.ghn_webhook_secret:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")
    else:
        logger.warning("GHN_WEBHOOK_SECRET chưa được cấu hình - bỏ qua xác thực chữ ký (chỉ nên dùng khi dev/test)")

    body = await request.json()
    tracking_code = body.get("OrderCode") or body.get("order_code")
    ghn_status    = body.get("Status") or body.get("status")

    if not tracking_code or not ghn_status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Thiếu OrderCode hoặc Status trong payload")

    internal_status = GHN_STATUS_MAP.get(ghn_status)
    if not internal_status:
        logger.warning(f"Không nhận diện được trạng thái GHN: {ghn_status}")
        return {"message": "Trạng thái không được xử lý, bỏ qua", "ghn_status": ghn_status}

    db: Session = SessionLocal()
    try:
        order = db.query(OrderDB).filter(OrderDB.tracking_code == tracking_code).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Không tìm thấy đơn hàng với mã vận đơn {tracking_code}")

        order.status = internal_status
        db.commit()
        return {"message": "Cập nhật trạng thái thành công", "order_id": order.id, "status": internal_status}
    finally:
        db.close()
