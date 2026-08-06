from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Stripe
    stripe_secret_key:  str = ""
    stripe_success_url: str = "http://localhost:5173/payment/stripe/success"
    stripe_cancel_url:  str = "http://localhost:5173/payment/stripe/cancel"

    # PayPal
    paypal_client_id:     str = ""
    paypal_client_secret: str = ""
    paypal_return_url:    str = "http://localhost:5173/payment/paypal/success"
    paypal_cancel_url:    str = "http://localhost:5173/payment/paypal/cancel"
    paypal_base_url:      str = "https://api-m.sandbox.paypal.com"

    # VNPay
    vnpay_tmn_code:    str = "DEMOV210"
    vnpay_hash_secret: str = ""
    vnpay_return_url:  str = "http://localhost:5173/payment/vnpay/success"
    vnpay_base_url:    str = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"

    # GHN (Giao Hàng Nhanh) - chưa có tài khoản sandbox thật, để trống cho tới khi cấu hình
    ghn_api_url:       str = "https://dev-online-gateway.ghn.vn/shiip/public-api"
    ghn_api_token:     str = ""
    ghn_shop_id:       str = ""

    # Webhook - khóa bí mật để xác thực request từ GHN (đặt cùng giá trị trên trang quản trị GHN)
    ghn_webhook_secret: str = ""

    # Password reset - chưa có SMTP thật nên link được trả trực tiếp về response (chế độ dev)
    frontend_reset_password_url: str = "http://localhost:5173/reset-password"

    class Config:
        env_file = ".env"

settings = Settings()