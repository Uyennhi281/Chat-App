from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class ProductDB(Base):
    """
    SQLAlchemy model – ánh xạ tới bảng 'products' trong PostgreSQL.
    Tên class: ProductDB (để phân biệt với Pydantic schema ProductRead)
    """
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    price       = Column(Float, nullable=False)
    category    = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    image_path  = Column(String(255), nullable=False)  # lưu path nội bộ

    # Timestamps tự động
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )