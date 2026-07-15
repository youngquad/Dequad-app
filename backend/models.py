from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# ==================== DATA MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    photos: List[str] = []
    role: str = "student"
    university_admin_for: Optional[str] = None
    interests: List[str] = []
    university: Optional[str] = None
    university_location: Optional[str] = None
    campus_name: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
    ethnicity: Optional[str] = None
    pronouns: Optional[str] = None
    show_pronouns: bool = True
    interested_in: List[str] = []
    gender: Optional[str] = None
    push_token: Optional[str] = None
    notifications_enabled: bool = True
    plan: str = "free"
    stripe_customer_id: Optional[str] = None
    swipes_today: int = 0
    last_swipe_date: Optional[str] = None
    # GeoJSON Point for GPS-based match distance filtering: {"type": "Point",
    # "coordinates": [longitude, latitude]}. Backed by a 2dsphere index. Set
    # via POST /api/profile/location when the user grants permission; omitted
    # for accounts that opt out.
    location: Optional[dict] = None
    location_updated_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: int
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
    status: str = "pending"
    score: float = 0.0
    comment: Optional[str] = None
    liked_section: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    pair_id: Optional[str] = None  # deterministic "min(uid_a):max(uid_b)" for symmetric lookups
    sender_id: str
    text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reported_user_id: str
    reporter_id: str
    reason: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    body: str
    notification_type: str
    data: dict = {}
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SafeguardingAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    source: str
    content: str
    risk_level: str
    matched_keywords: List[str]
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    was_true_positive: Optional[bool] = None
    feedback_notes: Optional[str] = None


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
    pronouns: Optional[str] = None
    show_pronouns: Optional[bool] = None
    interested_in: Optional[List[str]] = None
    gender: Optional[str] = None
    push_token: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    photos: Optional[List[str]] = None


class LocationUpdate(BaseModel):
    """Simple GPS coordinate payload for POST /api/profile/location."""
    latitude: float
    longitude: float


class SwipeAction(BaseModel):
    target_user_id: str
    action: str
    comment: Optional[str] = None
    liked_section: Optional[str] = None


class SendMessage(BaseModel):
    match_id: str
    text: str


class ReportCreate(BaseModel):
    reported_user_id: str
    reason: str


class UniversityAdminCreate(BaseModel):
    email: str
    password: str
    name: str
    university: str


class UniversityAdminLogin(BaseModel):
    email: str
    password: str


class AdminLoginRequest(BaseModel):
    email: str
    password: str
    admin_code: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class CreateCheckoutRequest(BaseModel):
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class UniversitySubscriptionRequest(BaseModel):
    university_name: str
    admin_email: str
    admin_name: str
    contact_phone: Optional[str] = None
    expected_students: Optional[int] = None
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class KeywordActionRequest(BaseModel):
    action: str
    risk_category: Optional[str] = None


class AlertFeedbackRequest(BaseModel):
    was_true_positive: bool
    notes: Optional[str] = None


# ==================== AI LEARNING MODELS ====================

class LearnedKeyword(BaseModel):
    keyword_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    keyword: str
    context_examples: List[str] = []
    suggested_by_ai: bool = True
    risk_category: str = "medium"
    frequency_score: int = 0
    confidence_score: float = 0.0
    status: str = "pending"
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BehavioralPattern(BaseModel):
    pattern_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pattern_type: str
    description: str
    anonymized_data: dict = {}
    detection_count: int = 0
    alert_threshold: float = 0.7
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AILearningInsight(BaseModel):
    insight_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    insight_type: str
    title: str
    description: str
    data: dict = {}
    severity: str = "info"
    reviewed: bool = False
    reviewed_by: Optional[str] = None
    action_taken: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
