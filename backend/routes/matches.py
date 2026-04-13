from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from database import db
from models import User, Match, SwipeAction
from helpers.auth import get_current_user
from helpers.notifications import send_push_notification
from helpers.safeguarding import check_language_filter
from config import FREE_SWIPES_PER_DAY

router = APIRouter()


def calculate_match_score(user: dict, other: dict) -> float:
    score = 0.0
    user_interests = set(user.get("interests", []))
    other_interests = set(other.get("interests", []))
    if user_interests and other_interests:
        common = user_interests.intersection(other_interests)
        total = max(len(user_interests), len(other_interests))
        score += (len(common) / total) * 0.25 if total > 0 else 0
    if user.get("university") and user.get("university") == other.get("university"):
        score += 0.15
        if user.get("campus_name") and user.get("campus_name") == other.get("campus_name"):
            score += 0.05
    if user.get("course") and user.get("course") == other.get("course"):
        score += 0.15
    user_age = user.get("age", 0)
    other_age = other.get("age", 0)
    if user_age and other_age:
        if abs(user_age - other_age) <= 3:
            score += 0.15
        elif abs(user_age - other_age) <= 5:
            score += 0.075
    if user.get("study_style") and user.get("study_style") == other.get("study_style"):
        score += 0.15
    if user.get("university_location") and user.get("university_location") == other.get("university_location"):
        score += 0.1
    return min(score, 1.0)


def check_preference_match(user: dict, other: dict) -> bool:
    user_interested_in = user.get("interested_in", [])
    other_gender = other.get("gender")
    if not user_interested_in or "everyone" in user_interested_in:
        return True
    if not other_gender:
        return True
    gender_to_preference = {"man": "men", "woman": "women", "non-binary": "non-binary"}
    preference_match = gender_to_preference.get(other_gender, other_gender)
    return preference_match in user_interested_in


@router.get("/matches/discover")
async def discover_matches(current_user: User = Depends(get_current_user)):
    existing_swipes = await db.matches.find(
        {"user_id": current_user.user_id}, {"matched_user_id": 1}
    ).to_list(1000)
    swiped_ids = [s["matched_user_id"] for s in existing_swipes]
    swiped_ids.append(current_user.user_id)

    potential_users = await db.users.find(
        {"user_id": {"$nin": swiped_ids}, "role": "student"}, {"_id": 0}
    ).to_list(100)

    current_user_dict = current_user.dict()
    scored_users = []
    for user in potential_users:
        if not check_preference_match(current_user_dict, user):
            continue
        if not check_preference_match(user, current_user_dict):
            continue
        score = calculate_match_score(current_user_dict, user)
        user["match_score"] = score
        scored_users.append(user)

    scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_users[:50]


@router.post("/matches/swipe")
async def swipe_action(data: SwipeAction, current_user: User = Depends(get_current_user)):
    if data.action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Action must be 'like' or 'dislike'")

    # Check comment for profanity/racist language
    if data.comment:
        language_check = check_language_filter(data.comment)
        if language_check["blocked"]:
            raise HTTPException(status_code=400, detail=language_check["message"])

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    user_plan = user_doc.get("plan", "free")
    swipes_today = user_doc.get("swipes_today", 0)
    last_swipe_date = user_doc.get("last_swipe_date")

    if last_swipe_date != today:
        swipes_today = 0

    if user_plan == "free" and swipes_today >= FREE_SWIPES_PER_DAY:
        raise HTTPException(status_code=403, detail={
            "message": "Daily swipe limit reached",
            "limit": FREE_SWIPES_PER_DAY,
            "upgrade_required": True
        })

    target_user = await db.users.find_one({"user_id": data.target_user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.matches.find_one({
        "user_id": current_user.user_id, "matched_user_id": data.target_user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this user")

    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"swipes_today": swipes_today + 1, "last_swipe_date": today}}
    )

    status = "liked" if data.action == "like" else "rejected"
    match = Match(
        user_id=current_user.user_id, matched_user_id=data.target_user_id,
        status=status, score=calculate_match_score(current_user.dict(), target_user),
        comment=data.comment if data.action == "like" else None,
        liked_section=data.liked_section if data.action == "like" else None
    )
    await db.matches.insert_one(match.dict())

    mutual_match = None
    if data.action == "like":
        like_notification_body = f"{current_user.name} liked your profile!"
        if data.comment:
            like_notification_body = f'{current_user.name} liked {data.liked_section or "your profile"}: "{data.comment[:60]}{"..." if len(data.comment) > 60 else ""}"'
        elif data.liked_section:
            like_notification_body = f"{current_user.name} liked {data.liked_section}!"

        await send_push_notification(
            data.target_user_id, "Someone likes you!", like_notification_body, "new_like",
            {"from_user_id": current_user.user_id, "from_user_name": current_user.name,
             "comment": data.comment, "liked_section": data.liked_section}
        )

        reverse_match = await db.matches.find_one({
            "user_id": data.target_user_id, "matched_user_id": current_user.user_id, "status": "liked"
        }, {"_id": 0})

        if reverse_match:
            await db.matches.update_many(
                {"$or": [
                    {"user_id": current_user.user_id, "matched_user_id": data.target_user_id},
                    {"user_id": data.target_user_id, "matched_user_id": current_user.user_id}
                ]},
                {"$set": {"status": "accepted"}}
            )
            mutual_match = target_user

            original_like = await db.matches.find_one({
                "user_id": data.target_user_id, "matched_user_id": current_user.user_id, "status": "liked"
            })
            like_comment = original_like.get("comment") if original_like else None

            match_msg_to_current = f"You matched with {target_user.get('name', 'someone')}! Start chatting now."
            match_msg_to_target = f"You matched with {current_user.name}!"
            if data.comment:
                match_msg_to_target += f' They said: "{data.comment[:50]}{"..." if len(data.comment) > 50 else ""}"'
            else:
                match_msg_to_target += " Start chatting now."

            await send_push_notification(
                current_user.user_id, "New Match!", match_msg_to_current, "new_match",
                {"match_user_id": data.target_user_id, "match_user_name": target_user.get("name"), "comment": like_comment}
            )
            await send_push_notification(
                data.target_user_id, "New Match!", match_msg_to_target, "new_match",
                {"match_user_id": current_user.user_id, "match_user_name": current_user.name, "comment": data.comment}
            )

    remaining_swipes = None
    if user_plan == "free":
        remaining_swipes = FREE_SWIPES_PER_DAY - (swipes_today + 1)

    return {
        "match": match.dict(),
        "is_mutual": mutual_match is not None,
        "matched_user": mutual_match,
        "remaining_swipes": remaining_swipes,
        "is_premium": user_plan == "premium"
    }


@router.get("/matches/accepted")
async def get_accepted_matches(current_user: User = Depends(get_current_user)):
    matches = await db.matches.find(
        {"user_id": current_user.user_id, "status": "accepted"}, {"_id": 0}
    ).to_list(100)

    result = []
    for match in matches:
        user = await db.users.find_one({"user_id": match["matched_user_id"]}, {"_id": 0})
        if user:
            result.append({
                "match_id": match["id"],
                "user": user,
                "comment": match.get("comment"),
                "liked_section": match.get("liked_section")
            })
    return result


@router.get("/matches/likes-received")
async def get_likes_received(current_user: User = Depends(get_current_user)):
    likes = await db.matches.find(
        {"matched_user_id": current_user.user_id, "status": "liked"}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    result = []
    for like in likes:
        response = await db.matches.find_one({
            "user_id": current_user.user_id, "matched_user_id": like["user_id"]
        })
        if response:
            continue
        user = await db.users.find_one({"user_id": like["user_id"]}, {"_id": 0})
        if user:
            result.append({
                "like_id": like["id"],
                "user": user,
                "comment": like.get("comment"),
                "liked_section": like.get("liked_section"),
                "created_at": like.get("created_at")
            })
    return result
