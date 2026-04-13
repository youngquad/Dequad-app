from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import db, client
from helpers.safeguarding import load_approved_keywords
from helpers.middleware import RequestLoggingMiddleware, RateLimitMiddleware
from seed import seed_admin_and_test_users

from routes import auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await seed_admin_and_test_users()
    await load_approved_keywords()
    yield
    # Shutdown
    client.close()


app = FastAPI(title="DEQUAD API", lifespan=lifespan)

# Middleware order: outermost runs first → CORS → Logging → Rate Limit → Route
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers under /api prefix
app.include_router(core.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(mood.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(university_admin.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(subscription.router, prefix="/api")
