from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserBase(BaseModel):
    email:     EmailStr
    full_name: str           = Field(..., min_length=3, max_length=100)
    role:      Optional[str] = "customer"


class UserCreate(UserBase):
    """
    Input schema – nhận password plaintext từ client.
    Session 9 sẽ hash password trước khi lưu vào DB.
    """
    password: str = Field(..., min_length=6)


class UserRead(BaseModel):
    """
    Output schema – KHÔNG bao gồm password_hash.
    Đây là cách bảo vệ dữ liệu nhạy cảm qua Pydantic.
    """
    id:        int
    email:     EmailStr
    full_name: str
    role:      str

    class Config:
        from_attributes = True