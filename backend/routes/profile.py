from fastapi import APIRouter, Depends, HTTPException
from database import db
from models import User, ProfileUpdate
from helpers.auth import get_current_user
from helpers.safeguarding import check_language_filter

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
