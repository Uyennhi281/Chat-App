from fastapi import APIRouter, HTTPException, status

from schemas.shipping import ShippingFeeRequest, ShippingFeeResponse
from services.shipping_strategy import get_shipping_strategy, ShippingProviderNotConfigured

router = APIRouter(prefix="/shipping", tags=["shipping"])


# ── POST /shipping/calculate-fee ────────────────────────────
@router.post("/calculate-fee", response_model=ShippingFeeResponse)
def calculate_shipping_fee(payload: ShippingFeeRequest):
    strategy = get_shipping_strategy(payload.shipping_provider)
    try:
        fee = strategy.calculate_fee(
            to_district_id=payload.to_district_id,
            to_ward_code=payload.to_ward_code,
            weight=payload.weight,
        )
    except ShippingProviderNotConfigured as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return ShippingFeeResponse(shipping_provider=payload.shipping_provider, fee=fee)
