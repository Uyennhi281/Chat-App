from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.user import UserDB
from schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


# ─────────────────────────────────────────
# POST /users  – tạo user mới
# ─────────────────────────────────────────
@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    # Kiểm tra email đã tồn tại chưa
    existing = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được đăng ký"
        )

    # ⚠️ Tạm thời lưu plaintext để demo – Session 9 sẽ dùng bcrypt hash
    new_user = UserDB(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=payload.password,  # TODO: hash in session 9
        role=payload.role or "customer",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ─────────────────────────────────────────
# GET /users  – danh sách users (safe fields)
# ─────────────────────────────────────────
@router.get("", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db)):
    users = db.query(UserDB).all()
    return users  # password_hash tự động bị ẩn bởi UserRead schema


# ─────────────────────────────────────────
# GET /users/{id}  – chi tiết user
# ─────────────────────────────────────────
@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy user với id={user_id}"
        )
    return user