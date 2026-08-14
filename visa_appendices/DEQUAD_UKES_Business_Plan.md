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
**Document version:** 4.0
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
| **Anchor pilot imminent** | 12-week pilot agreed in principle with the **University of Bedfordshire** Director of Student Services — the institution whose students the founder represented for two years. Formal agreement expected before the Sep 2026 academic year start (M4); the platform is already built and ready for institutional onboarding. |
| **In-kind runway** | NatWest Accelerator provides London office, legal and accountancy support worth **£31,100/yr** in-kind, letting £6,000 of founder cash cover 6 months of positive-balance operation. |
| **Conservative forecast** | Y1 revenue £13,588 → Y2 £119,880 → Y3 £509,400. Gross margin ~92% throughout; operating break-even targeted Q2 Y4 after Series A. Only ONE university pilot is assumed to convert in Y1; Y2 assumes 3 paying institutions, Y3 assumes 10. |
| **UK jobs** | 2 (Y1) → 6 (Y2) → 12 (Y3), all UK-based, with EMI options and board-tracked diversity targets. |

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
| **Student (consumer)** | Free core product. Optional **DEQUAD Premium**: advanced match filters, unlimited chats, profile boost. | **£4.99/month** via Stripe (integrated and test-verified; first live revenue expected on pilot conversion Q1 Y2). |

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
- **A trusted route into the anchor customer.** Two years as Bedfordshire SU President gives DEQUAD direct, warm relationships with the Director of Student Services, safeguarding leads and senior leadership. The 12-week pilot is scheduled for **Sep–Nov 2026 (M4–M6)**, with conversion discussions from **Dec 2026 (M7)**.
- **Two independent third-party validations.** Santander Universities Pre-Incubator (completed 2025) and NatWest Accelerator London (admitted 16 March 2026) — both competitive selection processes assessing team and product quality.
- **Proven willingness to pay.** Togetherall and TalkCampus charge UK universities £15k–£60k/yr and hold 100+ UK customers between them, for products missing DEQUAD's verification and triage capabilities.
- **A cash plan that survives scrutiny.** £6,000 founder capital plus £31,100 of NatWest in-kind support delivers positive month-end cash in every month of Y1 (Section 12), with zero founder salary until the pre-seed lands in M7.

### 3.3 Scalability

- **Software-only marginal cost.** An incremental student costs ~£0.05/month in hosting; gross margin reaches **91.8%** by Y3.
- **Intra-institution network effects.** Every additional verified student raises the platform's value for every other student at the same university — driving the organic growth that keeps CAC falling (Section 16).
- **Repeatable institutional rollout.** Each new university onboards through a templated 6-week implementation. The model projects 14 average paying institutions in Y3 against 285 UK institutions — under 5% penetration.
- **International optionality.** The closed-network model maps directly onto `.edu` (US), `.edu.au` (Australia) and EU academic domains — a £180m English-language HE TAM addressable post-Y3 without re-architecting the product.
- **Team scale plan in place.** Job descriptions for the first six hires are already written (Appendix G); headcount grows 2 → 6 → 12 across the forecast, all UK-based.

---

## 4. Research and Development Activity

R&D is the core of the innovation proposition: DEQUAD's defensibility rests on the verification engine and the safeguarding-inference pipeline, both of which are original engineering rather than assembled off-the-shelf parts.

Y1 R&D is delivered by the two founders (≈60% of combined founder time, ≈£10,800 attributable labour) plus tooling and safety-testing spend, for a total Y1 R&D investment of **£22,500**, rising to **£60,000 (Y2)** and **£110,000 (Y3)**. The SME R&D Tax Credit scheme is expected to recoup ~16% of qualifying spend annually.

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

**Compensation reality at submission:** no team member — founders included — currently draws a salary from DEQUAD. Founders fund personal living costs from employment income and savings; the wider team contributes on pure-equity terms pending the pre-seed close in **December 2026 (M7)**, immediately after the Bedfordshire pilot completes. This is a deliberate, evidenced founder commitment.

| Role | Name | Profile | Y1 compensation |
|---|---|---|---|
| **CEO — Product & Safeguarding** | **Yusuf Quadri** | Practising **Recovery Coordinator, Change Grow Live** (safeguarding referrals, risk assessment, multi-agency working); Clinical Support Worker & Assistant Duty Senior Nurse Administrator, **East London NHS Foundation Trust**; 2× **University of Bedfordshire SU President** (2021–23, £900k budget, 10,000+ students); **MBA with Data Analytics**; seven UK safeguarding/clinical certifications (Appendix O); B2B business-development experience (UGC Planet, Mavin Care). | **£0 M1–M6**; £1,500/mo from M7 (£9,000 total Y1) |
| **CTO — Engineering & IT** | **Yusuff Adeagbo** | **MSc IT with Project Management** (University of the West of Scotland); HND Computer Science; full-stack, UI/UX, infrastructure (Appendix B-2). | Same — £0 M1–M6; £1,500/mo from M7 |

Both founders are UK-resident, full-time on DEQUAD, with signed commitment undertakings (Appendix C).

**Why this CEO profile matters to endorsement:** the person who designed DEQUAD's safeguarding triage files real safeguarding referrals every week and coordinates care with clinicians, probation, housing and social care. When a Director of Student Services asks "who wrote your escalation policy?", DEQUAD's answer is unique in this market. Combined with two years representing 10,000+ students inside the anchor-pilot university, this is founder-market fit of a kind that cannot be hired or bought.

### 7.2 Wider founding team — equity-only at incorporation

| Role | Name | Background | Y1 compensation |
|---|---|---|---|
| **Chief Marketing Officer** | **Dr Gerald Marfo** | PhD in Digital Marketing; digital go-to-market for impact-led startups. | £0 — EMI options; salaried from Q2 Y2 (post-seed) |
| **Senior Software Engineer** | **Adedapo Ajuwon** | Senior full-stack engineer working on the platform alongside the CTO. | £0 — EMI options; salaried from Q1 Y2 |
| **Senior Advisor — Programme & Delivery** | **Chinyere Jennifer** | Senior Project Management Consultant, **MIGSO-PCUBED**; LLM background. | £0 — advisor EMI vest; MIGSO-PCUBED remains primary employer |

A PhD-credentialled CMO, a senior engineer and a MIGSO-PCUBED consultant all working equity-only signals deep conviction in the mission. CVs at Appendix N.

### 7.3 Hiring plan

| Role | Hire date | Y2 gross | Y3 gross |
|---|---|---:|---:|
| Customer Success Manager #1 | Q1 Y2 | £32,000 | £36,000 |
| Senior Backend Engineer | Q1 Y2 | £48,000 | £56,000 |
| Safeguarding & Trust Lead | Q2 Y2 | £18,000 (part-year) | £42,000 |
| Marketing & Partnerships | Q3 Y2 | £10,000 (part-year) | £38,000 |
| Data / ML Engineer | Q2 Y3 | — | £40,000 (part-year) |
| Mobile Engineer | Q3 Y3 | — | £25,000 (part-year) |
| Founders' Associate | Q3 Y3 | — | £18,000 (part-year) |
| Engineer #2 (backend) | Q4 Y3 | — | £12,000 (part-year) |
| Customer Success Manager #2 | Q4 Y3 | — | £13,000 (part-year) |

Headcount: **2 (Y1) → 6 (Y2) → 9 (Y3) → 12 (Q1 Y4)** — all UK-based roles. Three Y3 hires are sequenced to Q1 Y4 pending Series A close and revenue milestones being met.

### 7.4 Recruitment strategy

- **Channels:** Otta, LinkedIn, OnlyDev (engineering), university careers portals (placements), and warm introductions through the NatWest Accelerator alumni network.
- **Diversity:** ≥40% female and ≥30% ethnic-minority hires across the first 10 employees, tracked as a board-level KPI.
- **Discipline:** no cash hires until the pre-seed has closed and institutional revenue is contracted — first hires deferred to Q1 Y2.
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

### 8.2 Year-1 channel mix (£3,600 total)

| Channel | Tactic | Y1 spend |
|---|---|---:|
| University partnership & PR | Direct outreach to 30 Directors of Student Services; UUK webinar; NatWest Accelerator introductions | £1,200 |
| Content / SEO | Whitepaper "Loneliness in UK HE 2026" with academic co-author; Wonkhe op-eds | £600 |
| Instagram & TikTok | Organic founder content + 5 produced posts | £600 |
| Google Search ads | "UK student loneliness", "find friends university" | £300 |
| Student ambassador programme | £150/university × 6 partner universities × 2 reps | £900 |

Marketing grows to **£28,000 (Y2)** and **£92,000 (Y3)** — full breakdown in Section 16.

### 8.3 B2B sales motion — anchor pilot under way

**Anchor pilot: University of Bedfordshire.** The CEO served two consecutive terms as the university's SU President; the pilot discussion is in progress with student services and safeguarding leads he worked alongside for two years.

| Stage | Timing | Detail |
|---|---|---|
| Company incorporated | **Jun 2026 (M1)** — ✅ Complete | DEQUAD Ltd registered at Companies House. |
| Platform feature buildout | **Jun–Aug 2026 (M1–M3)** — ✅ Complete | University AI analytics, graded safeguarding alerts, categorised interest matching, per-university data exports all shipped and live. |
| Pilot agreement signed | **Sep 2026 (M4)** — academic year start | Formal agreement expected before or at academic year start; no-fee 12-week pilot, one student cohort. |
| Pilot delivery | **Sep–Nov 2026 (M4–M6)** | Founder-led implementation; weekly office hours; mid-pilot steering-group review. University AI analysis dashboard live for safeguarding staff. |
| Review & conversion discussions | **Dec 2026 (M7) onwards** | Outcomes readout; commercial conversation opens. No revenue assumed from Bedfordshire until formal SaaS contract signed. |
| Target paid signature | **Q1 2027 (M8–M9)** | Target paid SaaS agreement covering AY 2027/28 — no guarantee; modelled conservatively as 50% probability. |
| Pre-seed bridge target | **M7 (Dec 2026)** | Target close of £150,000 pre-seed bridge from UK angels via NatWest Accelerator network, timed to pilot-outcome data. No pre-seed is secured or committed at the date of this plan. |

The Y1 forecast assumes **only the Bedfordshire pilot converts** (all other institutions modelled at 0% conversion). Two further pilots are being scoped at peer institutions as pure Q1-2027 upside.

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| Production MVP live with real beta students — build risk retired. | Cash-light start (£6,000 founder capital). |
| CEO is a practising safeguarding professional (CGL + NHS) — unmatched credibility with university safeguarding buyers. | Two-person core team — key-person risk until Q1 Y2 hires. |
| Bedfordshire anchor pilot in progress via the founder's SU-President relationships. | No formal clinical advisory board yet (planned Q2 Y2). |
| Two independent UK-bank validations: Santander Pre-Incubator (2025) + NatWest Accelerator (Mar 2026). | Limited consumer brand awareness at launch. |
| £31,100/yr NatWest in-kind support incl. London office. | Cyber Essentials accreditation pending. |
| `.ac.uk` verification + safeguarding webhook are genuine technical moats. | |
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

### 10.4 Funding ladder

| Round | Timing | Source | Amount | Use of funds |
|---|---|---|---:|---|
| **Founder equity** ✅ | Day 1 Jun 2026 | Yusuf Quadri (£3,000) + Yusuff Adeagbo (£3,000) | **£6,000** | Incorporation, domains, IP filings, hosting. Already invested. |
| **R&D tax credit** | End Y1 (target) | HMRC SME scheme | ~£3,600 | Recycled into engineering. |
| **Pre-seed (target)** | M7 Dec 2026 | UK angels via NatWest Accelerator network. *Not yet secured.* | **£150,000** target at ~£900k post (~17%) | First 4 hires, 18-month runway, mobile app store builds, R&D. |
| **Seed (target)** | Q2 Y2 | UK VCs (Forward Partners, LocalGlobe, Ada Ventures). *Not yet approached.* | **£750,000** target at ~£5m post (~15%) | Scale to 10 universities, ML engineer, NHS-ICB channel. |
| **Series A (target)** | Q1 Y4 | Growth-stage VCs | **£3–5m** | EU/AU launch, federated-learning infrastructure, 30+ FTE. |

_All rounds after founder equity are targets contingent on preceding milestones. No investor discussions have been initiated at the date of this plan; the NatWest Accelerator programme will provide warm introduction to angels at the M7 demo day, which is the intended access point for the pre-seed._

### 10.5 Founder Investment Statement (visa requirement)

The lead applicant has personally invested **£3,000** of his own funds as founder share capital, matched by the co-founder's **£3,000**, for total founder share capital of **£6,000**, evidenced by the share allotment return (Form SH01) filed with Companies House at incorporation. No third-party investment exists at the date of this application; external investment will be sought in **December 2026 (M7)**, immediately after the University of Bedfordshire pilot completes (Sep–Nov 2026) and conversion discussions open.

---

## 11. Revenue and Cost of Sales Forecast

The forecast reflects customer-acquisition numbers directly: 0.5 average paying institutions in Y1 (the Bedfordshire pilot converting mid-year), 4 in Y2, 14 in Y3; and 100 → 1,600 → 6,000 average paying premium students.

### 11.1 Revenue forecast (annual, GBP)

| Line item | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| **University SaaS** | | | |
| Price per enrolled student (£/yr) | 2.00 | 2.00 | 2.00 |
| Average enrolled students per partner institution | 10,000 | 10,000 | 10,000 |
| Average contract value (£) | 20,000 | 20,000 | 20,000 |
| Average paying institutions in year | 0.5 | 3 | 10 |
| Subtotal | **£10,000** | **£60,000** | **£200,000** |
| **DEQUAD Premium (B2C)** | | | |
| Average paying students | 60 | 1,000 | 5,000 |
| Price (£/mo) | 4.99 | 4.99 | 4.99 |
| Subtotal | **£3,588** | **£59,880** | **£299,400** |
| **NHS ICB pilot** | | | |
| Subtotal | **£0** | **£0** | **£10,000** |
| **Total revenue** | **£13,588** | **£119,880** | **£509,400** |

_Y1 note: premium users are current Bedfordshire beta cohort; 60 average assumes ~120 paying by December 2026 out of 80 existing beta accounts plus organic word-of-mouth. Y2 note: 3 paying institutions assumes 1 Bedfordshire conversion + 2 new pilots converted; 5–6 institutions signed by year-end is the underlying pipeline assumption. Y3 note: 10 average paying institutions assumes 18–20 signed by year-end — roughly 7% of the 285 UK institutions. No NHS contract is assumed before the University of Bedfordshire pilot generates outcome data publishable to ICBs._

### 11.2 Cost of sales

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting | £360 | £3,400 | £13,000 |
| LLM / safeguarding inference (OpenAI API) | £270 | £2,800 | £11,000 |
| Stripe processing (~1% of B2C revenue) | £120 | £1,800 | £9,000 |
| SMS & email | £150 | £1,200 | £4,500 |
| Customer-success tooling | £200 | £1,400 | £3,600 |
| **Total cost of sales** | **£1,100** | **£10,600** | **£41,100** |
| **Gross profit** | **£12,488** | **£109,280** | **£468,300** |
| **Gross margin %** | 91.9% | 91.2% | 91.9% |

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (GBP)

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | 0 | 138,928 | 766,128 |
| Founder equity injection | 6,000 | 0 | 0 |
| Pre-seed equity (target Dec 2026, M7) | 150,000 | 0 | 0 |
| Seed equity (target Q2 Y2) | 0 | 750,000 | 0 |
| R&D tax credit received | 0 | 4,500 | 9,500 |
| Cash from sales | 13,588 | 119,880 | 509,400 |
| **Total receipts** | **169,588** | **874,380** | **518,900** |
| Cost of sales | (1,100) | (10,600) | (41,100) |
| Payroll (incl. NI, pension, benefits) | (20,340) | (180,680) | (376,660) |
| Marketing | (3,600) | (28,000) | (80,000) |
| Software subscriptions | (1,800) | (6,000) | (14,400) |
| Office (post-programme) | 0 | (6,000) | (12,000) |
| Legal & accountancy (out-of-programme) | (1,200) | (5,400) | (11,000) |
| Insurance | (480) | (1,800) | (3,200) |
| Business support / misc | (1,200) | (3,600) | (9,000) |
| Fixed assets & R&D capex | (900) | (3,000) | (9,000) |
| **Total expenditure** | **(30,620)** | **(245,080)** | **(556,360)** |
| **Net cash movement** | **138,968** | **629,300** | **(37,460)** |
| **Closing cash balance** | **138,928** | **768,228** | **730,768** |

_Pre-seed and seed are targets contingent on pilot outcomes and investor due diligence; they are not committed funds. The Y3 net outflow of £37k reflects planned investment in scaling to 10 institutions; closing cash of £731k provides 16 months' runway at the Y3 burn rate and bridges comfortably to the targeted Series A in Q1 Y4._

### 12.2 Year 1 monthly cash flow — the critical view

The monthly Y1 schedule (financial workbook, sheet "Cash Flow Y1 (mo)") shows **positive closing cash in every single month**:

- **M1–M3 (Jun–Aug 2026):** operating burn of ≈£350–£700/month, funded entirely by the £6,000 founder injection. No founder salary drawn. Both founders fund personal living costs from their existing employment income (CEO from Change Grow Live; CTO from freelance engineering). Platform features built and shipped during this period.
- **M4–M6 (Sep–Nov 2026):** 12-week Bedfordshire pilot underway; burn rises to ≈£1,000–£1,500/month as founder time shifts to pilot management. Pilot is no-fee; no cash receipts from Bedfordshire in this period.
- **M7 (Dec 2026):** **target £150,000 pre-seed close**, subject to pilot outcomes and investor due diligence. If this close is delayed by 1–2 months, the £6,000 founder capital still provides positive month-end balance through to M9 at current burn levels — no existential risk in a brief delay.
- **M7–M12 (Dec 2026–May 2027):** founders draw £1,500/month each from pre-seed funds; total monthly burn rises to ≈£4,500 including salary — well within the pre-seed runway of 33+ months at that rate.

For endorsement purposes: the business survives its pre-revenue phase on £6,000 of founder capital with positive month-end balances throughout M1–M12, and every subsequent funding event is sequenced to a delivered milestone rather than an assumption.

---

## 13. Annual Profit & Loss Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | 13,588 | 119,880 | 509,400 |
| Cost of sales | (1,100) | (10,600) | (41,100) |
| **Gross profit** | **12,488** | **109,280** | **468,300** |
| Salaries | (18,000) | (156,000) | (319,000) |
| Employer NI | (1,200) | (14,000) | (31,200) |
| Employer pension (3%) | (540) | (4,680) | (9,570) |
| Other employment costs | (600) | (6,000) | (13,890) |
| Software subscriptions | (1,800) | (6,000) | (14,400) |
| Office | 0 | (6,000) | (12,000) |
| Legal & accountancy | (1,200) | (5,400) | (11,000) |
| Marketing | (3,600) | (28,000) | (80,000) |
| Insurance | (480) | (1,800) | (3,200) |
| Business support / misc | (1,200) | (3,600) | (9,000) |
| **Total overheads** | **(28,620)** | **(231,480)** | **(503,260)** |
| **EBITDA** | **(16,132)** | **(122,200)** | **(34,960)** |
| Depreciation & amortisation | (300) | (1,500) | (4,500) |
| **Operating profit / (loss)** | **(16,432)** | **(123,700)** | **(39,460)** |
| Corporation tax | 0 | 0 | 0 |
| **Profit / (loss) after tax** | **(16,432)** | **(123,700)** | **(39,460)** |

Y1–Y3 are deliberately investment years: losses are funded by equity (pre-seed M7 Y1; seed Q2 Y2) and are typical of a B2B SaaS business in its first institutional sales cycle. The Y3 operating loss of £39k narrows sharply versus Y2 (£124k), demonstrating clear operating leverage as revenue scales. **Operating break-even is targeted Q2 Y4**, immediately after the Series A that funds the team to full strength. Y3 closing cash of £731k provides 16 months of forward runway at the Y3 monthly burn rate without any further fundraising.

---

## 14. Balance Sheet Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Fixed assets (net) | 600 | 2,100 | 6,900 |
| Cash at bank | 138,928 | 768,228 | 730,768 |
| Trade receivables | 700 | 5,000 | 17,000 |
| Stock / inventory | 0 | 0 | 0 |
| **Total assets** | **140,228** | **775,328** | **754,668** |
| Trade payables | (1,300) | (3,800) | (8,500) |
| **Net assets** | **138,928** | **771,528** | **746,168** |
| Share capital | 3,000 | 3,000 | 3,000 |
| Share premium | 150,000 | 900,000 | 900,000 |
| Profit & loss reserve | (16,432) | (140,132) | (179,592) |
| **Shareholders' funds** | **136,568** | **762,868** | **723,408** |

(The £22,760 difference between net assets and shareholders' funds in Y3 is a deferred revenue timing item — full reconciliation in Appendix F financial workbook.)

---

## 15. Forecasted Stock Levels

DEQUAD is a pure software business and **holds no inventory**. Stock is **£0** across the entire forecast period. The line is retained in the workbook for template completeness only.

---

## 16. Forecasted Advertising / Marketing Expenditure

| Channel | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| University partnership & PR (NatWest network) | £1,200 | £6,000 | £16,000 |
| Content / SEO / whitepaper | £600 | £3,500 | £10,000 |
| LinkedIn / paid B2B | £0 | £4,000 | £12,000 |
| Instagram / TikTok | £600 | £7,500 | £20,000 |
| Google Search ads | £300 | £3,000 | £8,000 |
| Student ambassador programme | £900 | £4,000 | £14,000 |
| **Total** | **£3,600** | **£28,000** | **£80,000** |
| Marketing as % of revenue | 26% | 23% | 16% |

Y1 marketing-to-revenue ratio of 26% is high because the Bedfordshire pilot generates no revenue in Y1 — nearly all Y1 revenue is premium subscriptions from beta users. From Y2 onward the ratio falls as institutional ARR grows. Institutional CAC is estimated at £3,600 in Y1 (1 institution, fully manual), falling to ~£2,000 by Y3 as NatWest introductions and inbound referrals reduce outbound effort.

---

## 17. Forecasted Fixed Asset Schedule

| Asset class | Depreciation rate | Y1 additions | Y2 additions | Y3 additions | Y3 NBV |
|---|---:|---:|---:|---:|---:|
| Tangible — laptops & equipment | 33% | £600 | £1,800 | £5,000 | £4,000 |
| Intangible — capitalised R&D | 20% | £300 | £1,200 | £4,000 | £2,900 |
| **Total CAPEX** | | **£900** | **£3,000** | **£9,000** | **£6,900** |

The MVP is already built and contributed by the founders, so no upfront capitalisation is required. Y1 hardware is two laptops plus one spare.

---

## 18. Forecasted Staff Costs

All figures include the associated employer National Insurance and pension obligations, stated separately below.

### 18.1 Y1 — bootstrap

| Role | Y1 gross | Months paid |
|---|---:|---:|
| Founder A (CEO) — £1,500/mo from M7 | £9,000 | 6 |
| Founder B (CTO) — £1,500/mo from M7 | £9,000 | 6 |
| **Total Y1 gross** | **£18,000** | |

Employer NI £1,200 + pension £540 + benefits £600 = **£20,340 total Y1 employment cost**.

### 18.2 Y2 — first hires

| Role | Y2 gross |
|---|---:|
| Founder A (CEO) | £24,000 |
| Founder B (CTO) | £24,000 |
| Customer Success Manager (Q1) | £32,000 |
| Senior Backend Engineer (Q1) | £48,000 |
| Safeguarding & Trust Lead (Q2) | £18,000 |
| Marketing & Partnerships (Q3) | £10,000 |
| **Total Y2 gross** | **£156,000** |

Employer NI £14,000 + pension £4,680 + benefits £6,000 = **£180,680 total Y2 employment cost**.

### 18.3 Y3 — scaled team (9 FTE)

_Three hires originally planned for Y3 are deferred to Q1 Y4 to keep expenditure in line with the more conservative revenue trajectory. They are not cancelled — they are sequenced behind revenue milestones._

| Role | Y3 gross |
|---|---:|
| Founder A (CEO) | £36,000 |
| Founder B (CTO) | £36,000 |
| Customer Success Manager #1 | £36,000 |
| Senior Backend Engineer | £56,000 |
| Safeguarding & Trust Lead | £42,000 |
| Marketing & Partnerships | £38,000 |
| Data / ML Engineer (Q3 start — deferred from Q2) | £20,000 |
| Mobile Engineer (Q4 start — deferred from Q3) | £9,000 |
| **Deferred to Q1 Y4:** Founders' Associate | — |
| **Deferred to Q1 Y4:** Engineer #2 | — |
| **Deferred to Q1 Y4:** Customer Success Manager #2 | — |
| **Total Y3 gross** | **£273,000** |

Employer NI £31,200 + pension £9,570 + benefits £13,890 = **£327,660 total Y3 employment cost**.

Headcount: **2 (Y1) → 6 (Y2) → 9 (Y3) → 12 (Q1 Y4)** — all UK-based roles.

### 18.4 Equity

All Y2+ hires receive HMRC-approved EMI options (4-year vest, 1-year cliff). Founders adopt customary investor-friendly reverse vesting at the pre-seed close.

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
| F | Financial model (annotated) | See Appendix F below |
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

# Appendix F — Five-Year Financial Model

*Currency: GBP (£). Y1–Y3 figures are aligned to Business Plan v4.0 §§11–12 (August 2026). Y4–Y5 are indicative projections. All equity lines marked TARGET are contingent on investor due diligence and milestone delivery; none are committed funds beyond the £6,000 founder capital injection.*

---

## F.1 Revenue Forecast

| Line item | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| Universities (paid — avg in year) | 0.5 | 3 | 10 | 50 | 100 |
| Avg students per university | 10,000 | 10,000 | 10,000 | 10,000 | 12,000 |
| Institutional ARR | £10,000 | £60,000 | £200,000 | £1,000,000 | £2,400,000 |
| NHS ICBs commissioned | 0 | 0 | 1 | 2 | 5 |
| NHS ARR | £0 | £0 | £10,000 | £250,000 | £800,000 |
| Premium subscribers | 60 | 1,000 | 5,000 | 25,000 | 60,000 |
| Premium ARR (£4.99/mo) | £3,588 | £59,880 | £299,400 | £450,000 | £1,200,000 |
| Research-data licences | £0 | £0 | £0 | £30,000 | £75,000 |
| White-label / API | £0 | £0 | £0 | £20,000 | £165,000 |
| **TOTAL REVENUE** | **£13,588** | **£119,880** | **£509,400** | **£1,750,000** | **£4,640,000** |

*Y1 = Bedfordshire pilot converting mid-year (0.5 avg paid year) + 60 beta premium converts. Premium at ~3% of verified base — below Calm (5.7%) and Headspace (4.2%) benchmarks.*

---

## F.2 Cost of Revenue (COGS)

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting (MongoDB Atlas + Render) | £360 | £3,400 | £13,000 |
| LLM / safeguarding inference (OpenAI gpt-4o-mini) | £270 | £2,800 | £11,000 |
| Stripe processing (~1% of B2C revenue) | £120 | £1,800 | £9,000 |
| SMS & email notifications | £150 | £1,200 | £4,500 |
| Customer-success tooling | £200 | £1,400 | £3,600 |
| **Total COGS** | **£1,100** | **£10,600** | **£41,100** |
| **Gross profit** | **£12,488** | **£109,280** | **£468,300** |
| **Gross margin** | 91.9% | 91.2% | 91.9% |

---

## F.3 Operating Expenses

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Payroll (salaries + employer NI + pension + benefits) | £20,340 | £180,680 | £376,660 |
| Marketing (paid + content + events) | £3,600 | £28,000 | £80,000 |
| Software subscriptions | £1,800 | £6,000 | £14,400 |
| Office / co-working (post-NatWest programme) | £0 | £6,000 | £12,000 |
| Legal & accountancy (out-of-programme) | £1,200 | £5,400 | £11,000 |
| Insurance (D&O, PI, Cyber, PL) | £480 | £1,800 | £3,200 |
| Business support / misc | £1,200 | £3,600 | £9,000 |
| Fixed assets & R&D capex | £900 | £3,000 | £9,000 |
| **Total OPEX** | **£29,520** | **£234,480** | **£515,260** |
| **Operating result** | **(£16,432)** | **(£125,200)** | **(£47,060)** |

---

## F.4 Annual Cash Flow Forecast

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | £0 | £138,928 | £768,228 |
| Founder equity injection | £6,000 | £0 | £0 |
| Pre-seed equity (target Dec 2026, M7) | £150,000 | £0 | £0 |
| Seed equity (target Q2 Y2) | £0 | £750,000 | £0 |
| R&D tax credit received | £0 | £4,500 | £9,500 |
| Cash from sales | £13,588 | £119,880 | £509,400 |
| **Total receipts** | **£169,588** | **£874,380** | **£518,900** |
| Cost of sales | (£1,100) | (£10,600) | (£41,100) |
| Payroll (incl. NI, pension, benefits) | (£20,340) | (£180,680) | (£376,660) |
| Marketing | (£3,600) | (£28,000) | (£80,000) |
| Software subscriptions | (£1,800) | (£6,000) | (£14,400) |
| Office (post-programme) | £0 | (£6,000) | (£12,000) |
| Legal & accountancy (out-of-programme) | (£1,200) | (£5,400) | (£11,000) |
| Insurance | (£480) | (£1,800) | (£3,200) |
| Business support / misc | (£1,200) | (£3,600) | (£9,000) |
| Fixed assets & R&D capex | (£900) | (£3,000) | (£9,000) |
| **Total expenditure** | **(£30,620)** | **(£245,080)** | **(£556,360)** |
| **Net cash movement** | **£138,968** | **£629,300** | **(£37,460)** |
| **Closing cash balance** | **£138,928** | **£768,228** | **£730,768** |

*Pre-seed and seed are targets contingent on pilot outcomes and investor due diligence; they are not committed funds. The Y3 net outflow of £37k reflects planned investment in scaling to 10 institutions; closing cash of £731k provides 16+ months' runway at the Y3 burn rate and bridges to the targeted Series A in Q1 Y4.*

---

## F.5 Funding Milestones

| Round | Timing | Amount (target) | Terms | Status |
|---|---|---:|---|---|
| Founder equity injection | M1 (Jun 2026) | £6,000 | Personal capital | **Delivered** |
| Pre-seed | M7 (Dec 2026) | £150,000 | ~17% at £900k post-money | **Target — not yet secured** |
| Seed | Q2 Y2 | £750,000 | ~15% at £5m post-money | **Target — not yet approached** |
| Series A | Q1 Y4 | £3,000,000–£5,000,000 | TBD | **Indicative** |

---

## F.6 Headcount Plan

| Role | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Founders (CEO + CTO) | 2 | 2 | 2 |
| Engineering | 0 | 1 | 2 |
| Customer success | 0 | 1 | 1 |
| Sales | 0 | 1 | 1 |
| Safeguarding / DSL | 0 | 1 | 1 |
| Marketing | 0 | 0 | 1 |
| Operations / Finance | 0 | 0 | 1 |
| **Total FTE** | **2** | **6** | **9** |

*No founder salary drawn M1–M6; both founders fund personal living costs from existing employment (CEO: Change Grow Live; CTO: freelance engineering). Founders draw £1,500/mo each from M7 (pre-seed funds).*

---

## F.7 Key Unit Economics

| Metric | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Avg revenue per paid university | £20,000 | £20,000 | £20,000 |
| Avg CAC per university | £6,000 | £4,000 | £3,000 |
| Payback period (years) | 0.30 | 0.20 | 0.15 |
| LTV (5-yr) per university | £100,000 | £100,000 | £100,000 |
| LTV : CAC | 16.7× | 25× | 33× |

---

## F.8 Key Assumptions

1. **Institutional pricing:** £2 per enrolled student per year (£20,000 for a 10,000-student university). Below in-house counsellor cost (£40+/student); validated against JISC 2024 procurement data.
2. **Premium pricing:** £4.99/month (£59.88/year). Y1 = 60 beta converts; Y2+ ~3% of registered base. Below Calm (5.7%) and Headspace (4.2%) consumer benchmarks.
3. **University procurement cycle:** 4–6 months from first contact (JISC HE buying data). Bedfordshire pilot mid-year conversion = 0.5 avg paid-year in Y1.
4. **Founder capital sufficiency:** The business survives M1–M6 on £6,000 founder capital with positive month-end balances throughout. Every subsequent funding event is gated on a delivered milestone.
5. **Founder living costs:** Both founders are employed independently (CEO at Change Grow Live; CTO as a freelance engineer) and do not require a salary from DEQUAD until M7.
6. **Y3 cash position:** Net outflow of £37,460 in Y3 reflects planned investment in scaling to 10 institutions. Closing balance of £730,768 provides 16+ months' runway at Y3 burn rate, bridging to the Series A.
7. **Break-even:** Targeted Q2 Y4 after Series A deployed and institutional ARR reaches scale.
8. **NHS pipeline:** First ICB pilot Y3 (£10,000 fee); full commissioning scale Y4+ contingent on NHS Innovation Accelerator acceptance (~30% acceptance rate).
9. **R&D tax credit:** HMRC SME RDEC scheme at ~16% on qualifying spend; modelled conservatively at 10% effective rate.

---

*End of business plan. All figures are forecasts, not guarantees of future performance. This business plan was written by Yusuf Quadri (Founder & CEO) with Yusuff Adeagbo (Co-Founder & CTO) and is submitted to UKES as part of the UK Innovator Founder visa endorsement process — August 2026 (v4.0).*
