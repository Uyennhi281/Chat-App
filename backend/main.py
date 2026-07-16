from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from models.product import ProductDB
from models.user import UserDB
from models.order import OrderDB, OrderItemDB
from routers import products, users, auth, orders, upload, payments


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopHub API",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(products.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(upload.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {"message": "ShopHub API v4.0 – Checkout & Orders Ready"}