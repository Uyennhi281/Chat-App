from pydantic import BaseModel, Field
from typing import Optional


class ProductBase(BaseModel):
    """Các trường chung cho Create và Update"""
    name:        str   = Field(..., min_length=3, max_length=100)
    price:       float = Field(..., gt=0)
    category:    str   = Field(..., min_length=3, max_length=50)
    description: str   = Field(..., min_length=5)


class ProductCreate(ProductBase):
    """Schema nhận từ client khi tạo mới – bắt buộc có imageUrl"""
    imageUrl: str


class ProductUpdate(BaseModel):
    """Schema nhận khi cập nhật – tất cả optional (partial update)"""
    name:        Optional[str]   = Field(None, min_length=3, max_length=100)
    price:       Optional[float] = Field(None, gt=0)
    category:    Optional[str]   = Field(None, min_length=3, max_length=50)
    description: Optional[str]   = Field(None, min_length=5)
    imageUrl:    Optional[str]   = None


class ProductRead(BaseModel):
    """
    Schema trả về cho frontend.
    KHÔNG expose: image_path (nội bộ), created_at, updated_at.
    """
    id:          int
    name:        str
    price:       float
    category:    str
    description: str
    imageUrl:    str   # map từ image_path của DB

    class Config:
        from_attributes = True  # Pydantic v2 (dùng orm_mode=True nếu v1)