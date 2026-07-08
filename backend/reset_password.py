from database import SessionLocal
from models.user import UserDB
from auth.security import hash_password

db = SessionLocal()

# Tìm user admin
user = db.query(UserDB).filter(UserDB.email == 'admin@shophub.com').first()

if user:
    # Hash password mới đúng cách
    new_password = 'admin123'  # hoặc mật khẩu bạn muốn
    user.password_hash = hash_password(new_password)
    db.commit()
    print(f"✅ Password đã reset thành: {new_password}")
else:
    print("❌ Không tìm thấy user")

db.close()