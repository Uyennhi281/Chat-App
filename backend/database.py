from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Chuỗi kết nối đến PostgreSQL của cậu
DATABASE_URL = "postgresql://shophub_user:shophub_password@localhost:5432/shophub_db"

# Khởi tạo engine (cái này là trái tim của SQLAlchemy đó!)
engine = create_engine(DATABASE_URL, echo=True)  # echo=True để log ra các câu SQL cho dễ debug nè

# Tạo SessionLocal để quản lý các phiên làm việc với database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các models sau này kế thừa
Base = declarative_base()

from fastapi import Depends
from sqlalchemy.orm import Session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()