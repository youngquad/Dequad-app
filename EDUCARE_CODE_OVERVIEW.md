# Educare - Complete Project Code

## Project Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI backend (3989 lines)
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── app/
│   │   ├── index.tsx              # Landing page
│   │   ├── _layout.tsx            # Root layout
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   └── login.tsx          # Login screen
│   │   ├── (main)/
│   │   │   ├── _layout.tsx        # Tab navigation
│   │   │   ├── mood.tsx           # Mood tracking
│   │   │   ├── feedback.tsx       # Lecture feedback
│   │   │   ├── matches.tsx        # Hinge-style matching
│   │   │   ├── likes-you.tsx      # Likes You screen
│   │   │   ├── chat/              # Chat screens
│   │   │   ├── profile.tsx        # User profile
│   │   │   └── subscription.tsx   # Premium upgrade
│   │   └── (admin)/
│   │       ├── login.tsx          # Admin login
│   │       └── dashboard.tsx      # Admin dashboard
│   ├── src/
│   │   ├── contexts/AuthContext.tsx
│   │   ├── services/api.ts
│   │   └── components/
│   ├── package.json
│   └── app.json
└── memory/PRD.md
```

## Admin Credentials
- **Email**: yusufquadri83@gmail.com
- **Password**: Oluwatobi11@

## Test Profiles
1. Emma Wilson - Computer Science, Manchester
2. James Chen - Data Science, Birmingham
3. Sofia Martinez - Psychology, Leeds
4. Alex Thompson - Environmental Science, Bristol
5. Priya Patel - Business Analytics, Warwick

---

## Key Files Overview

### 1. Backend Environment (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
EMERGENT_LLM_KEY=sk-emergent-xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
ADMIN_EMAIL=yusufquadri83@gmail.com
```

### 2. Frontend Environment (.env)
```env
REACT_APP_BACKEND_URL=https://review-extractor-2.preview.emergentagent.com
EXPO_PUBLIC_BACKEND_URL=https://review-extractor-2.preview.emergentagent.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Package.json (Key Dependencies)
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "@react-native-async-storage/async-storage": "1.23.1",
    "expo-linear-gradient": "~14.0.2",
    "@expo/vector-icons": "^14.0.2",
    "@stripe/stripe-react-native": "0.39.0"
  }
}
```

### 4. Requirements.txt
```
fastapi==0.115.6
uvicorn==0.34.0
motor==3.7.0
pymongo==4.10.1
python-dotenv==1.0.1
pydantic==2.10.5
httpx==0.28.1
stripe==11.4.1
emergentintegrations>=0.10.2
```

---

## Full Code Files

The complete code is available in:
- **ZIP file**: `/app/educare-complete-code.zip` (117KB)
- **Individual files**: See sections below

### Download Instructions
Use the "Download" or "Export" feature in Emergent platform to get:
1. The ZIP file containing all code
2. Or export the entire `/app` directory

---

## Core Feature Summary

### Hinge-Style Matching
- Scrollable profile cards
- Like buttons on each section (photo, bio, interests, course)
- Comment modal when liking
- 5 free likes per day, unlimited for premium

### Likes You Screen
- View who liked you with their comments
- 3 action buttons: Skip, Like, Message
- Message button likes back + navigates to chat

### Notifications with Comments
- "Emma liked your bio: 'Love your coding passion!'"
- Match notifications include the comment

### Admin Dashboard
- User management
- Safeguarding alerts
- AI learning system
- Analytics and exports
