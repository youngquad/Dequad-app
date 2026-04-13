from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime, timezone
import os

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "DEQUAD API", "status": "running"}


@router.get("/download/presentation")
async def download_presentation():
    file_path = "/app/DEQUAD_Presentation.pptx"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Presentation not found")
    return FileResponse(
        path=file_path, filename="DEQUAD_Presentation.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )


@router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}
