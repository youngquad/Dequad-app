# DEQUAD — Apple App Store Privacy Disclosures

Paste this directly into App Store Connect → Your App → App Privacy. Apple uses these answers to generate the "Privacy Nutrition Label" on your App Store listing.

> ⚠️ **Be accurate.** Apple cross-checks these against what the binary actually does. False answers = rejection or removal post-launch.

---

## ⓘ Data Types Collected — by category

For each data type below, check the **purposes** that apply to DEQUAD's actual usage:

### 🟢 Contact Info

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Email address** | ✅ Yes | ✅ Yes | ❌ No | App functionality, Account management |
| **Name** | ✅ Yes | ✅ Yes | ❌ No | App functionality, Personalisation |
| **Phone number** | ❌ No | — | — | — |
| **Physical address** | ❌ No | — | — | — |
| **Other user contact info** | ❌ No | — | — | — |

### 🟢 Health & Fitness

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Health (mood / wellbeing entries)** | ✅ Yes | ✅ Yes | ❌ No | App functionality, Personalisation, Safety / Safeguarding |
| **Fitness data** | ❌ No | — | — | — |

> Apple treats mood-tracker entries as Health data even though they're not from HealthKit. Disclose accurately.

### 🟢 User Content

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Photos / videos** | ✅ Yes (profile photos) | ✅ Yes | ❌ No | App functionality |
| **Audio data** | ❌ No | — | — | — |
| **Customer support** | ✅ Yes (support chat messages) | ✅ Yes | ❌ No | App functionality, Customer support |
| **Other user content** | ✅ Yes (chat messages with matches) | ✅ Yes | ❌ No | App functionality |

### 🟢 Identifiers

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **User ID** (internal) | ✅ Yes | ✅ Yes | ❌ No | App functionality, Analytics |
| **Device ID** | ❌ No | — | — | — |

### 🟢 Sensitive Info

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Sexual orientation** (match preferences) | ✅ Yes | ✅ Yes | ❌ No | App functionality |
| **Gender identity** | ✅ Yes | ✅ Yes | ❌ No | App functionality |
| **Race / ethnicity** | ❌ No | — | — | — |
| **Religious beliefs** | ❌ No | — | — | — |
| **Political opinion** | ❌ No | — | — | — |

### 🟢 Usage Data

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Product interaction** (swipes, mood-log frequency) | ✅ Yes | ✅ Yes | ❌ No | App functionality, Analytics |
| **Crash data** (Expo / EAS Build crash reports) | ✅ Yes | ❌ No | ❌ No | App functionality |
| **Performance data** | ✅ Yes | ❌ No | ❌ No | App functionality |
| **Other diagnostic data** | ❌ No | — | — | — |

### 🟢 Diagnostics

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Crash data** | ✅ Yes | ❌ No | ❌ No | App functionality |
| **Performance data** | ✅ Yes | ❌ No | ❌ No | App functionality |

### 🟢 Purchases

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Purchase history** (Stripe subscription records) | ✅ Yes | ✅ Yes | ❌ No | App functionality, Account management |

### 🟢 Financial Info

| Data type | Collected? | Linked to user? | Used for tracking? | Purposes |
|---|---|---|---|---|
| **Payment info** (handled by Stripe, never stored by DEQUAD) | ❌ No | — | — | — |
| **Credit info / other financial info** | ❌ No | — | — | — |

> Stripe holds card details. DEQUAD only stores the `stripe_customer_id` and subscription status. Disclose **No** for payment-info collection by your app.

### 🔴 Categories you should select "No" for

- Browsing History — ❌
- Search History — ❌
- Location (Precise) — ❌
- Location (Coarse) — ❌
- Contacts (address book) — ❌
- Sensitive Info — Race/Ethnicity, Religion, Politics — ❌

---

## ⓘ Data Linked to the User — yes/no flag

For each "Yes" above, Apple asks if the data is "Linked to the User's identity":

> **Yes** — every "Yes" data type above is linked to the user's DEQUAD account / `user_id`. DEQUAD does not anonymise or aggregate user-linked data.

---

## ⓘ Data Used to Track the User — yes/no flag

> **No** — DEQUAD does NOT track users for advertising or other purposes. No 3rd-party SDKs (no Meta SDK, no Google Ads SDK, no analytics-vendor SDK with tracking enabled). Stripe is for payments only, not tracking.

If you ever add Mixpanel / Amplitude / Meta Pixel for marketing in future, this flips to **Yes** and Apple's App Tracking Transparency (ATT) prompt becomes mandatory.

---

## ⓘ Privacy Choices — section 3 of the form

| Question | Answer |
|---|---|
| **Do users have the option to delete their account from within the app?** | ✅ Yes — see "Settings → Delete my account" in the profile screen |
| **Is access to the app available to users without providing personal information?** | ❌ No — every user must register with a `.ac.uk` email |
| **Are third parties unable to access user data?** | ✅ Yes — except: Stripe receives payment-related info (purchase history), and your university's safeguarding lead is notified IF the user explicitly flags a crisis |
| **Do users have a way to request their data is deleted (e.g. an email to support)?** | ✅ Yes — `support@dequad.co.uk` |
| **Does the app comply with COPPA?** | ✅ Yes — users must be 18+ (enforced on registration) |

---

## ⓘ Sensitive content disclosures (Section 4)

DEQUAD handles user-generated content + mental-health discussions, which Apple flags as elevated risk.

| Question | Answer |
|---|---|
| **Does your app contain user-generated content?** | ✅ Yes |
| **Have you implemented a method for filtering objectionable content?** | ✅ Yes — automated text moderation + admin verification queue + report-a-profile flow |
| **Have you implemented a mechanism for users to block abusive users?** | ✅ Yes — "Report user" + block (state: ⚠️ **verify block-user is fully implemented before claiming this**) |
| **Have you published a method to respond to reports of abusive content within 24 hours?** | ✅ Yes — admin support inbox, on-call rotation |
| **Does your app include mental health / wellbeing claims?** | ✅ Yes — clearly state in the listing description: *"DEQUAD is not a medical device, not a replacement for professional mental-health support, and does not diagnose conditions. In crisis, contact your university's wellbeing team or call 999."* |

---

## 📝 Privacy policy URL

Set both fields in App Store Connect → App Information:

| Field | Value |
|---|---|
| Privacy Policy URL | `https://dequad.co.uk/privacy` |
| Privacy Choices URL (CA users) | `https://dequad.co.uk/privacy#choices` |

> ⚠️ If `/privacy` doesn't yet exist on dequad.co.uk, that's a guaranteed rejection. Make sure the page is live before submitting.

---

## ⓘ "Reviewer notes" tab — provide a demo account

In App Store Connect → App Review → **Sign-in information**, give the reviewer a working account so they can test the app without registering:

| Field | Value |
|---|---|
| **Sign-in required** | Yes |
| **Username** | `Yusuff.Adeagbo@dequad.com` |
| **Password** | `YusuffAdeagbo11@` |
| **Notes for reviewer** | "This is a demo staff account with `email_verified=true` pre-set, so you skip the OTP step. The premium subscription page is hidden on iOS per App Store policy — to test the full flow including subscription, please log in at https://dequad.co.uk on a desktop browser using the same credentials." |

---

## 🚨 Most common iOS rejection reasons (and how DEQUAD addresses them)

| Rejection reason | Apple Guideline | Our mitigation |
|---|---|---|
| Account deletion not in-app | 5.1.1(v) | ✅ Built — "Delete my account" in profile |
| Charging digital subscriptions outside IAP | 3.1.1 | ✅ Subscribe button hidden on iOS — premium-upgrade redirected to web |
| User-generated content has no moderation | 1.2 | ✅ Auto-moderation + report flow + 24h admin response time |
| Mental health app claims to "treat" or "cure" | 5.2.6 | ✅ Listing states "not a medical device" |
| Missing privacy policy URL | 5.1.1(i) | ✅ `https://dequad.co.uk/privacy` |
| Demo account not provided to reviewer | (App Review tab) | ✅ Yusuff.Adeagbo@dequad.com credentials supplied |
| Crashes on launch | 2.1 | ✅ TestFlight smoke test before submitting |
| Broken links / blank screens | 2.2 | ✅ TestFlight smoke test |

If submitted clean with all the above, DEQUAD's first iOS approval should land within **2–5 days**. Health/mental-health apps occasionally trigger a manual policy review which adds 2–3 days.
