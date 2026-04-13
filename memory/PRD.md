# DEQUAD - AI-Powered Student Wellbeing Platform

## Original Problem Statement
Build an AI-powered student wellbeing platform with Google OAuth, admin dashboards, Hinge-style matching, mood tracking, safeguarding alerts, and university subscription management.

## Tech Stack
- **Frontend:** React Native (Expo Web)
- **Backend:** FastAPI (Python) — modular APIRouter architecture
- **Database:** MongoDB
- **Auth:** Google OAuth (Emergent-managed), Admin email/password
- **Payments:** Stripe
- **AI:** OpenAI GPT via Emergent LLM Key

## Backend Architecture (Post-Refactor)
```
/app/backend/
├── server.py              # 48 lines - App init, middleware, router includes, lifespan
├── database.py            # MongoDB connection & db object
├── config.py              # All env vars & constants
├── models.py              # All Pydantic models
├── seed.py                # Startup seed data (admin, 12 test students, mood entries)
├── helpers/
│   ├── auth.py            # Auth dependencies (get_current_user, require_admin, etc.)
│   ├── email.py           # SMTP functions, email templates
│   ├── safeguarding.py    # Keyword matrix, alerts, AI learning functions
│   └── notifications.py   # Push notification helpers
└── routes/
    ├── auth.py            # Login, logout, session, password reset
    ├── profile.py         # Profile CRUD
    ├── mood.py            # Mood tracking
    ├── feedback.py        # Feedback & AI risk
    ├── matches.py         # Discovery, swiping, likes
    ├── chat.py            # Messaging
    ├── notifications.py   # Notifications & reports
    ├── university_admin.py # University admin dashboard APIs
    ├── admin.py           # Super admin: stats, analytics, exports, AI learning
    ├── subscription.py    # Stripe payments & webhooks
    └── core.py            # Root, health, presentation download
```

## What's Implemented (Complete)
- [x] Landing page with DEQUAD branding and Google Sign-In
- [x] Google OAuth authentication flow
- [x] Student profile creation and editing
- [x] Mood tracking with daily scores and notes
- [x] Hinge-style matching system with comment on likes
- [x] Chat system
- [x] Safeguarding alerts (keyword detection + AI analysis)
- [x] Super Admin Dashboard (overview, safeguarding, subscriptions, AI, universities, analytics, export)
- [x] University Admin Dashboard (students, alerts, trends, data export)
- [x] University subscription flow via Stripe (GBP 49.99/month)
- [x] University admin auto-credential generation on subscription
- [x] Stripe student premium subscription (GBP 4.99/month)
- [x] Admin password reset with email
- [x] Email notifications for safeguarding alerts
- [x] 12 demo user profiles seeded across 5 universities
- [x] DEQUAD branding across entire app
- [x] PowerPoint presentation (/app/DEQUAD_Presentation.pptx, 10 slides)
- [x] Backend modular refactoring (4895 lines → 3135 lines, 19 modules)
- [x] API rate limiting (100 req/min general, 10 req/min auth endpoints)
- [x] Request logging middleware (IP, method, path, status, response time)
- [x] Profanity & racist language filter on chat and match comments
- [x] 5 demo match pairs with 26 chat messages seeded
- [x] Fixed vertical scroll on Connect/Matches page
- [x] Fixed logout (now clears both user_sessions and sessions collections)
- [x] Student wellbeing signposting on mood page (Samaritans, Shout, PAPYRUS, Student Minds, CALM, 999)
- [x] GET /api/wellbeing-resources endpoint for crisis services
- [x] Safeguarding signposting made dynamic-only (static block removed from mood page; modal triggers on keyword detection)
- [x] iOS/Android deployment guide via Expo EAS Build provided to user

## Backlog / Future Tasks
- [ ] Calendar integration (P2)
- [ ] Group study sessions (P2)

## Key Endpoints
- `GET /api/` - Health check
- `POST /api/auth/session` - Google OAuth session exchange
- `POST /api/auth/admin-login` - Admin login
- `POST /api/university-admin/login` - University admin login
- `GET /api/admin/stats` - Platform-wide stats
- `GET /api/university-admin/stats` - University-scoped stats
- `POST /api/stripe/create-university-checkout` - University subscription
- `GET /api/download/presentation` - Download DEQUAD PPTX
