from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class UserDB(Base):
    """
    SQLAlchemy model cho bảng 'users'.
    Lưu ý: password_hash thay vì password – không bao giờ lưu plaintext.
    """
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    full_name     = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)  # SENSITIVE – không expose
    role          = Column(String(20), nullable=False, default="customer")
    created_at    = Column(DateTime(timezone=True), server_default=func.now())