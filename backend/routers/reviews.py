from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from database import get_db
from models.review import ReviewDB
from models.product import ProductDB
from models.user import UserDB
from schemas.review import ReviewCreate, ReviewRead
from auth.deps import get_current_user

router = APIRouter(tags=["reviews"])


def review_to_read(review: ReviewDB, user_name: str) -> ReviewRead:
    return ReviewRead(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=user_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


# ── GET /products/{id}/reviews – công khai, ai cũng xem được ──
@router.get("/products/{product_id}/reviews", response_model=List[ReviewRead])
def list_reviews(product_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(ReviewDB, UserDB.full_name)
        .join(UserDB, ReviewDB.user_id == UserDB.id)
        .filter(ReviewDB.product_id == product_id)
        .order_by(desc(ReviewDB.created_at))
        .all()
    )
    return [review_to_read(review, full_name) for review, full_name in rows]


# ── POST /products/{id}/reviews – chỉ khách hàng đã đăng nhập ──
@router.post(
    "/products/{product_id}/reviews",
    response_model=ReviewRead,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    product_id: int,
    payload: ReviewCreate,
    db:      Session = Depends(get_db),
    user:    UserDB = Depends(get_current_user),
):
    if user.role in ("ADMIN", "SHIPPER"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ khách hàng mới có thể đánh giá sản phẩm",
        )

    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")

    existing = (
        db.query(ReviewDB)
        .filter(ReviewDB.product_id == product_id, ReviewDB.user_id == user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá sản phẩm này rồi")

    review = ReviewDB(
        product_id=product_id,
        user_id=user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review_to_read(review, user.full_name)


# ── DELETE /reviews/{id} – chủ đánh giá hoặc ADMIN ──
@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db:        Session = Depends(get_db),
    user:      UserDB = Depends(get_current_user),
):
    review = db.query(ReviewDB).filter(ReviewDB.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá")
    if review.user_id != user.id and user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Không có quyền xóa đánh giá này")

    db.delete(review)
    db.commit()
