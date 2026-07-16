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

    class Config:
        env_file = ".env"

settings = Settings()