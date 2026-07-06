from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import products, users, auth

app = FastAPI(
    title="ShopHub API",
    description="REST API for ShopHub – PostgreSQL + Authentication",
    version="3.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tạo tất cả bảng trong DB (products, users)
Base.metadata.create_all(bind=engine)

# Static files cho ảnh upload (Session 8)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(products.router)
app.include_router(users.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "ShopHub API v3.0 – PostgreSQL + Auth Ready"}