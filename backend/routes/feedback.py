from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone

from database import db
from models import User, FeedbackEntry, FeedbackCreate
from helpers.auth import get_current_user
from helpers.safeguarding import check_safeguarding_content, create_safeguarding_alert

router = APIRouter()


@router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")

    safeguarding_result = check_safeguarding_content(data.feedback)
    risk_score = max(0, 100 - (data.mood * 10))

    feedback_entry = FeedbackEntry(
        user_id=current_user.user_id, mood=data.mood,
        feedback=data.feedback, lecture_topic=data.lecture_topic,
        risk_score=risk_score, ai_analysis=""
    )
    await db.feedback_entries.insert_one(feedback_entry.dict())

    await db.risk_scores.insert_one({
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "risk_score": risk_score,
        "created_at": datetime.now(timezone.utc)
    })

    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(current_user, "feedback", data.feedback, safeguarding_result)

    response = {
        "entry_id": feedback_entry.id, "mood": feedback_entry.mood,
        "feedback": feedback_entry.feedback, "lecture_topic": feedback_entry.lecture_topic,
        "created_at": feedback_entry.created_at, "message": "Thank you for your feedback!"
    }

    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    return response


@router.get("/feedback", response_model=List[FeedbackEntry])
async def get_feedback_history(current_user: User = Depends(get_current_user)):
    entries = await db.feedback_entries.find(
        {"user_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [FeedbackEntry(**e) for e in entries]
