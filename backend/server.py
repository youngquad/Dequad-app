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
    role: str = "student"  # student, admin
    interests: List[str] = []
    university: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
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
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None

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
    """Calculate match score based on interests, university, age, study_style"""
    score = 0.0
    
    # Interest similarity (40%)
    user_interests = set(user.get("interests", []))
    other_interests = set(other.get("interests", []))
    if user_interests and other_interests:
        common = user_interests.intersection(other_interests)
        total = max(len(user_interests), len(other_interests))
        score += (len(common) / total) * 0.4 if total > 0 else 0
    
    # Same university (20%)
    if user.get("university") and user.get("university") == other.get("university"):
        score += 0.2
    
    # Age proximity (20%)
    user_age = user.get("age", 0)
    other_age = other.get("age", 0)
    if user_age and other_age:
        if abs(user_age - other_age) <= 3:
            score += 0.2
        elif abs(user_age - other_age) <= 5:
            score += 0.1
    
    # Same study style (20%)
    if user.get("study_style") and user.get("study_style") == other.get("study_style"):
        score += 0.2
    
    return score

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
    ).to_list(50)
    
    # Calculate and sort by match score
    current_user_dict = current_user.dict()
    scored_users = []
    for user in potential_users:
        score = calculate_match_score(current_user_dict, user)
        user["match_score"] = score
        scored_users.append(user)
    
    # Sort by score descending
    scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    
    return scored_users

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
