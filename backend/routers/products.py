from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models.product import ProductDB
from models.order import OrderItemDB
from schemas.product import ProductCreate, ProductUpdate, ProductRead
from auth.deps import require_admin

router = APIRouter(prefix="/products", tags=["products"])


def product_to_read(p: ProductDB) -> ProductRead:
    return ProductRead(
        id=p.id,
        name=p.name,
        price=p.price,
        category=p.category,
        description=p.description,
        imageUrl=p.image_path,
        stock=p.stock,
        sold=p.sold,
    )


# ─────────────────────────────────────────
# GET /products  – danh sách sản phẩm
# ─────────────────────────────────────────
@router.get("", response_model=List[ProductRead])
def list_products(
    category: Optional[str] = Query(None, description="Lọc theo category"),
    search:   Optional[str] = Query(None, description="Tìm theo tên"),
    skip:     int           = Query(0, ge=0, description="Bỏ qua N bản ghi (pagination)"),
    limit:    int           = Query(20, ge=1, le=100, description="Số bản ghi tối đa"),
    db:       Session       = Depends(get_db),
):
    query = db.query(ProductDB)

    if category:
        query = query.filter(ProductDB.category == category)

    if search:
        query = query.filter(ProductDB.name.ilike(f"%{search}%"))

    products = query.offset(skip).limit(limit).all()
    return [product_to_read(p) for p in products]


# ─────────────────────────────────────────
# GET /products/{id}  – chi tiết sản phẩm
# ─────────────────────────────────────────
@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với id={product_id}"
        )
    return product_to_read(product)


# ─── POST /products – CHỈ ADMIN ─────────────────────────────
@router.post(
    "",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],  # ← Bảo vệ route
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(
        name=payload.name,
        price=payload.price,
        category=payload.category,
        description=payload.description,
        image_path=payload.imageUrl,
        stock=payload.stock,
        sold=payload.sold,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return product_to_read(new_product)


# ─────────────────────────────────────────
# PUT /products/{id}  – cập nhật sản phẩm
# ─────────────────────────────────────────
@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload:    ProductUpdate,
    db:         Session = Depends(get_db),
):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với id={product_id}"
        )

    # Chỉ cập nhật các field được gửi lên (partial update)
    if payload.name        is not None: product.name        = payload.name
    if payload.price       is not None: product.price       = payload.price
    if payload.category    is not None: product.category    = payload.category
    if payload.description is not None: product.description = payload.description
    if payload.imageUrl    is not None: product.image_path  = payload.imageUrl
    if payload.stock       is not None: product.stock       = payload.stock
    if payload.sold        is not None: product.sold        = payload.sold

    db.commit()
    db.refresh(product)
    return product_to_read(product)


# ─── DELETE /products/{id} – CHỈ ADMIN + CASCADE ─────────────
@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy sản phẩm với id={product_id}"
        )
    
    # CASCADE: Xóa tất cả order_items liên quan trước
    deleted_items_count = db.query(OrderItemDB).filter(
        OrderItemDB.product_id == product_id
    ).delete(synchronize_session=False)
    
    # Log để debug (optional)
    print(f"Deleted {deleted_items_count} order items for product {product_id}")
    
    # Xóa sản phẩm
    db.delete(product)
    db.commit()
    
    return {"message": f"Product {product_id} and {deleted_items_count} related order items deleted"}