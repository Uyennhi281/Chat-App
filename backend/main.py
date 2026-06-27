from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import json
import os
import shutil

app = FastAPI(title="ShopHub Product API", version="1.1.0")

# ==========================================
# 1. Cấu hình CORS cho phép React gọi API
# ==========================================
origins = [
    "http://localhost:5173",   # Đường dẫn dev của React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 2. Pydantic Models (Quản lý luồng dữ liệu)
# ==========================================
# Domain Model (Nội bộ hệ thống)
class Product(BaseModel):
    id: int
    name: str = Field(..., min_length=3, max_length=100)
    price: float = Field(..., gt=0)
    category: str = Field(..., min_length=3, max_length=50)
    description: str = Field(..., min_length=5)
    imagePath: str   # Đường dẫn lưu file trên server
    costPrice: Optional[float] = None  # Trường nhạy cảm, không được lộ ra ngoài

# Output Schema (Trả về cho Frontend)
class ProductPublic(BaseModel):
    id: int
    name: str
    price: float
    category: str
    description: str
    imageUrl: str   # URL hoàn chỉnh để frontend hiển thị ảnh

class ProductListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[ProductPublic]

# ==========================================
# 3. Helper Functions (Đọc/Ghi dữ liệu JSON)
# ==========================================
DB_PATH = "data/products.json"
IMG_DIR = "data_images"

# Tạo sẵn thư mục lưu ảnh nếu chưa có
os.makedirs(IMG_DIR, exist_ok=True)

def read_db():
    if not os.path.exists(DB_PATH):
        return []
    with open(DB_PATH, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_db(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

# ==========================================
# 4. API Endpoints (Phần CRUD)
# ==========================================

# 4.1. Lấy danh sách sản phẩm (Có phân trang, bộ lọc)
@app.get("/products", response_model=ProductListResponse)
def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    products = read_db()

    # Áp dụng bộ lọc
    if search:
        products = [p for p in products if search.lower() in p['name'].lower() or search.lower() in p['description'].lower()]
    if category:
        products = [p for p in products if p['category'].lower() == category.lower()]
    if min_price is not None:
        products = [p for p in products if p['price'] >= min_price]
    if max_price is not None:
        products = [p for p in products if p['price'] <= max_price]

    total = len(products)
    
    # Tính toán phân trang
    start = (page - 1) * size
    end = start + size
    paginated_products = products[start:end]

    # Map dữ liệu nội bộ sang định dạng trả về (ProductPublic)
    public_items = []
    for p in paginated_products:
        p_copy = p.copy()
        # Biến đổi imagePath nội bộ thành imageUrl public
        p_copy['imageUrl'] = f"http://localhost:8000/images/{os.path.basename(p['imagePath'])}"
        public_items.append(p_copy)

    return {"total": total, "page": page, "size": size, "items": public_items}

# 4.2. API Đọc File Hình Ảnh (Auxiliary Image Endpoint)
@app.get("/images/{filename}")
def get_image(filename: str):
    file_path = os.path.join(IMG_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Image not found")

# 4.3. Tạo sản phẩm mới (Có Upload Ảnh)
@app.post("/products", response_model=ProductPublic)
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    costPrice: Optional[float] = Form(None),
    image_file: UploadFile = File(...)
):
    # Lưu file ảnh lên server
    file_location = os.path.join(IMG_DIR, image_file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(image_file.file, file_object)

    products = read_db()
    new_id = max([p["id"] for p in products], default=0) + 1

    # Tạo object nội bộ
    new_product = {
        "id": new_id,
        "name": name,
        "price": price,
        "category": category,
        "description": description,
        "imagePath": file_location,
        "costPrice": costPrice
    }
    
    products.append(new_product)
    write_db(products)

    # Chuẩn bị dữ liệu trả về cho frontend
    public_product = new_product.copy()
    public_product['imageUrl'] = f"http://localhost:8000/images/{image_file.filename}"
    
    return public_product

# 4.4 Lấy chi tiết 1 sản phẩm
@app.get("/products/{id}", response_model=ProductPublic)
def get_product_detail(id: int):
    products = read_db()
    for p in products:
        if p["id"] == id:
            public_product = p.copy()
            public_product['imageUrl'] = f"http://localhost:8000/images/{os.path.basename(p['imagePath'])}"
            return public_product
    raise HTTPException(status_code=404, detail="Product not found")

# 4.5. Xóa sản phẩm
@app.delete("/products/{id}")
def delete_product(id: int):
    products = read_db()
    new_products = [p for p in products if p["id"] != id]
    
    if len(products) == len(new_products):
        raise HTTPException(status_code=404, detail="Product not found")
        
    write_db(new_products)
    return {"message": "Product deleted successfully"}