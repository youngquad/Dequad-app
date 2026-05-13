# Dequad – Product Requirements Document

## Original Problem Statement
Full-stack mobile app (Expo/React Native + FastAPI + MongoDB) for UK university student wellbeing and connection. Originally named "Educare", rebranded to **Dequad** with **UK universities only** focus.

## Target Users
- UK university students (`.ac.uk` verified)
- UK university welfare teams (admin dashboard)

## Core Features (Implemented)
- Google OAuth authentication (merged landing + login screen)
- Hinge-style student matching (prompts, university, like-with-comment)
- Mood tracking with AI risk prediction
- Encrypted chat between matches
- Safeguarding alerts (keyword detection + email to welfare leads)
- Admin dashboard with analytics
- Push + in-app match notifications

## Geographic Scope
**UK universities only** for Years 1–5. International expansion out of scope.

## Tech Stack
- Frontend: React Native / Expo / Expo Router
- Backend: Python / FastAPI / Pydantic
- DB: MongoDB
- Auth: Google OAuth via Emergent session mapping
- Email: SMTP for safeguarding alerts

## Changelog
- **2026-02-22**: Rebranded `PITCH_DECK.md` and `BUSINESS_PLAN.md` from Educare → Dequad with UK-only market focus and updated UK-specific TAM/SAM/SOM, financials, GTM and regulatory framework (OfS, HESA, ICO).
- **2026-02-22**: Deleted obsolete `/app/frontend/app/(auth)/` route group (login was merged into `index.tsx`). Cleaned `_layout.tsx` references.
- **2026-02-16**: App renamed Educare → Dequad (frontend UI strings + business docs).
- **2026-02-16**: Landing + login merged into single `index.tsx` screen; "AI insights" copy removed.
- **2026-02-16**: Hinge-style matching UI implemented; backend `User`, `ProfileUpdate`, `SwipeAction` models extended with `prompts`, `university`, `comment`.
- **2026-02-16**: Match notification logic fixed to trigger in-app notifications regardless of push token.

## Backlog / Roadmap
### P1
- Resolve Cloudflare WAF 520 errors on `/api/auth/session` (user verification pending)
- Optional: rename `ADMIN_SECRET_CODE` to `DEQUAD_ADMIN_2024` and clean residual "Educare" strings in `server.py`, `profile.tsx`, `subscription.tsx`, `dashboard.tsx`, `index.tsx` for full UI rebrand

### P2
- EAS Android preview build for native testing (Expo tunnel unreliable)
- iOS EAS build (requires Apple Developer account)
- Stripe plugin fix in `app.json` (currently disabled — `merchantIdentifier` error in iOS plugin)

## Known Issues
- Expo tunnel start failing locally due to Stripe iOS plugin config (`merchantIdentifier` undefined). Backend unaffected.
- Cloudflare WAF intermittent 520 on `/api/auth/session`.

## Key Files
- `/app/backend/server.py` – FastAPI app, auth, matching, safeguarding
- `/app/frontend/app/index.tsx` – Unified landing + login
- `/app/frontend/app/(main)/matches.tsx` – Hinge-style matching UI
- `/app/frontend/PITCH_DECK.md` – Investor deck (UK-only, Dequad)
- `/app/frontend/BUSINESS_PLAN.md` – Business plan (UK-only, Dequad)
