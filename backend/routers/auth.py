from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models.user import UserDB
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AuthUser
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(tags=["auth"])


# ─────────────────────────────────────────────────
# POST /register – Đăng ký tài khoản mới
# ─────────────────────────────────────────────────
@router.post("/register", response_model=AuthUser, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    # 1. Kiểm tra email đã tồn tại chưa
    existing = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được đăng ký",
        )

    # 2. Hash password trước khi lưu
    hashed = hash_password(payload.password)

    # 3. Tạo user mới
    new_user = UserDB(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hashed,  # lưu hash, không lưu plaintext
        role=payload.role or "customer",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthUser(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
    )


# ─────────────────────────────────────────────────
# POST /login – Đăng nhập, nhận JWT token
# ─────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1. Tìm user theo email
    user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    # 2. Verify password
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )

    # 3. Tạo JWT token
    token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=token,
        user=AuthUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )