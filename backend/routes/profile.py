from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from database import db
from models import User, ProfileUpdate, LocationUpdate
from helpers.auth import get_current_user
from helpers.safeguarding import check_language_filter
from helpers.ai import stream_ai_response

router = APIRouter()


# Free-text profile fields are checked against the racism + profanity filter
TEXT_FIELDS_TO_FILTER = ("bio", "course", "university", "university_location", "campus_name")


@router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}

    # Block updates that contain racism / profanity in any free-text field
    for field in TEXT_FIELDS_TO_FILTER:
        value = update_data.get(field)
        if isinstance(value, str) and value.strip():
            language_check = check_language_filter(value)
            if language_check["blocked"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"{language_check['message']} (field: {field})",
                )

    if update_data:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    return User(**user_doc)


@router.post("/profile/location")
async def update_profile_location(
    data: LocationUpdate,
    current_user: User = Depends(get_current_user),
):
    """Store the user's GPS coordinates as a GeoJSON Point.

    Coordinates order in GeoJSON is [longitude, latitude] (not lat, lng).
    The 2dsphere index on `users.location` (created at boot in
    `database.ensure_indexes`) powers `$near`/`$geoNear` queries used by
    /api/matches/discover for distance-based filtering.
    """
    lat = float(data.latitude)
    lng = float(data.longitude)
    if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lng <= 180.0):
        raise HTTPException(status_code=400, detail="Invalid latitude/longitude range.")

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "location": {"type": "Point", "coordinates": [lng, lat]},
            "location_updated_at": now,
        }},
    )
    return {
        "ok": True,
        "location": {"type": "Point", "coordinates": [lng, lat]},
        "updated_at": now.isoformat(),
    }


@router.delete("/profile/location")
async def clear_profile_location(current_user: User = Depends(get_current_user)):
    """Let the user revoke sharing their location — removes the GeoJSON field
    so future distance filters exclude them from geo-based results."""
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$unset": {"location": "", "location_updated_at": ""}},
    )
    return {"ok": True}


class BioAssistRequest(BaseModel):
    tone: Optional[str] = None  # e.g. "witty", "warm", "chill" — free text, optional


@router.post("/profile/bio-assist")
async def bio_assist(data: BioAssistRequest, current_user: User = Depends(get_current_user)):
    """AI-drafted bio suggestion (GPT-5.4-mini) using the student's own
    course/university/interests — streamed as it's written."""
    interests = ", ".join(current_user.interests or []) or "no listed interests yet"
    tone_line = f" Tone: {data.tone}." if data.tone else ""

    system_message = (
        "You write short, warm, genuine dating/friend-finder app bios for UK university "
        "students. Output ONLY the bio text (1-3 sentences, under 240 characters), no "
        "quotes, no preamble, no hashtags, no emoji spam (at most one emoji)."
    )
    user_text = (
        f"Student at {current_user.university or 'university'}, studying "
        f"{current_user.course or 'their course'}. Interests: {interests}.{tone_line} "
        "Write a bio for their profile."
    )

    async def event_generator():
        async for chunk in stream_ai_response(system_message, user_text):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
