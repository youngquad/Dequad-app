from fastapi import APIRouter, Depends, HTTPException
from typing import List

from database import db
from models import User, ChatMessage, SendMessage
from helpers.auth import get_current_user
from helpers.safeguarding import check_safeguarding_content, create_safeguarding_alert, check_language_filter
from helpers.notifications import send_push_notification

router = APIRouter()


@router.post("/chat/send")
async def send_message(data: SendMessage, current_user: User = Depends(get_current_user)):
    match = await db.matches.find_one({
        "id": data.match_id,
        "$or": [
            {"user_id": current_user.user_id},
            {"matched_user_id": current_user.user_id}
        ],
        "status": "accepted"
    }, {"_id": 0})

    if not match:
        raise HTTPException(status_code=403, detail="Match not found or not accepted")

    # Check for profanity/racist language
    language_check = check_language_filter(data.text)
    if language_check["blocked"]:
        raise HTTPException(status_code=400, detail=language_check["message"])

    safeguarding_result = check_safeguarding_content(data.text)
    message = ChatMessage(match_id=data.match_id, sender_id=current_user.user_id, text=data.text)
    await db.chat_messages.insert_one(message.dict())

    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(current_user, "chat", data.text, safeguarding_result)

    if match["user_id"] == current_user.user_id:
        recipient_id = match["matched_user_id"]
    else:
        recipient_id = match["user_id"]

    await send_push_notification(
        recipient_id,
        f"New message from {current_user.name}",
        "You have a new message. Tap to read.",
        "new_message",
        {"match_id": data.match_id, "sender_name": current_user.name}
    )

    response = message.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    return response


@router.get("/chat/{match_id}")
async def get_messages(match_id: str, current_user: User = Depends(get_current_user)):
    match = await db.matches.find_one({
        "id": match_id,
        "$or": [
            {"user_id": current_user.user_id},
            {"matched_user_id": current_user.user_id}
        ],
        "status": "accepted"
    }, {"_id": 0})

    if not match:
        raise HTTPException(status_code=403, detail="Match not found or not accepted")

    messages = await db.chat_messages.find(
        {"match_id": match_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)

    return [ChatMessage(**m) for m in messages]
