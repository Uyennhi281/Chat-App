from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError

# ─── Password Hashing ───────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password - truncate to 72 bytes for bcrypt compatibility"""
    password_bytes = password.encode('utf-8')[:72]  # Giới hạn 72 bytes
    return pwd_context.hash(password_bytes)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """So sánh password người dùng nhập với hash trong DB"""
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT Settings ───────────────────────────────────────────
SECRET_KEY = "super-secret-key-change-me"  # đổi thành chuỗi ngẫu nhiên khi production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # token hết hạn sau 1 giờ


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Tạo JWT token chứa thông tin user.
    data thường có: {"sub": user_id, "role": user_role}
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Giải mã JWT token.
    Trả về payload nếu hợp lệ, None nếu token sai hoặc hết hạn.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None