from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://shophub_user:shophub_password@localhost:5432/shophub_db"

engine = create_engine(
    DATABASE_URL,
    echo=True  # In SQL log ra console để debug – tắt khi production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency injection cho FastAPI routes
def get_db():
    """
    Mỗi request sẽ nhận 1 DB session riêng.
    Session được đóng sau khi request xử lý xong (finally).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()