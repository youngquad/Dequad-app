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


@router.get("/wellbeing-resources")
async def get_wellbeing_resources():
    """Student-facing signposting: crisis and wellbeing support resources"""
    from helpers.safeguarding import CRISIS_RESOURCES
    return {
        "resources": CRISIS_RESOURCES,
        "message": "If you or someone you know is struggling, please reach out. You are not alone.",
        "emergency_note": "If you are in immediate danger, call 999 or go to your nearest A&E."
    }
