# Educare - AI-Powered Student Wellbeing Platform

## Original Problem Statement
Build Educare - AI-powered student wellbeing platform with mood tracking, AI risk prediction, student matching, encrypted chat, Google OAuth, admin dashboard, and Stripe billing.

## Latest Updates (March 4, 2026)

### New Feature: University Admin Dashboard
- **University Subscription**: Universities can subscribe (£49.99/month) to get dashboard access
- **Auto-credential Creation**: Admin credentials are auto-generated upon successful Stripe payment
- **Dedicated Dashboard**: University-specific analytics for student wellbeing monitoring
- **Features included**:
  - Student overview and list
  - Safeguarding alerts monitoring
  - Mood trends and analytics
  - Data export capabilities

### Previous Session Changes:
1. Hinge-style matching with scrollable profiles
2. Comment on like feature
3. Likes You screen with 3 actions
4. Pronouns feature on profiles
5. Subscription analytics in super admin dashboard
6. All bug fixes completed

## Architecture
- **Frontend**: React Native / Expo (TypeScript) - Mobile app with web support
- **Backend**: FastAPI (Python) with MongoDB
- **Integrations**: Stripe, OpenAI GPT, Emergent Google OAuth, SMTP Email

## Core Features
- ✅ Google OAuth Authentication
- ✅ Mood Tracking (1-10 scale)
- ✅ AI Risk Analysis (GPT-powered)
- ✅ Hinge-style Matching with comments
- ✅ Likes You screen with 3 actions (Skip, Like, Message)
- ✅ Notifications with comments
- ✅ Encrypted Chat (E2E)
- ✅ Safeguarding System
- ✅ Super Admin Dashboard
- ✅ **University Admin Dashboard (NEW)**
- ✅ Stripe Premium (£4.99/month for students)
- ✅ **Stripe University Subscription (£49.99/month) (NEW)**

## Admin Credentials

### Super Admin
- Email: yusufquadri83@gmail.com
- Password: Oluwatobi11@

### Test University Admin
- Email: admin@manchesteruni.edu
- Password: UniAdmin123!
- University: University of Manchester

## Test Profiles (with photos)
1. Emma Wilson - Computer Science, Manchester
2. James Chen - Data Science, Birmingham  
3. Sofia Martinez - Psychology, Leeds
4. Alex Thompson - Environmental Science, Bristol
5. Priya Patel - Business Analytics, Warwick

## Key API Endpoints

### University Admin Endpoints (NEW)
- `GET /api/university/pricing` - Get subscription pricing info (public)
- `POST /api/university/subscribe` - Create Stripe checkout session (public)
- `GET /api/university/subscription-success` - Complete subscription after payment
- `POST /api/university-admin/login` - University admin authentication
- `GET /api/university-admin/stats` - University-specific statistics
- `GET /api/university-admin/students` - List of students from university
- `GET /api/university-admin/mood-trends` - Mood analytics
- `GET /api/university-admin/safeguarding-alerts` - Safeguarding alerts
- `PUT /api/university-admin/safeguarding-alerts/{id}/acknowledge` - Acknowledge alert
- `GET /api/university-admin/export/students` - Export student data as CSV

### Existing Endpoints
- `/api/auth/session` - Validates a session token
- `/api/auth/admin-login` - Authenticates a super admin
- `/api/matches/swipe` - Handles user matching
- `/api/admin/stats` - Platform-wide statistics

## File Structure

```
/app/
├── backend/
│   ├── server.py         # All API endpoints
│   └── tests/
│       └── test_university_admin.py
└── frontend/
    └── app/
        ├── (admin)/      # Super admin dashboard
        ├── (auth)/       
        │   ├── university-subscribe.tsx    # University subscription page
        │   └── university-admin-login.tsx  # University admin login
        ├── (main)/       # Core app screens
        ├── (university-admin)/
        │   ├── _layout.tsx
        │   └── dashboard.tsx              # University admin dashboard
        ├── university-subscription-success.tsx  # Post-payment success page
        └── index.tsx     # Landing page with university link
```

## P0 Completed
- ✅ University Admin Dashboard feature

## P1 Backlog
- Chat directly from match notification
- Read receipts in chat
- Password change for university admins

## P2 Future
- Calendar integration
- Group study sessions
- Multi-university admin management
- Refactor server.py into modular APIRouters
