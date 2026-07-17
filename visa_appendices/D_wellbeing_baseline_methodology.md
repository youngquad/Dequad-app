# Appendix D — DEQUAD Wellbeing-Baseline Methodology

**Working title:** *Per-user wellbeing-baseline detection: a low-friction approach to early identification of student mental-health deterioration in a closed peer network*

**Author:** Yusuf Quadri, Founder & CEO, DEQUAD — written by the founder, drawing on his professional safeguarding practice (Change Grow Live / NHS)
**Version:** v0.3 — draft for endorsement submission
**Date:** ___________________

---

## D.1 Abstract

Most consumer mood-tracking applications use absolute-score thresholds (e.g. "if mood ≤ 2/5, suggest support") to identify users at risk. Absolute thresholds are easy to implement but generate high rates of false positives in heterogeneous populations: a student whose baseline mood sits at 3/5 is treated identically to one whose baseline is 4/5. In the student-wellbeing context this matters because:

1. False positives erode user trust ("the app keeps telling me to call Samaritans when I'm just stressed about a deadline").
2. False negatives are catastrophic — a normally-cheerful student dipping from 5 to 3 may be in greater relative distress than a chronically-low student logging 3.

DEQUAD's wellbeing engine builds a **per-user baseline** from the user's first 14 daily check-ins and detects statistically meaningful deviation against that personal baseline. This document describes the methodology, its assumptions, and the validation plan.

---

## D.2 Method

### D.2.1 Data collected

Each daily check-in captures:

| Field | Type | Constraint |
|---|---|---|
| `mood_score` | Integer 1–5 | 1 = very low, 5 = very good |
| `mood_note` | Text (optional) | Max 500 chars; scanned for crisis keywords |
| `timestamp` | datetime (UTC) | Server-set |
| `user_id` | string | Foreign key to user record |

### D.2.2 Baseline window

For each user, the first 14 daily check-ins (the **calibration window**) establish:

- `μ_user` — arithmetic mean of `mood_score` over the calibration window
- `σ_user` — standard deviation of `mood_score` over the calibration window, clamped to a minimum of 0.5 to avoid zero-variance edge cases

If a user logs fewer than 14 check-ins in their first 30 days, the engine uses cohort-level priors (mean=3.5, sd=1.0 — drawn from Student Minds 2024 normative data) until 14 own data points are accumulated.

### D.2.3 Deviation detection (z-score approach)

For every new check-in, the engine computes:

```
z_today = (mood_score_today - μ_user) / σ_user
```

A rolling 7-day average of `z_today` is maintained. If the rolling average falls below **−1.5 standard deviations** for two consecutive days, the engine fires a **"deterioration nudge"** — a low-friction in-app prompt offering to connect the user to:

- The user's chosen support contacts (configurable in their profile);
- The DEQUAD 24/7 support chat;
- Samaritans (116 123) / Shout (text 85258);
- Their university's wellbeing service (if a partner institution).

**No automatic action involving third parties is taken at this threshold.** The nudge is private to the user.

### D.2.4 Safeguarding escalation (separate channel)

If a user's check-in `mood_note` text matches the high-risk crisis-keyword set (independent of the z-score), an escalation is sent to the Designated Safeguarding Lead under the safeguarding policy described in main document §14.1. This is a **separate channel** from baseline deviation: high-risk text triggers immediate human review regardless of mood-score trend.

---

## D.3 Why per-user baselines, not population thresholds

A short worked example illustrates the value:

| Student | Calibration mean | Calibration sd | Today's score | Population-threshold (≤2 = alert) | Per-user (z < −1.5 = nudge) |
|---|---|---|---|---|---|
| Aisha (chronically anxious) | 2.5 | 0.7 | 2 | **Alert** (over-trigger) | z = −0.71 → no nudge ✅ |
| Ben (usually upbeat) | 4.6 | 0.5 | 3 | No alert (under-trigger) | z = −3.2 → nudge ✅ |
| Chen (medium baseline) | 3.4 | 0.8 | 2 | **Alert** (correct) | z = −1.75 → nudge ✅ |

Per-user baselines reduce false positives for chronically-low users and reduce false negatives for normally-cheerful users — both of which matter for the safety profile of the platform.

---

## D.4 Statistical assumptions

| Assumption | Risk | Mitigation |
|---|---|---|
| 1–5 ordinal mood scale is approximately normal in calibration window | Mild non-normality is acceptable for z-score deviation thresholds (Tukey, 1977) | Floor sd at 0.5 to avoid extreme z-scores; alternative non-parametric trend test under evaluation |
| User does not "game" the scale | Some users may inflate baseline to avoid prompts | Trend analysis robust to absolute-level manipulation; new check-ins outside expected daily-time pattern flagged for review |
| Daily logging frequency is sufficient to detect a multi-week deterioration | Low logging frequency could miss declines | Cohort-prior fallback for low-frequency users; Y2 roadmap includes passive-signal triangulation (e.g. typing latency) |

---

## D.5 Validation plan

### D.5.1 Phase 1 — pilot validation (academic year 2026/27)

In partnership with the first paid university, DEQUAD will validate the deterioration-nudge engine against three benchmarks:

1. **Self-report concurrent validity** — Quarterly PHQ-9 / GAD-7 surveys (with consent) cross-correlated against the engine's deterioration flags. Target Pearson r ≥ 0.4.
2. **Service-utilisation concordance** — Anonymised university-counselling appointment data cross-referenced against deterioration-flag timing. Target: ≥ 25% of counselling-service self-referrals preceded by an engine flag in the prior 21 days.
3. **False-positive rate** — User survey at end of academic year asking whether engine nudges were appropriately timed. Target FP rate ≤ 30% (i.e. ≥ 70% of nudges judged appropriate).

### D.5.2 Phase 2 — peer-reviewed publication (Year 2)

If pilot validation passes pre-registered thresholds, DEQUAD will submit a methodology paper to:

- *JMIR Mental Health* (open-access, fast-track for digital health)
- or *British Journal of Psychiatry Open*

The pre-registration will be lodged with the Open Science Framework (OSF).

### D.5.3 Phase 3 — independent replication (Year 3+)

Engage at least one independent research group (target: King's College London Institute of Psychiatry, Psychology & Neuroscience) to replicate the method on a sample DEQUAD does not control.

---

## D.6 Ethics and governance

- The engine never shares individual user data with the partner university. Aggregated, anonymised dashboards only.
- Users can opt out of the engine entirely without losing access to other DEQUAD features.
- Users can export their full mood history at any time (UK GDPR Art 20 — right to data portability).
- An ethics review by an independent advisory board (target convened: Year 1 Q4) governs all material changes to the engine.

---

## D.7 Limitations explicitly acknowledged

1. The engine is **not a diagnostic tool**. It does not diagnose depression, anxiety, or any other clinical condition.
2. The engine should not be relied upon as a sole indicator of risk. Other channels (peer reports, university counselling self-referral, GP referral) remain primary.
3. The engine has not been clinically validated at the date of this document. Section D.5 documents the plan to do so.
4. Cohort priors are drawn from UK undergraduate normative data and may not generalise to FE / international expansion without re-calibration.

---

## D.8 References

- Beck, A.T., et al. (1996). *Beck Depression Inventory — II*. The Psychological Corporation.
- Kroenke, K., Spitzer, R.L., & Williams, J.B.W. (2001). The PHQ-9: Validity of a brief depression severity measure. *Journal of General Internal Medicine*, 16, 606–613.
- Student Minds (2024). *Insight Briefing — Student Mental Health 2024*.
- Tukey, J.W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
- ONS (2023). *Student Insights — University Mental Wellbeing*.
- OFCOM (2024). *Online Safety: Illegal Harms Guidance*.
- NICE NG133 (2019). *Suicide prevention: identifying and supporting people at risk*.

---

*This methodology document is a living draft. Material updates will be lodged at OSF when pre-registration is complete.*
