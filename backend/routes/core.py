from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import logging
import os

from database import db

router = APIRouter()
logger = logging.getLogger(__name__)


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


class WaitlistRequest(BaseModel):
    email: EmailStr


@router.post("/waitlist")
async def join_waitlist(payload: WaitlistRequest, request: Request):
    """Public landing-page waitlist signup. Idempotent — same email is upserted."""
    email = payload.email.lower().strip()
    ip = request.client.host if request.client else None
    await db.waitlist.update_one(
        {"email": email},
        {
            "$setOnInsert": {
                "email": email,
                "created_at": datetime.now(timezone.utc),
                "source_ip": ip,
            },
            "$inc": {"submit_count": 1},
            "$set": {"last_submitted_at": datetime.now(timezone.utc)},
        },
        upsert=True,
    )
    logger.info(f"Waitlist signup: {email}")
    return {"ok": True, "message": "You're on the list."}

