# DEQUAD — Google Play Console Build & Update Guide (Aug 2026)

**Status:** app.json, eas.json and `expo-updates` are now configured for you.
- `version` → `1.2.0`
- `android.versionCode` → `4` (was `3`)
- `ios.buildNumber` → `4`
- EAS Update URL wired in: `https://u.expo.dev/0ad6a13c-845f-4ab4-9177-ba5031d2462d`
- Build channels added: `development`, `preview`, `production`

You now have **two independent release pipelines**:

| Pipeline | When to use | Command | Users get update |
|---|---|---|---|
| **EAS Build** | Native change, new lib, permission change, first-ever release | `eas build --platform android --profile production` | Only after downloading new AAB from Play Store |
| **EAS Update (OTA)** | JS-only change (React components, styles, copy, business logic in `.tsx`/`.ts`/`.js`) | `eas update --branch production --message "fix login copy"` | Next app open — no re-install |

**This solves the "Expo Go keeps showing the previous version" problem** — Expo Go was reading whatever last got published to your Expo account's default channel. From now on, you push updates explicitly with `eas update`, and production Play Store users get them via `expo-updates`.

---

## PART A — Why Expo Go was showing the old version

Expo Go is a **sandbox client** — it doesn't build a native app. It fetches whichever JS bundle is currently published to your Expo project. Two reasons your changes weren't showing up:

1. **Nothing was ever pushed to the update server.** You changed code locally, but never ran `eas update` or `expo publish`. Expo Go continues to serve the last published bundle (from months ago).
2. **Cached bundle on your phone.** Fully force-close Expo Go on the phone → open it again → open your project. Or shake the phone and tap **Reload**.

**From now on:** every time you change JS, run this one command in `/app/frontend`:

```bash
eas update --branch preview --message "what you changed"
```

Then in Expo Go, tap your DEQUAD project → it will download and show the latest.

---

## PART B — First-ever Google Play Console upload (run these ONCE on your Mac)

### B0. Prerequisites

- Node 20 LTS (see `EAS_BUILD_GUIDE.md` §0)
- A **Google Play Developer** account (£20 one-off — you should already have this)
- The Expo account that owns project ID `0ad6a13c-845f-4ab4-9177-ba5031d2462d`

### B1. Pull the latest configured code

```bash
cd ~/path/to/dequad/frontend
git pull
yarn install
```

### B2. Log into EAS

```bash
npx eas-cli@latest login
# enter your Expo email + password
npx eas-cli@latest whoami   # should print your username
```

### B3. Configure EAS Update credentials (one-time)

```bash
cd /path/to/frontend
npx eas-cli@latest update:configure
# Answer "yes" when it asks to overwrite metadata.
```

This wires up code-signing so future OTA updates are cryptographically tied to your project.

### B4. Kick off a production Android build

```bash
npx eas-cli@latest build --platform android --profile production
```

- EAS runs the build on Expo's cloud (10–15 min).
- On first run it will ask:
  - **"Generate a new Android Keystore?"** → **YES** (Expo stores it securely for you; you never need to touch it again. This is what Play Store uses to identify your app forever, so let Expo manage it.)
- When done, you'll get an `.aab` file URL like `https://expo.dev/artifacts/eas/xxxxx.aab`

### B5. Upload to Play Console (Internal testing track first)

1. Go to https://play.google.com/console
2. **Create app** (skip if already created):
   - App name: `DEQUAD`
   - Package name: `com.dequad.wellbeing`
   - Category: **Health & Fitness** (or **Social**)
3. Left sidebar → **Testing → Internal testing** → **Create new release**
4. Upload the `.aab` you downloaded in B4
5. Add release notes: *"Initial DEQUAD launch — verified UK student wellbeing & peer matching."*
6. Add yourself as an internal tester (email list). Click **Save → Review release → Start rollout to Internal testing**.
7. You'll get an opt-in link. Install DEQUAD from the Play Store on your Android — it's now the real production build.

### B6. Promote to Production track (when ready for real users)

Play Console → Internal testing release → **Promote release → Production → Send for review**.

Google reviews Android apps in ~2–3 days for a new account.

---

## PART C — Every JS-only change from now on (30 seconds)

```bash
cd /path/to/frontend
git pull
yarn install    # only if package.json changed
npx eas-cli@latest update --branch production --message "describe change"
```

That's it. Users open DEQUAD → the new JS is downloaded silently → active on next reload.

- Use `--branch preview` for staging.
- Use `--branch production` for live Play Store users.

---

## PART D — When you MUST rebuild native (not OTA)

Rebuild with `eas build` (not `eas update`) whenever you:

- Add / remove a native Expo module (e.g. `expo-camera`, `expo-notifications`)
- Change **any** value in `app.json` under `ios.*` or `android.*` (versionCode, permissions, package name, plugins list)
- Bump Expo SDK version
- Change app icon, splash, adaptive-icon
- Change requested permissions

Bump `android.versionCode` in `app.json` by 1 (Google Play rejects duplicates), then re-run B4 → B5. The `eas.json` production profile has `autoIncrement: true`, so EAS will bump it automatically if you forget.

---

## PART E — Play Store metadata checklist (fill in Play Console → Main store listing)

| Field | DEQUAD value |
|---|---|
| App name | `DEQUAD` |
| Short description (80 chars) | `Verified UK student friendships, wellbeing check-ins & safeguarding — .ac.uk only.` |
| Full description | Copy from `/app/APP_STORE_PRIVACY.md` §"App Description" |
| App category | Health & Fitness → Wellbeing |
| Content rating | Complete IARC questionnaire (mental-health app, no violence, no adult content) |
| Target audience | 18+ (higher-education students) |
| Privacy policy URL | `https://dequad.co.uk/privacy` |
| Contact email | `hello@dequad.co.uk` |
| Data safety form | See `/app/APP_STORE_PRIVACY.md` — Data Collected section |
| Screenshots | Use images from `/app/marketing/instagram/` (min 2 phone screenshots, 1080×1920 or 1080×2340) |
| Feature graphic | 1024×500 (marketing/dequad_brand_logo.png can be resized) |
| App icon | Auto-uploaded from your AAB |

---

## Troubleshooting

**"Version code X has already been used"** → bump `android.versionCode` in `app.json`, rerun `eas build`.

**"Missing google-services.json"** → you only need this for FCM push notifications, which DEQUAD doesn't use yet. The path in `eas.json` under `submit.production.android.serviceAccountKeyPath` is separate — it's the **Play Console service-account JSON** for `eas submit`, not the Firebase config. You don't need it unless you use `eas submit` to auto-upload.

**"App bundle is not signed"** → let EAS manage credentials (say YES to "generate keystore" in B4).

**Expo Go still shows old version after `eas update`** → force-close Expo Go on the phone, reopen. Also check you pushed to the right `--branch`.

---

_Generated 2026-08. Path this doc lives at: `/app/PLAY_STORE_BUILD_2026-08.md`._
