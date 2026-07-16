import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from auth.deps import require_admin

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/image", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    # Kiểm tra đuôi file
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Chỉ chấp nhận: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Đọc file và kiểm tra size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 5MB)")
    
    # Tạo tên file unique
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Lưu file
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Trả về URL để lưu vào database
    return {
        "filename": filename,
        "url": f"/static/uploads/{filename}",
        "message": "Upload thành công"
    }