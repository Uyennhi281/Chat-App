from pydantic import BaseModel, Field
from typing import Optional


class ShippingFeeRequest(BaseModel):
    shipping_provider: str = Field(..., description="'IN_HOUSE' | 'GHN'")
    to_district_id:    Optional[int] = None
    to_ward_code:       Optional[str] = None
    weight:             int = 500  # gram


class ShippingFeeResponse(BaseModel):
    shipping_provider: str
    fee:                float
