from pydantic import BaseModel, Field
from datetime import datetime


class ReviewCreate(BaseModel):
    rating:  int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=1000)


class ReviewRead(BaseModel):
    id:         int
    product_id: int
    user_id:    int
    user_name:  str
    rating:     int
    comment:    str
    created_at: datetime

    class Config:
        from_attributes = True
