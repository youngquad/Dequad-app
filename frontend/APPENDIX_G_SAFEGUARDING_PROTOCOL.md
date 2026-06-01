# Appendix G — Dequad Safeguarding Protocol

**Document classification:** Confidential
**Owner:** Dequad Ltd (in formation)
**Clinical sign-off:** [Clinical Advisor Name, qualifications, registration number]
**Document version:** 1.0 — February 2026
**Review cadence:** Quarterly (or immediately following any Category-A incident)
**Submitted as:** Appendix G of the Dequad UK Innovator Founder Visa Business Plan

---

## 1. Purpose

This protocol defines how Dequad detects, escalates, and audits safeguarding concerns arising from user activity on the Dequad mobile platform. It is aligned to:

- **UK Universities (UUK) Mental Health Charter** (2020, updated)
- **Office for Students (OfS) Regulatory Framework — Condition B3**
- **UK Data Protection Act 2018** and **UK GDPR**
- **Prevent Duty** statutory guidance (where applicable)
- **NHS Digital DTAC** (Digital Technology Assessment Criteria) — Dequad's target compliance level

It applies to all Dequad personnel, contractors, and university partner welfare leads.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| **User** | A `.ac.uk`-verified UK university student aged 18+ using Dequad. |
| **Welfare Lead** | The designated safeguarding contact at a partner UK university. |
| **Safeguarding Concern** | Any content, behaviour or pattern that indicates a user may be at risk of harm to self or others. |
| **Category-A Incident** | Imminent risk of life (e.g., active suicidal intent, ongoing self-harm, threat to others). |
| **Category-B Incident** | Moderate risk (e.g., expressions of severe distress, persistent low mood patterns, disordered eating signals). |
| **Category-C Incident** | Low risk / early warning (e.g., isolation indicators, declining mood-tracking patterns). |
| **DSL** | Designated Safeguarding Lead — Dequad's internal lead (CEO / Clinical Advisor). |

---

## 3. Detection — How Concerns Surface

### 3.1 Automated Keyword Detection

A curated, clinically-reviewed taxonomy of UK English (and common regional dialect) phrases is scanned **in real time** against:
- Direct messages (chat content)
- Mood-tracking free-text reflections
- Profile prompt responses

The taxonomy is grouped into three severity bands aligned to Categories A / B / C above. The full keyword list is held as a trade secret and reviewed quarterly by the Clinical Advisor. Examples (illustrative, not exhaustive):

| Category | Example keyword themes |
|----------|------------------------|
| A | Active suicidal phrasing, specific method references, immediate plan language |
| B | Persistent self-loathing language, repeated hopelessness phrasing, severe eating-related distress |
| C | Persistent isolation phrasing, sleep-disturbance patterns, sudden withdrawal from app |

### 3.2 Pattern-Based Detection

In addition to keyword triggers, Dequad monitors **behavioural patterns** that may indicate risk:

- Sudden drop in mood score (>3 points week-on-week)
- Stopped logging mood for 14+ days following negative trend
- Repeated late-night activity combined with negative sentiment
- Rapid increase in messages with safeguarding keywords (escalation pattern)

### 3.3 User Self-Report

Users can tap "I need help" in-app at any time, which triggers an immediate Category-A surface of UK crisis resources and (with explicit user opt-in only) notification to their university welfare lead.

### 3.4 Peer Report

Users can report another user. Reports are reviewed within **2 hours** during UK business hours, **6 hours** out-of-hours, by Dequad trained moderators.

---

## 4. Escalation Workflow

### 4.1 Category-A (Imminent Risk)

| Step | Action | Owner | Timing |
|------|--------|-------|--------|
| 1 | Alert is generated automatically by the detection engine | System | Immediate |
| 2 | **In-app overlay** surfaces to the user with UK crisis resources (Samaritans 116 123, Shout 85258, NHS 111 option 2, local A&E) | System | Immediate (<5 sec) |
| 3 | SMTP email + push notification to the **partner university's designated Welfare Lead** | System | <60 seconds |
| 4 | SMS to Dequad on-call Safeguarding Officer | System | <60 seconds |
| 5 | If university Welfare Lead unreachable within 30 minutes → escalation to Dequad Clinical Advisor for direct user contact | Human (Clinical Advisor) | 30 min |
| 6 | Audit entry written to immutable safeguarding log | System | Real time |
| 7 | Incident review within 24 hours; lessons-learned applied to taxonomy if needed | DSL + Clinical Advisor | <24 hr |

### 4.2 Category-B (Moderate Risk)

| Step | Action | Owner | Timing |
|------|--------|-------|--------|
| 1 | Alert generated | System | Immediate |
| 2 | In-app gentle prompt offering UK signposting resources | System | <1 min |
| 3 | Email notification to university Welfare Lead (non-urgent, batched daily 9am digest) | System | Within 24 hr |
| 4 | Welfare Lead reviews and decides on appropriate university-side response | Human (Welfare Lead) | Within 72 hr |
| 5 | Audit entry written | System | Real time |

### 4.3 Category-C (Low Risk / Early Warning)

| Step | Action | Owner | Timing |
|------|--------|-------|--------|
| 1 | Pattern logged in anonymised analytics | System | Real time |
| 2 | User shown personalised wellbeing content in-app (gentle, non-alarming) | System | Next session |
| 3 | Appears in **aggregate anonymised** welfare team dashboard | System | Weekly refresh |
| 4 | No individual escalation unless pattern persists or worsens to B/A | n/a | n/a |

---

## 5. UK Crisis Resources Presented In-App

All crisis surface points display **UK-specific** resources only:

| Resource | When shown |
|----------|------------|
| **Samaritans** — 116 123 (free, 24/7, UK) | Category A, on-demand |
| **Shout** — text 85258 (free, 24/7, UK) | Category A & B |
| **NHS 111**, option 2 (mental health) | Category A & B |
| **999 / A&E** (medical emergency) | Category A only, with explicit "if you are in immediate danger" framing |
| **CALM** — 0800 58 58 58 (5pm–midnight) | Optional, men's mental health |
| **Papyrus HOPELINE247** — 0800 068 4141 (under-35s suicide prevention) | Category A & B (age-appropriate) |
| **Mind Infoline** — 0300 123 3393 | Category C |
| **University-specific** welfare team contact | All categories, university-specific |

---

## 6. Data Protection & Privacy

### 6.1 Lawful Basis (UK GDPR Art. 6 & Art. 9)

| Data Type | Lawful Basis |
|-----------|--------------|
| General user data | Art. 6(1)(b) — performance of contract |
| Mental health-related signals | Art. 9(2)(a) — explicit consent **AND** Art. 9(2)(c) — vital interests for Category-A only |
| Safeguarding alert to university | Art. 6(1)(d) — vital interests + Art. 9(2)(c) for sensitive data |

Users **explicitly consent** to the safeguarding flow during onboarding via a granular, plain-English consent screen (no dark patterns, no pre-ticked boxes).

### 6.2 Data Minimisation

The minimum amount of data needed for the safeguarding decision is shared with the Welfare Lead:
- Category-A: user identity + university + specific risk indicator + timestamp
- Category-B: user identity + university + pattern summary
- Category-C: never identifies individuals — aggregate only

### 6.3 Retention

| Data | Retention |
|------|-----------|
| Safeguarding alert audit log | **7 years** (post-incident), then secure deletion |
| Mood-tracking individual data | **24 months** rolling, then anonymised aggregate retained |
| Chat content | **End-to-end encrypted on device**; server stores ciphertext only; deleted 90 days after chat closure |
| User account | Until account deletion + 30-day grace period |

### 6.4 Subject Rights

Standard UK GDPR rights honoured within **30 days**:
- Right of access (SAR)
- Right to rectification
- Right to erasure (with explicit caveats for safeguarding audit logs as permitted by Art. 17(3)(b))
- Right to data portability
- Right to object

A dedicated **dpo@dequad.app** inbox handles all DSR requests.

---

## 7. Governance

### 7.1 Internal Roles

| Role | Responsibility |
|------|----------------|
| **Designated Safeguarding Lead (DSL)** | Dequad CEO (with deputy = Clinical Advisor). Final decision authority on incidents. |
| **Clinical Advisor** | UK-registered Chartered Psychologist / Mental Health First Aid Instructor or equivalent. Owns the keyword taxonomy and quarterly review. |
| **Data Protection Officer (DPO)** | Either in-house from Year 2 or outsourced UK DPO firm from Year 1. |
| **On-Call Safeguarding Officer** | 24/7 rotation; Mental Health First Aid trained minimum. |
| **University Welfare Lead (external)** | Each partner university's named safeguarding contact, named in the Data Processing Agreement. |

### 7.2 External Advisory Board

A **UK Safeguarding Advisory Board** will be convened from Month 6, comprising:
- 1 × UK university Mental Health Lead (rotating partner)
- 1 × UK Chartered Psychologist
- 1 × UK student representative (NUS or partner SU)
- 1 × UK ICO / data protection expert
- 1 × Lived-experience advocate (UK)

Meets quarterly. Reviews incident summaries (anonymised), policy changes, taxonomy updates.

---

## 8. Training

All Dequad personnel handling safeguarding data complete:

| Training | Frequency |
|----------|-----------|
| **Mental Health First Aid (England)** — 2-day certified course | Within 60 days of joining; refresher every 2 years |
| **UK GDPR & ICO Data Protection** | On joining + annual refresher |
| **Suicide Prevention (Zero Suicide Alliance)** — 20-min free module | On joining |
| **Prevent Duty awareness** (where applicable) | On joining |
| **Internal Dequad Protocol Walk-through** | On joining + on any protocol revision |

University Welfare Leads receive a **Dequad Partner Onboarding Pack** within 5 days of contract signature, plus a 60-minute live walkthrough.

---

## 9. Incident Audit & Reporting

### 9.1 Per-Incident

Each safeguarding incident generates an immutable audit record:

- Unique incident ID
- Timestamp (UTC + UK local)
- User ID (pseudonymised in long-term store)
- University ID
- Category (A / B / C)
- Trigger (keyword / pattern / self-report / peer-report)
- Action taken (each step)
- Resolution outcome (where known)
- Lessons learned (if any)

### 9.2 Periodic Reporting

| Report | Recipient | Frequency |
|--------|-----------|-----------|
| Per-university anonymised incident summary | Partner Welfare Lead | Monthly |
| Aggregate UK trends report | All partner universities | Quarterly |
| Annual Safeguarding Transparency Report (public) | Public | Annually, March |
| Internal post-incident reviews | Dequad DSL + Advisory Board | Per incident (A & B) |

### 9.3 Regulatory Reporting

| Body | Trigger | Window |
|------|---------|--------|
| ICO | Personal data breach (likely to result in risk to rights) | 72 hours |
| Partner university | Any Category-A incident involving their student | Real-time + post-incident report within 48 hr |
| Police (999 / 101) | If lawful disclosure required (e.g., immediate threat to life of identifiable third party) | Immediate, with legal advice |

---

## 10. Limitations & Honest Disclosure

Dequad **does not** claim to:
- Replace UK university counselling or NHS mental health services
- Provide clinical diagnosis or treatment
- Guarantee detection of all safeguarding concerns (no automated system can)
- Operate as a clinical intervention service (it is an adjunct only)

These limitations are stated **in plain English** in the onboarding flow, in the in-app About screen, and in the Terms of Service.

---

## 11. Continuous Improvement

This protocol is reviewed:
- **Quarterly** by the Clinical Advisor + DSL
- **Immediately** after any Category-A incident
- **Annually** by the UK Safeguarding Advisory Board
- **On regulatory change** (OfS, ICO, UUK, NHS)

Each review produces a versioned, dated update. Previous versions are retained for 7 years.

---

## 12. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Designated Safeguarding Lead (Dequad CEO) | [Founder Full Legal Name] | _________________ | __________ |
| Clinical Advisor | [Clinical Advisor Name, registration number] | _________________ | __________ |
| Data Protection Officer | [DPO Name / Firm] | _________________ | __________ |
| Chair, UK Safeguarding Advisory Board | [Chair Name — to be appointed Month 6] | _________________ | __________ |

---

*Document version 1.0 — February 2026. Confidential — Dequad Ltd / [Founder Name] — for UK Innovator Founder Visa endorsement use and university partner Data Processing Agreement attachment.*
