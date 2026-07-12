from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.order import OrderDB, OrderItemDB
from schemas.order import (
    CheckoutRequest, OrderRead, OrderItemRead,
    OrderSummary, OrderStatusUpdate, OrderItemQuantityUpdate,
)
from auth.deps import get_current_user, require_admin

router = APIRouter(prefix="/orders", tags=["orders"])


# ── Helper: convert OrderDB → OrderRead ──────────────────────
def order_to_read(order: OrderDB) -> OrderRead:
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
    )


# ── POST /orders/checkout ────────────────────────────────────
@router.post("/checkout", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def checkout_order(
    payload: CheckoutRequest,
    db:      Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    # Tính tổng tiền
    total_amount = sum(item.price * item.quantity for item in payload.items)

    try:
        # Tạo order
        order = OrderDB(
            user_id=user.id,
            status="PLACED",
            total_amount=total_amount,
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

    return order_to_read(order)


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
    return order_to_read(order)


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
    return order_to_read(order)


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

    # Chỉ chính chủ hoặc ADMIN được xem
    if order.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not allowed")

    return order_to_read(order)