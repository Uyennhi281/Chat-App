from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterRequest(BaseModel):
    """Input schema – nhận từ frontend khi đăng ký"""
    email:     EmailStr
    full_name: str           = Field(..., min_length=3, max_length=100)
    password:  str           = Field(..., min_length=6)
    role:      Optional[str] = "customer"


class LoginRequest(BaseModel):
    """Input schema – nhận từ frontend khi đăng nhập"""
    email:    EmailStr
    password: str = Field(..., min_length=6)


class AuthUser(BaseModel):
    """
    User info trả về cho frontend.
    KHÔNG có password hay password_hash.
    """
    id:        int
    email:     EmailStr
    full_name: str
    role:      str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """
    Response sau khi login thành công.
    Gồm JWT token + thông tin user cơ bản.
    """
    access_token: str
    token_type:   str      = "bearer"
    user:         AuthUser  # frontend dùng để hiển thị tên, role