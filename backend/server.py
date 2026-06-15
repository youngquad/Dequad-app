from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from database import db, client
from helpers.safeguarding import load_approved_keywords
from helpers.middleware import RequestLoggingMiddleware, RateLimitMiddleware
from seed import seed_admin_and_test_users
from scripts.migrate_chat_pair_id import migrate_chat_pair_id
from scripts.migrate_dedupe_users import dedupe_users_and_index_email

from routes import auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core, reports, support

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Run user dedupe BEFORE seed so the seed admin upsert doesn't fight with duplicate
    # admin rows. Also adds the unique email index that prevents the bug recurring.
    try:
        result = await dedupe_users_and_index_email(db)
        logger.info(f"user dedupe migration: {result}")
    except Exception as e:
        logger.error(f"user dedupe migration failed (non-fatal): {e}")
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
# CORS: per spec, `allow_origins=["*"]` cannot be combined with `allow_credentials=True`.
# Modern browsers reject the response and the client thinks the request "failed" even when
# the server returned 200. Use an explicit allow-list (env-overridable) instead.
_default_origins = [
    "https://dequad.co.uk",
    "https://www.dequad.co.uk",
    "https://review-extractor-2.emergent.host",
    "https://review-extractor-2.preview.emergentagent.com",
    "http://localhost:3000",
    "http://localhost:19006",  # Expo web dev
]
_extra = [o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = list({*_default_origins, *_extra})

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    # Match any *.emergentagent.com / *.emergent.host / *.dequad.co.uk subdomain so future
    # custom domains and EAS update previews don't need a code change.
    allow_origin_regex=r"^https://([a-zA-Z0-9-]+\.)*(emergentagent\.com|emergent\.host|dequad\.co\.uk)$",
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
