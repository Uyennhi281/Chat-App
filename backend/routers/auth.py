from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
import secrets
import hashlib

from database import get_db
from models.user import UserDB
from models.password_reset import PasswordResetTokenDB
from schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse, AuthUser,
    ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest,
)
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from config import settings

router = APIRouter(tags=["auth"])

RESET_TOKEN_EXPIRE_MINUTES = 30


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


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


# ─────────────────────────────────────────────────
# POST /forgot-password – Tạo liên kết đặt lại mật khẩu
# ─────────────────────────────────────────────────
@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email không tồn tại trong hệ thống",
        )

    # Chỉ lưu HASH của token trong DB (giống cách lưu password), không lưu token gốc
    raw_token = secrets.token_urlsafe(32)
    reset_token = PasswordResetTokenDB(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.frontend_reset_password_url}?token={raw_token}"

    # LƯU Ý: dự án chưa cấu hình SMTP để gửi email thật.
    # Tạm thời trả link trực tiếp về response (chế độ dev) để test được ngay.
    # Khi có SMTP thật: gửi reset_url qua email và xóa field này khỏi response.
    return ForgotPasswordResponse(
        message="Đã tạo liên kết đặt lại mật khẩu (chế độ dev - chưa gửi email thật)",
        reset_url=reset_url,
    )


# ─────────────────────────────────────────────────
# POST /reset-password – Đặt lại mật khẩu bằng token
# ─────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = _hash_token(payload.token)
    reset_token = (
        db.query(PasswordResetTokenDB)
        .filter(PasswordResetTokenDB.token_hash == token_hash)
        .first()
    )

    if not reset_token or reset_token.used or reset_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
        )

    user = db.query(UserDB).filter(UserDB.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tài khoản")

    user.password_hash = hash_password(payload.new_password)
    reset_token.used = True
    db.commit()

    return {"message": "Đặt lại mật khẩu thành công"}