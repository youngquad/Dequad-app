# DEQUAD — Option A: Internal Beta Distribution Playbook

**Goal**: Get DEQUAD running on your testers' real iPhones and Android phones **today**, without app stores, without Apple review, without Play Store approval.

You will use EAS's built-in internal distribution: a QR code / install link for each platform.

---

## How Option A works

| Platform | Mechanism | Tester does |
|---|---|---|
| **Android** | EAS hosts the `.apk`; you share a URL | Tap link → install → done. No setup. |
| **iOS** | Ad-hoc provisioning profile signed for each tester's UDID | One-time profile install on phone → app installs via QR code |

**iOS catch:** Apple requires every device's UDID to be in the provisioning profile. EAS handles this for you with `eas device:create`. You'll re-build once after registering devices.

---

## Prerequisites checklist

- [ ] Mac with Node 20 (`nvm use 20`)
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Logged into EAS (`eas login`)
- [ ] Apple Developer account ($99/yr) — **required for iOS even with internal distribution**
- [ ] No requirement for Google Play account for Android internal distribution
- [ ] Emergent backend deployed (you have a production URL)
- [ ] `EXPO_PUBLIC_BACKEND_URL` set to that production URL (in `.env` or as EAS secret)

---

## Step-by-step

### Step 1 — Configure backend URL (one time)

```bash
cd /path/to/Dequad-app/frontend
eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value "https://<your-emergent-url>"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_test_..."
eas secret:list   # verify
```

### Step 2 — Register your testers' iPhones (iOS only)

For **each** iOS tester (including yourself):

```bash
cd /path/to/Dequad-app
./scripts/build.sh register-device
```

EAS prints a URL + QR code. **Send it to the tester.** They:

1. Open the link on their iPhone (Safari).
2. Tap **Allow** when iOS asks to download a configuration profile.
3. Go to **Settings → General → VPN & Device Management → Install Profile**.
4. Reply to you confirming "registered".

Verify they're registered:

```bash
./scripts/build.sh list-devices
```

> 💡 Do this for **all** iOS testers in one batch before building, so you only build once.
> Android testers don't need any of this — skip to Step 3.

### Step 3 — Build for internal distribution

```bash
cd /path/to/Dequad-app
./scripts/build.sh preview
```

This runs `eas build --profile preview --platform all`. Takes 15–25 min. EAS will:

- iOS: ask you which iOS devices to include — pick **all registered devices**, then EAS provisions, signs, and builds an `.ipa`.
- Android: builds an `.apk`.

When done, EAS dashboard shows two builds with **Install** buttons that produce QR codes.

### Step 4 — Share the install links

From the EAS dashboard (`https://expo.dev/accounts/<you>/projects/dequad/builds`):

1. Open the iOS build → click **Install** → copy the install URL (or share the QR).
2. Open the Android build → click **Install** → copy the install URL.

Send testers the right link for their phone. They install in one tap.

**Android tip:** First install will prompt "Install unknown apps" — tester taps **Settings → allow this source → install**. One-time.

**iOS tip:** If the tester sees "Untrusted Developer", guide them to **Settings → General → VPN & Device Management → Trust "<Your Apple Team>"**. One-time per device.

### Step 5 — Push JS fixes without rebuilding

For any bug fix that doesn't touch native code (UI, logic, API calls):

```bash
./scripts/build.sh ota "Fix support reply bug"
```

Testers get the update on next app open. ~30 seconds.

For native changes (new SDK, new permission, etc.) you re-run `./scripts/build.sh preview`.

### Step 6 — Add new testers later

- **Android**: just send them the existing install link. Done.
- **iOS**: run `./scripts/build.sh register-device` for each new device, then re-build once with `./scripts/build.sh ios preview`. EAS will include the new UDIDs.

---

## What testers should test (give them this checklist)

Copy-paste this into your invite message:

> **DEQUAD Beta — what to try**
> 1. Sign up with your university email
> 2. Complete profile + mood check-in
> 3. Browse Connect tab → like 3 profiles
> 4. Skip more than 3 likes → confirm countdown timer appears
> 5. Match with another tester → open chat → send + receive messages
> 6. Report a profile (red flag icon)
> 7. Open Profile → Contact Support → send a message
> 8. Test push notifications: have a friend reply to your message
> 9. Try the racist-word filter (try typing a slur — should be blocked)
>
> **Bugs?** Screenshot + describe what you did. Reply to this thread.

---

## Common Option A issues

| Symptom | Fix |
|---|---|
| iOS install link says "Unable to install" | Device UDID isn't in the profile. Run `./scripts/build.sh list-devices` — if missing, register + rebuild. |
| Android "App not installed" | Old version of DEQUAD already installed with a different signing key. Tester uninstalls existing app first. |
| App crashes on first launch | `EXPO_PUBLIC_BACKEND_URL` is wrong or backend isn't reachable. Curl your Emergent URL from your phone's browser to verify. |
| iOS push notifications don't arrive | EAS prompts to create an APNs key during iOS build — if you skipped it, re-run `eas credentials` → iOS → set up push key. |
| Stripe sheet doesn't open | Wrong publishable key (must be `pk_test_…` or `pk_live_…`, not the secret key). |

---

## When you outgrow Option A

You'll hit Option A's ceiling when:

- You have **>100 iOS testers** (Apple's ad-hoc cap)
- You need real **crash reports + version analytics**
- You're ready for **App Store** + **Play Store** review

At that point, graduate to Option B (TestFlight + Play Internal Testing) — already documented in `/app/EAS_BUILD_GUIDE.md` §7–8.

---

## TL;DR command sequence

```bash
nvm use 20
cd /path/to/Dequad-app

# One-time setup
cd frontend && eas login && cd ..
./scripts/build.sh validate

# For every iOS tester (run once each):
./scripts/build.sh register-device

# Build for all testers
./scripts/build.sh preview

# Share install links from https://expo.dev → DEQUAD → Builds

# When you have a bug fix:
./scripts/build.sh ota "Describe fix"
```
