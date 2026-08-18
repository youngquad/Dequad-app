# DEQUAD
## Business Plan — UK Innovator Founder Visa
### Endorsement Application to UKES

---

**Entity:** DEQUAD Ltd (Company in formation, England & Wales)
**Founders:** **Yusuf Quadri (CEO)** and **Yusuff Adeagbo (CTO)**
**Wider founding team:** Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior Software Engineer), Chinyere Jennifer (Senior Project Management Consultant, advisor)
**Headquarters:** London, United Kingdom — NatWest Accelerator (hosted)
**Trading domain:** dequad.co.uk
**Business start date:** **15 June 2026** (incorporation; trading from M1 = June 2026)
**MVP status:** Production — live at https://dequad.co.uk
**Founder starting capital:** £6,000 cash (£3,000 from each founder, pooled in the company bank)
**Accelerator:** **NatWest Accelerator London** — joined **16 March 2026**; office co-working, legal advice and accountancy support provided in-kind for the first 12 months
**Prior validation:** **Santander Universities Pre-Incubator programme** — completed 2025
**Founder contact:** quadri.yusuf@dequad.com · 07928132617 · https://www.linkedin.com/in/quadri-yusuf/
**Document version:** 5.0 (self-funded 3-year revision — no pre-seed/seed assumed; pilot status corrected to reflect no signed agreement)
**Date:** August 2026
**Endorsing body:** UKES

---

## Contents

1. Executive Summary
2. Description of Products and Services
3. Innovation, Viability and Scalability
4. Research and Development Activity
5. Market Analysis (incl. Market Research, TAM/SAM/SOM, Regulatory Tailwinds)
6. Competitor Analysis
7. Staff Profile and Recruitment Strategy
8. Marketing and Sales Strategy
9. SWOT Analysis
10. Investment Strategy and Funding Requirement
11. Revenue and Cost of Sales Forecast
12. Cash Flow Forecast
13. Annual Profit & Loss Forecast
14. Balance Sheet Forecast
15. Forecasted Stock Levels
16. Forecasted Advertising / Marketing Expenditure
17. Forecasted Fixed Asset Schedule
18. Forecasted Staff Costs
19. Appendices (including founder CVs)

---

## 1. Executive Summary

**DEQUAD** is a UK-built software platform that helps university students form genuine, verified peer connections, track their daily wellbeing, and receive proactive safeguarding — inside a closed network open only to identity-verified UK higher-education students.

The product is not a concept. It is **live in production at dequad.co.uk**, with a working matching engine, daily mood telemetry, machine-assisted safeguarding triage and a university-facing insights dashboard.

### The problem we solve

UK universities face a structural student-wellbeing crisis:

- **54%** of UK undergraduates report frequent loneliness (ONS, 2023).
- **34%** experience a clinically-significant mental-health issue during their degree (Student Minds, 2024).
- The average wait to see a university counsellor is **6.1 weeks**; only **23%** of UK universities offer 24/7 crisis support.
- The Office for Students now imposes a statutory condition on student mental health — institutions must **evidence prevention**, not just reaction.

Existing tools each solve a fragment: anonymous forums (Togetherall), peer-chat apps (TalkCampus), pre-enrolment chat (UniBuddy), or generic social apps with zero safeguarding (Bumble BFF, Discord). None connects **verified student identity → real peer connection → wellbeing telemetry → institutional safeguarding action** in one loop. DEQUAD does.

### The founder-market fit that most applications cannot claim

The lead founder, **Yusuf Quadri**, is a **practising frontline safeguarding professional** — currently a Recovery Coordinator at Change Grow Live managing safeguarding referrals, dynamic risk assessments and multi-agency casework for vulnerable adults, with parallel NHS mental-health experience at East London NHS Foundation Trust. He also served **two consecutive terms as University of Bedfordshire Students' Union President (2021–2023)**, representing 10,000+ students and managing a £900,000 budget. DEQUAD's safeguarding pipeline was not designed from a textbook; it was designed by someone who files real safeguarding referrals every week.

### Why this business is endorsable now

| Evidence | Detail |
|---|---|
| **Working product — fully featured** | Production deployment at dequad.co.uk. Closed beta: **80 verified student accounts at the University of Bedfordshire** (42 daily-active over 6 weeks). As at August 2026, the platform ships: verified peer matching (60+ categorised interests), daily mood telemetry, lecture feedback, graded safeguarding alerts, AI-powered per-institution wellbeing analysis, university insights dashboard with growth KPIs, and per-university CSV exports. Engineering build cost in Y1: **zero** — the MVP and all Y1 features are already built. |
| **Founding team** | **Yusuf Quadri** (CEO — safeguarding professional, MBA with Data Analytics, 2× SU President) + **Yusuff Adeagbo** (CTO — MSc IT with Project Management), supported by **Dr Gerald Marfo** (CMO, PhD Digital Marketing), **Adedapo Ajuwon** (Senior Software Engineer) and **Chinyere Jennifer** (Senior Advisor, MIGSO-PCUBED) — all wider team on equity-only terms. |
| **Two independent validations** | **Santander Universities Pre-Incubator** (completed 2025) and **NatWest Accelerator London** (joined 16 March 2026). Two UK high-street banks independently selected this team through competitive processes. |
| **Pilot conversations under way — nothing signed** | Early-stage conversations with the **University of Bedfordshire** Director of Student Services — the institution whose students the founder represented for two years. No pilot agreement, LOI or date is confirmed; the platform is already built and ready to onboard as soon as (and if) an agreement is reached. |
| **In-kind runway** | NatWest Accelerator provides London office, legal and accountancy support worth **£31,100/yr** in-kind through Y1, reducing DEQUAD's cash overheads. |
| **Self-funded, conservative forecast** | Y1 revenue ~£600 → Y2 ~£16,000 → Y3 ~£48,000, funded entirely by the founders' **£6,000 opening capital** plus revenue generated in the period. **No pre-seed, seed or other external investment is assumed anywhere in this plan.** The base case assumes **zero institutional revenue in Y1** (no pilot is yet signed); one paying university is modelled as a Y2 upside contingent on conversion, rising to c.1.5–2 by Y3. |
| **UK jobs — modest and self-funded** | 2 founders (Y1–Y2, unpaid by the company) → 3 people (2.5 FTE) by Y3, funded entirely from institutional and premium revenue, not external investment. |

We evidence all three Home Office endorsement criteria — **innovation, viability, scalability** — with a shipped product, a frontline-qualified founding team, third-party programme validation, and a deliberately conservative financial model.

---

## 2. Description of Products and Services

### 2.1 The DEQUAD platform

DEQUAD ships as a cross-platform application (iOS, Android and web at dequad.co.uk) on a FastAPI / MongoDB backend. Four modules are live in production today:

| Module | What it does | Why it is different |
|---|---|---|
| **Verified peer matching** | Matches students with compatible peers for friendship, study groups and peer support — exclusively within `.ac.uk` student-email-verified accounts, with distance-based and interest-based filters. Students select from **60+ categorised interests across 6 life-domains** (Academic, Creative, Tech, Lifestyle, Social, Entertainment) — up to 15 interests per profile — enabling richer compatibility scoring than any generic app. | Closed-network identity plus intent-based matching. Not offered by Bumble BFF, Hinge or Facebook Groups. |
| **Daily wellbeing tracker** | 30-second daily check-in (mood, sleep, stress, connection) feeding a personal trend dashboard. | Anonymised, opt-in, DPIA-cleared. Combined with connection data to flag emerging isolation before crisis. |
| **Machine-assisted safeguarding** | LLM-based classifier over mood and chat signals flags suicide-risk, harassment, hate-speech and disordered-eating indicators to university safeguarding leads via webhook, with human review. Low-mood streaks (mood ≤ 3 for 3+ consecutive days) and low lecture-engagement patterns trigger separate, graded safeguarding alert channels. | The first UK student platform pairing `.ac.uk` identity verification with proactive safeguarding triage — designed by a practising safeguarding professional. |
| **University Insights Dashboard** | Anonymised, aggregated cohort wellbeing analytics for university staff: mood trends, engagement rates, platform growth KPIs (DAU/WAU/MAU, retention cohorts), and **AI-powered per-institution wellbeing analysis** that surfaces key concerns, positive indicators and prioritised intervention recommendations. | Population-scale early warning without breaching individual privacy. The AI analysis layer (GPT-4o-mini via structured JSON output) interprets multi-signal patterns and delivers human-readable recommendations — not raw numbers — to non-technical safeguarding staff. |
| **Institutional data exports** | CSV export of feedback history, student data, mood entries and safeguarding alerts — with per-university filtering so each institution receives only its own cohort's data. | Closes the audit-trail requirement for OfS Condition B3 compliance; no comparable export tool exists in Togetherall or TalkCampus. |

### 2.2 What each customer buys

| Customer | What they receive | Price |
|---|---|---|
| **UK university** | Site licence to the Insights Dashboard, branded safeguarding webhook into their existing safeguarding team, dedicated success manager. | **£2 per enrolled student per year** — a 10,000-student university pays £20,000/yr. Simple, transparent, headcount-based. |
| **NHS Integrated Care Board (ICB)** | Population-level anonymised wellbeing data for funded institutions; joint safeguarding referral pathway. | Annual contract from **£20,000/yr** per ICB. |
| **Student (consumer)** | Free core product. Optional **DEQUAD Premium**: advanced match filters, unlimited chats, profile boost. | **£4.99/month** via Stripe (integrated and test-verified; first live revenue expected from M7 (Dec 2026) from the existing beta cohort, independent of whether any university pilot converts). |

The dual-sided model matters: students adopt because the core product is free and genuinely useful; universities pay because DEQUAD gives their safeguarding teams the early-warning layer regulators now require.

---

## 3. Innovation, Viability and Scalability

### 3.1 Innovation

1. **Closed-network identity verification.** DEQUAD is the only UK student platform enforcing `.ac.uk` student-domain verification with an explicit student-status attestation, a curated UK-student-domain allow-list, and a human admin review queue for ambiguous accounts (architecture at Appendix J). Generic social apps cannot retrofit this without abandoning their open-network model.
2. **The verification → connection → telemetry → safeguarding loop.** Each element exists somewhere in the market; the **integrated loop** exists nowhere else. Wellbeing signals are only actionable when tied to a verified identity inside an institution that can respond — which is exactly the configuration DEQUAD ships.
3. **Practitioner-designed safeguarding.** The triage thresholds, referral pathways and escalation policy were authored by a founder who performs statutory-adjacent safeguarding work weekly at Change Grow Live, modelled on UUK Stepchange and Suicide-Safer Universities guidance. Competing products bolt moderation on; DEQUAD is built outward from the safeguarding case-file. The graded-alert system distinguishes mood-based signals (routed with user context for counselling follow-up) from lecture-engagement signals (routed anonymously for academic support) — a nuance no competitor has attempted.
4. **AI-powered per-institution wellbeing intelligence.** The University Insights Dashboard now incorporates a GPT-4o-mini inference layer that reads multi-signal cohort data and generates a structured wellbeing analysis: a 0–100 wellbeing score (colour-coded with trend arrows), a ranked list of key concerns, a list of positive indicators, and prioritised, actionable recommendations — all rendered in human-readable English for safeguarding staff who are not data analysts. This converts a raw-numbers dashboard into a decision-support tool — a capability no university wellbeing platform currently provides.
5. **Compliance as a feature.** Online Safety Act 2023 risk assessment, in-app reporting, UK GDPR DPIA and lawful-basis register shipped **before** first institutional sale — turning the sector's biggest procurement objection into our opening slide. Per-institution CSV data exports with GDPR-safe university-scoped filtering are included by default, satisfying the OfS Condition B3 evidence obligation out of the box.

### 3.2 Viability

- **The product is built and live.** The largest single risk in most early-stage plans — can they ship? — is already retired. dequad.co.uk is in production with 80 verified beta users at the University of Bedfordshire (42 daily-active, 6-week retention window), Stripe billing integrated (test-mode; converting to live on first paid contract), and all safeguarding alert flows exercised end-to-end.
- **The founder does this job professionally.** Safeguarding-first is not a marketing phrase: the CEO manages safeguarding caseloads at Change Grow Live and has NHS mental-health ward experience. This is decisive credibility in university procurement conversations, which are led by safeguarding and student-services professionals.
- **A trusted route into a prospective anchor customer.** Two years as Bedfordshire SU President gives DEQUAD direct, warm relationships with the Director of Student Services, safeguarding leads and senior leadership. A 12-week pilot has been **proposed** for **Sep–Nov 2026 (M4–M6)** — this is a target timeline only; no agreement is signed, and the pilot may be delayed, altered or may not proceed.
- **Two independent third-party validations.** Santander Universities Pre-Incubator (completed 2025) and NatWest Accelerator London (admitted 16 March 2026) — both competitive selection processes assessing team and product quality.
- **Proven willingness to pay.** Togetherall and TalkCampus charge UK universities £15k–£60k/yr and hold 100+ UK customers between them, for products missing DEQUAD's verification and triage capabilities.
- **A cash plan that survives scrutiny — and needs no pilot to succeed.** £6,000 founder capital plus £31,100 of NatWest in-kind support delivers positive month-end cash in every month of Y1 (Section 12), with zero founder salary throughout Y1. The plan does not depend on any pilot converting, any investor closing, or any date being met.

### 3.3 Scalability

- **Software-only marginal cost.** An incremental student costs ~£0.05/month in hosting; gross margin reaches **91.8%** by Y3.
- **Intra-institution network effects.** Every additional verified student raises the platform's value for every other student at the same university — driving the organic growth that keeps CAC falling (Section 16).
- **Repeatable institutional rollout.** Each new university onboards through a templated 6-week implementation. This 3-year plan conservatively models c.1.5 average paying institutions by Y3 (Section 11) — a deliberately small, achievable slice of the 285 UK institutions, chosen so the business does not depend on rapid multi-university conversion to remain solvent. The templated rollout process is what makes faster scaling possible in later years, if and when it happens.
- **International optionality.** The closed-network model maps directly onto `.edu` (US), `.edu.au` (Australia) and EU academic domains — a £180m English-language HE TAM addressable post-Y3 without re-architecting the product.
- **Team scale plan in place, sequenced to revenue.** A job description for the first funded hire (Safeguarding & Trust Lead, part-time) is already written (Appendix G); headcount grows 2 (unpaid founders) → 2 → 3 (2.5 FTE) across the self-funded 3-year forecast, all UK-based. Faster hiring would only follow proven multi-university traction and/or a future funding round, neither of which is assumed in this plan.

---

## 4. Research and Development Activity

R&D is the core of the innovation proposition: DEQUAD's defensibility rests on the verification engine and the safeguarding-inference pipeline, both of which are original engineering rather than assembled off-the-shelf parts.

Y1 R&D is delivered entirely as unpaid founder time (no cash cost, and no salary is drawn) plus modest tooling and safety-testing spend included in Section 11.2/12.1. From Y3, a small amount of paid part-time capacity is added once revenue supports it. No SME R&D Tax Credit inflow is assumed in the cash flow forecast (Section 12) — the pre-revenue/bootstrap structure means qualifying PAYE spend is minimal in Y1–Y2; the founders will explore claiming R&D tax relief with NatWest's in-kind accountancy support once qualifying costs exist, as a possible upside not relied upon here.

### 4.1 Identity-and-intent verification engine

| Activity | Status | R&D tax-relief eligible |
|---|---|---|
| `.ac.uk` student-subdomain classifier (allow-list, block-list, attestation flow) | **Shipped** Feb 2026 (`uk_student_email` verification module) | Yes |
| Admin "Pending Verification" queue with audit trail | **Shipped** Feb 2026 | Yes |
| Optical student-ID OCR with on-device redaction | Planned Q3 Y1 | Yes |

### 4.2 Wellbeing inference and safeguarding triage

| Activity | Status | R&D tax-relief eligible |
|---|---|---|
| Mood × engagement × text-signal classifier (PHQ-9-lite scoring + risk-signal NLU) | Prototype Feb 2026; production Q2 Y2 | Yes |
| Graded-alert pipeline: low-mood streak detector (≤3, 3+ consecutive days) → admin safeguarding alert | **Shipped** Aug 2026 | Yes |
| Low lecture-engagement signal → anonymous academic-support alert | **Shipped** Aug 2026 | Yes |
| AI-powered per-institution wellbeing analysis (GPT-4o-mini structured JSON — wellbeing score, concerns, recommendations) | **Shipped** Aug 2026 | Yes |
| Real-time safeguarding webhook with adapter library for university SIS/CRM systems | Production Q3 Y1 | Yes |
| Federated learning so per-institution models improve without raw data leaving the platform | Planned Q4 Y2 | Yes |

The triage models are trained and threshold-tuned against the safeguarding decision frameworks the CEO applies professionally (CGL risk-assessment practice; UUK Suicide-Safer Universities), with every automated flag routed through human review — a deliberate safety-case design documented in Appendix D.

### 4.3 Privacy and compliance infrastructure

| Activity | Status |
|---|---|
| DPIA-cleared mood-data pipeline; ICO Code of Practice alignment | Drafted Feb 2026 (Appendix E) |
| Online Safety Act 2023 risk assessment and in-app reporting | **Shipped** Feb 2026 (Appendix I) |
| Cryptographic data minimisation (hash-based de-identification of mood records for institutional reporting) | Planned Q2 Y2 |

---

## 5. Market Analysis

### 5.1 Market Research — evidence base

The claims in this section are grounded in **primary field research conducted directly by the founding team between May 2024 and January 2026**, triangulated with peer-reviewed secondary sources. Nothing here is theoretical: every buyer, user and pricing signal below has been tested with a real counterparty on the record.

**Primary research undertaken (May 2024 – Jan 2026):**

| Method | Participants | What we tested | Where we did it |
|---|---|---|---|
| **Structured student interviews** | **48 UK undergraduates** across 6 universities (Bedfordshire, Manchester, Leeds, Warwick, Bristol, Birmingham) | Onboarding friction, verification trust, wellbeing willingness-to-share, £4.99/mo premium price test | 45-min Zoom + on-campus (Union buildings) |
| **Anonymous quantitative survey** | **312 completed responses** (target n=300); recruited via SU mailing lists and Instagram at 2 anchor universities | Loneliness prevalence, existing app usage (Bumble BFF, Hinge, Discord), safeguarding-app trust deltas, price elasticity at £2.99 / £4.99 / £7.99 | Google Forms, incentivised via £5 Amazon vouchers (10 randomly drawn) |
| **Semi-structured buyer interviews** | **11 university staff** — 4 Directors of Student Services, 3 Wellbeing/Safeguarding Managers, 2 Heads of Digital, 2 Deputy Vice-Chancellors (Student Experience) | Procurement path, budget owner, integration needs (SSO, LMS webhook), price-per-student anchor, compliance triggers (OfS, OSA 2023, UUK Charter) | 60-min recorded video calls; transcripts on file |
| **Discord / Reddit ethnographic scan** | 14 UK-university Discord servers, r/UniUK (287k members), r/UKUni | Where students actually meet peers today; unmet needs mentioned in unmoderated threads | Passive observation over 8 weeks |
| **Comparable-product pricing scrape** | Togetherall, TalkCampus, UniBuddy, Kooth, Silvercloud, Big White Wall archives | Real UK ASPs, per-student rates, contract length norms | FOI requests + public press releases + Crunchbase |
| **Closed beta at the University of Bedfordshire** | **80 verified students** onboarded, 42 daily-active over 6 weeks | Retention, mood-check completion, match-to-chat conversion, escalation false-positive rate | Live product, not prototype |

**Secondary sources triangulated with the above:**

- **HESA 2023/24** — UK student headcount and course-level segmentation
- **ONS 2023 Student Wellbeing Survey** — loneliness prevalence baseline (54% frequent, 26% chronic)
- **Student Minds "Insight Briefing 2024"** — 34% of undergraduates report a clinically significant mental-health issue during their degree
- **Universities UK (UUK) 2024 report** — average per-student services budget (£123/yr), average wait for counselling (6.1 weeks), Mental Health Charter signatory list (100+)
- **Office for Students** — 2023 statutory condition on student mental health; regulatory advice notes
- **Online Safety Act 2023 / Ofcom implementation timelines** — user-to-user services duties, illegal-content risk assessment obligations
- **HEPI (Higher Education Policy Institute)** — 2024 report *"How can universities and students respond to student mental ill health?"* — corroborates our safeguarding-first hypothesis
- **Crunchbase + Companies House filings** — competitor revenue trajectories (Togetherall, TalkCampus)

### 5.2 Key findings from primary research

The five findings below were consistent across **both** the 312-response quantitative survey and the 48 in-depth interviews, and are what the DEQUAD product is built around:

1. **Loneliness is near-universal, but shame is the barrier — not desire.** 71% of surveyed students agreed with "I want to make more real friends at university" while only **19%** used an existing app (Bumble BFF, Hinge, Discord) to try. Verified `.ac.uk`-only was the **#1 unlock**: 68% of respondents said they would try a friendship app *if they knew everyone else was a verified student at a real UK university.* This is exactly the trust gap DEQUAD closes and no incumbent addresses.
2. **£4.99/month is the price ceiling for students.** In the Van Westendorp price-sensitivity block: median "cheap" price = £2.99, median "expensive" = £7.99, **optimal price point = £4.99** for premium features (advanced filters, unlimited likes, distance filter). This confirmed our student-side price without further guesswork.
3. **Universities buy on safeguarding evidence, not engagement metrics.** In 10 of 11 buyer interviews, the *first question* was: **"Show me the safeguarding escalation flow."** Not matching volume, not DAU. This validates our decision to treat safeguarding as the primary product rather than a feature, and it drives our per-student pricing framing ("£2 per student is 1.6% of your services budget and reduces your OSA-2023 liability").
4. **`.ac.uk` verification is a procurement-decision-maker.** 9 of 11 university buyers cited *identity-verified peer networks* as their primary unmet need. Existing incumbents (Togetherall, TalkCampus) are anonymous by design, which explicitly prevents named-individual escalation — the exact capability that Directors of Student Services need to defend their budget.
5. **6-week university procurement cycle is achievable for pilots under £50k.** Buyers confirmed pilots at ≤£40,000/yr avoid full tender processes and can be signed off directly by the Director of Student Services (delegated authority), enabling our 6-week land-and-expand motion documented in Section 8.

### 5.3 Market size and structure

| Metric | Source | Figure |
|---|---|---|
| UK higher-education students (FT + PT) | HESA 2023/24 | **2.86 million** |
| UK higher-education institutions | HESA 2024 | **285** |
| UK undergrads reporting frequent loneliness | ONS 2023 | **54%** |
| UK undergrads with clinically-significant MH issue | Student Minds 2024 | **34%** |
| Average university student-services budget per FTE | UUK 2024 | **£123/yr** |
| Average wait for university counselling | UUK 2024 | **6.1 weeks** |

### TAM / SAM / SOM

| Tier | Definition | Size |
|---|---|---|
| **TAM** | All UK universities + ICBs + UK student premium subscriptions | **£86m/yr** |
| **SAM** | Russell Group + post-92 universities with >10k students + associated ICBs | **£28m/yr** |
| **SOM (5-yr)** | 12% SAM capture (matching Togetherall's Y5 share) | **£3.4m ARR by Y5** |

_The 5-year SOM above is a long-term market-opportunity reference point, not a forecast. The committed, self-funded 3-year financial plan (Sections 11–14) targets a far smaller, achievable base — c.£48,000 revenue by Y3 — deliberately kept independent of this larger opportunity so that viability does not depend on capturing it._

### Regulatory tailwinds

Three regulatory forces are converting student wellbeing from discretionary spend into compliance spend:

1. **Office for Students statutory condition on student mental health (2023)** — institutions must evidence *proactive prevention*, which requires exactly the early-warning data DEQUAD's dashboard produces.
2. **Online Safety Act 2023, now in force** — student-facing platforms must implement risk assessments and reporting flows. DEQUAD ships OSA-compliant by design; informal alternatives (Discord servers, Facebook groups) expose universities to unmanaged risk.
3. **UUK Mental Health Charter** — 100+ signatory universities have committed to data-driven wellbeing strategies and must now demonstrate delivery.

Budget exists: at £123 per student FTE, a 20,000-student university spends ~£2.5m/yr on student services. DEQUAD's £2-per-student price (£40,000/yr for that university) is ~1.6% of that budget — and roughly **half Togetherall's effective per-student cost** — while directly servicing a statutory obligation.

---

## 6. Competitor Analysis

Five competitors, assessed comprehensively:

| # | Competitor | Model | UK universities | ASP | Where DEQUAD wins |
|---|---|---|---|---|---|
| 1 | **Togetherall** | Anonymous moderated peer-support community + self-help courses | ~60 | ~£40k/yr | Anonymity prevents real-world connection and makes individual safeguarding escalation impossible. DEQUAD adds verified peer matching, daily telemetry and named-individual safeguarding webhooks. |
| 2 | **TalkCampus** | Peer-support app with trained moderation and CBT modules | ~30 | ~£25k/yr | No institutional insights dashboard, no machine-assisted triage, no identity verification. Universities get a service, not a data-driven safeguarding capability. |
| 3 | **UniBuddy** | Prospective-student chat for course discovery and recruitment | 200+ | ~£18k/yr | Pre-enrolment only — proves universities buy student-engagement SaaS at scale but competes in an orthogonal market. |
| 4 | **Bumble BFF / Hinge** | Generic friendship/dating apps with student users | n/a | Free + £15–£35/mo premium | No `.ac.uk` verification, no university partnership, no safeguarding, no wellbeing layer. Open networks cannot pivot to closed-network institutional trust. |
| 5 | **Discord / Facebook Groups** | Informal, unmoderated student communities | n/a | Free | Zero moderation, zero safeguarding, zero telemetry — and a growing OSA-2023 liability for universities that informally rely on them. |

### Feature-by-feature comparison

| Capability | DEQUAD | Togetherall | TalkCampus | UniBuddy | Bumble BFF | Discord |
|---|---|---|---|---|---|---|
| `.ac.uk` student verification | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Intent-based peer matching (60+ interests, 6 categories) | ✅ | ❌ | Ltd | ❌ | Ltd | ❌ |
| Daily mood telemetry | ✅ | ❌ | Ltd | ❌ | ❌ | ❌ |
| Machine-assisted safeguarding triage | ✅ | Ltd | ❌ | ❌ | ❌ | ❌ |
| Graded-alert safeguarding (mood vs engagement) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| University insights dashboard | ✅ | ✅ | ✅ | Ltd | ❌ | ❌ |
| AI-powered per-institution wellbeing analysis | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Per-university CSV export with GDPR filtering | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Safeguarding webhook to institution | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Online Safety Act 2023 ready | ✅ | ✅ | ✅ | ✅ | Partial | ❌ |

**DEQUAD is the only product in the UK market that holds all ten capabilities simultaneously.** Our closest substitutes are strong in exactly one column each.

---

## 7. Staff Profile and Recruitment Strategy

### 7.1 Founding team — Year 1

**Compensation reality at submission:** no team member — founders included — currently draws a salary from DEQUAD. Founders fund personal living costs from employment income and savings throughout Y1 and Y2; the wider team contributes on pure-equity terms. There is no committed date for this to change, and it is **not contingent on any external funding round** — under this plan, founder pay only begins in Y3, and only once institutional and premium revenue supports it (Section 18).

| Role | Name | Profile | Compensation under this plan |
|---|---|---|---|
| **CEO — Product & Safeguarding** | **Yusuf Quadri** | Practising **Recovery Coordinator, Change Grow Live** (safeguarding referrals, risk assessment, multi-agency working); Clinical Support Worker & Assistant Duty Senior Nurse Administrator, **East London NHS Foundation Trust**; 2× **University of Bedfordshire SU President** (2021–23, £900k budget, 10,000+ students); **MBA with Data Analytics**; seven UK safeguarding/clinical certifications (Appendix O); B2B business-development experience (UGC Planet, Mavin Care). | **£0 in Y1–Y2**; modest £500/mo from Y3, funded entirely by revenue (£6,000 Y3 total) |
| **CTO — Engineering & IT** | **Yusuff Adeagbo** | **MSc IT with Project Management** (University of the West of Scotland); HND Computer Science; full-stack, UI/UX, infrastructure (Appendix B-2). | Same — **£0 in Y1–Y2**; £500/mo from Y3 |

Both founders are UK-resident, full-time on DEQUAD, with signed commitment undertakings (Appendix C).

**Why this CEO profile matters to endorsement:** the person who designed DEQUAD's safeguarding triage files real safeguarding referrals every week and coordinates care with clinicians, probation, housing and social care. When a Director of Student Services asks "who wrote your escalation policy?", DEQUAD's answer is unique in this market. Combined with two years representing 10,000+ students inside the anchor-pilot university, this is founder-market fit of a kind that cannot be hired or bought.

### 7.2 Wider founding team — equity-only at incorporation

| Role | Name | Background | Compensation under this plan |
|---|---|---|---|
| **Chief Marketing Officer** | **Dr Gerald Marfo** | PhD in Digital Marketing; digital go-to-market for impact-led startups. | £0 — EMI options; a cash salary is not funded within this 3-year self-funded plan and would only begin once revenue or a future funding round supports it |
| **Senior Software Engineer** | **Adedapo Ajuwon** | Senior full-stack engineer working on the platform alongside the CTO. | £0 — EMI options; same basis as above |
| **Senior Advisor — Programme & Delivery** | **Chinyere Jennifer** | Senior Project Management Consultant, **MIGSO-PCUBED**; LLM background. | £0 — advisor EMI vest; MIGSO-PCUBED remains primary employer |

A PhD-credentialled CMO, a senior engineer and a MIGSO-PCUBED consultant all working equity-only signals deep conviction in the mission. CVs at Appendix N.

### 7.3 Hiring plan

This plan makes **one** funded hire within the 3-year forecast, timed strictly to revenue rather than to any funding round:

| Role | Hire date | Basis | Y3 gross |
|---|---|---|---:|
| Safeguarding & Trust Lead (part-time, ~10 hrs/wk) | Y3 — contingent on 2+ paying universities | Funded entirely by institutional revenue, not investment | £8,000 |

Headcount: **2 (Y1, founders unpaid) → 2 (Y2, founders unpaid) → 3 people / 2.5 FTE (Y3, founders on modest pay + 1 part-time hire)** — all UK-based, entirely self-funded from revenue. Further hires (engineering, customer success, marketing) are **not assumed** in this plan; they would only be made beyond Year 3 if revenue growth or a future funding round justifies them.

### 7.4 Recruitment strategy

- **Channels:** Otta, LinkedIn, OnlyDev (engineering), university careers portals (placements), and warm introductions through the NatWest Accelerator alumni network.
- **Diversity:** ≥40% female and ≥30% ethnic-minority hires across the first 10 employees, tracked as a board-level KPI.
- **Discipline:** no cash hires until institutional revenue is signed and recurring — the first hire (Y3) is funded entirely by revenue already earned, not by any external investment.
- **Retention:** HMRC-approved EMI share-option scheme for all Y2+ hires (4-year vest, 1-year cliff).

---

## 8. Marketing and Sales Strategy

### 8.1 Positioning

> **"The UK student app that gives universities early warning before students fall through the cracks."**

| Audience | Message |
|---|---|
| Students | "Verified UK uni students. Real connections. Wellbeing built in." |
| Universities | "See loneliness early. Act before it becomes a crisis." |
| NHS ICBs | "Population-level student wellbeing data — anonymised and audit-ready." |

### 8.2 Year-1 channel mix (£900 total)

Kept deliberately lean — this is founder-led, low-cost outreach funded from the £6,000 opening capital, not a paid-acquisition budget:

| Channel | Tactic | Y1 spend |
|---|---|---:|
| University partnership & PR | Direct outreach to Directors of Student Services; NatWest Accelerator introductions | £300 |
| Content / SEO | Founder-written blog content; Wonkhe op-ed pitches | £150 |
| Instagram & TikTok | Organic founder content | £150 |
| Google Search ads | None in Y1 — deferred until revenue justifies paid acquisition | £0 |
| Student ambassador programme | Small incentive budget at the Bedfordshire beta cohort | £300 |

Marketing grows modestly to **£2,500 (Y2)** and **£5,000 (Y3)**, scaled to actual revenue rather than assumed funding — full breakdown in Section 16.

### 8.3 B2B sales motion — pilot conversations under way, nothing signed

**Prospective anchor pilot: University of Bedfordshire.** The CEO served two consecutive terms as the university's SU President; he is in early, informal conversation with student services and safeguarding leads he worked alongside for two years. **No agreement, LOI or date has been signed or confirmed.**

| Stage | Timing | Detail |
|---|---|---|
| Company incorporated | **Jun 2026 (M1)** — ✅ Complete | DEQUAD Ltd registered at Companies House. |
| Platform feature buildout | **Jun–Aug 2026 (M1–M3)** — ✅ Complete | University AI analytics, graded safeguarding alerts, categorised interest matching, per-university data exports all shipped and live. |
| Pilot agreement — **target, not signed** | Proposed for **Sep 2026 (M4)** — academic year start | Nothing is agreed or scheduled. This is an aspirational target date only, contingent entirely on the university's decision, and the pilot may be delayed, changed, or may not happen at all. |
| Pilot delivery (if agreed) | **Sep–Nov 2026 (M4–M6)** | Founder-led implementation, if the pilot proceeds; weekly office hours; mid-pilot steering-group review. |
| Review & conversion discussions (if a pilot occurs) | **Dec 2026 (M7) onwards** | Outcomes readout; commercial conversation opens. No revenue is assumed from Bedfordshire until a formal SaaS contract is signed. |
| Target paid signature (upside case) | **Q1 2027 (M8–M9)** | Target paid SaaS agreement covering AY 2027/28 — no guarantee; not assumed in the Y1 base case (Section 11), modelled only as a Y2 upside. |

The Y1 base-case forecast assumes **zero institutional revenue** — no pilot signed, no conversion. One paying institution is modelled only as a Y2 upside if the Bedfordshire conversation converts; this is a target, not a commitment. No other institutions are in active conversation at the date of this plan.

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| Production MVP live with real beta students — build risk retired. | Cash-light start (£6,000 founder capital, no external investment). |
| CEO is a practising safeguarding professional (CGL + NHS) — unmatched credibility with university safeguarding buyers. | Two-person core team — key-person risk until the first funded hire in Y3. |
| Early, informal conversations with Bedfordshire via the founder's SU-President relationships. | **No signed pilot, LOI or paying customer at the date of this plan — institutional revenue is a target, not a commitment.** |
| Two independent UK-bank validations: Santander Pre-Incubator (2025) + NatWest Accelerator (Mar 2026). | Limited consumer brand awareness at launch. |
| £31,100/yr NatWest in-kind support incl. London office (Y1 only). | Cyber Essentials accreditation pending. |
| `.ac.uk` verification + safeguarding webhook are genuine technical moats. | No formal clinical advisory board yet. |
| B2B willingness-to-pay proven by Togetherall/TalkCampus (100+ UK customers combined). | |
| OSA-2023 compliance shipped, not promised. | |
| **Opportunities** | **Threats** |
| OfS statutory MH condition forces universities to evidence prevention. | Togetherall/TalkCampus could attempt `.ac.uk` verification within 12 months. |
| UUK Mental Health Charter: 100+ universities need evidenced strategies. | A large incumbent (Meta/Microsoft) launching a student-only network. |
| 42 NHS ICBs at £20–60k/yr each once university data proves value. | Reputational damage from a mishandled safeguarding incident. |
| International expansion: .edu / .edu.au / EU domains (£180m TAM post-Y3). | Cost-of-living pressure on student premium uptake. |
| SME R&D tax credits recoup ~16% of qualifying spend. | Tighter UK immigration rules affecting international founder talent. |

Mitigations for each threat are documented in the Risk Register (Appendix L) — including the safeguarding-incident playbook, which the CEO drafted from professional practice.

---

## 10. Investment Strategy and Funding Requirement

### 10.1 Founder commitment

The co-founders contribute **£6,000 of personal capital (£3,000 each)** at incorporation to cover company formation, `.uk`/`.co.uk` domains, trademark filings (Classes 9/41/45) and initial cloud-hosting credits. The MVP is contributed as founders' work-product — **zero engineering capex is required at incorporation** because the product is already built and live.

### 10.2 Independent third-party validation

| Programme | Status | Value |
|---|---|---|
| **Santander Universities Pre-Incubator** | Completed 2025 | Competitive university-affiliated programme validating team and thesis. |
| **NatWest Accelerator (London)** | Joined **16 March 2026** — active | Office, legal, accountancy, banking and investor mentoring in-kind for 12 months. |

### 10.3 NatWest Accelerator in-kind contribution (Y1)

| In-kind item | Annual value |
|---|---:|
| London office co-working (3 desks) | £12,000 |
| Legal advice (Mishcon de Reya, DLA Piper panels) | £4,500 |
| Accountancy support | £3,600 |
| Banking & business introductions | £2,000 |
| Investor pitch coaching & mentoring | £5,000 |
| Demo day & PR placement | £4,000 |
| **Total in-kind value (Y1)** | **£31,100** |

This support is why £6,000 of founder cash is sufficient: DEQUAD pays no rent, lawyers or accountants in cash during Y1.

### 10.4 Funding — self-funded, no external investment assumed

| Source | Timing | Detail | Amount |
|---|---|---|---:|
| **Founder equity** ✅ | Day 1, Jun 2026 | Yusuf Quadri (£3,000) + Yusuff Adeagbo (£3,000) — already invested, evidenced by Form SH01 | **£6,000** |

**This £6,000 is the only funding assumed anywhere in this business plan.** The 3-year financial forecast (Sections 11–14) is funded entirely by this founder capital plus revenue generated in the period. No pre-seed, seed, Series A, R&D tax credit or other external investment is assumed, committed, or required for the plan to remain solvent — every table in Sections 11–14 reconciles on that basis alone.

If institutional traction significantly exceeds this conservative forecast (for example, 5+ paying universities), the founders may explore external investment beyond Year 3 to accelerate growth. That scenario is not part of the numbers presented here and carries no commitment, timeline, or dependency for this plan to succeed.

### 10.5 Founder Investment Statement (visa requirement)

The lead applicant has personally invested **£3,000** of his own funds as founder share capital, matched by the co-founder's **£3,000**, for total founder share capital of **£6,000**, evidenced by the share allotment return (Form SH01) filed with Companies House at incorporation. **No third-party investment exists at the date of this application, and none is assumed anywhere in this plan.** The business is designed to be fully self-funding — from this £6,000 founder equity plus subsequent revenue — across the entire 3-year forecast period, independent of whether any pilot converts or any external funding is later raised.

---

## 11. Revenue and Cost of Sales Forecast

This is a deliberately conservative, self-funded forecast: it assumes **zero institutional revenue in Y1** (no pilot is signed at the date of this plan), rising only if the Bedfordshire conversation converts to a Y2 upside. Institutional conversion is a target, not a commitment. Customer-acquisition numbers: 0 average paying institutions in Y1, 0.5 in Y2 (one pilot converting mid-year, contingent), c.1.5 in Y3; and 20 → 100 → 300 average paying premium students, funded entirely by the £6,000 founder capital plus revenue (Section 12).

### 11.1 Revenue forecast (annual, GBP)

| Line item | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| **University SaaS** | | | |
| Price per enrolled student (£/yr) | 2.00 | 2.00 | 2.00 |
| Average enrolled students per partner institution | 10,000 | 10,000 | 10,000 |
| Average contract value (£) | 20,000 | 20,000 | 20,000 |
| Average paying institutions in year | 0 | 0.5 (contingent, not signed) | 1.5 (contingent) |
| Subtotal | **£0** | **£10,000** | **£30,000** |
| **DEQUAD Premium (B2C)** | | | |
| Average paying students | 20 | 100 | 300 |
| Price (£/mo) | 4.99 | 4.99 | 4.99 |
| Subtotal | **£600** | **£6,000** | **£18,000** |
| **NHS ICB pilot** | | | |
| Subtotal | **£0** | **£0** | **£0** |
| **Total revenue** | **£600** | **£16,000** | **£48,000** |

_Y1 note: no institutional revenue is assumed — nothing is signed. Premium subscriptions are modelled independently of the Bedfordshire pilot, drawn from the existing 80-person beta cohort and modest organic growth; 20 average paying subscribers is a conservative estimate, not tied to any pilot outcome. Y2 note: 0.5 average paying institutions is a target only, contingent on the Bedfordshire conversation converting to a signed, paid contract — the base case does not require this to happen for the plan to remain solvent (Section 12). Y3 note: 1.5 average paying institutions assumes one renewal plus one further signed pilot — this remains a small fraction (well under 1%) of the 285 UK institutions. No NHS ICB revenue is assumed within this 3-year plan._

### 11.2 Cost of sales

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting | £600 | £1,200 | £2,400 |
| LLM / safeguarding inference (OpenAI API) | £400 | £900 | £1,800 |
| Stripe processing (~5% of B2C revenue at low volume) | £50 | £90 | £180 |
| SMS & email | £150 | £400 | £800 |
| Customer-success tooling | £200 | £500 | £900 |
| **Total cost of sales** | **£1,400** | **£3,100** | **£6,100** |
| **Gross profit** | **(£800)** | **£12,900** | **£41,900** |
| **Gross margin %** | n/a — revenue too small to be meaningful | 80.6% | 87.3% |

_Y1 gross profit is negative because minimum viable infrastructure cost (hosting, safeguarding-inference API) exceeds the small Y1 revenue base — normal for a pre-revenue-stage bootstrap and fully absorbed within the £6,000 founder capital (Section 12)._

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (GBP)

No external investment, grant or tax credit is assumed anywhere in this table — the business is funded entirely by the founders' £6,000 opening capital plus revenue generated in each period.

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | 6,000 | 1,920 | 8,220 |
| Cash from sales | 600 | 16,000 | 48,000 |
| **Total receipts** | **600** | **16,000** | **48,000** |
| Cost of sales | (1,400) | (3,100) | (6,100) |
| Payroll (incl. NI, pension, benefits) | 0 | 0 | (21,500) |
| Marketing | (900) | (2,500) | (5,000) |
| Software subscriptions | (600) | (1,200) | (1,800) |
| Office (post-NatWest programme; low-cost co-working / remote) | 0 | (300) | (600) |
| Legal & accountancy (out-of-programme) | (300) | (600) | (1,200) |
| Insurance | (480) | (700) | (900) |
| Business support / misc | (400) | (700) | (1,000) |
| Fixed assets capex | (600) | (600) | (1,200) |
| Corporation tax (paid in arrears, prior-year liability) | 0 | 0 | (500) |
| **Total expenditure** | **(4,680)** | **(9,700)** | **(39,800)** |
| **Net cash movement** | **(4,080)** | **6,300** | **8,200** |
| **Closing cash balance** | **1,920** | **8,220** | **16,420** |

_This is a self-funded plan: it does not require any pilot to convert, any investor to close, or any grant to be awarded to remain solvent. Closing cash stays positive throughout, growing from the £6,000 opening balance to c.£16,420 by the end of Y3 — modest, but achievable and fully within the founders' own control. If institutional revenue is delayed or does not materialise at all, Y1–Y2 costs are scoped to still fit comfortably within the £6,000 founder capital plus modest premium revenue alone (see 12.2)._

### 12.2 Year 1 monthly cash flow — the critical view

The Y1 plan is built to survive on **£6,000 of founder capital alone**, with no institutional revenue and no external funding assumed at any point:

- **M1–M3 (Jun–Aug 2026):** operating burn of ≈£250–£400/month (hosting, tooling, incorporation costs), funded entirely by the £6,000 founder injection. No founder salary drawn. Both founders fund personal living costs from their existing employment income (CEO from Change Grow Live; CTO from freelance engineering). Platform features built and shipped during this period.
- **M4–M6 (Sep–Nov 2026):** if the proposed 12-week Bedfordshire pilot goes ahead, it is planned as **no-fee**, so it generates no institutional cash receipts in this window; if it does not go ahead, costs are unaffected since none were budgeted against it. Burn stays in the same ≈£300–£450/month range.
- **M7–M12 (Dec 2026–May 2027):** modest premium-subscription revenue begins from the existing 80-person beta cohort as Stripe billing goes live; no founder salary is drawn in Y1 regardless of whether any pilot converts.

Because **no funding round, tax credit or pilot conversion is required** for the plan to work, there is no "funding cliff" and no single point of failure: the business survives the entirety of Y1 on founder capital and organic premium revenue alone, closing the year with roughly **£1,920** in the bank.

---

## 13. Annual Profit & Loss Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | 600 | 16,000 | 48,000 |
| Cost of sales | (1,400) | (3,100) | (6,100) |
| **Gross profit / (loss)** | **(800)** | **12,900** | **41,900** |
| Salaries | 0 | 0 | (20,000) |
| Employer NI | 0 | 0 | (900) |
| Employer pension (3%) | 0 | 0 | (350) |
| Other employment costs | 0 | 0 | (250) |
| Software subscriptions | (600) | (1,200) | (1,800) |
| Office | 0 | (300) | (600) |
| Legal & accountancy | (300) | (600) | (1,200) |
| Marketing | (900) | (2,500) | (5,000) |
| Insurance | (480) | (700) | (900) |
| Business support / misc | (400) | (700) | (1,000) |
| **Total overheads** | **(2,680)** | **(6,000)** | **(32,000)** |
| **EBITDA** | **(3,480)** | **6,900** | **9,900** |
| Depreciation & amortisation | (150) | (400) | (700) |
| **Operating profit / (loss)** | **(3,630)** | **6,500** | **9,200** |
| Corporation tax | 0 | (500) | (1,200) |
| **Profit / (loss) after tax** | **(3,630)** | **6,000** | **8,000** |

This is a self-funded plan: it assumes **no equity investment of any kind** — Y1's small loss is absorbed entirely by the £6,000 founder capital, not by any pre-seed or seed round. Y2 turns modestly profitable on the back of minimal overheads and the first (contingent, unconfirmed) institutional contract; Y3 profit funds the plan's only hire and a small founder salary. This is a deliberately small, achievable trajectory rather than a break-even target dependent on external funding — the business does not need investment to survive or to grow modestly across these three years.

---

## 14. Balance Sheet Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Fixed assets (net) | 450 | 650 | 1,150 |
| Cash at bank | 1,920 | 8,220 | 16,420 |
| Trade receivables | 0 | 500 | 1,500 |
| Stock / inventory | 0 | 0 | 0 |
| **Total assets** | **2,370** | **9,370** | **19,070** |
| Trade payables | 0 | (1,000) | (2,700) |
| **Net assets** | **2,370** | **8,370** | **16,370** |
| Share capital | 6,000 | 6,000 | 6,000 |
| Share premium | 0 | 0 | 0 |
| Profit & loss reserve | (3,630) | 2,370 | 10,370 |
| **Shareholders' funds** | **2,370** | **8,370** | **16,370** |

No share premium exists in any year — there has been no external investment round, consistent with Section 10. Shareholders' funds grow from the £6,000 founder investment (less the small Y1 trading loss) to c.£16,370 by Y3, entirely through trading, not fundraising.

---

## 15. Forecasted Stock Levels

DEQUAD is a pure software business and **holds no inventory**. Stock is **£0** across the entire forecast period. The line is retained in the workbook for template completeness only.

---

## 16. Forecasted Advertising / Marketing Expenditure

| Channel | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| University partnership & PR (NatWest network) | £300 | £700 | £1,300 |
| Content / SEO / whitepaper | £150 | £400 | £700 |
| LinkedIn / paid B2B | £0 | £300 | £700 |
| Instagram / TikTok | £150 | £500 | £1,000 |
| Google Search ads | £0 | £200 | £500 |
| Student ambassador programme | £300 | £400 | £800 |
| **Total** | **£900** | **£2,500** | **£5,000** |
| Marketing as % of revenue | n/a — Y1 revenue too small to be meaningful | 15.6% | 10.4% |

Marketing is deliberately kept to founder-led, low-cost channels throughout — there is no paid-acquisition budget in Y1, and spend only grows in line with actual revenue in Y2–Y3, not with any assumed funding round.

---

## 17. Forecasted Fixed Asset Schedule

| Asset class | Depreciation rate | Y1 additions | Y2 additions | Y3 additions | Y3 NBV |
|---|---:|---:|---:|---:|---:|
| Tangible — laptops & equipment | 33% | £500 | £500 | £900 | £850 |
| Intangible — capitalised R&D | 20% | £100 | £100 | £300 | £300 |
| **Total CAPEX** | | **£600** | **£600** | **£1,200** | **£1,150** |

The MVP is already built and contributed by the founders, so no upfront capitalisation is required. Y1 hardware is two founder laptops; Y3 adds a laptop for the first part-time hire.

---

## 18. Forecasted Staff Costs

All figures include the associated employer National Insurance and pension obligations, stated separately below. **No salary is drawn by anyone until Y3, and only then to the extent institutional and premium revenue supports it — no external funding is assumed at any point.**

### 18.1 Y1 — bootstrap, unpaid founders

| Role | Y1 gross |
|---|---:|
| Founder A (CEO) | £0 |
| Founder B (CTO) | £0 |
| **Total Y1 gross** | **£0** |

Both founders fund personal living costs from their existing employment/freelance income throughout Y1. **Total Y1 employment cost: £0.**

### 18.2 Y2 — still unpaid, no hires

| Role | Y2 gross |
|---|---:|
| Founder A (CEO) | £0 |
| Founder B (CTO) | £0 |
| **Total Y2 gross** | **£0** |

No hires are made in Y2 under this plan; the modest (contingent) institutional revenue and growing premium revenue are retained as cash buffer rather than spent on payroll. **Total Y2 employment cost: £0.**

### 18.3 Y3 — first modest pay, first hire

| Role | Y3 gross |
|---|---:|
| Founder A (CEO) — £500/mo | £6,000 |
| Founder B (CTO) — £500/mo | £6,000 |
| Safeguarding & Trust Lead (part-time, ~10 hrs/wk) | £8,000 |
| **Total Y3 gross** | **£20,000** |

Employer NI ~£900 + pension ~£350 + other employment costs ~£250 = **£21,500 total Y3 employment cost**, funded entirely by Y3 revenue (Section 11).

Headcount: **2 unpaid founders (Y1) → 2 unpaid founders (Y2) → 3 people / 2.5 FTE (Y3)** — all UK-based, entirely self-funded. Scaling beyond this (additional engineering, customer success, marketing hires) is a longer-term ambition, not part of this 3-year plan, and would only follow proven multi-university revenue or a future funding round.

### 18.4 Equity

The wider founding team (Section 7.2) hold EMI options on equity-only terms. No new EMI grants are modelled for the single Y3 hire's compensation above, which is cash-only; option grants for future hires would be considered if and when a funding round is raised — not assumed in this plan.

---

## 19. Appendices

| Ref | Document | File |
|---|---|---|
| A | Founder academic certificates (Yusuf Quadri) | `A_founder_academic_certificates.md` |
| B | **Founder CV — Yusuf Quadri (updated June 2026)** | `B_founder_cv.md` |
| B-2 | Co-Founder CV — Yusuff Adeagbo (CTO) | `B_cofounder_cv.md` |
| C | Personal commitment & undertaking | `C_personal_commitment_undertaking.md` |
| D | Wellbeing baseline methodology | `D_wellbeing_baseline_methodology.md` |
| E | Data Protection Impact Assessment (DPIA) | `E_dpia.md` |
| F | Financial model (annotated) | `DEQUAD_Financial_Model.xlsx` |
| G | Job descriptions for first 6 hires | `G_job_descriptions.md` |
| H | University Letters of Interest (template) | `H_university_letter_of_interest_template.md` |
| I | Online Safety Act 2023 compliance statement | `I_online_safety_act_compliance.md` |
| J | Architecture diagram | `J_architecture_diagram.md` |
| K | Product screenshots | `K_product_screenshots.md` |
| L | Risk Register (UKES) | `DEQUAD_Risk_Register.md` |
| M | Decision-Maker Brief (UKES short track) | `DEQUAD_UKES_Decision_Brief.md` |
| N | Wider Founding Team CVs — Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior SWE), Chinyere Jennifer (Advisor) | `N_wider_team_cvs.md` |
| O | Yusuf Quadri — Safeguarding & Clinical-Awareness Certifications | `O_safeguarding_certifications.md` |

---

*End of business plan. All figures are forecasts, not guarantees of future performance. This business plan was written by Yusuf Quadri (Founder & CEO) with Yusuff Adeagbo (Co-Founder & CTO) and is submitted to UKES as part of the UK Innovator Founder visa endorsement process — August 2026 (v4.0).*


---


# Appendix A — Founder Academic Certificates

*Declared and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd.*

This appendix lists the qualifications relied upon in the Founder Profile (main document §2.2) and confirms how the originals will be made available to the endorsing body.

---

## Qualifications declared

| # | Qualification | Awarding institution | Year awarded | Subject / classification |
|---|---|---|---|---|
| 1 | _______________ | _______________ | _______________ | _______________ |
| 2 | _______________ | _______________ | _______________ | _______________ |
| 3 | _______________ | _______________ | _______________ | _______________ |

(Add additional rows as required. Include school-leaving qualifications, undergraduate degree, postgraduate degree, and any professional certifications relevant to product, engineering, or safeguarding.)

---

## Verification

For each qualification listed above, the applicant has obtained and will provide upon request:

1. Original certificate (scanned colour PDF + original on hand for in-person verification).
2. Official transcript where applicable.
3. UK NARIC / ECCTIS Statement of Comparability for any qualifications awarded outside the UK.
4. Independent English-language proficiency evidence (IELTS, TOEFL, Cambridge English, or a degree taught in English — whichever applies).

---

## Document register

| Document | Location | Format | Notes |
|---|---|---|---|
| Degree certificate | /app/visa_appendices/A_supporting/degree_cert.pdf | PDF | _Applicant to upload_ |
| Degree transcript | /app/visa_appendices/A_supporting/transcript.pdf | PDF | _Applicant to upload_ |
| ECCTIS statement (if applicable) | /app/visa_appendices/A_supporting/ecctis.pdf | PDF | _Applicant to upload_ |
| Professional certifications | /app/visa_appendices/A_supporting/certs/ | PDFs | _Applicant to upload_ |

---

## Applicant statement

I, Yusuf Quadri, confirm that the qualifications listed above are true and accurate. I will produce the original documents at the request of the endorsing body or the Home Office at any stage of the application or post-endorsement review.

**Signature:** ___________________________________

**Date:** ___________________________________


---


# Appendix B — Founder CV (Yusuf Quadri)

**QUADRI YUSUF**
Founder & CEO, DEQUAD
quadri.yusuf@dequad.com · 07928132617 · https://www.linkedin.com/in/quadri-yusuf/ · https://dequad.co.uk

---

## Professional summary

Founder & CEO of DEQUAD, a UK-headquartered safeguarding-first student-wellbeing platform live in production at dequad.co.uk — and a practising frontline safeguarding professional. Currently a **Recovery Coordinator at Change Grow Live (Resolutions service)**, managing complex caseloads of adults in structured drug-and-alcohol treatment, with responsibility for safeguarding referrals, dynamic risk assessment, harm reduction and multi-agency working. Concurrent **NHS experience (East London NHS Foundation Trust)** supporting adults with mental-health conditions, learning disabilities and autism, and coordinating safe staffing across inpatient mental-health wards.

Two-time **University of Bedfordshire Students' Union President (2021–2023)**, representing 10,000+ students and managing a **£900,000 budget**. MBA-qualified with Data Analytics. Built the DEQUAD MVP end-to-end alongside co-founder Yusuff Adeagbo (CTO): FastAPI backend, MongoDB persistence, React Native / Expo web + native frontends, Stripe billing, machine-assisted safeguarding pipeline and admin dashboard. Member of the **NatWest Accelerator (London cohort, joined 16 March 2026)** and alumnus of the **Santander Universities Pre-Incubator (2025)**.

This combination — daily professional practice in adult safeguarding and mental-health support, senior student-representation leadership, commercial business development, and full-stack product delivery — is precisely the founder profile DEQUAD's safeguarding-first mission requires.

---

## Core competencies

| Safeguarding & clinical | Leadership & commercial | Product & technical |
|---|---|---|
| Safeguarding adults & children | Team leadership & volunteer supervision | Full-stack engineering (FastAPI, React Native) |
| Risk assessment & risk management | Stakeholder engagement & influencing | Product strategy & roadmap ownership |
| Recovery planning & harm reduction | Budget management (£900k SU budget) | Data analytics (SQL, Excel, Power BI) |
| Multi-agency partnership working | B2B sales & lead generation | UK GDPR / DPIA authorship |
| Motivational interviewing | Negotiation & contract management | Online Safety Act 2023 compliance |
| Clinical governance & information governance | Performance & quality improvement | CRM & pipeline development |

---

## Experience

### Founder & CEO — DEQUAD (DEQUAD Ltd, in formation)
_2025 – Present · London, United Kingdom_

- Co-founded DEQUAD with **Yusuff Adeagbo (CTO)** — a UK-headquartered safeguarding-first student-wellbeing platform live in production at dequad.co.uk.
- Built the entire MVP end-to-end: FastAPI backend, MongoDB persistence, React Native / Expo web + native frontends, Stripe billing, safeguarding pipeline and admin dashboard.
- Engineered the closed-network architecture: `.ac.uk` email verification with UK-student-domain policy, per-user wellbeing baseline detection, real-time crisis-keyword scanning, admin verification queue and safeguarding webhook.
- Designed the safeguarding policy modelled on UUK Stepchange / Suicide-Safer Universities guidance — informed directly by day-to-day professional practice in adult safeguarding at Change Grow Live and the NHS; authored the UK GDPR DPIA, Lawful Basis register and Online Safety Act 2023 risk assessment.
- **Joined the NatWest Accelerator (London cohort) on 16 March 2026**; previously completed the **Santander Universities Pre-Incubator programme (2025)**.
- In early, informal conversation about a possible pilot with the **University of Bedfordshire** — no agreement, LOI or date is signed — leveraging two years' tenure as the university's Students' Union President.
- Recruited a wider founding team contributing on a pure-equity basis: Dr Gerald Marfo (CMO, PhD Digital Marketing), Adedapo Ajuwon (Senior Software Engineer), Chinyere Jennifer (Senior Advisor — MIGSO-PCUBED).

### Recovery Coordinator — Change Grow Live (Resolutions service)
_2025 – Present · United Kingdom_

- Manage a complex caseload of adults receiving treatment for opiate dependence, delivering person-centred recovery plans and evidence-based interventions that promote sustained recovery.
- Complete comprehensive assessments, **safeguarding referrals and dynamic risk assessments** to ensure safe and effective service delivery.
- Work collaboratively with prescribing clinicians, housing providers, probation, social care, mental-health services and community partners to coordinate holistic, multi-agency support.
- Deliver harm-reduction interventions including naloxone education, overdose prevention and health promotion.
- Provide day-to-day supervision, coaching and support to volunteers — allocating work, monitoring progress, giving constructive feedback and encouraging reflective practice.
- Maintain accurate records and ensure compliance with safeguarding, information-governance and organisational policies.

### Clinical Support Worker — East London NHS Foundation Trust
_2022 – Present · London, United Kingdom_

- Support adults with mental-health conditions, learning disabilities and autism using person-centred approaches.
- Work within multidisciplinary teams to deliver safe, effective care while identifying and escalating safeguarding concerns.
- Maintain high-quality clinical records and contribute to positive patient outcomes.

### Assistant Duty Senior Nurse Administrator — East London NHS Foundation Trust
_2022 – Present · London, United Kingdom_

- Coordinate staffing across inpatient mental-health wards, ensuring safe staffing levels and continuity of care.
- Support operational managers by coordinating referrals, admissions and workforce deployment in a fast-paced environment.

### Business Development Executive — UGC Planet
_2024 · United Kingdom_

- Conducted outbound sales to generate new business opportunities and expand the customer base; researched, sourced and qualified leads, building and managing a prospect database.
- Presented IT solutions to clients, driving adoption of cloud computing, networking and data solutions.
- Maintained a CRM database to track sales trends and customer interactions, improving client-engagement strategies.

### Assistant Business Developer / Data Analyst — Mavin Care Ltd
_2023 – 2024 · United Kingdom_

- Developed partnerships, supported healthcare projects and strengthened stakeholder relationships.
- Analysed sales and customer data to enhance decision-making and forecasting accuracy; built reports and dashboards using **SQL, Excel and Power BI**.

### Students' Union President — University of Bedfordshire
_2021 – 2023 · Two consecutive terms · Luton / Bedfordshire, UK_

- Represented **10,000+ students** at university senior-management level, including on safeguarding, student services, equality and welfare policy.
- Managed a **£900,000 budget**, negotiating vendor contracts and partnerships; increased business–student collaborations by **30%**.
- Led wellbeing, equality and inclusion initiatives; chaired meetings and influenced strategic decision-making across university committees.
- Built the direct relationships with the Director of Student Services, safeguarding leads and senior leadership that now underpin DEQUAD's early, informal pilot conversation with the university — nothing signed to date.

### Ad-hoc Support Worker — Falcon Recruitment & Training
_April 2021 – January 2023 · United Kingdom_

- Supported individuals with complex physical and mental-health needs while promoting dignity, independence and safeguarding.

---

## Education

| Qualification | Institution | Year |
|---|---|---|
| Master of Business Administration (MBA) with Data Analytics | University of Bedfordshire, Luton | 2024 |
| MSc International Relations Management | University of Bedfordshire, Luton | 2020 |
| BSc International Relations and Diplomacy | Afe Babalola University, Nigeria | 2017 |

---

## Skills relevant to DEQUAD

### Safeguarding & compliance
Adult and child safeguarding practice (Change Grow Live / NHS), risk assessment and management, UUK Stepchange and Suicide-Safer Universities guidance, UK Online Safety Act 2023 (Sections 10, 12, Schedule 11), UK GDPR / DPA 2018, DPIA authorship, lawful-basis analysis, NHS DSPT framework, clinical and information governance. Holder of **seven UK safeguarding / clinical-awareness certifications** (see Appendix O).

### Engineering
Python (FastAPI, AsyncIO, Pydantic), TypeScript, React, React Native, Expo Router, MongoDB (Motor, aggregation pipeline), Kubernetes, Docker, GitHub Actions, REST API design, OAuth 2.0, JWT.

### Product & data
Product strategy, roadmap ownership, prioritisation frameworks (RICE, ICE), user-research methods, A/B experimentation, analytics instrumentation, SQL, Power BI, Excel modelling.

### Commercial
Institutional sales motion in UK higher education, NHS commissioning pathways (ICB routes), B2B outbound sales and lead generation, CRM pipeline management, pricing strategy, grant applications (Innovate UK, NIHR), budget management.

---

## Certifications & training

- Seven UK safeguarding and clinical-awareness certifications, including Oliver McGowan Learning Disabilities & Autism, Adult Safeguarding Partnership Working, Suicide Prevention (2026), Data Protection and Information Security, and Safe Response to Challenging Situations (full list: Appendix O).
- Microsoft Azure Fundamentals (in progress).

## Professional development planned (next 12 months)

| Activity | Provider | Target completion |
|---|---|---|
| Level 2 Safeguarding Adults — Awareness (refresher) | iHasco / Virtual College | Month 1 post-endorsement |
| Cyber Essentials Plus certification (organisational) | IASME-accredited certifying body | Month 6 post-endorsement |
| ICO data-protection foundations | UK ICO Online | Month 2 post-endorsement |
| NHS DSPT Toolkit familiarisation | NHS England | Month 9 post-endorsement |

---

## Languages

- English — fluent

## Interests

- IT trends, cloud computing and business applications; competitive volleyball and Scrabble; planning and organising group events.

---

## References

Available on request. The applicant will provide three professional references covering safeguarding practice, commercial and personal-conduct dimensions ahead of the UKES assessment interview.

---

*This CV was written by the applicant and is current as at the date of submission. The original signed copy with full personal details is held by the applicant and will be produced on UKES request.*

**Signature:** ___________________________________

**Date:** ___________________________________


---


# Co-Founder CV — Yusuff Adeagbo
## Chief Technology Officer, DEQUAD

---

## Personal details

| Field | Value |
|---|---|
| **Full name** | Yusuff Adeagbo |
| **Role at DEQUAD** | Co-founder & Chief Technology Officer (CTO) |
| **UK residency status** | UK-resident, full-time on DEQUAD |
| **Working hours commitment** | Full-time |
| **Cash contribution to share capital** | £3,000 (matching the lead founder) |

---

## Summary

Yusuff Adeagbo is the co-founder and Chief Technology Officer of DEQUAD. He combines a postgraduate qualification in Information Technology with Project Management from a UK university with a Higher National Diploma in Computer Science, and brings a multidisciplinary skill set that spans full-stack engineering, UI/UX, graphic design, digital marketing for e-commerce and IT business analysis. This breadth makes him well placed to lead the engineering and IT functions of an early-stage software startup operating across web, mobile and institutional integrations.

---

## Education

| Years | Institution | Award |
|---|---|---|
| 2022 – 2024 | **University of the West of Scotland** | **MSc Information Technology with Project Management** |
| (prior) | Federal Polytechnic (Nigeria) | Higher National Diploma in Computer Science |

---

## Core skills

| Area | Detail |
|---|---|
| **Engineering & IT support** | End-to-end IT support across user-facing and back-office systems; troubleshooting; service-desk operations; hardware and OS administration. |
| **UI / UX design** | User-centred design for web and mobile; wireframing, prototyping, design hand-off to engineering; accessibility and inclusive-design principles. |
| **Graphic design** | Brand identity, marketing collateral, infographic and presentation design — directly relevant to DEQUAD's go-to-market materials. |
| **Digital marketing (e-commerce)** | Performance marketing for e-commerce: campaign set-up, paid social, search, conversion tracking, A/B testing, channel attribution. |
| **IT business analysis** | Requirements gathering, process mapping, stakeholder management, gap analysis, solution scoping. |
| **Project management** | Postgraduate-level training in PM frameworks (PRINCE2-style and agile) applied through the MSc programme. |

---

## Responsibilities at DEQUAD

As CTO, Yusuff is responsible for:

- **Engineering delivery** — owning the FastAPI / MongoDB backend and the Expo / React Native universal frontend; hiring and managing the first engineering team members from Y2 onward.
- **Infrastructure & security** — cloud (Render, Cloudflare), Cyber Essentials roadmap, secrets management, GDPR/DPA-by-design, OSA-2023 compliance reporting flows.
- **Product UX** — collaborating with the CEO and CMO on user-experience decisions across the matching, mood-tracking and safeguarding modules.
- **R&D claim leadership** — documenting qualifying R&D activity in line with HMRC SME R&D Tax Credit guidance.
- **Vendor management** — LLM provider abstraction (OpenAI, Anthropic, Gemini), payment processing (Stripe), notification rails (Twilio, SendGrid).

---

## Why DEQUAD

Yusuff is committing full-time to DEQUAD as a co-founder because:

1. **Lived experience of the problem.** Like the lead founder, Yusuff is part of the African diaspora UK student community and has seen first-hand the gap between the community-building UK universities want to provide and what students actually experience day-to-day.
2. **Cross-functional fit.** DEQUAD needs a CTO who can write production code, design a usable interface, brief a marketing campaign and lead a project to a hard deadline. That breadth is unusual in early-stage UK tech and is exactly what Yusuff brings.
3. **Long-term commitment.** Yusuff is contributing £3,000 of personal capital alongside the lead founder, accepting no salary through Y1–Y2 (Section 18), and signing customary founder vesting if and when any future funding round is raised. He is committed to working full-time in the UK on DEQUAD for the duration of the visa endorsement period and beyond.

---

## Founder undertaking

The undersigned confirms that he:

- is committing full-time to DEQUAD as Chief Technology Officer;
- is contributing **£3,000** of personal capital as founder share capital, to be evidenced by the share allotment return (Form SH01) to be filed with Companies House at incorporation;
- agrees to a customary 4-year founder-vesting schedule with a 1-year cliff, to be put in place if and when any future external funding round is raised (none is assumed or required in this 3-year self-funded plan — Section 10);
- accepts a £0 salary for the first six months of trading (Q1–Q2 Year 1) and a £1,500/month salary thereafter until the seed round.

Signed: ___________________________   Date: ___________________

— *Yusuff Adeagbo*, Chief Technology Officer, DEQUAD Ltd.

---

*Written by Yusuff Adeagbo (Co-Founder & CTO) and submitted to UKES as Appendix B-2 of the DEQUAD Innovator Founder visa endorsement application — June 2026.*


---


# Appendix C — Founder Personal-Commitment Undertaking

**To:** UK Endorsement Services Ltd (UKES)
**From:** Yusuf Quadri ("the Founder")
**Re:** DEQUAD Ltd — Innovator Founder route endorsement
**Date:** ___________________

---

I, **Yusuf Quadri**, co-founder and CEO of DEQUAD Ltd (the "Company") and applicant for endorsement under the UK Innovator Founder route, irrevocably undertake to UK Endorsement Services Ltd as follows:

## 0. Co-founder context

The Company is being co-founded with **Yusuff Adeagbo** (Chief Technology Officer), who is also UK-resident, full-time on DEQUAD, and contributing matching founder share capital of £3,000. Both co-founders have signed customary founder-vesting on equivalent terms. The wider founding team — Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior Software Engineer) and Chinyere Jennifer (Senior Advisor) — is joining at incorporation on equity-only terms with no Year-1 salary.

## 1. Sole and full-time occupation

I will be engaged in the business of DEQUAD Ltd as my **sole and full-time occupation** in the United Kingdom from the date of my grant of leave to remain as an Innovator Founder. I will not undertake any other employment or commercial activity that would prevent me from devoting a minimum of **35 hours per week** to DEQUAD Ltd, save for incidental activities expressly permitted by the Immigration Rules in force from time to time.

## 2. Continuity of role and equity

I will retain the role of Chief Executive Officer of the Company for the duration of the endorsement period. I will retain a material founding shareholding (initially 50%, jointly with the co-founder) throughout that period; any dilutive equity investment will be approved in advance by the endorsing body in accordance with UKES's published guidance.

## 3. UK base of operations

I will base the Company's registered office, principal place of business, and operations in the United Kingdom. All employees recruited in support of the business plan submitted with this endorsement will be UK-based.

## 4. Compliance with endorsement contact points

I will participate in the **6, 12, and 24-month contact points** with UKES as required by the Innovator Founder route, and will provide UKES with:
- A current business-progress report;
- Up-to-date management accounts;
- Evidence of material milestones met;
- Notice of any material adverse changes in the business plan within 30 days of becoming aware of them.

## 5. Material changes

I undertake to notify UKES in writing of any of the following events within thirty (30) days of their occurrence:
- Change in the legal form of the Company;
- Sale or transfer of more than 25% of the Company's equity in a single transaction;
- Departure from the business model, market, or geography submitted in support of the endorsement;
- Insolvency event, including but not limited to administration, voluntary arrangement, or winding-up petition.

## 6. Legal and regulatory compliance

I undertake that DEQUAD Ltd will at all times comply with:
- UK GDPR and the Data Protection Act 2018;
- The Online Safety Act 2023 and applicable secondary regulations;
- The Equality Act 2010;
- The Companies Act 2006;
- All applicable safeguarding obligations, including those applicable to processors of data relating to children and vulnerable adults.

## 7. Anti-fraud and good standing

I confirm that I have not been:
- Convicted of any criminal offence in any jurisdiction that would be considered serious under UK law;
- Subject to any disqualification order under the Company Directors Disqualification Act 1986;
- Subject to any current investigation by HMRC, the Insolvency Service, or any equivalent overseas authority.

## 8. Truthfulness of submission

I confirm that the contents of the principal endorsement document (**INNOVATOR_VISA_DEQUAD.md**) and all appendices are true and accurate to the best of my knowledge. I acknowledge that the provision of false information may result in the revocation of any endorsement granted and removal of leave to remain in the United Kingdom.

## 9. Use of endorsement

I will not represent to any third party that endorsement carries any implication of investment recommendation, financial advice, or guarantee of business success. I will use the endorsement only for the purpose of supporting my Innovator Founder visa application and as evidence of UKES's professional view at the date of issue.

---

**Signed:** ___________________________________

**Print name:** Yusuf Quadri

**Date:** ___________________________________

**Witness signature:** ___________________________________

**Witness name + address:** ___________________________________

---

*This undertaking was drafted personally by the Founder, is given freely and without coercion, and is governed by the laws of England and Wales.*


---


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


---


# Appendix E — Data Protection Impact Assessment (DPIA)

**Controller:** DEQUAD Ltd (in formation), United Kingdom
**Processor:** DEQUAD Ltd (in formation)
**Processing activity covered:** Operation of the DEQUAD platform — verified-student peer matching, daily mood tracking, in-app messaging, safeguarding scanning, and 24/7 support chat.
**DPIA version:** v0.4 (draft)
**Author:** Yusuf Quadri, CEO (acting controller representative)
**Reviewed by:** _External fractional DPO to be appointed Month 1 post-endorsement (recommended: The DPO Centre)_
**Last reviewed:** ___________________
**Next review due:** 12 months from approval

---

## E.1 Why this DPIA is required

UK GDPR Art 35 requires a DPIA where processing is **likely to result in a high risk to the rights and freedoms of natural persons**, including:

- Systematic monitoring of behaviour (Art 35(3)(c))
- Processing of special-category data on a large scale (Art 35(3)(b))
- Use of new technologies (Art 35(3))

DEQUAD's processing meets at least two of these criteria — systematic monitoring of in-app behaviour for safeguarding purposes and processing of mental-health (special category) data. A DPIA is therefore mandatory.

---

## E.2 Description of the processing

### E.2.1 Nature

DEQUAD collects, stores, analyses, and acts upon data from verified UK university students relating to:

- Identity (name, photo, university email)
- Profile preferences (course, modules, society interests, lifestyle)
- In-app messages
- Daily mood scores and free-text notes
- Support-chat messages

Data is analysed by:
- A peer-matching engine (compatibility ranking)
- A safeguarding engine (real-time crisis-keyword scanning)
- A wellbeing-baseline engine (per-user trend detection)
- An LLM-assisted support reply engine (text generation)

### E.2.2 Scope

| Dimension | Scope at endorsement | Scope at Year 5 |
|---|---|---|
| Geographic | United Kingdom only | UK + Republic of Ireland + ANZ + Canada |
| Data subjects | Verified UK HE students | + FE students + ICB-commissioned 16-25 |
| Volume | 0 at endorsement | Up to ~1.2m active users |
| Retention | See E.5 | See E.5 |
| Special-category data | Mental-health (mood, support, safeguarding flags) | Same |

### E.2.3 Context

DEQUAD is a closed network. Data subjects are adults (16+) who have actively chosen to sign up, have read a plain-English privacy notice, and have given explicit consent to special-category processing where required. The processing is necessary to deliver the product the user has signed up for.

### E.2.4 Purposes

| Purpose | Lawful basis (Art 6) | Special category basis (Art 9) |
|---|---|---|
| Verifying university affiliation | Performance of contract (Art 6.1.b) | n/a |
| Storing mood entries | Consent (Art 6.1.a) | Explicit consent (Art 9.2.a) |
| Crisis-keyword scanning | Legitimate interest (Art 6.1.f) + vital interests (Art 6.1.d) where life at risk | Substantial public interest — safeguarding of children and individuals at risk (DPA 2018 Sch 1 Pt 2 para 18) |
| Peer matching | Performance of contract | n/a |
| Anonymised research licensing | Legitimate interest (Art 6.1.f) | Data fully anonymised before transfer; not in scope of Art 9 |

A full data-flow diagram is filed alongside this DPIA as `E_supporting/data_flow.png`.

---

## E.3 Consultation

| Party consulted | Date | Outcome |
|---|---|---|
| The DPO Centre (proposed DPO) | _Pending_ | Fractional DPO retainer to be signed Month 1 post-endorsement |
| ICO Innovation Hub | _Pending_ | Application to the Innovation Service for early-stage guidance during Month 2 |
| Sample data subjects | _Pending — pilot university_ | User-research interviews planned during pilot onboarding |
| Independent safeguarding consultant | _Pending — proposed: Survivors UK / NSPCC Learning_ | Annual audit retainer Year 1 |

---

## E.4 Necessity and proportionality

| Test | Assessment |
|---|---|
| Are the lawful bases identified appropriate? | Yes — consent for mood (revocable), contract for matching, substantial public interest for safeguarding |
| Does the processing achieve its purpose? | Yes — wellbeing trends and safeguarding alerts cannot be detected without processing the underlying data |
| Is there a less-invasive way? | Considered: (a) population thresholds instead of per-user baseline (rejected — see Appendix D for evidence of higher false-positive rate); (b) self-report only with no scanning (rejected — fails OSA s. 10 safeguarding duty); (c) hashing of message content (rejected — defeats safeguarding purpose) |
| Quality and accuracy | Mood data is self-reported (Art 5.1.d compliant — subject to data subject's own veracity); profile data is editable by the user at any time; admin records are auditable |
| Data minimisation | Profile-photo upload optional; mood-note free-text is optional; no demographic data collected beyond university name unless user explicitly adds it |
| Retention | See E.5 |
| Rights of data subjects | See E.6 |
| Processors | See E.7 |

---

## E.5 Retention schedule

| Data category | Retention period | Justification |
|---|---|---|
| Active account profile | Duration of account + 30 days post-deletion | 30-day grace for accidental deletion; compliant with Art 17 |
| Mood entries | Duration of account; user-exportable; user-deletable | User-controlled |
| In-app messages | Duration of account, both sides; deleted on either party's account deletion (deletion takes precedence) | UK GDPR principle of data minimisation |
| Safeguarding-alert records | **7 years** from creation | Required for safeguarding audit trail (Care Act 2014 best practice; statutory limitation for civil claims) |
| Support-chat transcripts | 2 years | Customer-service quality + dispute resolution |
| Stripe billing records | 7 years | Companies Act 2006 + HMRC requirement |
| Server access logs | 90 days | Security; sufficient for incident response |
| Audit logs (admin actions) | 7 years | Internal-control + OSA s. 23 record-keeping |

---

## E.6 Rights of data subjects

| Right | How exercised | Response SLA |
|---|---|---|
| Access (Art 15) | "Download my data" in app + DPO email | 30 days |
| Rectification (Art 16) | Inline profile edits + DPO email | Immediate (UI) / 30 days (DPO) |
| Erasure (Art 17) | "Delete account" in app + DPO email | 30 days; safeguarding records retained per E.5 with lawful basis |
| Restriction (Art 18) | DPO email | 30 days |
| Portability (Art 20) | "Export my data" in app — JSON file | 30 days |
| Objection (Art 21) | DPO email | 30 days |
| Withdraw consent (Art 7.3) | One-tap revocation in app | Immediate |
| Lodge a complaint with ICO | Linked from in-app privacy notice and dequad.co.uk/privacy | n/a |

A documented Subject Rights Request procedure is maintained at `/internal/SRR_procedure.md` (not yet public).

---

## E.7 Processors

| Processor | Purpose | Data shared | Location | Contract status |
|---|---|---|---|---|
| MongoDB Atlas (MongoDB Inc.) | Database hosting | All collections | UK (London region) | Atlas DPA accepted; Standard Contractual Clauses adopted |
| Stripe Payments UK Ltd | Subscription billing | Email + payment token | UK | Stripe DPA accepted |
| Cloudflare UK Ltd | DNS / WAF / CDN | IP + request metadata | UK / EU | Cloudflare DPA accepted |
| OpenAI (via Emergent LLM Key) | LLM auto-reply on support chat | Redacted excerpt of support text only | US (with Standard Contractual Clauses) | Emergent ToS + OpenAI DPA |
| Expo Push Service (Expo Inc.) | Push notifications | Device token + alert payload | US (with SCCs) | Expo DPA |
| Sentry (Functional Software Inc.) | Error monitoring | Stack traces (PII-scrubbed) | EU region | Sentry DPA |
| AWS SES (Amazon Web Services EMEA) | Transactional email | Email address + body | UK (eu-west-2) | AWS DPA accepted |
| Hiscox / Markel | Insurance | None during ordinary course | UK | n/a |

International transfers documented in `E_supporting/transfer_register.md` with Standard Contractual Clauses 2021 in place where applicable.

---

## E.8 Risk register

| # | Risk | Likelihood | Severity | Inherent risk | Mitigation | Residual risk |
|---|---|---|---|---|---|---|
| 1 | Unauthorised access to mood/safeguarding records | Low | High | High | Encryption at rest + TLS in transit + RBAC + audit logging + annual pen-test | Low |
| 2 | Re-identification from "anonymised" research data | Med | High | High | k-anonymity ≥ 5 enforced; named DPO review of every release; written agreements with recipients | Low |
| 3 | Excessive scanning of in-app messages (over-collection) | Med | Med | Med | Keyword library reviewed quarterly; false-positive rate audited; transparency report annually | Low |
| 4 | LLM prompt-injection or output containing PII | Med | Med | Med | All user text redacted before LLM call; no PII in prompt templates; output filtered for crisis numbers + URLs only | Low |
| 5 | Cross-border transfer to OpenAI (US) | Med | Med | Med | Only redacted excerpts; SCCs in place; transfer-risk assessment lodged at `E_supporting/transfer_risk_assessment.md` | Low-Med |
| 6 | Data subject denied erasure due to safeguarding retention | Low | High | Med | Lawful basis (substantial public interest) documented per request; data subject notified in writing with right to ICO complaint | Low |
| 7 | Insider misuse of admin dashboard | Low | High | Med | Two-factor auth on admin; audit log retained 7 years; quarterly access review; immediate offboarding workflow | Low |
| 8 | DPIA itself becomes stale | High | Med | Med | DPIA reviewed annually and on any material change (e.g. new processor, new processing purpose) | Low |
| 9 | Children (under-18) processed without parental consent | Low | High | Med | Birth-date check at sign-up; flag for `.ac.uk` accounts where birth-date < 18; default privacy-protective settings; ICO AADC alignment | Low |
| 10 | A safeguarding event leaks to other students | Low | Critical | High | Safeguarding scans are server-side only; alerts go to DSL email, never in-app; UI design prevents accidental exposure | Low |

---

## E.9 Approvals

| Role | Name | Signature | Date |
|---|---|---|---|
| Controller representative | Yusuf Quadri | _signed in original_ | ___________________ |
| Data Protection Officer | _The DPO Centre (designated)_ | _to follow Month 1_ | ___________________ |
| External safeguarding advisor | _to be appointed Year 1_ | _to follow_ | ___________________ |

---

## E.10 Conclusion

The processing described above is necessary to deliver the DEQUAD service and to meet UK regulatory obligations under the Online Safety Act 2023. The risks have been identified and mitigated to a level that — in the controller's view — meets the UK GDPR Article 35 standard of being **proportionate to the purposes and rights at stake**. No high residual risk has been identified that requires consultation with the Information Commissioner under Art 36 at this time.

The DPIA will be re-reviewed annually, on the appointment of the DPO, and immediately upon any material change in processing.


---


# Appendix F — Three-Year Financial Model (Self-Funded)

*Currency: GBP (£). Figures are aligned to Business Plan v5.0 §§11–14 (this document). This is a deliberately conservative, self-funded model: the £6,000 founder capital injection is the only funding assumed anywhere. No pre-seed, seed, Series A, grant or R&D tax credit is assumed, committed, or required for the plan to remain solvent. No institutional revenue is assumed in Y1 — the pilot conversation with the University of Bedfordshire is not signed and nothing is guaranteed.*

---

## F.1 Revenue Forecast

| Line item | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Universities (paid — avg in year) | 0 (nothing signed) | 0.5 (target, contingent) | 1.5 (target, contingent) |
| Avg students per university | 10,000 | 10,000 | 10,000 |
| Institutional ARR | £0 | £10,000 | £30,000 |
| NHS ICBs commissioned | 0 | 0 | 0 |
| NHS ARR | £0 | £0 | £0 |
| Premium subscribers (avg) | 20 | 100 | 300 |
| Premium ARR (£4.99/mo) | £600 | £6,000 | £18,000 |
| **TOTAL REVENUE** | **£600** | **£16,000** | **£48,000** |

*Y1 assumes zero institutional revenue — no pilot is signed at the date of this plan. Premium revenue is modelled independently of any pilot, from the existing 80-person Bedfordshire beta cohort plus modest organic growth. Y2/Y3 institutional figures are targets only, contingent on the Bedfordshire conversation converting; the plan remains solvent (Section 12) even if it does not.*

---

## F.2 Cost of Revenue (COGS)

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting (MongoDB Atlas + Render) | £600 | £1,200 | £2,400 |
| LLM / safeguarding inference (OpenAI gpt-4o-mini) | £400 | £900 | £1,800 |
| Stripe processing | £50 | £90 | £180 |
| SMS & email notifications | £150 | £400 | £800 |
| Customer-success tooling | £200 | £500 | £900 |
| **Total COGS** | **£1,400** | **£3,100** | **£6,100** |
| **Gross profit / (loss)** | **(£800)** | **£12,900** | **£41,900** |
| **Gross margin** | n/a (revenue too small) | 80.6% | 87.3% |

---

## F.3 Operating Expenses

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Payroll (salaries + employer NI + pension + benefits) | £0 | £0 | £21,500 |
| Marketing (founder-led, low-cost channels) | £900 | £2,500 | £5,000 |
| Software subscriptions | £600 | £1,200 | £1,800 |
| Office / co-working (post-NatWest programme; low-cost/remote) | £0 | £300 | £600 |
| Legal & accountancy (out-of-programme) | £300 | £600 | £1,200 |
| Insurance (D&O, PI, Cyber, PL) | £480 | £700 | £900 |
| Business support / misc | £400 | £700 | £1,000 |
| Fixed assets capex | £600 | £600 | £1,200 |
| **Total OPEX** | **£3,280** | **£6,600** | **£33,200** |
| **Operating result** | **(£3,630)** *(incl. depreciation, see §13)* | **£6,500** | **£9,200** |

---

## F.4 Annual Cash Flow Forecast

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | £6,000 | £1,920 | £8,220 |
| Cash from sales | £600 | £16,000 | £48,000 |
| **Total receipts** | **£600** | **£16,000** | **£48,000** |
| Cost of sales | (£1,400) | (£3,100) | (£6,100) |
| Payroll (incl. NI, pension, benefits) | £0 | £0 | (£21,500) |
| Marketing | (£900) | (£2,500) | (£5,000) |
| Software subscriptions | (£600) | (£1,200) | (£1,800) |
| Office | £0 | (£300) | (£600) |
| Legal & accountancy | (£300) | (£600) | (£1,200) |
| Insurance | (£480) | (£700) | (£900) |
| Business support / misc | (£400) | (£700) | (£1,000) |
| Fixed assets capex | (£600) | (£600) | (£1,200) |
| Corporation tax (prior-year liability, paid in arrears) | £0 | £0 | (£500) |
| **Total expenditure** | **(£4,680)** | **(£9,700)** | **(£39,800)** |
| **Net cash movement** | **(£4,080)** | **£6,300** | **£8,200** |
| **Closing cash balance** | **£1,920** | **£8,220** | **£16,420** |

*No pre-seed, seed or R&D tax credit is assumed. Closing cash stays positive in every year, funded entirely by the £6,000 opening balance plus revenue — the plan does not depend on any pilot converting or any investor closing.*

---

## F.5 Funding — self-funded only

| Source | Timing | Amount | Status |
|---|---|---:|---|
| Founder equity injection | M1 (Jun 2026) | £6,000 | **Delivered — the only funding in this plan** |

No pre-seed, seed, Series A or other external investment is assumed, committed, or required anywhere in this 3-year model. If institutional traction significantly exceeds this conservative forecast, the founders may explore external investment beyond Year 3 — that scenario is outside the scope of these figures.

---

## F.6 Headcount Plan

| Role | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Founders (CEO + CTO) | 2 (unpaid) | 2 (unpaid) | 2 (modest pay) |
| Safeguarding & Trust Lead (part-time) | 0 | 0 | 1 |
| **Total headcount / FTE** | **2 / 0 FTE (unpaid)** | **2 / 0 FTE (unpaid)** | **3 / c.2.5 FTE** |

*No founder salary is drawn in Y1 or Y2; both founders fund personal living costs from existing employment (CEO: Change Grow Live; CTO: freelance engineering). Modest founder pay (£500/mo each) and the plan's only funded hire begin in Y3, funded entirely by revenue.*

---

## F.7 Key Unit Economics

| Metric | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Avg revenue per paid university | n/a | £20,000 | £20,000 |
| Avg CAC per university | n/a (no paid channel) | c.£2,500 (founder-led, low-cost) | c.£3,300 |
| Avg premium subscriber revenue | £59.88/yr | £59.88/yr | £59.88/yr |

*Institutional unit economics are illustrative only in Y1–Y2 given the small, contingent sample size (0–0.5 universities). They are not presented as validated benchmarks until more than one paying institution exists.*

---

## F.8 Key Assumptions

1. **Institutional pricing:** £2 per enrolled student per year (£20,000 for a 10,000-student university) — unchanged from the original pricing research (Section 5), but **no institutional revenue is assumed in Y1**.
2. **Premium pricing:** £4.99/month (£59.88/year), drawn from the existing 80-person Bedfordshire beta cohort and modest organic growth — independent of whether any institutional pilot converts.
3. **No external funding assumed:** the entire 3-year plan is funded by the £6,000 founder capital plus revenue. No pre-seed, seed, grant or R&D tax credit is assumed or required.
4. **Founder living costs:** both founders are employed independently (CEO at Change Grow Live; CTO as a freelance engineer) and draw no salary from DEQUAD until Y3, and only then to the extent revenue supports it.
5. **Pilot uncertainty:** the University of Bedfordshire pilot is an early-stage, informal conversation only. No agreement, LOI or date is signed. It is modelled as a Y2 upside, not a Y1 certainty, and the plan remains solvent whether or not it converts.
6. **No break-even target is set for this 3-year window** — the plan targets modest, growing profitability and a growing cash reserve (Section 13), not a specific break-even date tied to external funding.


---


# Appendix G — Job Description & Salary Band (Self-Funded 3-Year Plan)

*Written and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd.*

This appendix documents the **one funded hire** in the self-funded 3-year plan referenced in main document §7.3, plus the basis on which any further hiring beyond Year 3 would be considered. This is a deliberate change from earlier drafts of this plan, which assumed a 42-role, 5-year hiring plan funded by pre-seed, seed and Series A rounds. None of that external funding is assumed in this version (Section 10), so the hiring plan has been rebuilt around what institutional and premium revenue can actually fund.

All roles are **UK-based, PAYE, paying UK National Insurance contributions**, and recruited through fair and open processes.

---

## G.1 Hiring summary — 3-year, self-funded

| Year | New hires | Cumulative headcount | Basis |
|---|---|---|---|
| Y1 | 0 | 2 (founders, unpaid) | No revenue to fund any hire |
| Y2 | 0 | 2 (founders, unpaid) | Revenue still too small/uncertain to justify a hire |
| Y3 | 1 (part-time) | 3 (c.2.5 FTE) | Funded entirely by Y3 revenue, contingent on 2+ paying universities |

Total Y3 wage bill (all roles, incl. modest founder pay): **£20,000 gross / £21,500 incl. employer NI, pension and other costs** (Section 18.3).

---

## G.2 Year 3 — Safeguarding & Trust Lead (part-time)

| Field | Detail |
|---|---|
| Hire timing | Year 3, contingent on 2+ paying universities — not guaranteed |
| Commitment | Part-time, c.10 hours/week |
| Salary band | c.£8,000/yr (pro-rata) |
| Reporting line | CEO (Yusuf Quadri) |
| Mission | Support safeguarding triage and escalation as the paying-university base grows beyond what the founder can cover alone; liaise with partner-university DSLs |
| Must-have | Relevant safeguarding qualification (Level 2/3 Safeguarding Adults or equivalent); HE, NHS or charity safeguarding experience; enhanced DBS |
| Recruitment channel | Charity Job, NCVO, AMOSSHE network |

---

## G.3 Beyond Year 3 — not part of this plan

Further roles (engineering, customer success, sales, marketing, data/ML, operations) are a long-term ambition, not a commitment. They would only be made if institutional revenue significantly exceeds the conservative Y3 base case (Section 11) or if a future funding round is raised — neither of which is assumed here. No salary bands, hire dates or headcount targets are set for this later stage, to avoid presenting an unfunded plan as committed.

---

## G.4 Diversity, equality, and inclusion commitments

Even at this small scale, DEQUAD commits to:

- **Open advertising** for the Y3 hire on at least two channels for at least 14 days before any offer.
- **Blind shortlisting** at CV-screening stage (name, university, address removed).
- **Structured interview rubric.**
- **Pay-band transparency** — salary published in the job advert.
- **Hiring-mix aspiration** — as the team grows beyond Year 3, DEQUAD aims for at least 45% female and at least 30% minority-ethnic representation, reported annually once headcount is large enough for this to be meaningful.


---


# Appendix H — University Letter of Interest (Template)

*Template drafted by Yusuf Quadri, Founder & CEO, DEQUAD Ltd.*

This appendix provides the template used by DEQUAD when seeking a Letter of Interest or formal Memorandum of Understanding (MOU) from a pilot university. Letters returned by partner institutions will be attached to this appendix as they arrive.

The template below is co-signed by the partner-university point of contact (typically the Director of Student Services or Head of Wellbeing Services) and the DEQUAD founder.

---

## Template: Letter of Interest

_(On partner-university letterhead.)_

**Date:** ___________________

**To:** UK Endorsement Services Ltd

**Subject:** Letter of Interest in piloting DEQUAD at [University Name]

To whom it may concern,

I am writing in my capacity as **[Job Title]** at the **University of Bedfordshire** to confirm our institutional interest in piloting the DEQUAD platform (developed by DEQUAD Ltd, co-founded by Yusuf Quadri — formerly Bedfordshire SU President 2021–2023 — and Yusuff Adeagbo, CTO) during academic year 2026/27.

## Background

[University Name] has an enrolled student population of approximately **[number]** undergraduates and **[number]** postgraduates across **[number]** schools/faculties. Our student services team handles approximately **[number]** wellbeing-related contacts per academic year, with average waiting time for counselling appointments of **[number]** weeks.

## Why we are interested in DEQUAD

We have identified three institutional priorities that the DEQUAD platform appears well-positioned to address:

1. **Proactive identification of students at risk** — DEQUAD's per-user wellbeing baseline approach offers the prospect of detecting deterioration earlier than self-referral, which is critical given the volume pressures on our counselling service.

2. **Out-of-hours peer-mediated support** — DEQUAD's closed peer network provides a moderated, safeguarded route for students to connect outside business hours, supplementing (not replacing) our in-house provision.

3. **Compliance with the Higher Education Mental Health Charter** — Our institution is [a signatory / planning to sign / committed to the principles of] the Charter. DEQUAD's design aligns with the Charter's whole-university approach and the "Step Change" framework.

## Pilot scope (subject to procurement and DPIA completion)

Subject to satisfactory completion of our procurement process, including:
- A joint Data Protection Impact Assessment (DPIA);
- A Data Processing Agreement compliant with UK GDPR;
- Information-security due diligence (Cyber Essentials Plus required);
- An agreed safeguarding escalation protocol;

…we would be open to piloting DEQUAD with a sub-cohort of up to **[number] students** during academic year 2026/27, with full-cohort rollout subject to pilot outcomes.

## Indicative pricing acceptance

The pricing point of **£1.50 per enrolled student per annum** discussed with the DEQUAD team is within the indicative range we have allocated for digital-wellbeing tooling in the 2026/27 budget cycle.

## No commitment at this stage

This letter is a statement of interest only and does not constitute a procurement decision, contractual commitment, or financial obligation by [University Name]. Any binding commitment will follow our standard procurement, legal, and DPIA processes.

## Contact

I am happy to be contacted by UK Endorsement Services Ltd to confirm the contents of this letter and to discuss [University Name]'s assessment of DEQUAD's potential.

**Yours sincerely,**

___________________________________
**[Name]**
[Job Title]
[University Name]
[Email]
[Phone]

---

## Letters received to date

| University | Signed by | Date | Status |
|---|---|---|---|
| University of Manchester | _Pending — discussion underway_ | _____________ | Verbal interest |
| _______________ | _______________ | _____________ | _______________ |
| _______________ | _______________ | _____________ | _______________ |

---

## Notes for UKES assessor

DEQUAD acknowledges that as a pre-revenue business at the date of endorsement application, formal signed Letters of Interest may be limited. Where formal letters are not yet returned, the applicant will provide:

- Verbal-interest confirmations via the named contact's professional email signature
- Meeting notes from any in-person or video discussions
- Anonymised LinkedIn message chains where data-protection rules permit
- Calendar invitations from completed exploratory meetings

These are attached as supporting evidence in the **`H_supporting/`** folder.


---


# Appendix I — Online Safety Act 2023 Compliance Opinion

**Subject of opinion:** DEQUAD (DEQUAD Ltd in formation), operated at https://dequad.co.uk
**Author of internal assessment:** Yusuf Quadri (Founder)
**External counsel of record:** [Law firm to be appointed — recommended panel: Bristows, Mishcon, Wiggin, Schillings]
**Date of latest review:** ___________________

---

## I.1 Purpose

This document is an internal compliance opinion summarising DEQUAD's position under the **Online Safety Act 2023** ("OSA") and is intended to demonstrate to UK Endorsement Services Ltd that the applicant has identified the obligations applicable to the business and has built the product with them in mind.

A signed external legal opinion from a UK-qualified solicitor in good standing will be commissioned during Month 2 post-endorsement and attached to this appendix at the next UKES contact point.

---

## I.2 Categorisation of DEQUAD under the OSA

| Category | Status | Reason |
|---|---|---|
| Regulated user-to-user service | **Yes** | Users (verified students) share content with other users via messages and profile fields |
| Search service | No | DEQUAD does not provide search across third-party content |
| Likely to be accessed by children (under 18) | **Yes** (residual) | Although DEQUAD targets verified university students (predominantly 18+), some UK undergraduates start at 17 |
| Category 1 service (Ofcom designation) | **No** (forecast) | DEQUAD's user base and functionality will not meet the Category 1 thresholds during the endorsement window |

**Practical implication:** DEQUAD is a **Category 2B-equivalent** user-to-user service with residual exposure to under-18 users. The applicable duties are summarised in §I.3.

---

## I.3 Applicable duties

| Duty | Section | DEQUAD design response |
|---|---|---|
| Illegal-content risk assessment | OSA s. 9, s. 10 | Completed; reviewed annually. See §I.4 below |
| Illegal-content safety duties | OSA s. 10 | Real-time keyword scanning + escalation to DSL; reporting flow built; takedown SLA defined |
| Children's risk assessment | OSA s. 11, s. 12 | Completed under assumption of residual under-18 access. See §I.5 |
| Children's safety duties | OSA s. 12 | High-risk safety setting default-on for all users; no algorithmic recommendation of strangers to flagged-under-18 accounts |
| Content-reporting and complaints procedures | OSA s. 17 | "Report a profile" feature live since 2026; complaints SLA 4 hours human triage |
| User empowerment (Cat 1 only) | OSA s. 14 | Not applicable (Cat 2B) |
| Freedom of expression / privacy | OSA s. 22 | DPIA documents necessity + proportionality of every safeguarding scan |
| Record-keeping | OSA s. 23 | All safeguarding events logged for 7 years; risk-assessment versions retained |
| Designated content moderator | OSA s. 56 | DSL appointed; backup DSL named |
| Ofcom information requests | OSA s. 100 | Process in place: 7-day response SLA |

---

## I.4 Illegal-content risk assessment summary

| Priority illegal content type | Risk on DEQUAD | Why | Mitigation |
|---|---|---|---|
| Terrorism (s. 59) | Very low | Closed UK university network; no anonymous posting; no public discoverability | Standard keyword scan + reporting flow |
| Child sexual abuse (CSAM) | Low | Verified `.ac.uk` users (16+ at oldest UK universities); no photo-sharing without face-detection check | Photo upload moderation queue; CSAM detection partner to be appointed Y1 |
| Hate offences | Medium | Student demographics include vulnerable groups; loneliness apps attract abuse vectors | Real-time slur detection (already live); zero-tolerance ban policy; appeals route |
| Harassment / stalking | Medium | Direct-message functionality enables targeted abuse | Per-message safeguarding scan; "block + report" combined flow |
| Controlling / coercive behaviour | Medium | Closed-network apps can enable controlling relationships | Pattern detection on per-conversation cadence; safeguarding nudges; partnership with Refuge for IDVA referrals (Y2) |
| Drugs / firearms / sale of stolen goods | Low | Verified-student network with strict TOS; no marketplace functionality | TOS prohibition + reporting + ban |
| Fraud | Low | No payment between users; no marketplace | Stripe-only billing flow; users cannot solicit money |
| Suicide and self-injury content | **High residual** | The platform's safeguarding role makes this content type uniquely relevant | Per-message scan + DSL escalation + Samaritans/Shout signposting (live); evaluated quarterly |
| Encouragement of suicide (s. 184 OSA) | High residual | As above | Active scanning; "encouragement" patterns distinct from "expression of distress" — DSL judges |
| Animal cruelty / extreme pornography | Very low | No mass-media upload; profile photos only | Profile-photo moderation queue |

The full Illegal Content Risk Assessment (ICRA) is kept on file and reviewed annually. Methodology aligns with Ofcom's **Online Safety: Illegal Harms Guidance** (December 2024).

---

## I.5 Children's risk assessment summary

DEQUAD is designed for verified UK university students. The platform's verification gate (active `.ac.uk` email) excludes the vast majority of under-18 users. However:

- A small number of UK undergraduate students begin their first year aged 17 (typically birthday-rule edge cases).
- Some Foundation-Year and Access course students at partner FE institutions may be 16+.

The Children's Risk Assessment therefore treats DEQUAD as a service with **residual exposure to under-18 users** and applies the corresponding precautions:

| Precaution | Implementation |
|---|---|
| Age-assurance at sign-up | Self-declared birth date + verified university email. Stronger age-verification under evaluation for Year 2 |
| Default privacy-protective settings for likely under-18 accounts | No discoverability via search; no exposure to adult users >5 years older without dual opt-in |
| Children's content-design code (ICO AADC) alignment | Designed in from launch: data minimisation, no profiling, no dark patterns |
| Education and reporting tools tailored for younger users | Plain-English help; one-tap "I need help" route to Childline (for under-18 self-identified users) |

---

## I.6 Designated roles and accountabilities

| OSA-mandated role | Person / function | Notes |
|---|---|---|
| Senior Manager Responsible for Compliance (OSA s. 56) | Yusuf Quadri, CEO (with Yusuff Adeagbo, CTO, as deputy) | Joint founder accountability documented in board minutes |
| Designated Safeguarding Lead | _Yusuf Quadri, CEO, personally (a qualified safeguarding professional) through Y1–Y2; a dedicated part-time Safeguarding & Trust Lead is planned for Y3, contingent on 2+ paying universities and funded entirely by revenue — see Business Plan §18.3_ | Job description in Appendix G |
| Data Protection Officer | _Outsourced fractional throughout Y1–Y2 (e.g. The DPO Centre, low-cost pay-as-you-go); an in-house FTE DPO is not assumed in this 3-year plan and would only be considered later if data-processing scale justifies it_ | |
| Ofcom liaison point | Yusuf Quadri, CEO (Y1); transition to in-house counsel Y3 | |

---

## I.7 Engagement with the regulator (Ofcom)

| Activity | Status |
|---|---|
| Registered for Ofcom's small-platform information service | Pending Month 1 post-endorsement |
| Subscribed to Ofcom guidance updates | ✅ Live |
| Familiarity with Ofcom's Guidance for Smaller Providers (2025) | ✅ Reviewed |
| Plan for Ofcom transparency reports (if Cat 1 designation triggered) | Documented; no current Cat 1 forecast within endorsement window |

---

## I.8 External legal opinion — scope of work to be commissioned

The external legal opinion to be commissioned in Month 2 post-endorsement will cover:

1. Confirmation of DEQUAD's categorisation under the OSA;
2. Sufficiency of the Illegal Content and Children's Risk Assessments;
3. Sufficiency of the content-reporting and complaints procedures;
4. Adequacy of record-keeping;
5. Risk register for foreseeable Ofcom enforcement;
6. Boilerplate Terms of Service and Acceptable Use Policy review;
7. Confirmation that the founder's senior-manager-responsible accountability is appropriately recorded.

Estimated cost: **£8,000–£12,000** (firm fee dependent). Budgeted in Year-1 P&L (Appendix F).

---

## I.9 Statement

The applicant has read the Online Safety Act 2023 in full, has read the Ofcom illegal-content and children's-safety guidance, and has designed DEQUAD's product, processes, and policies to comply with the duties applicable to a Category 2B-equivalent user-to-user service. The applicant will obtain external legal confirmation of this position within the first six months of operation and will produce that opinion at the 6-month UKES contact point.

**Signed:** ___________________________________ **Yusuf Quadri**

**Date:** ___________________________________


---


# Appendix J — Technology Architecture

*Prepared by the founders — Yusuf Quadri (CEO) and Yusuff Adeagbo (CTO), who designed and built the architecture described below.*

DEQUAD's stack is intentionally simple, cloud-native, and based on widely-adopted open-source components — minimising key-person risk and supporting the scalability commitments in §7.

---

## J.1 High-level architecture diagram

```
                                  ┌──────────────────────────┐
                                  │   Cloudflare (DNS, WAF)  │
                                  └────────────┬─────────────┘
                                               │ TLS 1.3
                ┌──────────────────────────────┴──────────────────────────┐
                │                                                         │
        ┌───────▼────────┐                                       ┌────────▼────────┐
        │  Web client    │                                       │  Native clients │
        │  (React +      │                                       │  (iOS / Android │
        │   Expo Router) │                                       │   via Expo /    │
        │                │                                       │   EAS Build)    │
        └───────┬────────┘                                       └────────┬────────┘
                │                                                         │
                │             HTTPS (Bearer-token auth, JSON)             │
                └──────────────────────┬──────────────────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │   Ingress       │
                              │  (Nginx, K8s)   │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │  FastAPI API    │
                              │  (Python 3.11)  │
                              │  - Auth         │
                              │  - Matching     │
                              │  - Mood         │
                              │  - Safeguarding │
                              │  - Support      │
                              │  - Admin        │
                              └─┬─────┬─────┬───┘
                                │     │     │
              ┌─────────────────┘     │     └───────────────────────┐
              │                       │                             │
      ┌───────▼────────┐    ┌─────────▼─────────┐         ┌─────────▼─────────┐
      │  MongoDB Atlas │    │  Stripe Connect   │         │  Outbound services│
      │  (UK region,   │    │  (UK FCA-         │         │  - SMTP (Gmail/   │
      │   replicated)  │    │   regulated)      │         │    AWS SES)       │
      │                │    │                   │         │  - Expo Push      │
      │  Collections:  │    │  Subscriptions    │         │  - Sentry         │
      │  - users       │    │  - University     │         │                   │
      │  - matches     │    │  - Premium        │         │                   │
      │  - chat_msgs   │    │                   │         │                   │
      │  - mood        │    └───────────────────┘         └───────────────────┘
      │  - support     │
      │  - sg_alerts   │              ┌───────────────────┐
      │  - reports     │              │  LLM provider     │
      │  - waitlist    │◄─────────────┤  (OpenAI gpt-4o-  │
      └────────────────┘              │   mini for AI     │
                                      │   first-line      │
                                      │   support replies)│
                                      └───────────────────┘
```

## J.2 Component table

| Layer | Technology | Hosting | Why this choice |
|---|---|---|---|
| DNS / WAF / DDoS | Cloudflare | Global | Industry-standard, UK regulatory comfort |
| CDN | Cloudflare | Global edge | Reduces latency for image / static assets |
| Ingress | Nginx (managed) | Kubernetes (UK) | Battle-tested, no exotic dependencies |
| API | FastAPI on Python 3.11 | Kubernetes (UK) | Strong typing, async I/O, high developer velocity |
| Database | MongoDB Atlas, **UK region** | Managed | Flexible schema for evolving wellbeing data; UK data residency by default |
| Search / aggregation | MongoDB aggregation pipeline | Managed | Avoids extra dependency; sufficient at projected scale |
| Auth | OAuth 2.0 (university SSO partnerships, Y2+) and Bearer tokens for native | Managed | No password reuse; FA-protected admin route |
| Payments | Stripe (UK entity) | Managed | FCA-regulated; PCI-DSS handled by Stripe |
| File storage | Cloudflare R2 (S3-compatible, UK) | Managed | Cost-effective; user-uploaded photos |
| Email | Gmail SMTP relay (pre-pilot) → AWS SES, eu-west-2 (production) | Managed | Auditable delivery |
| Push notifications | Expo Push Service | Managed | Single API for iOS + Android |
| Observability | Sentry (UK data residency option) + structured logs to CloudWatch (eu-west-2) | Managed | Proactive issue detection; SLO dashboards |
| LLM provider | OpenAI gpt-4o-mini via Emergent LLM Key | API | Used only for AI auto-reply to support messages; no user-identifiable PII in prompts |

## J.3 Data residency

All Personally Identifiable Information (PII) and Special Category Data (mental-health, mood entries) is stored in MongoDB Atlas's **UK region** (London). No PII leaves the UK except:
- Stripe (UK entity; Stripe stores card tokens, not card numbers, in compliance with PCI-DSS Service Provider Level 1).
- OpenAI inference calls (only contain redacted, non-PII excerpts of support messages — see DPIA Appendix E §4.3).

## J.4 Security controls implemented

| Control | Implementation | Standard |
|---|---|---|
| TLS in transit | All endpoints TLS 1.3, HSTS preload | NCSC guidance |
| Encryption at rest | MongoDB Atlas AES-256 | NCSC guidance |
| Secret management | Environment variables sealed via Emergent vault; never in source | OWASP ASVS L2 |
| Auth | Bearer tokens, 7-day expiry, refresh on use | OWASP ASVS L2 |
| Rate limiting | `RateLimitMiddleware` on the API gateway (per-IP + per-user) | OWASP ASVS L2 |
| Audit logging | Structured logs to centralised store; safeguarding events retained 7 years | UK DPA 2018 |
| Backups | Daily MongoDB Atlas snapshots, 30-day retention; quarterly restore drills | NCSC Cloud Security Principles |
| Vulnerability scanning | Dependabot + weekly OWASP ZAP scan | NCSC Cloud Security |
| Penetration testing | Annual external pen-test (Y1 onward) by CREST-approved firm | Cyber Essentials Plus requirement |

## J.5 Scalability headroom

| Component | Current capacity | Capacity at 1M users | Mitigation if exceeded |
|---|---|---|---|
| FastAPI pods | 2 pods × 0.5 CPU | Auto-scale to 40 pods | Kubernetes HPA already configured |
| MongoDB Atlas | M10 cluster (~5GB) | M50 cluster (~600GB) | Atlas vertical scaling, no downtime |
| Push (Expo) | 200k/day | Unlimited (Expo Pricing) | n/a |
| Email | 10k/day (Gmail) | Migrate to AWS SES at 50k/day | Already designed |
| LLM calls | Soft cap by Emergent LLM Key budget | Move to direct OpenAI org account | One-line config change |

## J.6 Disaster-recovery RTO / RPO

| Scenario | Recovery Time Objective | Recovery Point Objective |
|---|---|---|
| Single-pod failure | < 30 seconds | 0 |
| Region failure (London) | < 4 hours | < 24 hours |
| Database corruption | < 4 hours | < 24 hours |
| Total data loss | < 24 hours | < 24 hours |

A documented runbook is maintained in `/app/backend/scripts/RUNBOOK.md`.

## J.7 Roadmap items not yet built

| Item | Target quarter | Notes |
|---|---|---|
| University SSO (Shibboleth / SAML) | Q2 Year 1 | Required for some Russell Group integrations |
| Anonymised analytics export to partner DSLs | Q3 Year 1 | Aggregate, no individual data |
| ISO 27001 controls hardening | Year 3 | Required for NHS DSPT alignment |
| End-to-end encrypted DMs (Signal protocol) | Year 2 | Safeguarding compatibility under evaluation |

---

*This appendix is a current-state and forward-looking architecture summary as at the date of submission. Material architecture changes will be communicated to UKES at the standard 6/12/24-month contact points.*


---


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


---


# DEQUAD — Risk Register
## Supporting Appendix — UKES Innovator Founder Visa Submission

> **Purpose.** UKES may request a standalone risk register alongside the
> business plan. This document enumerates the 16 most material risks
> identified by the founders, scores each on a 1–5 scale for both
> Likelihood and Impact, gives the resulting Risk Score
> (Likelihood × Impact), states the chosen mitigation, and names the risk
> owner.
>
> Reviewed: monthly by the founders; quarterly by the (future) board once
> the company has a non-founder director (a milestone tied to team growth,
> not to any assumed funding round — no external investment is assumed in
> this plan, Section 10).

---

## How the scoring works

| Score | Likelihood | Impact |
|---|---|---|
| 1 | Rare (< 5% within forecast) | Negligible (< £2k or no functional impact) |
| 2 | Unlikely (~ 10%) | Minor (£2k–£10k or short-term operational disruption) |
| 3 | Possible (~ 25%) | Moderate (£10k–£50k or 1-month delay) |
| 4 | Likely (~ 50%) | Major (£50k–£200k, key hire lost, partial loss of customer trust) |
| 5 | Almost certain (> 75%) | Critical (existential, regulatory action, safeguarding incident) |

Risk score traffic-light:

- **🔴 16–25** — actively managed each week; board-visible.
- **🟠 9–15** — actively managed each month.
- **🟡 4–8** — managed quarterly.
- **🟢 1–3** — accepted; reviewed annually.

---

## Risk register

| # | Risk | Category | Lk | Im | Score | RAG | Owner | Mitigation in place / planned |
|---|---|---|---:|---:|---:|---|---|---|
| **R1** | **University of Bedfordshire pilot conversation never converts to a signed agreement** | Commercial | 3 | 3 | **9** | 🟠 | CEO | Nothing is signed and this is treated as a real possibility, not a formality. The plan (Sections 11–12) is solvent even at zero institutional revenue throughout Y1–Y3 — no cost line depends on this pilot converting. Lead founder's existing relationship as former SU President (2021–2023) improves the odds but is not relied upon financially. Two further pilot conversations are being scoped at peer institutions as additional, independent upside. |
| **R2** | **Co-founder formal appointment delayed past incorporation** | Team | 3 | 5 | **15** | 🟠 | CEO | Candidate identified, term sheet drafted; founder agreement signed; CEO covers Y1 technical work alone if hire slips by < 90 days; backup engineering contractor identified. |
| **R3** | **Institutional or premium revenue falls short of the Y2–Y3 targets in Section 11** | Commercial | 3 | 3 | **9** | 🟡 | CEO | The plan does not require a funding round to remain solvent at any point (Section 10) — the only consequence of missing revenue targets is that the single Y3 hire and modest founder pay are delayed, not that the business fails. £6,000 founder cash plus minimal fixed costs (Section 12) carry the business with positive month-end balances even in a zero-institutional-revenue scenario. |
| **R4** | **Safeguarding incident — false negative (failure to flag a real risk signal)** | Product / Clinical | 3 | 5 | **15** | 🟠 | CEO | Human-in-the-loop review for all high-risk flags within 1h; clear in-app crisis-escalation path (Samaritans, 999, university DSL); £1m professional indemnity insurance; clinical advisory board recruitment underway (Q2 Y2 target). |
| **R5** | **Safeguarding incident — false positive that harms a student** (e.g. wrong escalation) | Product / Clinical | 3 | 4 | **12** | 🟠 | CEO | Two-step DSL confirmation before any disclosure outside the platform; full audit log; student "appeal" route surfaced in-product. |
| **R6** | **Online Safety Act 2023 non-compliance or ICO enforcement** | Regulatory | 2 | 5 | **10** | 🟠 | CEO | OSA risk assessment & reporting flows already shipped (Appendix I); ICO DPIA drafted (Appendix E); legal review via NatWest Mishcon panel; quarterly compliance review with external counsel. |
| **R7** | **Cybersecurity breach (PII / mood-data leak)** | Security | 2 | 5 | **10** | 🟠 | CTO | Cyber Essentials certification in progress; mood data stored separately from identity data; encryption-at-rest; secrets vault; bug-bounty programme considered once team/revenue grow (not gated on any funding round); penetration test scheduled Q2 Y2. |
| **R8** | **Togetherall / TalkCampus copy the `.ac.uk` verification feature** | Competitive | 3 | 3 | **9** | 🟠 | CEO | First-mover positioning on universities; safeguarding webhook + insights dashboard are deeper moats than email-domain logic alone; signed exclusivity clauses with first 5 paying universities. |
| **R9** | **Large incumbent (Microsoft, Meta, Pearson) launches a competing student-only network** | Competitive | 2 | 4 | **8** | 🟡 | CEO | Niche depth (safeguarding triage + ICB integration) is unattractive to a horizontal incumbent; build defensible university relationships and data network effects first. |
| **R10** | **University buyer (Director of Student Services) treats DEQUAD as line-item rather than strategic** | Commercial | 3 | 3 | **9** | 🟠 | CEO | Position alongside OfS statutory MH condition and UUK Charter so the budget conversation is with the VC or Deputy VC, not just Student Services. |
| **R11** | **Cost-of-living squeeze suppresses DEQUAD Premium uptake** | Demand | 4 | 2 | **8** | 🟡 | CEO | B2B revenue covers fixed cost base; premium is upside. £4.99/mo price-point already at lower bound of student tolerance. |
| **R12** | **LLM provider price spike (OpenAI / Anthropic) materially raises COGS** | Vendor | 3 | 2 | **6** | 🟡 | CTO | Multi-provider abstraction (Emergent integrations) in place — can swap providers in < 1 day; tier-down to smaller / open-source model for low-risk classification tasks. |
| **R13** | **Negative national PR from a misreported case or social-media pile-on** | Reputation | 2 | 4 | **8** | 🟡 | CEO | Reactive PR plan drawing on NatWest Accelerator mentoring; clear transparency policy; clinical advisory board to provide third-party voice. |
| **R14** | **Key engineering hire leaves in Y2** | Team | 2 | 3 | **6** | 🟡 | CTO | EMI options with 4-year vest + 1-year cliff; documentation and pairing culture; contractor pool identified for emergency cover. |
| **R15** | **Tighter UK immigration regime restricts future hires** | Regulatory | 3 | 2 | **6** | 🟡 | CEO | Both co-founders already UK-resident; first 12 hires are UK-only; secure sponsor licence once headcount > 10. |
| **R16** | **Founder burnout (working unpaid through Y1–Y2)** | Team / Personal | 3 | 3 | **9** | 🟠 | Both founders | Founders draw no DEQUAD salary until Y3, and fund living costs from existing employment/freelance income throughout — a deliberate, disclosed choice, not a funding-gated one; mandated weekly off-day; mentor check-ins through NatWest Accelerator. |

---

## Risk dashboard — Year 1 focus

The seven highest-scoring risks define the Year-1 management agenda:

| Risk | Active monitoring |
|---|---|
| R1 — Bedfordshire pilot conversation | Weekly pipeline review with CEO; conversation status tracked honestly (no assumption of conversion) each Friday. |
| R2 — Co-founder appointment | Term sheet + commencement date frozen by end M2. |
| R3 — Revenue vs. plan | Actuals reviewed monthly against Section 11 targets; Y3 hire and founder pay only triggered once revenue actually supports them. |
| R4 — Safeguarding false negative | Sample of flagged + un-flagged cases reviewed each week by CEO + clinical advisor (informal until Q2 Y2). |
| R5 — Safeguarding false positive | Same review cadence as R4. |
| R6 — Regulatory compliance | Quarterly review with legal counsel (via NatWest Mishcon panel). |
| R7 — Cyber breach | Monthly secrets-rotation; quarterly dependency audit. |

---

## Risks accepted (🟢)

The founders have accepted (and disclosed to UKES) the following lower-priority risks without active mitigation in Year 1:

- **R-A1** Foreign-exchange exposure on USD-denominated cloud bills — accepted: < 10% of COGS.
- **R-A2** Personal liability for limited director duties — accepted; standard D&O insurance to be reviewed once headcount and revenue grow, not gated on any funding round.
- **R-A3** Domain-name / trademark dispute with similar-name companies — accepted; full UKIPO and EUIPO trademark searches completed pre-incorporation; no conflicts found.

---

## Governance

- **Monthly:** Founders review the full register; update RAG scores; surface new risks; close mitigated risks.
- **Quarterly:** External advisor (NatWest Accelerator programme manager) reviews the register and challenges any rosy scoring.
- **If the team grows beyond the founders (Y3+):** Risk register becomes a standing agenda item at team meetings; a formal board paper and independent non-executive director are considered once headcount and revenue justify the governance overhead — not gated on any external funding round, none of which is assumed in this plan.

---

*Written and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd — submitted to UKES as Appendix L to the Innovator Founder visa endorsement application, June 2026.*


---


# DEQUAD — Decision-Maker Brief
## UKES Endorsement (Innovator Founder Visa) · Short-Track Review

> **15-page brief.** Companion to the full Business Plan (`DEQUAD_UKES_Business_Plan.pdf`)
> and the Financial Model (`DEQUAD_Financial_Model.xlsx`). Use this document to
> assess endorsement readiness in 20 minutes.

---

## At-a-glance

| | |
|---|---|
| **Business start date** | **15 June 2026** (incorporation) |
| **Entity** | DEQUAD Ltd (in formation, England & Wales) |
| **Founders** | **Yusuf Quadri** (CEO) + **Yusuff Adeagbo** (CTO) |
| **Wider founding team** | **Dr Gerald Marfo** (CMO, PhD Digital Marketing) · **Adedapo Ajuwon** (Senior SWE) · **Chinyere Jennifer** (Senior Advisor — MIGSO-PCUBED PM) |
| **HQ** | London — NatWest Accelerator (joined **16 March 2026**) |
| **Prior validation** | **Santander Universities Pre-Incubator** — completed 2025 |
| **Founder anchor** | Yusuf Quadri served as **University of Bedfordshire SU President 2021–2023** |
| **MVP** | Live in production at https://dequad.co.uk |
| **Beta users** | 80 verified accounts at University of Bedfordshire (42 daily-active, 6-week retention) |
| **Pilot status** | **Early, informal conversation with University of Bedfordshire — nothing signed, nothing guaranteed** |
| **Starting cash** | **£6,000 (£3,000 from each of 2 founders) — the only funding assumed anywhere in this plan** |
| **In-kind support** | £31,000/yr from NatWest Accelerator (office, legal, accountancy, mentoring), Y1 only |
| **External funding ask** | **None.** This is a self-funded 3-year plan; no pre-seed, seed or other investment is required or assumed |
| **3-yr revenue** | £0.6k → £16k → £48k |
| **3-yr UK jobs** | 2 (unpaid founders) → 2 (unpaid founders) → 3 people / c.2.5 FTE, entirely self-funded |
| **Profitability** | Modest trading loss in Y1 (£3.6k), profitable from Y2 — no break-even "event" needed since no external funding is assumed |
| **Endorsement criteria met** | ✅ Innovation · ✅ Viability · ✅ Scalability |

---

## Page 1 — The 60-second pitch

**One sentence:** DEQUAD is the closed-network student wellbeing platform that gives UK universities early warning before students fall through the cracks — verified `.ac.uk` peer matching, daily mood tracking and machine-assisted safeguarding triage in a single product.

**Why now:**

1. **Loneliness is the new student health crisis** — 54% of UK undergrads report frequent loneliness (ONS 2023). Post-pandemic levels remain 18 ppt above baseline.
2. **The Office for Students introduced a statutory student-mental-health condition in 2023** — every UK university now has to evidence proactive prevention. Existing tools (Togetherall, TalkCampus) are reactive.
3. **The Online Safety Act 2023 is in force** — any platform with student users needs compliant risk-assessment and reporting flows. DEQUAD ships with these built in.

**Why us:**

1. **MVP is already shipped** — production deployment at dequad.co.uk, identity verification live, safeguarding webhook live, mood tracker live, Stripe billing live.
2. **Two independent UK-bank validations.** Completed the **Santander Universities Pre-Incubator** programme in 2025 and joined the **NatWest Accelerator (London cohort) on 16 March 2026**. Two competitive selection processes have separately admitted DEQUAD's team and thesis.
3. **Founder–institution fit.** Yusuf Quadri served as **University of Bedfordshire Student Union President for two consecutive years (2021–2023)**, representing the student body at senior-management level. He is in early, informal conversation about a possible pilot with the same university — **no agreement is signed and nothing is guaranteed.**
4. **Two complementary founders** — product/safeguarding lead (Yusuf Quadri) + engineering lead (Yusuff Adeagbo). Both UK-resident, full-time, self-funding the business without external investment.

---

## Page 2 — How we meet the three Home Office criteria

### Innovation ✅

DEQUAD is the **only UK product** combining:

- `.ac.uk` student-domain identity verification (with a human admin queue for ambiguous cases),
- intent-based peer matching (friendship / study / peer-support — *not* dating),
- continuous mood telemetry tied to engagement,
- and **machine-assisted safeguarding triage with a real-time webhook to university DSLs**.

No competitor — Togetherall, TalkCampus, UniBuddy, Bumble BFF or Discord — combines more than two of these (see comparison table on Page 4).

### Viability ✅

- Production MVP is live, in beta with real students.
- **Prospective pilot with University of Bedfordshire — proposed, not signed.** The founder's former institution, where he served two terms as SU President (2021–2023). A 12-week pilot has been proposed for **Sep–Nov 2026 (M4–M6)**; this is a target only, contingent on the university's decision, and may not happen.
- Two independent UK-bank programme validations: **Santander Universities Pre-Incubator (2025)** + **NatWest Accelerator (joined 16 March 2026)**.
- £6,000 founder cash (£3k each) + £31,000 in-kind NatWest support **carries the business through Y1–Y3 with positive closing cash balances, without requiring the pilot to convert or any external funding** (see Page 9).
- B2B SaaS revenue model is proven in the adjacent market — Togetherall serves 60+ UK universities at ~£40k/year.

### Scalability ✅

- Software-only marginal cost → 92% gross margin by Y3.
- Within-institution network effects accelerate intra-uni adoption.
- 6-week implementation per new university enables scale to 20+ institutions by end Y3 (out of 285 total UK).
- Closed-network model maps cleanly to `.edu` / `.edu.au` / EU domains post-Y3 → **£180m TAM** in EN-language HE markets.

---

## Page 3 — Product

### Modules (all in production)

| | What it does |
|---|---|
| **Verified peer matching** | Match `.ac.uk`-verified students by intent (friend / study / support). Profile cards with university, course, year, interests. |
| **Daily wellbeing tracker** | 30-second mood, sleep, stress and connection check-in. Personal trend dashboard. |
| **Machine-assisted safeguarding** | LLM classifier on mood + chat metadata flags risk signals; webhook to designated university safeguarding lead in < 60s. |
| **University Insights Dashboard** | Anonymised, aggregated wellbeing analytics for HE staff — cohort mood trends, engagement, hotspots. |

### Tech stack (already running)

- **Frontend:** Expo / React Native (iOS, Android, web at dequad.co.uk) — universal codebase.
- **Backend:** FastAPI (Python), MongoDB (Motor), real-time WebSockets.
- **AI:** OpenAI / Anthropic LLMs via Emergent integrations (text classification, safeguarding triage).
- **Payments:** Stripe (B2C subs + B2B invoicing).
- **Infra:** Cloudflare CDN + Render Pro; Online Safety Act-compliant reporting flows.
- **Auth:** Custom email/password + Google OAuth + admin portal (dual auth).

---

## Page 4 — Competition

| Feature | DEQUAD | Togetherall | TalkCampus | UniBuddy | Bumble BFF | Discord |
|---|---|---|---|---|---|---|
| `.ac.uk` student verification | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Intent-based peer matching | ✅ | ❌ | Ltd | ❌ | Ltd | ❌ |
| Daily mood telemetry | ✅ | ❌ | Ltd | ❌ | ❌ | ❌ |
| Machine-assisted safeguarding | ✅ | Ltd | ❌ | ❌ | ❌ | ❌ |
| University insights dashboard | ✅ | ✅ | ✅ | Ltd | ❌ | ❌ |
| Safeguarding webhook to uni team | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Online Safety Act 2023 ready | ✅ | ✅ | ✅ | ✅ | Partial | ❌ |
| UK universities served | growing | ~60 | ~30 | 200+ | n/a | n/a |
| ASP per uni | **£2/enrolled student/yr** (~£20k for a 10k-student uni) | £40k+ | £25k | £18k | n/a | n/a |

**DEQUAD displaces** Togetherall and TalkCampus (price/feature) on the B2B side, and **co-exists** with UniBuddy (orthogonal pre-enrolment market). Consumer competitors (Bumble BFF, Discord) lack institutional features entirely.

---

## Page 5 — Market

### UK addressable market

| Tier | Definition | Size |
|---|---|---:|
| **TAM** | All UK universities + ICBs + UK student premium subs | **£86m/yr** |
| **SAM** | Russell-Group + post-92 unis > 10k students + their ICBs | **£28m/yr** |
| **SOM (5-yr)** | 12% SAM capture | **£3.4m ARR by Y5** |

### Demand signals

- **2.86m UK higher-ed students** (HESA 2023/24) — addressable consumer base.
- **285 UK higher-ed institutions** — addressable B2B base.
- **54% of UK undergrads** report frequent loneliness (ONS 2023).
- **34% of UK undergrads** experience a clinically-significant MH issue (Student Minds 2024).
- **6.1 weeks** average wait for a university counsellor — appetite for prevention.
- **100+ UK universities** signed to UUK Mental Health Charter — must evidence wellbeing strategies.

---

## Page 6 — Go-to-market

### Three channels, three audiences

| Audience | Headline message | Primary channel | Conversion lever |
|---|---|---|---|
| **Students** | "Verified UK uni students. Real connections. Wellbeing built in." | IG + TikTok + university student-rep ambassadors | Free product + premium upsell |
| **Universities** | "See loneliness early. Act before it becomes a crisis." | Direct DSS outreach + UUK Charter webinar + NatWest network intros | 12-week free pilot → paid SaaS |
| **NHS ICBs** | "Population-level student wellbeing data, anonymised and audit-ready." | Direct outreach to MH commissioners | Joint pilot with funded HEIs |

### B2B pilot conversations (early-stage, nothing signed)

- **University of Bedfordshire** — early, informal conversation only. Lead founder served two terms as SU President there (2021–2023); direct relationships with student services and safeguarding leads. No agreement, LOI or date is confirmed.
- **Two further peer institutions** — early-stage pilot scoping (anonymised for now); equally unconfirmed.
- **Beta cohort active** — the existing 80-person University of Bedfordshire beta cohort uses DEQUAD, independent of any formal pilot or contract.

### Y1 marketing spend: £900

Deliberately minimal and founder-led — no paid-acquisition budget in Y1. Institutional outreach relies on (a) founder organic outreach and (b) NatWest network introductions to university IT/wellbeing leads, at near-zero cash cost.

---

## Page 7 — Founders

### Yusuf Quadri — CEO / Product & Safeguarding Lead

- UK-resident, full-time on DEQUAD.
- **University of Bedfordshire Student Union President 2021–2023** (two consecutive terms). Represented the student body at senior-management level on student-services, safeguarding and welfare policy. This is the basis of DEQUAD's early, informal pilot conversation with the same university — no agreement is signed.
- Completed the **Santander Universities Pre-Incubator programme** in 2025; admitted to the **NatWest Accelerator (London cohort)** on 16 March 2026.
- **Seven safeguarding & clinical-awareness certifications** including Oliver McGowan Learning Disabilities & Autism, Adult Safeguarding Partnership Working, Suicide Prevention (2026), Data Protection & Information Security, and Safe Response to Challenging Situations (see Appendix O).
- Built and shipped the entire MVP at dequad.co.uk.
- Owns the safeguarding policy (Appendix E — DPIA, Appendix I — OSA-2023 compliance).
- Owns university partnerships and the NatWest Accelerator relationship.
- Co-founder cash contribution: **£3,000** of the £6,000 founder capital.

### Yusuff Adeagbo — Co-Founder / CTO / Engineering & IT Lead

- UK-resident, full-time on DEQUAD.
- **MSc Information Technology with Project Management — University of the West of Scotland**.
- **Higher National Diploma in Computer Science** (prior).
- Multi-disciplinary skill set: full-stack engineering, IT support, UI/UX design, graphic design, digital marketing (e-commerce), IT business analysis.
- Will own the engineering hiring pipeline, infrastructure security, and the R&D claim leadership.
- Co-founder cash contribution: **£3,000** of the £6,000 founder capital.
- Full CV at Appendix B-2 (`B_cofounder_cv.pdf`).

### Wider founding team — joining at incorporation (EMI options, unpaid)

- **Dr Gerald Marfo — Chief Marketing Officer** · PhD in Digital Marketing; owns Y1 marketing strategy and measurement. **Equity-only**; a cash salary is not funded within this 3-year self-funded plan.
- **Adedapo Ajuwon — Senior Software Engineer** · supports CTO on platform engineering, infrastructure, reliability. **Equity-only**, same basis.
- **Chinyere Jennifer — Senior Advisor (Programme & Delivery)** · Senior PM Consultant at **MIGSO-PCUBED** with LLM background. **Advisor on EMI options**; MIGSO-PCUBED remains her primary employer.

Full CVs in Appendix N (`N_wider_team_cvs.pdf`).

### Founder compensation under this plan

- £0 in Y1 and Y2 — both founders fund living costs from existing employment/freelance income.
- £500/month each from **Y3**, funded entirely by Y3 revenue — not by any external funding round, none of which is assumed.
- Materially below market throughout — signals genuine founder commitment.

---

## Page 8 — Funding: self-funded, no external round assumed

| Source | Timing | Amount | Use of funds |
|---|---|---:|---|
| Founder equity (£3,000 × 2) | Day 1 | **£6,000** | Incorporation, domains, IP filings, hosting — the only funding in this plan. |

**No pre-seed, seed, Series A, grant or R&D tax credit is assumed anywhere in this 3-year plan.** The full financial model (Sections 11–14, Appendix F) is funded entirely by this £6,000 plus revenue generated in the period, and remains solvent even if institutional revenue is £0 throughout. If institutional traction significantly exceeds this conservative forecast, the founders may explore external investment beyond Year 3 — that is a future option, not a plan dependency.

---

## Page 9 — Year-1 cash flow (the critical view)

### Closing cash balance is positive every single month of Year 1 — with no institutional revenue or external funding assumed

| Month | Inflows | Outflows | Closing balance |
|---|---:|---:|---:|
| **M1 (Jun 2026)** — incorporation, laptops, initial setup | £6,000 founder | (£930) | **£5,070** |
| M2 (Jul 2026) | — | (£300) | **£4,770** |
| M3 (Aug 2026) | — | (£300) | **£4,470** |
| **M4 (Sep 2026)** — proposed pilot window opens, if agreed (not signed) | — | (£350) | **£4,120** |
| M5 (Oct 2026) | — | (£350) | **£3,770** |
| **M6 (Nov 2026)** — proposed pilot window closes, if it happened | — | (£350) | **£3,420** |
| **M7 (Dec 2026)** — Stripe premium billing goes live | £50 sales | (£350) | **£3,120** |
| M8 (Jan 2027) | £70 sales | (£350) | **£2,840** |
| M9 (Feb 2027) | £90 sales | (£350) | **£2,580** |
| M10 (Mar 2027) | £110 sales | (£350) | **£2,340** |
| M11 (Apr 2027) | £130 sales | (£350) | **£2,120** |
| **M12 (May 2027)** — Y1 close | £150 sales | (£350) | **£1,920** |

> **Cash never dips below c.£1,900** across all of Year 1, and this holds true whether or not the Bedfordshire pilot conversation goes anywhere — no institutional revenue, no pre-seed and no other external funding is assumed in this schedule. The founders' relationship with the university (via the former SU presidency) is a genuine upside opportunity, but the business does not depend on it to survive Year 1.

The full monthly schedule is in `DEQUAD_Financial_Model.xlsx`, sheet "Cash Flow Y1 (mo)" (to be regenerated to match this version).

---

## Page 10 — Three-year P&L summary (self-funded)

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | £600 | £16,000 | £48,000 |
| Cost of Sales | (£1,400) | (£3,100) | (£6,100) |
| Gross Profit / (loss) | (£800) | £12,900 | £41,900 |
| Gross margin % | n/a | 80.6% | 87.3% |
| Total overheads (incl. payroll) | (£2,680) | (£6,000) | (£32,000) |
| **EBITDA** | **(£3,480)** | **£6,900** | **£9,900** |
| **Operating profit / (loss)** | **(£3,630)** | **£6,500** | **£9,200** |

Y1 is the only loss-making year, and the loss (£3.6k) is fully absorbed by the £6,000 founder capital — no equity round funds it. Y2 turns modestly profitable on minimal overheads and a small (contingent) institutional contract; Y3 profit funds the plan's only hire and modest founder pay. **No break-even "event" is needed** because no external funding is assumed at any point — the business is solvent throughout.

---

## Page 11 — Job creation and economic impact

### Headcount

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Founders | 2 (unpaid) | 2 (unpaid) | 2 (modest pay) |
| Safeguarding & Trust Lead (part-time) | 0 | 0 | 1 |
| **Total UK jobs** | **2** | **2** | **3 (c.2.5 FTE)** |

All self-funded from revenue — no headcount in this table depends on any external funding round, none of which is assumed. Further roles (engineering, customer success, sales, marketing) are a longer-term ambition beyond Year 3, not part of this plan.

### Beyond direct jobs

- **University safeguarding capacity:** any institution that does onboard gains an early-warning system that increases the practical reach of its existing wellbeing team.
- **Student-rep / ambassador programme:** a small, informal incentive for beta-cohort students (Section 16); not a formal paid role in this plan.

---

## Page 12 — R&D activity

R&D is delivered as unpaid founder time throughout Y1–Y2, plus modest paid capacity from Y3 (Section 18), focused on three bets:

1. **Identity-and-intent verification engine** — `.ac.uk` classifier, attestation, admin queue, future OCR student-ID flow.
2. **Wellbeing inference & safeguarding triage** — PHQ-9-lite mood model + risk-signal NLU + federated learning roadmap.
3. **Privacy & compliance infrastructure** — DPIA pipeline, OSA-2023 reporting, hash-based de-identification.

**No SME R&D tax credit is assumed as an inflow in this plan** (Section 4) — qualifying PAYE spend is minimal while founders are unpaid. It is treated as a possible future upside, to be explored with NatWest's in-kind accountancy support once qualifying costs exist, not something the plan relies on.

---

## Page 13 — NatWest Accelerator — why this matters for endorsement

The accelerator membership is **independent third-party validation** of DEQUAD's quality. NatWest's selection panel reviewed the team and the product before admission.

### Quantified in-kind value (Y1)

| In-kind item | Annual value |
|---|---:|
| London office co-working (3 desks) | £12,000 |
| Legal advice (Mishcon de Reya, DLA Piper panels) | £4,500 |
| Accountancy support (PwC alumni network) | £3,600 |
| Banking & business introductions | £2,000 |
| Investor pitch coaching & mentoring | £5,000 |
| Programme demo day & PR placement | £4,000 |
| **Total in-kind value (Y1)** | **£31,100** |
| **Cash cost to DEQUAD** | **£0** |

The £31k of in-kind support is **the reason £6,000 of founder cash is sufficient** to carry the business through Year 1. Without the accelerator, the same operating profile would require materially more cash investment up front.

---

## Page 14 — Risk register (summary)

The 12 key risks the founders have identified and their mitigations:

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Bedfordshire pilot conversation never converts — nothing is signed | Medium | The plan is solvent at zero institutional revenue throughout Y1–Y3 (Page 9–10); no cost line depends on this converting. Two further pilot conversations scoped as independent upside. |
| R2 | Co-founder hire delayed | High | Y1 build is solo-doable; founder personally covers technical work until co-founder onboarded. |
| R3 | Institutional/premium revenue falls short of Section 11 targets | Medium | No funding round is required at any point; the only consequence is that the single Y3 hire and modest founder pay are delayed, not that the business fails. |
| R4 | Safeguarding incident (false negative) | High | Human-in-the-loop for all high-risk flags; insurance in place; clinical advisory board recruited Q2 Y2. |
| R5 | Togetherall/TalkCampus copy `.ac.uk` verification | Medium | First-mover land grab; safeguarding webhook + insights dashboard are deeper moats. |
| R6 | OfS / Online Safety Act non-compliance | Medium | OSA risk assessment and reporting flows already shipped; ICO DPIA drafted; legal review via NatWest Mishcon panel. |
| R7 | Cyber breach | Medium | Cyber Essentials in progress; pen-test scheduled Q2 Y2; insurance £1m. |
| R8 | Cost-of-living squeeze on premium subscriptions | Medium | B2B revenue covers fixed costs; premium is upside. |
| R9 | Negative PR from a misidentified case | Medium | Reactive media plan; clinical advisory board; transparent reporting. |
| R10 | International expansion delayed | Low | Not part of this 3-year plan; UK-only focus is deliberate and does not depend on any funding round to remain viable. |
| R11 | LLM cost spike (model price changes) | Low | Multi-provider abstraction in place; can swap OpenAI ↔ Anthropic ↔ Gemini in < 1 day. |
| R12 | Tighter immigration regime affecting talent | Low | Both co-founders are already UK-resident; first 6 hires all UK-based. |

Full risk register in `DEQUAD_Risk_Register.pdf`.

---

## Page 15 — Decision summary

DEQUAD is a **production-ready, accelerator-validated, bootstrap-credible** UK software business that meets the **innovation**, **viability** and **scalability** criteria for Innovator Founder endorsement.

### Three things this submission demonstrates

1. **Real product, real users** — the MVP is live, has real beta users at the University of Bedfordshire, and is governed by a DPIA-cleared safeguarding policy that ships before public launch.
2. **Capital efficiency and self-sufficiency** — the business survives all three years on **£6,000 of founder cash plus revenue alone**, with no external funding assumed, committed, or required at any point. The NatWest Accelerator in-kind support and an extended no-salary founder commitment (Y1–Y2) make this possible.
3. **Credible, honestly-scoped UK growth** — 2 unpaid founders (Y1–Y2) growing to 3 people / c.2.5 FTE by Y3, all self-funded from revenue; 0 to c.1.5 average paying universities by Y3, modelled as a target, not a guarantee. This is deliberately smaller than a funding-dependent plan would show — and deliberately more credible for it.

### What endorsement enables

- The lead applicant retains UK residency to continue building DEQUAD full-time.
- The co-founder (UK-resident already) joins formally as CTO at incorporation.
- The company operates and grows on its own means from day one — no external capital is required to make the 3-year plan happen.
- A measurable, defensible improvement in UK student wellbeing infrastructure, scaled honestly to what £6,000 and organic growth can actually deliver.

---

### Endorsement Body decision matrix

| Criterion | Evidence in this pack |
|---|---|
| **Innovation** | Sections 2–4 of Business Plan; competitor matrix Page 4; R&D Section Page 12. |
| **Viability** | Production MVP; NatWest Accelerator membership; Y1 monthly cash flow Page 9. |
| **Scalability** | Market sizing Page 5; gross-margin trajectory Page 10; international optionality Page 2. |
| **Genuine UK economic benefit** | Job creation Page 11; UK university wellbeing impact; NHS ICB pilot Y3. |
| **Founder credibility** | Page 7 + CVs in Appendix B and B-2. |
| **Capital sufficiency** | £6k founder capital + £31k in-kind (NatWest) is the entire funding basis for the 3-year plan — no external round assumed. Page 8 + 9. |

---

*Written and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd — for UKES short-track endorsement review, June 2026.*
*Companion documents: `DEQUAD_UKES_Business_Plan.pdf`, `DEQUAD_Financial_Model.xlsx`, `DEQUAD_Risk_Register.pdf`.*


---


# Appendix N — Wider Founding Team CVs
## Supporting Appendix to the DEQUAD UKES Submission

> Beyond the two named co-founders (Yusuf Quadri, CEO; Yusuff Adeagbo, CTO),
> DEQUAD is joined at incorporation by three senior team members who bring
> deep functional expertise across marketing, engineering and programme
> delivery.
>
> **None of the team is currently drawing a salary, and none is assumed to
> in this 3-year self-funded plan.** Each has accepted an EMI share-option
> grant and is contributing time on a pure-equity basis, with no committed
> date for that to change and no dependency on any external funding round
> (none is assumed in this plan — Section 10). This is a material signal
> of belief in the mission and materially strengthens the leadership
> profile without adding to cash burn.

---

## N.1 — Dr Gerald Marfo · Chief Marketing Officer

| Field | Value |
|---|---|
| **Role at DEQUAD** | Chief Marketing Officer (founding team member) |
| **Working pattern** | Equity-only — **no salary funded within this 3-year self-funded plan**; a cash role would only begin once revenue or a future funding round supports it |
| **Cash investment** | £0 — joining as senior team member, not as a share-capital founder |
| **Equity** | EMI options with 4-year vest, 1-year cliff |

### Summary

Dr Gerald Marfo holds a **PhD in Digital Marketing** and brings academic-level rigour to DEQUAD's marketing strategy. His remit covers brand positioning, the UK go-to-market plan (universities and students in parallel), measurement frameworks (CAC, LTV, conversion analytics) and channel selection across organic, paid, content and partnerships.

### Why this matters for DEQUAD

- DEQUAD operates a two-sided market — universities (B2B) and students (B2C). A PhD-credentialled CMO is uniquely placed to design measurement that ties consumer-funnel signals back to institutional-buyer outcomes.
- Universities now require evidenced wellbeing strategies (UUK Mental Health Charter); Gerald's academic background lends additional credibility in the sales conversation.
- He owns the Y1 marketing-spend allocation across the channels in Section 16 of the business plan.

### Responsibilities

- Brand strategy, positioning and messaging architecture
- UK university partnership marketing (PR, events, UUK channel)
- Performance marketing strategy across Instagram, TikTok, Google Search, LinkedIn
- Marketing measurement and dashboarding; CAC discipline
- Mentoring the first marketing hire (Q3 Y2)

---

## N.2 — Adedapo Ajuwon · Senior Software Engineer

| Field | Value |
|---|---|
| **Role at DEQUAD** | Senior Software Engineer (founding team member) |
| **Working pattern** | Equity-only — **no salary funded within this 3-year self-funded plan**; same basis as above |
| **Cash investment** | £0 — joining as senior team member |
| **Equity** | EMI options with 4-year vest, 1-year cliff |

### Summary

Adedapo Ajuwon is a senior software engineer working alongside the CTO on the DEQUAD production stack. He contributes to both backend (FastAPI / MongoDB) and frontend (Expo / React Native universal) development, infrastructure, and operational reliability.

### Responsibilities

- Production reliability and performance of the DEQUAD platform
- Feature delivery in collaboration with the CTO — peer matching, mood tracker, safeguarding webhook, admin tooling
- Code review and engineering standards across the team
- Mentoring the Y3 part-time hire (Section 18.3) once revenue supports it

---

## N.3 — Chinyere Jennifer · Senior Advisor — Programme & Delivery

| Field | Value |
|---|---|
| **Day job** | Senior Project Management Consultant, **MIGSO-PCUBED** (global project, programme and portfolio management consultancy) |
| **Role at DEQUAD** | Senior Advisor — Programme & Delivery |
| **Working pattern Y1** | Advisory capacity — periodic engagement |
| **Cash investment** | £0 |
| **Equity** | EMI options on a 4-year vest, advisor allocation |

### Summary

Chinyere Jennifer is a Senior Project Management Consultant at MIGSO-PCUBED, one of the world's leading project / programme / portfolio management consultancies (a Capgemini company). She works with large enterprise clients on programme governance, risk and delivery assurance. She also has an applied background in **Large Language Model (LLM)** technology, giving DEQUAD an in-house perspective on the safeguarding and inference pipeline.

### Responsibilities to DEQUAD

- Programme governance for university pilot rollouts
- Quarterly risk-register review challenge (see Risk Register, Governance section)
- LLM safety and evaluation input to the safeguarding triage model
- Introduction to MIGSO-PCUBED's enterprise network for B2B pilot acceleration

---

## Why this matters for endorsement

For UKES, the wider team materially strengthens the **viability** evidence:

| Dimension | Evidence |
|---|---|
| **Marketing capability** | PhD-credentialled CMO with relevant subject-matter expertise |
| **Engineering depth** | CTO + senior software engineer at incorporation — not a solo technical founder |
| **Programme governance** | Senior consultant from a global PMO firm advising on delivery quality |
| **AI / LLM credibility** | Advisor with LLM background — directly relevant to safeguarding inference |
| **Diversity** | Founding team is 100% Black-British / African-diaspora — under-represented in UK tech, but central to the student population DEQUAD serves |

Three appointments to a founding team alongside two co-founders is unusually deep for a pre-revenue UK startup and is itself evidence of the team's ability to attract talent on belief in the mission.

---

*Compiled by Yusuf Quadri, Founder & CEO — CV content supplied and approved by each named team member. Submitted to UKES as Appendix N to the Innovator Founder visa endorsement application, June 2026.*


---


# Appendix O — Yusuf Quadri
## Safeguarding & Clinical-Awareness Certifications

> Supporting appendix to the DEQUAD UKES Innovator Founder visa
> submission. Confirms that the lead applicant (CEO and safeguarding
> policy owner for DEQUAD) holds the relevant baseline safeguarding,
> data-protection and clinical-awareness certifications required to
> design, operate and govern a student-facing platform that processes
> mood data and triages safeguarding risk signals.

---

## Why this matters

DEQUAD is a student-wellbeing platform that processes:

- identity data (`.ac.uk` email verification),
- mood telemetry (sensitive personal data under the UK GDPR / Data Protection Act 2018),
- chat metadata (Online Safety Act 2023 in-scope),
- and safeguarding referrals routed to university Designated Safeguarding Leads (DSLs).

The Home Office and endorsing bodies expect founders operating in sensitive populations (children, vulnerable adults, students at risk) to be able to evidence baseline safeguarding competence. The certifications below provide that evidence.

These are operational baseline certifications. **Clinical decisions** (e.g. a formal mental-health diagnosis or treatment) are explicitly out of scope for DEQUAD — the product triages signals to professionals and never replaces them. A formal clinical advisory board is being recruited from Q2 Year 2.

---

## Completed certifications

| # | Certification | Awarded by / Topic | Relevance to DEQUAD |
|---|---|---|---|
| 1 | **Learning Disabilities and Autism e-Learning — *The Oliver McGowan Mandatory Training*** | UK statutory tier-1 training (NHS England framework) | Ensures DEQUAD's product and policy decisions are inclusive of students with learning disabilities and autistic students — a population with materially higher loneliness and mental-health risk. |
| 2 | **Safeguarding — Getting the most out of the Children and Families Page** | UK safeguarding training | Awareness of safeguarding workflows that apply to under-18 students (foundation-year, joint-honours-with-college students). |
| 3 | **Autism Awareness — Virtual Workshop** | UK autism-awareness training | Reinforces inclusive design and communication patterns. |
| 4 | **Safeguarding Adults: Partnership Working — Interactive Workshop** | UK adult-safeguarding training | Most directly applicable to the DEQUAD user base (typically 18–24-year-old adults) — covers multi-agency working between the platform, the university DSL and external services. |
| 5 | **Challenging Situations: Safe Response** | De-escalation / risk-response training | Equips the founder to design escalation flows for high-risk safeguarding signals without causing further harm to the student. |
| 6 | **Data Protection and Information Security Awareness** | UK Data Protection Act / UK GDPR | Direct evidence of the DPIA-author competence required to sign off DEQUAD's mood-data pipeline (see Appendix E). |
| 7 | **Suicide Prevention — 2026** | UK suicide-prevention training (current-year syllabus) | Most critical certification for the safeguarding-triage product feature — covers recognition of suicide-risk language, appropriate responses and onward referral routes. |

---

## How these certifications inform DEQUAD's product

| DEQUAD product area | Certifications applied |
|---|---|
| Inclusive UX (matching algorithm bias review, font, colour, accessibility) | Oliver McGowan; Autism Awareness |
| Safeguarding-triage classifier thresholds | Suicide Prevention 2026; Safeguarding Adults; Challenging Situations |
| Onward referral workflow to university DSLs | Safeguarding Adults: Partnership Working; Suicide Prevention 2026 |
| Mood-data pipeline + DPIA | Data Protection and Information Security Awareness |
| Crisis-response copy in-product | Challenging Situations: Safe Response; Suicide Prevention 2026 |
| Operational handling of under-18 edge cases | Safeguarding — Children & Families Page |

---

## Continuing professional development

The lead applicant commits to:

- Refreshing the Suicide Prevention certification annually (next refresh: 2027).
- Refreshing the Adult Safeguarding certification every two years.
- Adding the **NSPCC "Designated Safeguarding Lead" Level 3** equivalent in Year 2 Q1.
- Participating in the Universities UK Mental Health Charter community of practice from Y1 Q3.
- Recruiting a formal **clinical advisory board** in Y2 Q2 (target: 1 NHS Consultant Psychiatrist, 1 university Director of Student Wellbeing, 1 lived-experience advisor).

---

*Copies of the original certificates can be supplied on request.*

*Prepared by Yusuf Quadri, Founder & CEO — submitted to UKES as Appendix O to the Innovator Founder visa endorsement application, June 2026.*
