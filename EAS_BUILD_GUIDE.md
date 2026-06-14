# DEQUAD — EAS Build & Local Setup Guide

This guide bundles every command, env var, and signing step you need to ship a build of the DEQUAD Expo app for **iOS** and **Android**. Run all commands from `/app/frontend`.

---

## 0. Local prerequisites (Mac)

You hit `npm install` + `JSON5: invalid end of input` errors locally. The two root causes are almost always:

1. **Wrong Node version.** Expo SDK 54 (used here) requires **Node 20 LTS** or **Node 22 LTS**. Node 23/24 will silently break native modules and Metro.
2. **Stale npm cache or partial `node_modules`.**

### Fix Node version (use `nvm`)

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
exec $SHELL -l

# Install + use the right Node
nvm install 20
nvm use 20
node -v   # should print v20.x.x
```

### Use yarn, not npm

The project ships with `yarn.lock`. Mixing `npm install` with a `yarn.lock` is what causes most of those red errors.

```bash
cd /path/to/Dequad-app/frontend
rm -rf node_modules package-lock.json
corepack enable
yarn install
```

### Install global CLIs

```bash
npm install -g eas-cli expo-cli
eas --version    # should be 7.x or higher
```

### Login to Expo

```bash
eas login
eas whoami       # should print your Expo username
```

---

## 1. Fix the `app.json` parse error

Open `frontend/app.json` and **replace its entire contents** with the block below. The error `JSON5: invalid end of input at 47:1` means braces are unbalanced — pasting this guarantees a valid file.

```json
{
  "expo": {
    "name": "DEQUAD",
    "slug": "dequad",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "dequad",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash-image.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dequad.wellbeing",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.dequad.wellbeing",
      "versionCode": 2,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "0ad6a13c-845f-4ab4-9177-ba5031d2462d"
      }
    }
  }
}
```

Validate it after saving:

```bash
node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); console.log('app.json OK')"
```

Then clear the Metro cache and start Expo:

```bash
npx expo start --clear
```

---

## 2. Required environment variables

Create `frontend/.env` (or set them in EAS as secrets — see §6):

| Variable | Required for | Notes |
|---|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | App at runtime | Your deployed backend URL, e.g. `https://api.dequad.app` |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe payments | Use `pk_test_…` for dev, `pk_live_…` for prod |

For native channels (push notifications), Expo handles tokens automatically once `expo-notifications` is installed (already in `package.json`).

---

## 3. First-time EAS project setup

Run **once** in `frontend/`:

```bash
eas init --id 0ad6a13c-845f-4ab4-9177-ba5031d2462d   # already wired in app.json
eas build:configure
```

`eas build:configure` will auto-generate iOS bundle IDs and Android package names if missing — but we already pinned them in `app.json` (`com.dequad.wellbeing`).

---

## 4. iOS — first-time signing checklist

You need an **Apple Developer Account** ($99/yr) before this works.

1. Go to <https://developer.apple.com/account> → sign in.
2. Note your **Apple Team ID** (10-character string under Membership).
3. In App Store Connect (<https://appstoreconnect.apple.com>):
   - Create a new app
   - Bundle ID: `com.dequad.wellbeing`
   - Note the **ASC App ID** (numeric, on the app's "App Information" page)
4. Run:
   ```bash
   eas credentials
   ```
   - Pick **iOS** → **production** → **Set up a new Distribution Certificate**
   - Let EAS manage the certificate + provisioning profile (recommended)
5. Update `eas.json` `submit.production.ios` with your real values:
   ```json
   "ios": {
     "appleId": "you@example.com",
     "ascAppId": "1234567890",
     "appleTeamId": "ABCDE12345"
   }
   ```

---

## 5. Android — first-time signing checklist

1. Create a Google Play Console account ($25 one-time).
2. Create a new app, package name: `com.dequad.wellbeing`.
3. Generate a Google Play **service account JSON**:
   - Google Play Console → Setup → API access → Create new service account
   - Grant role **Release Manager** in Play Console
   - Download the JSON file
4. Save it as `frontend/google-services.json` (already referenced in `eas.json`).
5. Let EAS manage your upload keystore:
   ```bash
   eas credentials
   # Android → production → Set up a new Keystore (managed by EAS)
   ```

---

## 6. EAS secrets (for env vars that should NOT be in git)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value "https://api.dequad.app"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_test_…"
eas secret:list
```

---

## 7. Build commands

All commands are from `frontend/`. Pick the profile you need from `eas.json`.

### Development build (with dev-client — needed for testing in Expo Go alternatives)

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Preview build (internal testing — install on real devices via QR code)

```bash
# Both platforms in parallel
eas build --profile preview --platform all

# Or individually
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

Preview builds produce an **`.ipa`** (iOS, ad-hoc) and **`.apk`** (Android). Send the QR code from the EAS dashboard to testers.

### Production build (store-ready)

```bash
eas build --profile production --platform all
```

Produces a TestFlight-ready `.ipa` and a Play Store `.aab`.

---

## 8. Submit to stores

```bash
# iOS — uploads to TestFlight
eas submit --platform ios --latest

# Android — uploads to Play Console internal track
eas submit --platform android --latest
```

---

## 9. OTA updates (push JS-only fixes without a rebuild)

```bash
eas update --branch production --message "Fix chat bug"
```

Users on the matching `runtimeVersion` will receive it on next app open.

---

## 10. Useful debugging commands

```bash
# Check current EAS status / who you're logged in as
eas whoami
eas build:list

# Cancel a stuck build
eas build:cancel

# Re-sync credentials if Apple revoked them
eas credentials

# Validate app.json + eas.json
npx expo-doctor
```

---

## 11. Troubleshooting cheat-sheet

| Symptom | Fix |
|---|---|
| `JSON5: invalid end of input` | Replace `app.json` with the block in §1 above. |
| `npm install` errors with peer-dep warnings | Use `yarn install`, not npm. Project uses yarn lockfile. |
| Metro stuck on "Building JavaScript bundle" | `npx expo start --clear` |
| Build fails with "No iOS Team ID" | Run `eas credentials` → iOS → set Team ID. |
| Push notifications silent on iOS | EAS will prompt to create an APNS key during first iOS build. Accept. |
| "Cannot find module 'expo'" after Node upgrade | Delete `node_modules` + lockfile, run `yarn install` again. |
| Stripe payments crash in dev | Double-check `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env` and starts with `pk_`. |

---

## 12. Quick-start (copy-paste, once Node 20 is active)

```bash
cd /path/to/Dequad-app/frontend
rm -rf node_modules
yarn install
npx expo start --clear           # smoke-test locally first

eas login
eas build --profile preview --platform all
```

That's it — you'll get an email + dashboard link from EAS when the build finishes (~15–25 minutes).
