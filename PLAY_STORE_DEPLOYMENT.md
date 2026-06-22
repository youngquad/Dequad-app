# DEQUAD — Google Play Store deployment guide

Everything you need to ship DEQUAD on the Play Store. All preview-side changes that needed code edits have already been made.

---

## ✅ What's already done (in the codebase)

| Item | Status |
|---|---|
| `app.json` name = `DEQUAD`, package = `com.dequad.wellbeing` | ✅ |
| `app.json` version bumped to `1.1.0`, Android `versionCode: 3` | ✅ |
| Default Expo "e" icon replaced with **real DEQUAD logo** (1024×1024) | ✅ |
| Adaptive icon foreground regenerated for Android adaptive icon system | ✅ |
| Splash screen image regenerated (1200×1200 with DEQUAD logo centred) | ✅ |
| Web favicon regenerated (48×48) | ✅ |
| `eas.json` production profile builds `.aab` (Android App Bundle — what Play Store requires) | ✅ |
| Stripe subscriptions (Apple Pay redirect, cancel-at-period-end, BACS) — all production-ready | ✅ |
| `/admin/accept-invite` route works on production domain | ✅ |

## ⏳ What you still need to do (cannot be automated from here)

| # | Action | Where | Time |
|---|---|---|---|
| 1 | Install EAS CLI on your laptop | `npm install -g eas-cli` | 2 min |
| 2 | Run `eas login` with your Expo account | terminal | 30 sec |
| 3 | Run the production build (creates the `.aab`) | terminal | 15–25 min |
| 4 | Upload the `.aab` to Play Console → Internal testing | Play Console | 5 min |
| 5 | Test on your own phone via the opt-in link | phone | 10 min |
| 6 | Fill out store listing + Data Safety form | Play Console | 1–2 hrs |
| 7 | Promote to Production track + submit for review | Play Console | 5 min |
| 8 | Wait for Google review | n/a | 2–7 days |

---

## 🖥️ Step-by-step commands (run from your laptop)

> **Important**: you cannot run `eas build` from inside this Emergent preview — it must be run on your own machine because it builds on EAS infrastructure tied to your Expo account credentials.

### 1. Clone or pull the latest code

If you've connected the repo via "Save to GitHub", clone it. Otherwise download the project zip from the Emergent dashboard.

### 2. Set up EAS CLI

```bash
npm install -g eas-cli
cd path/to/your/dequad/frontend
eas login           # paste your expo.dev credentials
```

### 3. Verify config

```bash
eas build:configure   # confirms package name, Android keystore strategy, etc.
```

When asked **"Generate a new Android Keystore?"** → answer **YES**. EAS will manage the keystore on their servers — you can't lose it. Critical: never delete this keystore later (it's how Google verifies all future updates).

### 4. Build the .aab for Play Store

```bash
eas build --platform android --profile production
```

This takes 15–25 minutes. When done, you'll get:
- A URL to download the `.aab` file (e.g. `https://expo.dev/artifacts/.../dequad.aab`)
- A build ID for your records

### 5. Upload to Play Console — Internal Testing FIRST

1. https://play.google.com/console
2. Click your app (or "Create app" if not done yet)
3. **Testing → Internal testing → Create new release**
4. Upload the downloaded `.aab` file
5. Release name: `1.1.0 (build 3)` (auto-fills)
6. Release notes:
   ```
   First Play Store release of DEQUAD — the UK student wellbeing app.
   - Peer matching with verified .ac.uk students
   - Daily mood tracker + safeguarding pipeline
   - Premium subscription (£4.99/mo) via Stripe
   ```
7. Save → Review release → Roll out to Internal testing

### 6. Add yourself as an internal tester

1. Play Console → Internal testing → **Testers** tab
2. Create email list "DEQUAD founders"
3. Add: `quadri.yusuf@dequad.com`, `Yusuff.Adeagbo@dequad.com`, `yusufquadri83@gmail.com`
4. Save
5. Copy the **"Opt-in URL"** and open it on your Android phone
6. Tap "Accept invitation" → "Download from Google Play"
7. **Install and smoke-test for 30 mins** — sign in, swipe, mood-track, try (but cancel) a subscription, accept an admin invite

### 7. Fill out the store listing

Required before you can promote to Production. Items marked **must-do**:

| Section | What to put |
|---|---|
| **Short description** (80 chars) | `UK student wellbeing app: peer matching, mood tracking, instant support.` |
| **Full description** (4000 chars) | See template below |
| **App icon** | Use `/app/frontend/assets/images/icon.png` (already 1024×1024) |
| **Feature graphic** (1024×500) | Generate one — happy to make this for you, just say the word |
| **Phone screenshots** (2–8) | Take screenshots from `dequad.co.uk` in mobile view, or from the installed app |
| **Privacy Policy URL** | `https://dequad.co.uk/privacy` |
| **Data Safety form** | See template below |
| **Target audience** | 18+ |
| **Content rating** | Complete the IARC questionnaire (5 min) |
| **App category** | Health & Fitness → Mental Wellness |
| **Tags** | `mental health`, `university`, `students`, `friends`, `wellbeing` |
| **Country availability** | United Kingdom only initially (expand later) |

### 8. Promote → Production

1. Once Internal testing is happy:
2. Production → Create new release → **Promote release** → pick the same `.aab`
3. Same release notes
4. Submit for review
5. Wait 2–7 days for first review (Google reviews health/wellbeing apps more carefully)

---

## 📝 Long description template (paste into Play Console)

```
DEQUAD — The UK Student Wellbeing App

University was supposed to be the best years of your life. For one in four UK students, it's the loneliest.

DEQUAD is the only app built specifically for UK university students that combines wellbeing tracking, verified peer matching and instant safeguarding support in one place.

✨ WHAT MAKES DEQUAD DIFFERENT

🎓 UK students only — every user is verified with a real .ac.uk email. No bots, no randoms, no grown men sliding into DMs.

💚 Wellbeing-first — track your mood every day, see patterns, and get matched with students who actually understand what you're going through.

🤝 Real connection — swipe through profiles from students at YOUR university with shared interests, courses and vibes. Body-double dissertations, find gym buddies, meet other final-year survivors.

🚨 Safe by design — if you ever flag a "red day", our system can notify your university's designated safeguarding lead in under 60 seconds.

🔒 Your data, your control — we don't sell your data. Ever. Delete your account in one tap.

💷 Free forever — match, chat and track your mood at no cost. Want unlimited likes? Premium is £4.99/month — cancel anytime.

🏆 BACKED BY
• Santander Universities Pre-Incubator (2025)
• NatWest Accelerator London (2026)
• University of Bedfordshire pilot (Sept 2026)

DEQUAD was built by two former Bedfordshire students — including a two-time Student Union President — who almost dropped out themselves. They built the app they wished existed in their second year.

You're not the only one. Promise.

dequad.co.uk
```

---

## 🔐 Data Safety form — answers

Fill in exactly like this (Google enforces accuracy):

### Data collected

| Data type | Why | Shared with 3rd parties? | Encrypted in transit? | Can users delete it? |
|---|---|---|---|---|
| Email address | Account creation, login | No | Yes | Yes |
| User name | Profile display | No | Yes | Yes |
| Photos | Profile pictures | No | Yes | Yes |
| Age | Match preferences | No | Yes | Yes |
| Gender | Match preferences | No | Yes | Yes |
| Sexual orientation | Match preferences | No | Yes | Yes |
| University name | Match preferences | No | Yes | Yes |
| Course of study | Match preferences | No | Yes | Yes |
| Health / wellness info (mood entries) | Wellbeing tracking, safeguarding | No (only your university DSL if you flag red) | Yes | Yes |
| Messages | In-app chat | No | Yes | Yes |
| IP address | Spam / abuse prevention | No | Yes | Yes |
| Crash logs | App stability | Yes (Expo / Sentry) | Yes | n/a |
| Purchase history | Subscription management | Yes (Stripe) | Yes | n/a (legal record-keeping) |

### Security practices
- [x] Data is encrypted in transit (HTTPS)
- [x] Users can request that their data be deleted
- [x] We follow the Families Policy guidelines (no users under 18 — enforced via age input)

### Specific declarations
- [x] App provides info on physical/mental health → **Yes** (this is the most important box to tick)
- [x] App can communicate with users in distress → **Yes**
- [x] Not a medical device → **Yes** (clearly state in description)

---

## ⚠️ The one tricky thing: Google Play subscriptions policy

Google's policy is: **digital subscriptions consumed inside the app must use Google Play Billing** — UNLESS the user can also purchase the same service outside the app on a separate website (which yours is — `dequad.co.uk` accepts Stripe payments).

**Current state**: your subscribe flow opens Stripe Checkout in the **browser** (via `window.location.href`) — that's borderline-compliant for the Android app because the actual purchase happens on `checkout.stripe.com`, not inside the app.

**Two safe options:**
1. **Keep as-is**: Stripe Checkout opens in the browser. Mention "Subscription managed at dequad.co.uk" on the upgrade screen. Google's reviewer may approve or push back.
2. **Hide the subscribe button on Android**: Simple defensive move — Android users would only see the upgrade option via the web (`dequad.co.uk`). Maximises approval odds at the cost of slightly worse UX.

If you get rejected, the safest second submission removes the in-app upgrade button entirely on Android. Tell me if you want me to implement option 2 pre-emptively.

---

## 🆘 If something goes wrong

| Problem | Fix |
|---|---|
| EAS build fails with "no credentials" | Run `eas credentials --platform android` and set up the keystore |
| Build succeeds but Play Console rejects: "icon too small" | The new 1024×1024 icon is fine — re-upload, sometimes a Play Console glitch |
| Reviewer rejects for "missing privacy policy" | Add `/privacy` page on dequad.co.uk before submitting; ping me to generate one |
| Reviewer rejects for "uses Google Play Billing not respected" | Implement Option 2 above (hide subscribe button on Android) |
| App keeps showing default Expo splash on Android | Add `expo-splash-screen` plugin to app.json — already partially configured |

---

## 🎯 Realistic timeline

| Day | What you'll do |
|---|---|
| **Today** | Run `eas build` on your laptop (15–25 min) + upload to Internal testing + install on phone |
| **Today + 1** | Test thoroughly, file any bugs back here |
| **Today + 2** | Fill out store listing + Data Safety form + take screenshots |
| **Today + 3** | Submit to Production review |
| **Today + 5 to +10** | Google approves → app goes live on the Play Store 🎉 |

When you've got the `.aab` downloaded and uploaded to internal testing, ping me — I'll help you write release notes, generate the feature graphic, and walk you through anything that comes up during Google review.
