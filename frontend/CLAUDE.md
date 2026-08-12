# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DEQUAD (bundle id `com.dequad.wellbeing`) — a university student wellbeing/social app (mood tracking, lecture feedback, matching/chat, subscriptions) built with Expo Router. This directory is the `frontend` of a larger project (there is a sibling `backend`, not in this repo checkout); the API base URL is configured via `EXPO_PUBLIC_BACKEND_URL` in `.env`.

## Commands

Package manager: use `npm` (a `package-lock.json` is committed and kept up to date; the `packageManager: yarn` field in `package.json` is stale — do not run `yarn install`).

```bash
npm install                 # install deps (legacy-peer-deps=true via .npmrc)

npm run start                # expo start --web --port 3000 --lan (web dev server)
npm run start:mobile         # expo start (Expo Go / dev client, for iOS/Android)
npm run android               # expo run:android (native build + install)
npm run ios                   # expo run:ios

npm run lint                  # expo lint (eslint-config-expo flat config)
```

There is no test suite configured in this repo (no jest config, no `*.test.*` files).

### Builds & releases (EAS)

Build profiles are defined in `eas.json`: `development`, `preview`, `production` (Android production builds an `.aab`, others build an `.apk`). Native config is largely handled by Expo (`expo-build-properties`, `expo-updates`); OTA updates are channel-based (`development` / `preview` / `production`) and point at `https://u.expo.dev/<projectId>`.

```bash
eas build --platform android --profile production   # produces the Play Store .aab
eas build --platform ios --profile production
eas submit --platform android --profile production
eas submit --platform ios --profile production
```

See `DEPLOYMENT_GUIDE.md` for the full TestFlight / Play Console walkthrough (account setup, service account keys, store listing requirements). `app.json` holds the EAS `projectId`, version, and native identifiers (`android.versionCode` / `ios.buildNumber` must be bumped manually per release; `android/app/build.gradle`'s `versionCode` must be kept in sync with `app.json`).

## Architecture

### Routing: Expo Router, grouped by role

`app/` uses file-based routing with typed routes enabled (`experiments.typedRoutes` in `app.json`). Route groups map directly to user roles/flows, each with its own `_layout.tsx`:

- `app/(auth)/` — login, register, password reset, university-admin login, university subscription signup. Unauthenticated flows.
- `app/(main)/` — the authenticated student app, rendered as a bottom-tab navigator (`Tabs` in `app/(main)/_layout.tsx`): Mood, Feedback, Connect (matches), Chat, Profile, plus tab-bar-hidden screens (`subscription`, `likes-you`, `support`) reached by navigation rather than the tab bar. Chat is its own nested stack (`app/(main)/chat/`).
- `app/(admin)/` — platform-admin dashboard (global user/university/subscription management).
- `app/(university-admin)/` — a *separate* role hierarchy for university-level admins (their own dashboard, distinct from platform `(admin)`). Don't conflate the two — they have different permissions and different layouts.
- `app/admin/` (no parens) — thin `<Redirect>` stubs (e.g. `app/admin/index.tsx` → `/(admin)/login`) kept for backward-compatible/deep-link URLs into the `(admin)` group.
- Top-level `index.tsx`, `privacy.tsx`, `terms.tsx`, `contact.tsx` each have a `.web.tsx` sibling — Expo Router picks the platform-specific file automatically for web builds.

Route protection is centralized, not per-screen: `app/_layout.tsx`'s `useProtectedRoute()` inspects `useSegments()` against `isAuthenticated`/`user.role` and redirects (e.g. non-admins bounced out of `(admin)`, unauthenticated users bounced out of `(main)`). When adding a new top-level group, update this function rather than adding auth checks inside individual screens.

### Auth & API

- `src/contexts/AuthContext.tsx` is the single source of truth for session state (`user`, `sessionToken`). It supports three login paths: OAuth-style redirect through `auth.emergentagent.com` (parses `session_id` from the callback URL, web and native both), direct email/password (`loginWithEmail`), and email/password registration gated by an OTP email-verification step (`registerWithEmail` → `verifyEmail`). Admin sessions are injected separately via `setAdminSession` rather than going through the normal login flow.
- Session tokens are persisted to **both** `AsyncStorage` (native) and `localStorage` (web) — code that reads/writes the token generally has to handle both, guarded by `Platform.OS === 'web'`.
- `src/services/api.ts` (`api` singleton) is a thin fetch wrapper: Bearer-token auth (`credentials: 'omit'`, not cookies — see comment in `request()` about why: avoids a CORS-preflight failure against wildcard-CORS backends), JSON in/out, falls back to a stored `admin_session_token` on web if no regular session token is present.
- `logout()` intentionally does **not** await the backend invalidation call — it clears local state and navigates first, then fires the API call in the background with `keepalive: true`. This was a deliberate fix for a race that caused "logout needs a second click" in production; don't reintroduce an `await` there.

### Chat

Chat messages are encrypted client-side with AES (`src/utils/encryption.ts`, `crypto-js`) using a key from `EXPO_PUBLIC_CHAT_ENCRYPTION_KEY`/`REACT_APP_CHAT_ENCRYPTION_KEY`, with a baked-in fallback key kept only so legacy dev messages stay readable — production is expected to set the env var explicitly. Chat + "likes you" unread counts are polled every 20s from `(main)/_layout.tsx` and surfaced both as tab-bar badges and as the native OS app-icon badge (`expo-notifications`, no-op on web).

### Admin surfaces

`src/components/Admin*.tsx` (AdminAILearningTab, AdminExportTab, AdminGrowthAnalytics, AdminInviteManager, AdminSubscriptionsTab, AdminSupportInbox, AdminUniversitiesTab, AdminVerificationQueue) are tab panels composed into the large `app/(admin)/dashboard.tsx` and `app/(admin)/university-dashboard.tsx` screens rather than being separate routes — adding an admin feature usually means adding a component here and wiring it into the dashboard's tab switcher, not adding a new route.

### Platform differences

This is a universal app targeting iOS, Android, and web from one codebase (`react-native-web`, `metro` bundler for web per `app.json`). Expect `Platform.OS` branches around storage, navigation redirects (`window.location` vs `expo-router`'s `router`), and auth callback URL handling — check both branches when touching auth, storage, or navigation code.
