from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class ReviewDB(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
