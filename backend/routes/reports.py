from fastapi import APIRouter, Depends, HTTPException

from database import db
from models import User, Report, ReportCreate
from helpers.auth import get_current_user
from helpers.safeguarding import check_language_filter

router = APIRouter()

ALLOWED_REPORT_REASONS = {
    "inappropriate_photos",
    "harassment_or_bullying",
    "hate_speech_or_racism",
    "spam_or_scam",
    "fake_profile",
    "underage",
    "violence_or_threats",
    "sexual_content",
    "other",
}


@router.post("/reports")
async def create_report(
    data: ReportCreate,
    current_user: User = Depends(get_current_user),
):
    """Allow a student to report another user's profile."""
    if data.reported_user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot report yourself")

    if not data.reason or len(data.reason.strip()) < 3:
        raise HTTPException(status_code=400, detail="Please provide a reason for the report")

    # Block reports that themselves contain racist / profane language
    language_check = check_language_filter(data.reason)
    if language_check["blocked"]:
        raise HTTPException(status_code=400, detail=language_check["message"])

    reported_user = await db.users.find_one(
        {"user_id": data.reported_user_id}, {"_id": 0, "user_id": 1, "name": 1}
    )
    if not reported_user:
        raise HTTPException(status_code=404, detail="Reported user not found")

    # Prevent duplicate pending reports from same reporter for same user
    existing = await db.reports.find_one({
        "reporter_id": current_user.user_id,
        "reported_user_id": data.reported_user_id,
        "status": "pending",
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending report against this user. Our team is reviewing it.",
        )

    report = Report(
        reported_user_id=data.reported_user_id,
        reporter_id=current_user.user_id,
        reason=data.reason.strip(),
    )
    await db.reports.insert_one(report.dict())

    return {
        "success": True,
        "message": "Thank you. Our safeguarding team will review this report shortly.",
        "report_id": report.id,
    }


@router.get("/reports/my")
async def get_my_reports(current_user: User = Depends(get_current_user)):
    """Get reports submitted by the current user."""
    reports = await db.reports.find(
        {"reporter_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return reports
