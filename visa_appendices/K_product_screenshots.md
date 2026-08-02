# Appendix K — Product Screenshots Register

*Compiled by Yusuf Quadri, Founder & CEO, DEQUAD Ltd.*

This appendix lists the product screenshots that accompany the endorsement application. The screenshots are taken from the live application at https://dequad.co.uk and from the preview iOS / Android builds.

UKES assessors are encouraged to access the live web app directly with the credentials provided at the application interview.

---

## K.1 Live application access

| Item | URL / detail |
|---|---|
| Web app (production) | https://dequad.co.uk |
| Web app (preview) | https://review-extractor-2.preview.emergentagent.com |
| iOS preview build | EAS install link provided at interview |
| Android preview build | EAS install link provided at interview |
| Demo student account | Provided by separate secure channel at interview |
| Demo admin account | Provided by separate secure channel at interview |

## K.2 Screenshot register

| # | Filename | What it shows | Why it matters |
|---|---|---|---|
| 1 | `K1_landing.png` | Hero of the public landing page at dequad.co.uk | First-impression brand quality; "designed for university" positioning |
| 2 | `K2_signup.png` | The .ac.uk email verification flow | Closed-network claim is real |
| 3 | `K3_profile.png` | Student onboarding (course / society / interests) | Compatibility-based matching, not looks-based |
| 4 | `K4_connect.png` | The Connect tab — peer matches | Live matching engine output |
| 5 | `K5_match_flow.png` | Successful mutual-like → chat hand-off | Match-to-chat flow proven |
| 6 | `K6_chat.png` | In-app messaging | Closed network, message scanning live |
| 7 | `K7_mood_checkin.png` | Daily 10-second mood entry | Daily-engagement loop |
| 8 | `K8_mood_history.png` | Personal wellbeing baseline over time | Per-user trend detection |
| 9 | `K9_support_chat.png` | The 24/7 support chat (with AI auto-reply + human handover) | Out-of-hours support real |
| 10 | `K10_safeguarding_alert.png` | A safeguarding alert in the admin dashboard | Crisis detection in action |
| 11 | `K11_admin_dashboard.png` | Institutional dashboard for partner universities (anonymised cohort metrics) | What universities actually buy |
| 12 | `K12_report_flow.png` | The "report a profile" flow | Self-protection mechanism |
| 13 | `K13_university_admin.png` | The university-admin login portal | Multi-tenant institutional access |
| 14 | `K14_safeguarding_email.png` | Email notification to DSL | Out-of-band alerting |
| 15 | `K15_unread_badges.png` | Unread badge logic across tabs | Production polish detail |

## K.3 Where the images live

All screenshots are stored as PNGs in:

```
/app/visa_appendices/K_supporting/
├── K1_landing.png
├── K2_signup.png
├── K3_profile.png
├── ...
└── K15_unread_badges.png
```

## K.4 How to capture fresh screenshots

If UKES requests screenshots taken on a specific date:

```bash
# Web app
cd /app && ./scripts/capture_product_screenshots.sh
# Output: /tmp/dequad-screenshots-YYYYMMDD/
```

A helper script will be added at `/app/scripts/capture_product_screenshots.sh` ahead of the assessment interview to enable on-demand capture.

---

*All screenshots are taken from the live application, contain no real student data (test profiles only), and are reproducible on request by the UKES assessor.*
