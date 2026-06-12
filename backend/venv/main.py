from fastapi import FastAPI

app = FastAPI()

# 1. Endpoint mặc định (Theo bài mẫu)
@app.get("/")
def root():
    return {
        "message": "Welcome to ShopHub API"
    }

# 2. End-of-Session Lab: Thêm endpoint /about
@app.get("/about")
def about():
    return {
        "project": "ShopHub",
        "version": "1.0"
    }

# 3. Homework Exercise 2: Thêm endpoint /products
@app.get("/products")
def get_products():
    return [
        {
            "id": 1,
            "name": "Laptop"
        },
        {
            "id": 2,
            "name": "Mouse"
        }
    ]