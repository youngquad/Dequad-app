from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
import os
import asyncio
import logging

from database import db
from models import User
from helpers.auth import get_current_user, require_admin
from helpers.notifications import send_push_notification
from helpers.email import send_support_reply_email
from helpers.safeguarding import (
    check_language_filter,
    check_safeguarding_content,
    create_safeguarding_alert,
)
from config import EMERGENT_LLM_KEY
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)
router = APIRouter()


# ==================== MODELS ====================

class SupportMessageCreate(BaseModel):
    text: str


class SupportAdminReply(BaseModel):
    user_id: str
    text: str


# ==================== HELPERS ====================

SUPPORT_SYSTEM_PROMPT = (
    "You are 'DEQUAD Support', a friendly, concise customer support assistant for the DEQUAD "
    "student wellbeing app (mood tracking, lecture feedback, peer matching, and chat for university "
    "students in the UK). \n\n"
    "Help students with:\n"
    "- How to use mood tracking, feedback, matching, and chat features\n"
    "- Account/profile questions, push notifications, privacy\n"
    "- Premium subscription (£4.99/month for unlimited swipes) and refunds policy (direct billing "
    "  issues to support team)\n"
    "- Reporting other users and safeguarding (escalate to human admin if safety concern)\n\n"
    "Rules:\n"
    "- Keep answers under 100 words. Be warm, empathetic, and student-friendly.\n"
    "- Never invent features or pricing. If unsure, say a human agent will follow up.\n"
    "- If the user mentions self-harm, crisis, or being unsafe, gently share Samaritans 116 123 "
    "  and offer to connect them with a human agent.\n"
    "- Never use profanity or discriminatory language.\n"
    "- End every reply by inviting the user to ask anything else, or noting a human will follow up "
    "  if the issue is complex (e.g., billing dispute, account deletion, safeguarding).\n"
)


async def _get_ai_reply(user: User, history: list, latest_text: str) -> str:
    """Get an AI auto-reply for a support message."""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"support_{user.user_id}",
            system_message=SUPPORT_SYSTEM_PROMPT,
        ).with_model("openai", "gpt-4o-mini")

        # Build short context from last 6 messages
        context_lines = []
        for m in history[-6:]:
            who = "Student" if m.get("sender") == "user" else "Support"
            context_lines.append(f"{who}: {m.get('text', '')}")
        context_lines.append(f"Student: {latest_text}")
        prompt = "\n".join(context_lines)

        response = await chat.send_message(UserMessage(text=prompt))
        text = response.text if hasattr(response, "text") else str(response)
        return text.strip() or "Thanks for reaching out — a human agent will follow up shortly."
    except Exception as e:
        logger.error(f"Support AI error: {e}")
        return (
            "Thanks for your message! Our team is currently unavailable, but we've logged your "
            "request and a human agent will reply soon."
        )


async def _save_message(user_id: str, sender: str, text: str, is_ai: bool = False) -> dict:
    """Persist a support message. sender is 'user' | 'agent' | 'ai'."""
    msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,            # the student the conversation belongs to
        "sender": sender,
        "text": text,
        "is_ai": is_ai,
        # Flip read flags: messages from the user are unread for admin; replies are unread for user.
        "read_by_admin": (sender != "user"),
        "read_by_user": (sender == "user"),
        "created_at": datetime.now(timezone.utc),
    }
    await db.support_messages.insert_one(msg)
    msg.pop("_id", None)
    msg["created_at"] = msg["created_at"].isoformat()
    return msg


# ==================== USER ENDPOINTS ====================

@router.get("/support/messages")
async def get_my_support_messages(current_user: User = Depends(get_current_user)):
    """Get the current user's support conversation."""
    messages = await db.support_messages.find(
        {"user_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    for m in messages:
        ca = m.get("created_at")
        if isinstance(ca, datetime):
            m["created_at"] = ca.isoformat()
    # mark agent messages as read by user
    await db.support_messages.update_many(
        {"user_id": current_user.user_id, "sender": {"$in": ["agent", "ai"]}, "read_by_user": False},
        {"$set": {"read_by_user": True}},
    )
    return messages


@router.post("/support/message")
async def send_support_message(
    data: SupportMessageCreate, current_user: User = Depends(get_current_user)
):
    """Student sends a support message. AI auto-replies; admins also see it."""
    if not data.text or not data.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(data.text) > 2000:
        raise HTTPException(status_code=400, detail="Message is too long (max 2000 chars)")

    # Language filter (racist + profanity)
    language_check = check_language_filter(data.text)
    if language_check["blocked"]:
        raise HTTPException(status_code=400, detail=language_check["message"])

    # Safeguarding check — if crisis indicators, alert admins
    safeguarding_result = check_safeguarding_content(data.text)
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(current_user, "support_chat", data.text, safeguarding_result)

    # Save user message
    user_msg = await _save_message(current_user.user_id, "user", data.text.strip())

    # Get prior history for context
    history_docs = await db.support_messages.find(
        {"user_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(50)

    # AI reply
    ai_text = await _get_ai_reply(current_user, history_docs, data.text.strip())
    ai_msg = await _save_message(current_user.user_id, "ai", ai_text, is_ai=True)

    response = {"user_message": user_msg, "reply": ai_msg}
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": (
                "We noticed you may be going through a difficult time. Please know that support is "
                "available — Samaritans 116 123 (24/7)."
            ),
        }
    return response


# ==================== ADMIN ENDPOINTS ====================

@router.get("/support/admin/conversations")
async def admin_list_conversations(admin: User = Depends(require_admin)):
    """List all support conversations grouped by user with latest message + unread counts."""
    pipeline = [
        {"$sort": {"created_at": -1}},
        {
            "$group": {
                "_id": "$user_id",
                "last_message": {"$first": "$text"},
                "last_message_at": {"$first": "$created_at"},
                "last_sender": {"$first": "$sender"},
                "unread_for_admin": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$eq": ["$sender", "user"]},
                                {"$eq": ["$read_by_admin", False]},
                            ]},
                            1,
                            0,
                        ]
                    }
                },
                "total": {"$sum": 1},
            }
        },
        {"$sort": {"last_message_at": -1}},
    ]
    rows = await db.support_messages.aggregate(pipeline).to_list(500)
    user_ids = [r["_id"] for r in rows]
    users = await db.users.find(
        {"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "email": 1, "university": 1}
    ).to_list(500)
    user_map = {u["user_id"]: u for u in users}
    result = []
    for r in rows:
        u = user_map.get(r["_id"], {})
        last_at = r["last_message_at"]
        result.append({
            "user_id": r["_id"],
            "name": u.get("name", "Unknown"),
            "email": u.get("email", ""),
            "university": u.get("university"),
            "last_message": r["last_message"],
            "last_message_at": last_at.isoformat() if isinstance(last_at, datetime) else last_at,
            "last_sender": r["last_sender"],
            "unread_for_admin": r["unread_for_admin"],
            "total_messages": r["total"],
        })
    return {"conversations": result}


@router.get("/support/admin/messages/{user_id}")
async def admin_get_messages(user_id: str, admin: User = Depends(require_admin)):
    """Get a single user's support conversation."""
    messages = await db.support_messages.find(
        {"user_id": user_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    for m in messages:
        ca = m.get("created_at")
        if isinstance(ca, datetime):
            m["created_at"] = ca.isoformat()
    # mark as read by admin
    await db.support_messages.update_many(
        {"user_id": user_id, "sender": "user", "read_by_admin": False},
        {"$set": {"read_by_admin": True}},
    )
    return messages


@router.post("/support/admin/reply")
async def admin_send_reply(data: SupportAdminReply, admin: User = Depends(require_admin)):
    """Admin replies to a user's support conversation as a human agent."""
    if not data.text or not data.text.strip():
        raise HTTPException(status_code=400, detail="Reply cannot be empty")
    if len(data.text) > 2000:
        raise HTTPException(status_code=400, detail="Message is too long (max 2000 chars)")

    # Even admins go through the language filter for racism (anti-discrimination policy)
    language_check = check_language_filter(data.text)
    if language_check["blocked"]:
        raise HTTPException(status_code=400, detail=language_check["message"])

    target = await db.users.find_one(
        {"user_id": data.user_id},
        {"_id": 0, "user_id": 1, "email": 1, "name": 1, "notifications_enabled": 1},
    )
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    msg = await _save_message(data.user_id, "agent", data.text.strip())

    # Notify the student that a human support agent has replied.
    preview = data.text.strip()
    if len(preview) > 80:
        preview = preview[:77] + "..."
    await send_push_notification(
        data.user_id,
        "DEQUAD Support replied",
        preview,
        "support_reply",
        {"message_id": msg["id"], "agent_name": admin.name},
    )

    # Email fallback (fires in background so the API stays snappy).
    if target.get("notifications_enabled", True) and target.get("email"):
        app_url = os.environ.get("APP_URL", "https://review-extractor-2.preview.emergentagent.com").rstrip("/")
        deep_link = f"{app_url}/(main)/support"
        asyncio.create_task(send_support_reply_email(
            student_email=target["email"],
            student_name=target.get("name", ""),
            agent_name=admin.name,
            reply_text=data.text.strip(),
            app_url=deep_link,
        ))

    return {"success": True, "message": msg}
