from fastapi import APIRouter, Depends, HTTPException
from typing import List
import asyncio

from database import db
from models import User, MoodEntry, MoodCreate
from helpers.auth import get_current_user
from helpers.safeguarding import check_safeguarding_content, create_safeguarding_alert, analyze_text_for_new_patterns

router = APIRouter()


@router.post("/mood")
async def create_mood(data: MoodCreate, current_user: User = Depends(get_current_user)):
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")

    safeguarding_result = check_safeguarding_content(data.notes or "")

    mood_entry = MoodEntry(user_id=current_user.user_id, mood=data.mood, notes=data.notes)
    await db.mood_entries.insert_one(mood_entry.dict())

    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(current_user, "mood", data.notes or "", safeguarding_result)

    if data.notes and (data.mood <= 3 or len(data.notes) > 50):
        asyncio.create_task(analyze_text_for_new_patterns(data.notes, "mood"))

    response = mood_entry.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    return response


@router.get("/mood", response_model=List[MoodEntry])
async def get_mood_history(current_user: User = Depends(get_current_user)):
    entries = await db.mood_entries.find(
        {"user_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return [MoodEntry(**e) for e in entries]
