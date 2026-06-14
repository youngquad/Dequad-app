from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import db, client
from helpers.safeguarding import load_approved_keywords
from helpers.middleware import RequestLoggingMiddleware, RateLimitMiddleware
from seed import seed_admin_and_test_users
from scripts.migrate_chat_pair_id import migrate_chat_pair_id

from routes import auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core, reports, support

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await seed_admin_and_test_users()
    await load_approved_keywords()
    # Idempotent chat migration: backfills pair_id on legacy messages and
    # ensures the supporting index exists. Safe to run on every boot.
    try:
        result = await migrate_chat_pair_id(db)
        logger.info(f"chat pair_id migration: {result}")
    except Exception as e:
        logger.error(f"chat pair_id migration failed (non-fatal): {e}")
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
app.include_router(reports.router, prefix="/api")
app.include_router(support.router, prefix="/api")
