from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="Educare API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    photos: List[str] = []  # Up to 3 profile photos in base64
    role: str = "student"  # student, admin
    interests: List[str] = []
    university: Optional[str] = None
    university_location: Optional[str] = None
    campus_name: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
    ethnicity: Optional[str] = None
    interested_in: List[str] = []  # men, women, non-binary, everyone
    gender: Optional[str] = None  # man, woman, non-binary
    push_token: Optional[str] = None
    notifications_enabled: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: int  # 1-10
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: int
    feedback: str
    lecture_topic: Optional[str] = None
    risk_score: Optional[int] = None
    ai_analysis: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    matched_user_id: str
    status: str = "pending"  # pending, accepted, rejected
    score: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: str
    text: str  # Encrypted text
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reported_user_id: str
    reporter_id: str
    reason: str
    status: str = "pending"  # pending, reviewed, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    body: str
    notification_type: str  # new_match, new_message
    data: dict = {}
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== REQUEST/RESPONSE MODELS ====================

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class MoodCreate(BaseModel):
    mood: int
    notes: Optional[str] = None

class FeedbackCreate(BaseModel):
    mood: int
    feedback: str
    lecture_topic: Optional[str] = None

class ProfileUpdate(BaseModel):
    interests: Optional[List[str]] = None
    university: Optional[str] = None
    university_location: Optional[str] = None
    campus_name: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
    ethnicity: Optional[str] = None
    interested_in: Optional[List[str]] = None
    gender: Optional[str] = None
    push_token: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    photos: Optional[List[str]] = None  # Up to 3 photos in base64

class SwipeAction(BaseModel):
    target_user_id: str
    action: str  # like, dislike

class SendMessage(BaseModel):
    match_id: str
    text: str

class ReportCreate(BaseModel):
    reported_user_id: str
    reason: str

# ==================== AUTH HELPERS ====================

async def get_session_token(request: Request) -> Optional[str]:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        return session_token
    
    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    
    return None

async def get_current_user(request: Request) -> User:
    session_token = await get_session_token(request)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiration with timezone awareness
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_optional_user(request: Request) -> Optional[User]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== NOTIFICATION HELPERS ====================

async def send_push_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    """Send push notification to user via Expo Push Service"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("push_token") or not user.get("notifications_enabled", True):
        return None
    
    # Store notification in database
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    await db.notifications.insert_one(notification.dict())
    
    # Send via Expo Push API
    push_token = user.get("push_token")
    if push_token and push_token.startswith("ExponentPushToken"):
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://exp.host/--/api/v2/push/send",
                    json={
                        "to": push_token,
                        "title": title,
                        "body": body,
                        "data": data,
                        "sound": "default"
                    }
                )
        except Exception as e:
            logger.error(f"Push notification error: {e}")
    
    return notification

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=500, detail="Authentication failed")
    
    session_data = SessionDataResponse(**user_data)
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": session_data.email}, {"_id": 0})
    
    if not existing_user:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "role": "student",
            "interests": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    else:
        user_id = existing_user["user_id"]
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_data.session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_data.session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"user": user_doc, "session_token": session_data.session_token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = await get_session_token(request)
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== PROFILE ENDPOINTS ====================

@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    return User(**user_doc)

# ==================== MOOD ENDPOINTS ====================

@api_router.post("/mood")
async def create_mood(data: MoodCreate, current_user: User = Depends(get_current_user)):
    """Log mood entry"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    mood_entry = MoodEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        notes=data.notes
    )
    
    await db.mood_entries.insert_one(mood_entry.dict())
    return mood_entry

@api_router.get("/mood", response_model=List[MoodEntry])
async def get_mood_history(current_user: User = Depends(get_current_user)):
    """Get mood history for current user"""
    entries = await db.mood_entries.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [MoodEntry(**e) for e in entries]

# ==================== FEEDBACK & AI RISK PREDICTION ====================

@api_router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    """Submit lecture feedback and get AI risk analysis"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    # Get AI risk analysis
    risk_score = 0
    ai_analysis = ""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"risk_{current_user.user_id}_{uuid.uuid4().hex[:8]}",
            system_message="""You are a student wellbeing AI assistant. Analyze student mood and feedback to assess their mental health risk level.
            
            Based on the mood score (1-10, where 1 is very poor and 10 is excellent) and feedback content, provide:
            1. A risk score from 0-100 (0 = no risk, 100 = high risk)
            2. A brief analysis (2-3 sentences) explaining your assessment and any concerns.
            
            Consider factors like:
            - Low mood scores (1-3) indicate higher risk
            - Negative sentiment in feedback
            - Signs of stress, anxiety, or disengagement
            - Positive indicators that reduce risk
            
            Respond in JSON format: {"risk_score": number, "analysis": "string"}"""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"Student mood score: {data.mood}/10\nLecture topic: {data.lecture_topic or 'Not specified'}\nFeedback: {data.feedback}"
        )
        
        response = await chat.send_message(user_message)
        
        # Parse AI response
        import json
        try:
            ai_result = json.loads(response)
            risk_score = ai_result.get("risk_score", 0)
            ai_analysis = ai_result.get("analysis", "")
        except json.JSONDecodeError:
            # If not valid JSON, use basic scoring
            risk_score = max(0, 100 - (data.mood * 10))
            ai_analysis = response
            
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        # Fallback to basic risk scoring
        risk_score = max(0, 100 - (data.mood * 10))
        ai_analysis = f"Basic risk assessment based on mood score: {data.mood}/10"
    
    feedback_entry = FeedbackEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        feedback=data.feedback,
        lecture_topic=data.lecture_topic,
        risk_score=risk_score,
        ai_analysis=ai_analysis
    )
    
    await db.feedback_entries.insert_one(feedback_entry.dict())
    
    # Also log to risk_scores for admin dashboard
    await db.risk_scores.insert_one({
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "risk_score": risk_score,
        "created_at": datetime.now(timezone.utc)
    })
    
    return feedback_entry

@api_router.get("/feedback", response_model=List[FeedbackEntry])
async def get_feedback_history(current_user: User = Depends(get_current_user)):
    """Get feedback history for current user"""
    entries = await db.feedback_entries.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [FeedbackEntry(**e) for e in entries]

# ==================== MATCHING ENDPOINTS ====================

def calculate_match_score(user: dict, other: dict) -> float:
    """Calculate match score based on interests, university, campus, course, age, study_style, ethnicity"""
    score = 0.0
    
    # Interest similarity (25%)
    user_interests = set(user.get("interests", []))
    other_interests = set(other.get("interests", []))
    if user_interests and other_interests:
        common = user_interests.intersection(other_interests)
        total = max(len(user_interests), len(other_interests))
        score += (len(common) / total) * 0.25 if total > 0 else 0
    
    # Same university (15%)
    if user.get("university") and user.get("university") == other.get("university"):
        score += 0.15
        # Bonus for same campus (5%)
        if user.get("campus_name") and user.get("campus_name") == other.get("campus_name"):
            score += 0.05
    
    # Same course (15%)
    if user.get("course") and user.get("course") == other.get("course"):
        score += 0.15
    
    # Age proximity (15%)
    user_age = user.get("age", 0)
    other_age = other.get("age", 0)
    if user_age and other_age:
        if abs(user_age - other_age) <= 3:
            score += 0.15
        elif abs(user_age - other_age) <= 5:
            score += 0.075
    
    # Same study style (15%)
    if user.get("study_style") and user.get("study_style") == other.get("study_style"):
        score += 0.15
    
    # Same location (10%)
    if user.get("university_location") and user.get("university_location") == other.get("university_location"):
        score += 0.1
    
    return min(score, 1.0)  # Cap at 1.0

def check_preference_match(user: dict, other: dict) -> bool:
    """Check if other matches user's dating preferences"""
    user_interested_in = user.get("interested_in", [])
    other_gender = other.get("gender")
    
    # If no preferences set or "everyone" is selected, match everyone
    if not user_interested_in or "everyone" in user_interested_in:
        return True
    
    # If other hasn't set gender, allow the match
    if not other_gender:
        return True
    
    # Map gender to preference format
    gender_to_preference = {
        "man": "men",
        "woman": "women",
        "non-binary": "non-binary"
    }
    
    preference_match = gender_to_preference.get(other_gender, other_gender)
    return preference_match in user_interested_in

@api_router.get("/matches/discover")
async def discover_matches(current_user: User = Depends(get_current_user)):
    """Get potential matches for swiping"""
    # Get users we haven't swiped on yet
    existing_swipes = await db.matches.find(
        {"user_id": current_user.user_id},
        {"matched_user_id": 1}
    ).to_list(1000)
    
    swiped_ids = [s["matched_user_id"] for s in existing_swipes]
    swiped_ids.append(current_user.user_id)  # Exclude self
    
    # Get potential matches
    potential_users = await db.users.find(
        {
            "user_id": {"$nin": swiped_ids},
            "role": "student"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Filter by preferences and calculate scores
    current_user_dict = current_user.dict()
    scored_users = []
    for user in potential_users:
        # Check if user matches current user's preferences
        if not check_preference_match(current_user_dict, user):
            continue
        # Check if current user matches the other user's preferences (mutual)
        if not check_preference_match(user, current_user_dict):
            continue
        
        score = calculate_match_score(current_user_dict, user)
        user["match_score"] = score
        scored_users.append(user)
    
    # Sort by score descending
    scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    
    return scored_users[:50]  # Limit to 50

@api_router.post("/matches/swipe")
async def swipe_action(data: SwipeAction, current_user: User = Depends(get_current_user)):
    """Process swipe action (like/dislike)"""
    if data.action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Action must be 'like' or 'dislike'")
    
    # Check if target user exists
    target_user = await db.users.find_one({"user_id": data.target_user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already swiped
    existing = await db.matches.find_one({
        "user_id": current_user.user_id,
        "matched_user_id": data.target_user_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this user")
    
    status = "liked" if data.action == "like" else "rejected"
    
    match = Match(
        user_id=current_user.user_id,
        matched_user_id=data.target_user_id,
        status=status,
        score=calculate_match_score(current_user.dict(), target_user)
    )
    
    await db.matches.insert_one(match.dict())
    
    # Check for mutual match
    mutual_match = None
    if data.action == "like":
        reverse_match = await db.matches.find_one({
            "user_id": data.target_user_id,
            "matched_user_id": current_user.user_id,
            "status": "liked"
        }, {"_id": 0})
        
        if reverse_match:
            # Update both to accepted
            await db.matches.update_many(
                {
                    "$or": [
                        {"user_id": current_user.user_id, "matched_user_id": data.target_user_id},
                        {"user_id": data.target_user_id, "matched_user_id": current_user.user_id}
                    ]
                },
                {"$set": {"status": "accepted"}}
            )
            mutual_match = target_user
            
            # Send push notifications to both users about the match
            await send_push_notification(
                current_user.user_id,
                "New Match!",
                f"You matched with {target_user.get('name', 'someone')}! Start chatting now.",
                "new_match",
                {"match_user_id": data.target_user_id, "match_user_name": target_user.get("name")}
            )
            await send_push_notification(
                data.target_user_id,
                "New Match!",
                f"You matched with {current_user.name}! Start chatting now.",
                "new_match",
                {"match_user_id": current_user.user_id, "match_user_name": current_user.name}
            )
    
    return {
        "match": match.dict(),
        "is_mutual": mutual_match is not None,
        "matched_user": mutual_match
    }

@api_router.get("/matches/accepted")
async def get_accepted_matches(current_user: User = Depends(get_current_user)):
    """Get list of accepted matches"""
    matches = await db.matches.find(
        {
            "user_id": current_user.user_id,
            "status": "accepted"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Get matched user details
    result = []
    for match in matches:
        user = await db.users.find_one(
            {"user_id": match["matched_user_id"]},
            {"_id": 0}
        )
        if user:
            result.append({
                "match_id": match["id"],
                "user": user
            })
    
    return result

# ==================== CHAT ENDPOINTS ====================

@api_router.post("/chat/send")
async def send_message(data: SendMessage, current_user: User = Depends(get_current_user)):
    """Send encrypted message"""
    # Verify match exists and is accepted
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
    
    message = ChatMessage(
        match_id=data.match_id,
        sender_id=current_user.user_id,
        text=data.text  # Expect encrypted text from client
    )
    
    await db.chat_messages.insert_one(message.dict())
    
    # Send push notification to the other user
    # Determine the recipient (the other person in the match)
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
    
    return message

@api_router.get("/chat/{match_id}")
async def get_messages(match_id: str, current_user: User = Depends(get_current_user)):
    """Get chat messages for a match"""
    # Verify match exists and user is part of it
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
        {"match_id": match_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    return [ChatMessage(**m) for m in messages]

# ==================== REPORT ENDPOINTS ====================

@api_router.post("/reports")
async def create_report(data: ReportCreate, current_user: User = Depends(get_current_user)):
    """Report a user"""
    report = Report(
        reported_user_id=data.reported_user_id,
        reporter_id=current_user.user_id,
        reason=data.reason
    )
    
    await db.reports.insert_one(report.dict())
    return report

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get user's notifications"""
    notifications = await db.notifications.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return notifications

@api_router.post("/notifications/read/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.user_id},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

@api_router.post("/notifications/read-all")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": current_user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"success": True}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({
        "user_id": current_user.user_id,
        "read": False
    })
    
    return {"count": count}

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(require_admin)):
    """Get admin dashboard statistics"""
    total_users = await db.users.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_feedback = await db.feedback_entries.count_documents({})
    total_matches = await db.matches.count_documents({"status": "accepted"})
    pending_reports = await db.reports.count_documents({"status": "pending"})
    
    # Get recent risk scores
    risk_scores = await db.risk_scores.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate average risk
    avg_risk = 0
    if risk_scores:
        avg_risk = sum(r.get("risk_score", 0) for r in risk_scores) / len(risk_scores)
    
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_feedback": total_feedback,
        "total_matches": total_matches,
        "pending_reports": pending_reports,
        "average_risk_score": round(avg_risk, 2),
        "recent_risk_scores": risk_scores[:20]
    }

@api_router.get("/admin/reports")
async def get_reports(admin: User = Depends(require_admin)):
    """Get all reports"""
    reports = await db.reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reports

@api_router.post("/admin/block/{user_id}")
async def block_user(user_id: str, admin: User = Depends(require_admin)):
    """Block a user"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"blocked": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"blocked": True, "user_id": user_id}

@api_router.get("/admin/users")
async def get_all_users(admin: User = Depends(require_admin)):
    """Get all users"""
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return users

@api_router.post("/admin/make-admin/{user_id}")
async def make_admin(user_id: str, admin: User = Depends(require_admin)):
    """Make a user an admin"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User promoted to admin", "user_id": user_id}

# ==================== ANALYTICS ENDPOINTS ====================

async def calculate_student_engagement(user_id: str) -> dict:
    """Calculate engagement metrics for a student"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Count activities
    mood_entries_week = await db.mood_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    mood_entries_month = await db.mood_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": month_ago}
    })
    
    feedback_entries_week = await db.feedback_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    feedback_entries_month = await db.feedback_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": month_ago}
    })
    
    chat_messages_week = await db.chat_messages.count_documents({
        "sender_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    matches_count = await db.matches.count_documents({
        "user_id": user_id,
        "status": "accepted"
    })
    
    # Calculate engagement score (0-100)
    engagement_score = min(100, (
        mood_entries_week * 10 +
        feedback_entries_week * 15 +
        chat_messages_week * 5 +
        matches_count * 5
    ))
    
    # Get average mood
    recent_moods = await db.mood_entries.find(
        {"user_id": user_id, "created_at": {"$gte": month_ago}},
        {"mood": 1}
    ).to_list(100)
    
    avg_mood = 0
    if recent_moods:
        avg_mood = sum(m["mood"] for m in recent_moods) / len(recent_moods)
    
    # Get average risk score
    recent_risks = await db.risk_scores.find(
        {"user_id": user_id, "created_at": {"$gte": month_ago}},
        {"risk_score": 1}
    ).to_list(100)
    
    avg_risk = 0
    if recent_risks:
        avg_risk = sum(r["risk_score"] for r in recent_risks) / len(recent_risks)
    
    return {
        "engagement_score": engagement_score,
        "mood_entries_week": mood_entries_week,
        "mood_entries_month": mood_entries_month,
        "feedback_entries_week": feedback_entries_week,
        "feedback_entries_month": feedback_entries_month,
        "chat_messages_week": chat_messages_week,
        "matches_count": matches_count,
        "average_mood": round(avg_mood, 1),
        "average_risk": round(avg_risk, 1)
    }

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(admin: User = Depends(require_admin)):
    """Get comprehensive analytics overview for student retention and engagement"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total counts
    total_students = await db.users.count_documents({"role": "student"})
    
    # Active students (any activity in last 7 days)
    active_mood_users = await db.mood_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_feedback_users = await db.feedback_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_chat_users = await db.chat_messages.distinct("sender_id", {"created_at": {"$gte": week_ago}})
    
    active_users = set(active_mood_users + active_feedback_users + active_chat_users)
    active_count = len(active_users)
    
    # Engagement rate
    engagement_rate = (active_count / total_students * 100) if total_students > 0 else 0
    
    # Average mood across platform
    all_moods = await db.mood_entries.find(
        {"created_at": {"$gte": month_ago}},
        {"mood": 1}
    ).to_list(10000)
    
    platform_avg_mood = 0
    if all_moods:
        platform_avg_mood = sum(m["mood"] for m in all_moods) / len(all_moods)
    
    # Risk distribution
    high_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$gte": 70},
        "created_at": {"$gte": week_ago}
    })
    
    medium_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$gte": 40, "$lt": 70},
        "created_at": {"$gte": week_ago}
    })
    
    low_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$lt": 40},
        "created_at": {"$gte": week_ago}
    })
    
    # University breakdown
    university_stats = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {
            "_id": "$university",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]).to_list(10)
    
    return {
        "total_students": total_students,
        "active_students_week": active_count,
        "engagement_rate": round(engagement_rate, 1),
        "platform_average_mood": round(platform_avg_mood, 1),
        "high_risk_count": len(high_risk_students),
        "medium_risk_count": len(medium_risk_students),
        "low_risk_count": len(low_risk_students),
        "university_breakdown": [{"university": u["_id"], "students": u["count"]} for u in university_stats]
    }

@api_router.get("/admin/analytics/at-risk-students")
async def get_at_risk_students(admin: User = Depends(require_admin)):
    """Get list of students at risk of dropping out with AI analysis"""
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    
    # Get all students
    students = await db.users.find(
        {"role": "student"},
        {"_id": 0}
    ).to_list(1000)
    
    at_risk_students = []
    
    for student in students:
        user_id = student["user_id"]
        
        # Calculate engagement
        engagement = await calculate_student_engagement(user_id)
        
        # Determine risk factors
        risk_factors = []
        dropout_risk = 0
        
        # Low engagement
        if engagement["engagement_score"] < 20:
            risk_factors.append("Very low platform engagement")
            dropout_risk += 30
        elif engagement["engagement_score"] < 40:
            risk_factors.append("Low platform engagement")
            dropout_risk += 15
        
        # Low mood
        if engagement["average_mood"] > 0 and engagement["average_mood"] < 4:
            risk_factors.append("Consistently low mood")
            dropout_risk += 25
        elif engagement["average_mood"] > 0 and engagement["average_mood"] < 6:
            risk_factors.append("Below average mood")
            dropout_risk += 10
        
        # High risk scores
        if engagement["average_risk"] > 70:
            risk_factors.append("High wellbeing risk score")
            dropout_risk += 30
        elif engagement["average_risk"] > 50:
            risk_factors.append("Elevated wellbeing risk")
            dropout_risk += 15
        
        # No recent activity
        if engagement["mood_entries_week"] == 0 and engagement["feedback_entries_week"] == 0:
            risk_factors.append("No recent activity")
            dropout_risk += 20
        
        # No social connections
        if engagement["matches_count"] == 0:
            risk_factors.append("No peer connections")
            dropout_risk += 10
        
        dropout_risk = min(100, dropout_risk)
        
        if dropout_risk >= 30:  # Only include students with significant risk
            at_risk_students.append({
                "user_id": user_id,
                "name": student.get("name", "Unknown"),
                "email": student.get("email", ""),
                "university": student.get("university"),
                "course": student.get("course"),
                "dropout_risk": dropout_risk,
                "risk_level": "High" if dropout_risk >= 60 else "Medium" if dropout_risk >= 40 else "Low",
                "risk_factors": risk_factors,
                "engagement_score": engagement["engagement_score"],
                "average_mood": engagement["average_mood"],
                "last_activity": {
                    "mood_entries_week": engagement["mood_entries_week"],
                    "feedback_entries_week": engagement["feedback_entries_week"]
                }
            })
    
    # Sort by risk level
    at_risk_students.sort(key=lambda x: x["dropout_risk"], reverse=True)
    
    return {
        "total_at_risk": len(at_risk_students),
        "high_risk": len([s for s in at_risk_students if s["risk_level"] == "High"]),
        "medium_risk": len([s for s in at_risk_students if s["risk_level"] == "Medium"]),
        "students": at_risk_students[:50]  # Top 50 at-risk students
    }

@api_router.get("/admin/analytics/student/{user_id}")
async def get_student_analytics(user_id: str, admin: User = Depends(require_admin)):
    """Get detailed analytics for a specific student"""
    student = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    engagement = await calculate_student_engagement(user_id)
    
    # Get mood history
    mood_history = await db.mood_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    
    # Get feedback history
    feedback_history = await db.feedback_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    # Get risk score history
    risk_history = await db.risk_scores.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    
    return {
        "student": student,
        "engagement": engagement,
        "mood_history": mood_history,
        "feedback_history": feedback_history,
        "risk_history": risk_history
    }

@api_router.get("/admin/analytics/retention")
async def get_retention_analytics(admin: User = Depends(require_admin)):
    """Get student retention analytics by university"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Get all universities
    universities = await db.users.distinct("university", {"role": "student", "university": {"$ne": None}})
    
    retention_data = []
    
    for uni in universities:
        if not uni:
            continue
            
        # Total students at university
        total_students = await db.users.count_documents({
            "role": "student",
            "university": uni
        })
        
        # Get active students at university
        uni_students = await db.users.find(
            {"role": "student", "university": uni},
            {"user_id": 1}
        ).to_list(1000)
        
        uni_user_ids = [s["user_id"] for s in uni_students]
        
        active_week = await db.mood_entries.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "created_at": {"$gte": week_ago}
        })
        
        active_month = await db.mood_entries.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "created_at": {"$gte": month_ago}
        })
        
        # Get average mood for university
        uni_moods = await db.mood_entries.find(
            {"user_id": {"$in": uni_user_ids}, "created_at": {"$gte": month_ago}},
            {"mood": 1}
        ).to_list(10000)
        
        avg_mood = 0
        if uni_moods:
            avg_mood = sum(m["mood"] for m in uni_moods) / len(uni_moods)
        
        # Get at-risk count for university
        at_risk = await db.risk_scores.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "risk_score": {"$gte": 60},
            "created_at": {"$gte": week_ago}
        })
        
        weekly_retention = (len(active_week) / total_students * 100) if total_students > 0 else 0
        monthly_retention = (len(active_month) / total_students * 100) if total_students > 0 else 0
        
        retention_data.append({
            "university": uni,
            "total_students": total_students,
            "active_weekly": len(active_week),
            "active_monthly": len(active_month),
            "weekly_retention_rate": round(weekly_retention, 1),
            "monthly_retention_rate": round(monthly_retention, 1),
            "average_mood": round(avg_mood, 1),
            "at_risk_count": len(at_risk),
            "health_status": "Good" if avg_mood >= 6 and weekly_retention >= 50 else "Attention Needed" if avg_mood >= 4 else "Critical"
        })
    
    # Sort by retention rate
    retention_data.sort(key=lambda x: x["weekly_retention_rate"], reverse=True)
    
    return {
        "universities": retention_data,
        "total_universities": len(retention_data)
    }

@api_router.post("/admin/analytics/ai-insights")
async def get_ai_insights(admin: User = Depends(require_admin)):
    """Get AI-powered insights on student retention and wellbeing"""
    # Gather platform data
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    
    total_students = await db.users.count_documents({"role": "student"})
    
    # Get mood distribution
    all_moods = await db.mood_entries.find(
        {"created_at": {"$gte": month_ago}},
        {"mood": 1, "user_id": 1}
    ).to_list(10000)
    
    mood_distribution = {i: 0 for i in range(1, 11)}
    for m in all_moods:
        mood_distribution[m["mood"]] = mood_distribution.get(m["mood"], 0) + 1
    
    # Get risk distribution
    risk_scores = await db.risk_scores.find(
        {"created_at": {"$gte": month_ago}},
        {"risk_score": 1}
    ).to_list(10000)
    
    high_risk = len([r for r in risk_scores if r["risk_score"] >= 70])
    medium_risk = len([r for r in risk_scores if 40 <= r["risk_score"] < 70])
    low_risk = len([r for r in risk_scores if r["risk_score"] < 40])
    
    # Get university data
    university_counts = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {"_id": "$university", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    # Generate AI insights
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"admin_insights_{uuid.uuid4().hex[:8]}",
            system_message="""You are an educational analytics AI assistant. Analyze the provided student wellbeing data and generate actionable insights for university administrators.

Focus on:
1. Student retention risks
2. Dropout prediction factors
3. Engagement improvement suggestions
4. University-specific recommendations
5. Early intervention opportunities

Respond in JSON format:
{
    "summary": "Brief overview of platform health",
    "retention_insights": ["insight1", "insight2"],
    "dropout_risk_factors": ["factor1", "factor2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "priority_actions": ["action1", "action2"],
    "positive_trends": ["trend1", "trend2"]
}"""
        ).with_model("openai", "gpt-4o")
        
        data_summary = f"""
Platform Data (Last 30 days):
- Total Students: {total_students}
- Mood Entries: {len(all_moods)}
- Mood Distribution: {mood_distribution}
- Risk Scores: High={high_risk}, Medium={medium_risk}, Low={low_risk}
- Top Universities: {[{'name': u['_id'], 'students': u['count']} for u in university_counts]}
"""
        
        user_message = UserMessage(text=data_summary)
        response = await chat.send_message(user_message)
        
        import json
        try:
            insights = json.loads(response)
        except:
            insights = {
                "summary": response,
                "retention_insights": [],
                "dropout_risk_factors": [],
                "recommendations": [],
                "priority_actions": [],
                "positive_trends": []
            }
        
    except Exception as e:
        logger.error(f"AI insights error: {e}")
        insights = {
            "summary": "Unable to generate AI insights at this time",
            "retention_insights": [],
            "dropout_risk_factors": [],
            "recommendations": [],
            "priority_actions": [],
            "positive_trends": []
        }
    
    return {
        "insights": insights,
        "data_summary": {
            "total_students": total_students,
            "mood_entries_count": len(all_moods),
            "high_risk_count": high_risk,
            "medium_risk_count": medium_risk,
            "low_risk_count": low_risk
        }
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Educare API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
