"""
Strategy Pattern cho vận chuyển (Session 16 - Yêu cầu nâng cao 2).

Mỗi đơn vị vận chuyển (IN_HOUSE, GHN, và sau này Viettel Post/NinjaVan...) implement
cùng một interface ShippingStrategy, tránh phải viết if/else lồng nhau khi checkout.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional

import httpx

from config import settings


class ShippingProviderNotConfigured(Exception):
    """API key/ShopID của đối tác vận chuyển chưa được cấu hình trong .env"""


class ShippingStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, **kwargs: Any) -> float:
        """Trả về phí ship (VNĐ)."""

    @abstractmethod
    def create_order(self, **kwargs: Any) -> dict:
        """Tạo đơn vận chuyển bên đối tác. Trả về {'tracking_code': str | None}."""


class InHouseShipping(ShippingStrategy):
    """Đội xe nội bộ ShopHub - Shipper tự nhận đơn và giao, không có mã vận đơn."""

    FLAT_FEE = 20000  # phí giao hàng nội thành cố định (VNĐ)

    def calculate_fee(self, **kwargs: Any) -> float:
        return self.FLAT_FEE

    def create_order(self, **kwargs: Any) -> dict:
        return {"tracking_code": None}


class GHNShipping(ShippingStrategy):
    """
    Giao Hàng Nhanh (GHN) - gọi API thật.

    LƯU Ý: dự án hiện CHƯA có tài khoản sandbox GHN (ShopID/API Token) nên các hàm
    dưới đây sẽ raise ShippingProviderNotConfigured cho tới khi .env được điền đủ:
    GHN_API_TOKEN, GHN_SHOP_ID. Logic gọi API đã viết sẵn theo docs GHN, chỉ cần
    cấu hình là chạy được ngay - không cần sửa code.
    """

    def __init__(self) -> None:
        self.token = settings.ghn_api_token
        self.shop_id = settings.ghn_shop_id
        self.base_url = settings.ghn_api_url

    def _ensure_configured(self) -> None:
        if not self.token or not self.shop_id:
            raise ShippingProviderNotConfigured(
                "GHN chưa được cấu hình (thiếu GHN_API_TOKEN / GHN_SHOP_ID trong .env). "
                "Vui lòng chọn 'Giao hàng nội bộ' hoặc liên hệ admin để cấu hình GHN."
            )

    def _headers(self) -> dict:
        return {"Token": self.token, "ShopId": self.shop_id, "Content-Type": "application/json"}

    def calculate_fee(
        self,
        to_district_id: Optional[int] = None,
        to_ward_code: Optional[str] = None,
        weight: int = 500,
        insurance_value: int = 0,
        **kwargs: Any,
    ) -> float:
        self._ensure_configured()
        payload = {
            "shop_id": int(self.shop_id),
            "to_district_id": to_district_id,
            "to_ward_code": to_ward_code,
            "weight": weight,
            "insurance_value": insurance_value,
            "service_type_id": 2,  # hàng nhẹ tiêu chuẩn
        }
        resp = httpx.post(
            f"{self.base_url}/v2/shipping-order/fee",
            json=payload,
            headers=self._headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return float(resp.json()["data"]["total"])

    def create_order(
        self,
        to_name: Optional[str] = None,
        to_phone: Optional[str] = None,
        to_address: Optional[str] = None,
        to_district_id: Optional[int] = None,
        to_ward_code: Optional[str] = None,
        items: Optional[list] = None,
        **kwargs: Any,
    ) -> dict:
        self._ensure_configured()
        payload = {
            "shop_id": int(self.shop_id),
            "to_name": to_name,
            "to_phone": to_phone,
            "to_address": to_address,
            "to_district_id": to_district_id,
            "to_ward_code": to_ward_code,
            "items": items or [],
            "service_type_id": 2,
        }
        resp = httpx.post(
            f"{self.base_url}/v2/shipping-order/create",
            json=payload,
            headers=self._headers(),
            timeout=10,
        )
        resp.raise_for_status()
        return {"tracking_code": resp.json()["data"]["order_code"]}


def get_shipping_strategy(provider: str) -> ShippingStrategy:
    if provider == "GHN":
        return GHNShipping()
    return InHouseShipping()
