from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

ALLOWED_STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED", "FAILED"]
ALLOWED_SHIPPING_PROVIDERS = ["IN_HOUSE", "GHN"]

# Trạng thái Shipper được phép chuyển (chu trình bắt buộc, xem docx Session 16 - NV1)
SHIPPER_TRANSITIONS = {
    "claim":   {"from": "PROCESSING", "to": "SHIPPED"},
    "deliver": {"from": "SHIPPED",    "to": "COMPLETED"},
    "fail":    {"from": "SHIPPED",    "to": "FAILED"},
}


class OrderItemCreate(BaseModel):
    product_id: int
    name:       str
    price:      float
    quantity:   int = Field(..., gt=0)


class CheckoutRequest(BaseModel):
    items:              List[OrderItemCreate]
    shipping_provider:  str   = Field("IN_HOUSE")
    shipping_fee:       float = Field(0, ge=0)

    @field_validator("shipping_provider")
    @classmethod
    def validate_provider(cls, v: str) -> str:
        if v not in ALLOWED_SHIPPING_PROVIDERS:
            raise ValueError(f"Invalid shipping_provider: {v}")
        return v


class OrderItemRead(BaseModel):
    id:            int
    product_id:    int
    product_name:  str
    product_price: float
    quantity:      int
    line_total:    float

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id:                 int
    status:             str
    total_amount:       float
    created_at:         str
    items:              List[OrderItemRead]
    shipping_provider:  str
    tracking_code:      Optional[str] = None
    shipping_fee:       float
    shipper_id:         Optional[int] = None
    shipper_name:       Optional[str] = None
    delivery_lat:       Optional[float] = None
    delivery_lng:       Optional[float] = None

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    id:                 int
    status:             str
    total_amount:       float
    created_at:         str
    shipping_provider:  str
    tracking_code:      Optional[str] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_STATUSES:
            raise ValueError(f"Invalid status: {v}")
        return v


class OrderItemQuantityUpdate(BaseModel):
    item_id:  int
    quantity: int = Field(..., gt=0)


class ShipperLocation(BaseModel):
    """Tọa độ GPS Shipper ghi nhận lúc bấm 'Nhận đơn' / 'Giao thành công' (HTML5 Geolocation)."""
    lat: Optional[float] = None
    lng: Optional[float] = None


class ShipperDeliverRequest(BaseModel):
    success:  bool
    location: Optional[ShipperLocation] = None