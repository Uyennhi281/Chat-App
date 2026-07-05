from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine
from models.product import ProductDB
from models.user import UserDB
from database import Base
from routers import products, users

# Tạo tất cả bảng trong DB (chỉ dùng khi dev – sau này dùng Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopHub API",
    description="REST API for ShopHub – PostgreSQL Edition",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (ảnh upload)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(products.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "ShopHub API v2.0 – PostgreSQL Integration"}