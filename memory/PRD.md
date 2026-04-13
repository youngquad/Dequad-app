# DEQUAD - AI-Powered Student Wellbeing Platform

## Original Problem Statement
Build an AI-powered student wellbeing platform with Google OAuth, admin dashboards, Hinge-style matching, mood tracking, safeguarding alerts, and university subscription management.

## Core Requirements
- Google OAuth authentication for students
- Admin email/password authentication
- Mood tracking (1-10 scale with notes)
- Hinge-style matching with like/comment system
- End-to-end encrypted chat
- Safeguarding alerts with AI risk analysis
- Super Admin Dashboard (platform-wide analytics)
- University Admin Dashboard (university-scoped analytics)
- Stripe subscription integration (student premium + university dashboard)
- Email notifications for safeguarding alerts
- Data export (CSV)

## Tech Stack
- **Frontend:** React Native (Expo Web)
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Auth:** Google OAuth (Emergent-managed), Admin email/password
- **Payments:** Stripe
- **AI:** OpenAI GPT via Emergent LLM Key
- **Email:** SMTP (Gmail)

## What's Implemented (Complete)
- [x] Landing page with DEQUAD branding and Google Sign-In
- [x] Google OAuth authentication flow
- [x] Student profile creation and editing
- [x] Mood tracking with daily scores and notes
- [x] Hinge-style matching system
- [x] Comment on likes feature
- [x] Chat system
- [x] Safeguarding alerts (keyword detection + AI analysis)
- [x] Super Admin Dashboard (overview, safeguarding, subscriptions, AI, universities, analytics, export)
- [x] University Admin Dashboard (students, alerts, trends, data export)
- [x] University subscription flow via Stripe (GBP 49.99/month)
- [x] University admin auto-credential generation on subscription
- [x] University admin login portal
- [x] Admin password reset with email
- [x] Stripe student premium subscription
- [x] Email notifications for safeguarding alerts
- [x] 12 demo user profiles seeded across 5 universities
- [x] Demo mood data seeded for dashboard analytics
- [x] DEQUAD branding (logo, naming) across all screens
- [x] PowerPoint presentation with screenshots (10 slides, /app/DEQUAD_Presentation.pptx)
- [x] Presentation download API endpoint

## Backlog / Future Tasks
- [ ] Calendar integration (P2)
- [ ] Group study sessions (P2)
- [ ] iOS/Android deployment via Expo EAS Build
- [ ] Backend refactoring (break server.py into APIRouter modules)

## Key Endpoints
- `GET /api/` - Health check
- `POST /api/auth/callback` - Google OAuth callback
- `POST /api/admin/login` - Admin login
- `POST /api/university-admin/login` - University admin login
- `GET /api/university-admin/stats` - University-scoped stats
- `POST /api/stripe/create-university-checkout` - University subscription
- `GET /api/download/presentation` - Download DEQUAD presentation
