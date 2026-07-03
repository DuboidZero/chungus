from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.storage import upload_file

router = APIRouter(prefix="/me", tags=["upload"])

# What we allow
ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
}
MAX_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # 1. Validate type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPG, PNG, WEBP, PDF.",
        )

    # 2. Read bytes + validate size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Maximum size is 5 MB.",
        )

    # 3. Upload to storage, get public URL
    url = upload_file(file_bytes, file.filename or "upload", file.content_type)

    return {"url": url}