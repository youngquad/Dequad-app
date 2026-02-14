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
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
stripe.api_key = STRIPE_SECRET_KEY

# Stripe Price Configuration (£4.99/month)
STRIPE_PRICE_AMOUNT = 499  # in pence
STRIPE_PRICE_CURRENCY = "gbp"
STRIPE_PRODUCT_NAME = "Educare Premium"

# Swipe limits
FREE_SWIPES_PER_DAY = 5

# ==================== SAFEGUARDING MATRIX ====================
# Keywords that indicate potential crisis/self-harm
SAFEGUARDING_KEYWORDS = [
    "kill myself", "want to die", "end my life", "suicide",
    "self harm", "self-harm", "cut myself", "hurt myself",
    "no reason to live", "end it all", "better off dead",
    "can't go on", "give up on life", "take my life",
    "don't want to be here", "want to disappear", "overdose",
    "jump off", "hang myself", "slit my wrists"
]

# UK Crisis Resources
CRISIS_RESOURCES = {
    "samaritans": {
        "name": "Samaritans",
        "phone": "116 123",
        "description": "Free 24/7 support - Talk to someone who cares",
        "available": "24 hours a day, 7 days a week"
    },
    "nhs_111": {
        "name": "NHS 111",
        "phone": "111",
        "description": "Non-emergency medical help",
        "available": "24 hours a day"
    },
    "emergency": {
        "name": "Emergency Services",
        "phone": "999",
        "description": "For immediate danger to life",
        "available": "24 hours a day"
    },
    "shout": {
        "name": "Shout Crisis Text Line",
        "phone": "Text SHOUT to 85258",
        "description": "Free, confidential text support",
        "available": "24/7"
    }
}

def check_safeguarding_content(text: str) -> dict:
    """
    Check text for safeguarding concerns and return risk level with resources
    """
    if not text:
        return {"flagged": False, "risk_level": "none", "matched_keywords": []}
    
    text_lower = text.lower()
    matched_keywords = []
    
    for keyword in SAFEGUARDING_KEYWORDS:
        if keyword in text_lower:
            matched_keywords.append(keyword)
    
    if len(matched_keywords) >= 2:
        risk_level = "high"
    elif len(matched_keywords) == 1:
        risk_level = "medium"
    else:
        risk_level = "none"
    
    return {
        "flagged": len(matched_keywords) > 0,
        "risk_level": risk_level,
        "matched_keywords": matched_keywords,
        "resources": CRISIS_RESOURCES if matched_keywords else None
    }

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
    # Subscription fields
    plan: str = "free"  # free, premium
    stripe_customer_id: Optional[str] = None
    swipes_today: int = 0
    last_swipe_date: Optional[str] = None  # YYYY-MM-DD format
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

class SafeguardingAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    source: str  # mood, chat, feedback
    content: str
    risk_level: str  # medium, high
    matched_keywords: List[str]
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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

async def create_safeguarding_alert(user: User, source: str, content: str, safeguarding_result: dict):
    """Create a safeguarding alert for admin review"""
    alert = SafeguardingAlert(
        user_id=user.user_id,
        user_name=user.name,
        user_email=user.email,
        source=source,
        content=content,
        risk_level=safeguarding_result["risk_level"],
        matched_keywords=safeguarding_result["matched_keywords"]
    )
    await db.safeguarding_alerts.insert_one(alert.dict())
    logger.warning(f"SAFEGUARDING ALERT: {safeguarding_result['risk_level']} risk detected for user {user.user_id} in {source}")
    return alert

@api_router.post("/mood")
async def create_mood(data: MoodCreate, current_user: User = Depends(get_current_user)):
    """Log mood entry with safeguarding check"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    # Check for safeguarding concerns in notes
    safeguarding_result = check_safeguarding_content(data.notes or "")
    
    mood_entry = MoodEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        notes=data.notes
    )
    
    await db.mood_entries.insert_one(mood_entry.dict())
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "mood",
            data.notes or "",
            safeguarding_result
        )
    
    # Return mood entry with safeguarding info if flagged
    response = mood_entry.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

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
    """Submit lecture feedback with safeguarding check (AI analysis is admin-only)"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    # Check for safeguarding concerns in feedback
    safeguarding_result = check_safeguarding_content(data.feedback)
    
    # Basic risk scoring (no AI for regular users - AI analysis is admin-only)
    risk_score = max(0, 100 - (data.mood * 10))
    ai_analysis = ""  # AI analysis only shown to admins
    
    feedback_entry = FeedbackEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        feedback=data.feedback,
        lecture_topic=data.lecture_topic,
        risk_score=risk_score,
        ai_analysis=ai_analysis
    )
    
    await db.feedback_entries.insert_one(feedback_entry.dict())
    
    # Log to risk_scores for admin dashboard
    await db.risk_scores.insert_one({
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "risk_score": risk_score,
        "created_at": datetime.now(timezone.utc)
    })
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "feedback",
            data.feedback,
            safeguarding_result
        )
    
    # Return feedback WITHOUT AI analysis (users don't see risk scores)
    response = {
        "entry_id": feedback_entry.entry_id,
        "mood": feedback_entry.mood,
        "feedback": feedback_entry.feedback,
        "lecture_topic": feedback_entry.lecture_topic,
        "created_at": feedback_entry.created_at,
        "message": "Thank you for your feedback!"
    }
    
    # Add safeguarding info if flagged
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

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
    
    # Check swipe limit for free users
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    user_plan = user_doc.get("plan", "free")
    swipes_today = user_doc.get("swipes_today", 0)
    last_swipe_date = user_doc.get("last_swipe_date")
    
    # Reset swipes if it's a new day
    if last_swipe_date != today:
        swipes_today = 0
    
    # Check limit for free users
    if user_plan == "free" and swipes_today >= FREE_SWIPES_PER_DAY:
        raise HTTPException(
            status_code=403, 
            detail={
                "message": "Daily swipe limit reached",
                "limit": FREE_SWIPES_PER_DAY,
                "upgrade_required": True
            }
        )
    
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
    
    # Update swipe count
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"swipes_today": swipes_today + 1, "last_swipe_date": today}}
    )
    
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
    
    # Return remaining swipes info for free users
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
    
    # Check for safeguarding concerns in message
    safeguarding_result = check_safeguarding_content(data.text)
    
    message = ChatMessage(
        match_id=data.match_id,
        sender_id=current_user.user_id,
        text=data.text  # Expect encrypted text from client
    )
    
    await db.chat_messages.insert_one(message.dict())
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "chat",
            data.text,
            safeguarding_result
        )
    
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
    
    # Return message with safeguarding info if flagged
    response = message.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

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

# ==================== ADMIN SAFEGUARDING ENDPOINTS ====================

@api_router.get("/admin/safeguarding-alerts")
async def get_safeguarding_alerts(admin: User = Depends(require_admin)):
    """Get all safeguarding alerts (Admin Only)"""
    alerts = await db.safeguarding_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return {
        "alerts": alerts,
        "unacknowledged_count": len([a for a in alerts if not a.get("acknowledged", False)]),
        "high_risk_count": len([a for a in alerts if a.get("risk_level") == "high"]),
        "total_count": len(alerts)
    }

@api_router.post("/admin/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, admin: User = Depends(require_admin)):
    """Acknowledge a safeguarding alert (Admin Only)"""
    result = await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {
            "acknowledged": True,
            "acknowledged_by": admin.user_id,
            "acknowledged_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert acknowledged", "alert_id": alert_id}

@api_router.get("/admin/ai-risk-analysis/{user_id}")
async def admin_ai_risk_analysis(user_id: str, admin: User = Depends(require_admin)):
    """Get AI-powered risk analysis for a specific student (Admin Only)"""
    # Get user info
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's mood entries and feedback
    mood_entries = await db.mood_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    feedback_entries = await db.feedback_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Prepare data for AI analysis
    mood_data = [{"mood": e.get("mood"), "notes": e.get("notes"), "date": str(e.get("created_at"))} for e in mood_entries]
    feedback_data = [{"mood": e.get("mood"), "feedback": e.get("feedback"), "topic": e.get("lecture_topic"), "date": str(e.get("created_at"))} for e in feedback_entries]
    
    # Get AI risk analysis
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"admin_risk_{user_id}_{uuid.uuid4().hex[:8]}",
            system_message="""You are a student wellbeing AI assistant helping university administrators assess student risk levels.
            
            Analyze the student's mood entries and feedback to provide a comprehensive risk assessment.
            
            Provide your response in JSON format with:
            {
                "overall_risk_score": 0-100,
                "risk_level": "low" | "medium" | "high" | "critical",
                "key_concerns": ["concern1", "concern2"],
                "positive_indicators": ["indicator1", "indicator2"],
                "recommendation": "brief recommendation for admin",
                "summary": "2-3 sentence summary of overall wellbeing"
            }
            
            Consider factors like:
            - Mood trends (declining = higher risk)
            - Concerning language in notes/feedback
            - Engagement levels
            - Signs of stress, isolation, or disengagement"""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Student: {user.get('name', 'Unknown')}
University: {user.get('university', 'Not specified')}
Course: {user.get('course', 'Not specified')}

Mood Entries (last 50):
{mood_data}

Feedback Entries (last 50):
{feedback_data}"""
        )
        
        response = await chat.send_message(user_message)
        
        import json
        try:
            ai_result = json.loads(response)
        except json.JSONDecodeError:
            ai_result = {
                "overall_risk_score": 50,
                "risk_level": "medium",
                "key_concerns": ["Unable to parse AI response"],
                "positive_indicators": [],
                "recommendation": response[:500],
                "summary": "AI analysis returned non-JSON response"
            }
            
    except Exception as e:
        logger.error(f"Admin AI analysis error: {e}")
        # Calculate basic risk score
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else 5
        basic_risk = max(0, 100 - (avg_mood * 10))
        
        ai_result = {
            "overall_risk_score": round(basic_risk),
            "risk_level": "high" if basic_risk > 70 else "medium" if basic_risk > 40 else "low",
            "key_concerns": ["AI analysis unavailable - using basic scoring"],
            "positive_indicators": [],
            "recommendation": "Review student's data manually",
            "summary": f"Basic risk assessment based on average mood: {avg_mood:.1f}/10"
        }
    
    return {
        "user": {
            "user_id": user.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "university": user.get("university"),
            "course": user.get("course")
        },
        "ai_analysis": ai_result,
        "data_summary": {
            "total_mood_entries": len(mood_entries),
            "total_feedback_entries": len(feedback_entries),
            "average_mood": sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else None
        }
    }

@api_router.get("/admin/crisis-resources")
async def get_crisis_resources(admin: User = Depends(require_admin)):
    """Get crisis resources configuration (Admin Only)"""
    return {
        "resources": CRISIS_RESOURCES,
        "keywords": SAFEGUARDING_KEYWORDS
    }

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
        except json.JSONDecodeError:
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

# ==================== SUBSCRIPTION & BILLING ENDPOINTS ====================

class CreateCheckoutRequest(BaseModel):
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

@api_router.post("/subscription/create-checkout")
async def create_checkout_session(data: CreateCheckoutRequest, current_user: User = Depends(get_current_user)):
    """Create a Stripe checkout session for premium subscription"""
    try:
        # Create or retrieve Stripe customer
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        
        if not stripe_customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.name,
                metadata={"user_id": current_user.user_id}
            )
            stripe_customer_id = customer.id
            
            # Save customer ID to database
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {"stripe_customer_id": stripe_customer_id}}
            )
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": STRIPE_PRICE_CURRENCY,
                    "unit_amount": STRIPE_PRICE_AMOUNT,
                    "recurring": {"interval": "month"},
                    "product_data": {"name": STRIPE_PRODUCT_NAME},
                },
                "quantity": 1,
            }],
            success_url=data.success_url or "educare://subscription-success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=data.cancel_url or "educare://subscription-cancel",
            metadata={"user_id": current_user.user_id},
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/subscription/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get current subscription status for user"""
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    swipes_today = user_doc.get("swipes_today", 0)
    last_swipe_date = user_doc.get("last_swipe_date")
    
    # Reset swipes if it's a new day
    if last_swipe_date != today:
        swipes_today = 0
    
    plan = user_doc.get("plan", "free")
    remaining_swipes = FREE_SWIPES_PER_DAY - swipes_today if plan == "free" else None
    
    return {
        "plan": plan,
        "is_premium": plan == "premium",
        "stripe_customer_id": user_doc.get("stripe_customer_id"),
        "swipes_today": swipes_today if plan == "free" else 0,
        "remaining_swipes": remaining_swipes,
        "daily_limit": FREE_SWIPES_PER_DAY if plan == "free" else None,
        "price": f"£{STRIPE_PRICE_AMOUNT / 100:.2f}/month"
    }

@api_router.post("/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel user's premium subscription"""
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    stripe_customer_id = user_doc.get("stripe_customer_id")
    
    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="No active subscription")
    
    try:
        # List active subscriptions for this customer
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=1
        )
        
        if not subscriptions.data:
            raise HTTPException(status_code=400, detail="No active subscription found")
        
        # Cancel the subscription
        stripe.Subscription.cancel(subscriptions.data[0].id)
        
        # Update user plan in database
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"plan": "free"}}
        )
        
        return {"message": "Subscription cancelled successfully", "plan": "free"}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error cancelling subscription: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/subscription/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    logger.info(f"Processing Stripe webhook: {event_type}")
    
    if event_type == "checkout.session.completed":
        # Payment successful, upgrade user to premium
        user_id = event_data.get("metadata", {}).get("user_id")
        customer_id = event_data.get("customer")
        
        if user_id:
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "plan": "premium",
                    "stripe_customer_id": customer_id
                }}
            )
            logger.info(f"User {user_id} upgraded to premium")
    
    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled or expired
        customer_id = event_data.get("customer")
        
        if customer_id:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": "free"}}
            )
            logger.info(f"Subscription deleted for customer {customer_id}")
    
    elif event_type == "customer.subscription.updated":
        # Subscription updated (could be paused, resumed, etc.)
        customer_id = event_data.get("customer")
        status = event_data.get("status")
        
        if customer_id:
            plan = "premium" if status == "active" else "free"
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": plan}}
            )
            logger.info(f"Subscription updated for customer {customer_id}, status: {status}")
    
    elif event_type == "invoice.payment_failed":
        # Payment failed, downgrade user
        customer_id = event_data.get("customer")
        
        if customer_id:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": "free"}}
            )
            logger.info(f"Payment failed for customer {customer_id}, downgraded to free")
    
    return {"received": True}

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
