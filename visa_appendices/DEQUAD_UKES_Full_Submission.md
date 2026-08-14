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
- Anchor pilot discussion currently in progress with the **University of Bedfordshire**, leveraging two years' tenure as the university's Students' Union President.
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
- Built the direct relationships with the Director of Student Services, safeguarding leads and senior leadership that now underpin DEQUAD's anchor pilot discussion.

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
3. **Long-term commitment.** Yusuff is contributing £3,000 of personal capital alongside the lead founder, accepting six months of no salary, and signing customary founder vesting at the pre-seed close. He is committed to working full-time in the UK on DEQUAD for the duration of the visa endorsement period and beyond.

---

## Founder undertaking

The undersigned confirms that he:

- is committing full-time to DEQUAD as Chief Technology Officer;
- is contributing **£3,000** of personal capital as founder share capital, to be evidenced by the share allotment return (Form SH01) to be filed with Companies House at incorporation;
- agrees to a customary 4-year founder-vesting schedule with a 1-year cliff, to be put in place at the pre-seed round;
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

*Y1 = Bedfordshire pilot converting mid-year (0.5 avg paid year) + 60 beta premium converts. Y2+ institutional ARR grows as procurement cycles close. Premium at ~3% of verified base — below Calm (5.7%) and Headspace (4.2%) benchmarks.*

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
6. **Y3 cash position:** Net outflow of £37,460 in Y3 reflects planned investment in scaling to 10 institutions. Closing balance of £730,768 provides 16+ months' runway at Y3 burn rate, bridging comfortably to the Series A.
7. **Break-even:** Targeted Q2 Y4 after Series A deployed and institutional ARR reaches scale.
8. **NHS pipeline:** First ICB pilot Y3 (£10,000 fee); full commissioning scale Y4+ contingent on NHS Innovation Accelerator acceptance (~30% acceptance rate).
9. **R&D tax credit:** HMRC SME RDEC scheme at ~16% on qualifying spend; modelled conservatively at 10% effective rate.


---


# Appendix G — Job Descriptions & Salary Bands (42 UK FTE Roles)

*Written and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd.*

This appendix documents every role in the 5-year hiring plan referenced in main document §7.3. All roles are **UK-based, PAYE, paying UK National Insurance contributions**, and recruited through fair and open processes.

Salary bands are aligned with **London or hybrid-London** weighting where applicable (2026 baseline), with cost-of-living adjustments noted for any non-London hires.

---

## G.1 Hiring summary

| Year | New hires (FTE) | Cumulative | Total wage bill (£k) |
|---|---|---|---|
| Y1 | 4 | 4 | ~145 |
| Y2 | 6 | 10 | ~410 |
| Y3 | 9 | 19 | ~880 |
| Y4 | 11 | 30 | ~1,510 |
| Y5 | 12 | 42 | ~2,160 |

---

## G.2 Year 1 — 4 hires

### G.2.1 Designated Safeguarding Lead (PT → FT)

| Field | Detail |
|---|---|
| Hire month | Month 1 |
| Initial commitment | 0.5 FTE (Y1) → 1.0 FTE end of Y1 |
| Salary band | £42k–£52k (pro-rata) |
| Reporting line | CEO + CTO (Yusuf Quadri + Yusuff Adeagbo) |
| Mission | Lead safeguarding triage, manage DSL on-call rota, liaise with partner-university DSLs |
| Must-have | Level 3 Safeguarding Adults qualification; ≥3 years HE / NHS / charity safeguarding experience; enhanced DBS |
| Nice-to-have | Direct counselling experience; suicide-safer training |
| Recruitment channel | Charity Job, NCVO, AMOSSHE network |

### G.2.2 Full-stack engineer

| Field | Detail |
|---|---|
| Hire month | Month 4 |
| FTE | 1.0 |
| Salary band | £55k–£70k |
| Reporting line | CEO + CTO (Yusuf Quadri + Yusuff Adeagbo) |
| Mission | Take ownership of frontend (Expo/React) so founder can shift to product + sales; ship the iOS + Android stores release |
| Must-have | 4+ years full-stack; React Native or Expo production experience; comfort with serverless + Mongo |
| Nice-to-have | Health-tech background; safeguarding context |
| Recruitment channel | Otta, Wellfound, LinkedIn, Tech Nation Visa alumni |

### G.2.3 Customer-success lead

| Field | Detail |
|---|---|
| Hire month | Month 7 |
| FTE | 0.5 (Y1) → 1.0 (Y2) |
| Salary band | £36k–£44k (pro-rata) |
| Reporting line | CEO + CTO |
| Mission | Onboard first 3 pilot universities; build CS playbook |
| Must-have | 2+ years CS or account management in B2B SaaS; education or health-tech background |
| Recruitment channel | LinkedIn, Otta |

### G.2.4 Growth marketer

| Field | Detail |
|---|---|
| Hire month | Month 10 |
| FTE | 0.5 |
| Salary band | £40k–£50k (pro-rata) |
| Reporting line | CEO + CTO |
| Mission | Student-facing marketing: TikTok/Instagram, freshers' fair partnerships, society sponsorships |
| Must-have | Demonstrated organic growth on Gen-Z channels; basic data literacy |
| Recruitment channel | LinkedIn, freelancer-platform conversion |

---

## G.3 Year 2 — 6 hires (cumulative 10 FTE)

| Role | FTE | Salary band | Why now |
|---|---|---|---|
| Engineer #2 (backend / data) | 1.0 | £55k–£70k | Scale to 10 universities; data pipeline |
| Engineer #3 (mobile lead) | 1.0 | £60k–£75k | Native-app release maintenance + iOS App Store ops |
| Sales rep (university accounts) | 1.0 | £40k base + £15k OTE | Inbound conversion + outbound to 25 universities |
| Data Protection Officer (FTE) | 1.0 | £55k–£75k | NHS DSPT prep + scale of processing |
| Operations / People Ops | 1.0 | £40k–£50k | First-line HR, finance, contracts |
| Customer-success specialist #2 | 1.0 | £36k–£44k | Cohort onboarding |

---

## G.4 Year 3 — 9 hires (cumulative 19 FTE)

| Role | FTE | Salary band | Why now |
|---|---|---|---|
| Engineer #4 (platform / SRE) | 1.0 | £65k–£85k | 200k users requires SRE discipline |
| Engineer #5 + #6 (full-stack) | 2.0 | £55k–£70k each | Faster product velocity |
| Sales rep #2 + #3 | 2.0 | £40k+OTE | UK sales motion expansion |
| Clinical / safeguarding lead (senior) | 1.0 | £55k–£70k | NHS commissioning bid leadership |
| Finance manager (FTE) | 1.0 | £50k–£65k | Series A readiness |
| Marketing manager | 1.0 | £45k–£60k | Brand + content |
| HR business partner | 1.0 | £45k–£60k | Headcount of 19 FTE needs dedicated HR |

---

## G.5 Year 4 — 11 hires (cumulative 30 FTE)

| Role | FTE | Salary band | Why now |
|---|---|---|---|
| Head of Engineering | 1.0 | £100k–£130k | Spans risk away from founder |
| Engineer #7, #8, #9 | 3.0 | £55k–£75k | Maintain velocity |
| Senior sales (NHS accounts) | 1.0 | £55k+OTE | NHS ICB bids |
| Sales rep #4, #5, #6 | 3.0 | £40k+OTE | UK + ROI expansion |
| Senior CS (enterprise / NHS) | 1.0 | £55k–£70k | NHS implementation |
| Data scientist | 1.0 | £55k–£75k | Wellbeing-baseline R&D + publications |
| Partnerships manager (ROI / first international) | 1.0 | £45k–£60k | Republic of Ireland entry |

---

## G.6 Year 5 — 12 hires (cumulative 42 FTE)

| Role | FTE | Salary band | Why now |
|---|---|---|---|
| Head of Sales | 1.0 | £90k–£120k | Sales-leadership layer |
| Head of Customer Success | 1.0 | £75k–£100k | Enterprise CS layer |
| Engineer #10, #11 | 2.0 | £55k–£75k | Localisation + new platform |
| Sales rep #7–#9 | 3.0 | £40k+OTE | Volume growth |
| Senior product manager | 1.0 | £65k–£85k | First dedicated PM |
| QA lead | 1.0 | £45k–£60k | Quality gate |
| Sales engineer | 1.0 | £55k–£70k | Pre-sales technical assistance |
| Compliance manager | 1.0 | £55k–£70k | ISO 27001 + DSPT |
| Marketing exec #2 | 1.0 | £30k–£40k | Content velocity |

---

## G.7 Diversity, equality, and inclusion commitments

DEQUAD commits to:

- **Open advertising** for every role on at least two channels (LinkedIn + Otta minimum) for at least 14 days before any offer.
- **Blind shortlisting** at CV-screening stage (name, university, address removed).
- **Structured interview rubrics** for every role.
- **Pay-band transparency** — salary published in every job advert.
- **Mentor opportunities** — formal partnership with **Code First Girls**, **Pinpoint** (women returners), and **Diversity in Tech** by end of Year 2.
- **Hiring-mix targets** — by Year 3, the company aims for at least 45% female engineering hires and at least 30% minority-ethnic representation across the company. These targets are aspirational and reported annually.

---

## G.8 Wage-bill summary (rounded)

| Year | Engineering | Commercial | Safeguarding/Clinical | Operations | Total wage bill (£k) |
|---|---|---|---|---|---|
| Y1 | 55 | 40 | 30 | 20 | 145 |
| Y2 | 200 | 80 | 65 | 65 | 410 |
| Y3 | 470 | 160 | 145 | 105 | 880 |
| Y4 | 810 | 320 | 200 | 180 | 1,510 |
| Y5 | 1,150 | 500 | 240 | 270 | 2,160 |

Figures include employer NI (13.8% above secondary threshold), workplace-pension contribution (3% minimum), and basic apprenticeship-levy (0.5% above £3m wage bill from Y5).

---

## G.9 Recruitment-cost assumption

Average **cost-per-hire** for technical roles: £2,500 (mostly LinkedIn Recruiter + interview-time opportunity cost).
Average cost-per-hire for senior roles: £8,000–£12,000 (occasional retained-search where required).

These costs are absorbed in the Marketing / People line of the financial model (Appendix F).


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
| Designated Safeguarding Lead | _To be appointed Month 1 post-endorsement_ | Job description in Appendix G |
| Data Protection Officer | _Outsourced fractional in Y1 (e.g. The DPO Centre, IT Governance); FTE in Y2_ | |
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
> the pre-seed round closes.

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
| **R1** | **University of Bedfordshire pilot fails to convert before Sep Y1 — pre-seed bridge slips** | Commercial | 2 | 5 | **10** | 🟠 | CEO | Lead founder is a **former University of Bedfordshire Student Union President (2021–2023)** with existing senior-management relationships; conversion likelihood materially de-risked vs. cold-outreach. Two further pilot conversations scoped at peer institutions as backup. Founders have committed personal-savings top-up for any 4-week slip. |
| **R2** | **Co-founder formal appointment delayed past incorporation** | Team | 3 | 5 | **15** | 🟠 | CEO | Candidate identified, term sheet drafted; founder agreement signed; CEO covers Y1 technical work alone if hire slips by < 90 days; backup engineering contractor identified. |
| **R3** | **Pre-seed bridge fails to close in Sep Y1** | Capital | 2 | 4 | **8** | 🟡 | CEO | Two parallel investor tracks: (a) UKES angel network, (b) NatWest Accelerator demo day Q3 Y1. **£6,000 founder cash + £31k in-kind support carry the business with positive monthly closing balances every month of Year 1**, so a 3-month investor slip is tolerable. Fall-back: Innovate UK Smart Grant submitted Q2 Y1 (~£30k). |
| **R4** | **Safeguarding incident — false negative (failure to flag a real risk signal)** | Product / Clinical | 3 | 5 | **15** | 🟠 | CEO | Human-in-the-loop review for all high-risk flags within 1h; clear in-app crisis-escalation path (Samaritans, 999, university DSL); £1m professional indemnity insurance; clinical advisory board recruitment underway (Q2 Y2 target). |
| **R5** | **Safeguarding incident — false positive that harms a student** (e.g. wrong escalation) | Product / Clinical | 3 | 4 | **12** | 🟠 | CEO | Two-step DSL confirmation before any disclosure outside the platform; full audit log; student "appeal" route surfaced in-product. |
| **R6** | **Online Safety Act 2023 non-compliance or ICO enforcement** | Regulatory | 2 | 5 | **10** | 🟠 | CEO | OSA risk assessment & reporting flows already shipped (Appendix I); ICO DPIA drafted (Appendix E); legal review via NatWest Mishcon panel; quarterly compliance review with external counsel. |
| **R7** | **Cybersecurity breach (PII / mood-data leak)** | Security | 2 | 5 | **10** | 🟠 | CTO | Cyber Essentials certification in progress; mood data stored separately from identity data; encryption-at-rest; secrets vault; bug-bounty programme post-seed; penetration test scheduled Q2 Y2. |
| **R8** | **Togetherall / TalkCampus copy the `.ac.uk` verification feature** | Competitive | 3 | 3 | **9** | 🟠 | CEO | First-mover positioning on universities; safeguarding webhook + insights dashboard are deeper moats than email-domain logic alone; signed exclusivity clauses with first 5 paying universities. |
| **R9** | **Large incumbent (Microsoft, Meta, Pearson) launches a competing student-only network** | Competitive | 2 | 4 | **8** | 🟡 | CEO | Niche depth (safeguarding triage + ICB integration) is unattractive to a horizontal incumbent; build defensible university relationships and data network effects first. |
| **R10** | **University buyer (Director of Student Services) treats DEQUAD as line-item rather than strategic** | Commercial | 3 | 3 | **9** | 🟠 | CEO | Position alongside OfS statutory MH condition and UUK Charter so the budget conversation is with the VC or Deputy VC, not just Student Services. |
| **R11** | **Cost-of-living squeeze suppresses DEQUAD Premium uptake** | Demand | 4 | 2 | **8** | 🟡 | CEO | B2B revenue covers fixed cost base; premium is upside. £4.99/mo price-point already at lower bound of student tolerance. |
| **R12** | **LLM provider price spike (OpenAI / Anthropic) materially raises COGS** | Vendor | 3 | 2 | **6** | 🟡 | CTO | Multi-provider abstraction (Emergent integrations) in place — can swap providers in < 1 day; tier-down to smaller / open-source model for low-risk classification tasks. |
| **R13** | **Negative national PR from a misreported case or social-media pile-on** | Reputation | 2 | 4 | **8** | 🟡 | CEO | Reactive PR plan with NatWest-provided agency on retainer (post-seed); clear transparency policy; clinical advisory board to provide third-party voice. |
| **R14** | **Key engineering hire leaves in Y2** | Team | 2 | 3 | **6** | 🟡 | CTO | EMI options with 4-year vest + 1-year cliff; documentation and pairing culture; contractor pool identified for emergency cover. |
| **R15** | **Tighter UK immigration regime restricts future hires** | Regulatory | 3 | 2 | **6** | 🟡 | CEO | Both co-founders already UK-resident; first 12 hires are UK-only; secure sponsor licence once headcount > 10. |
| **R16** | **Founder burnout (working without salary for 6 months)** | Team / Personal | 3 | 3 | **9** | 🟠 | Both founders | Strict M8+ founder salary draw; mandated weekly off-day; mentor check-ins through NatWest Accelerator; personal-savings runway calculated and disclosed. |

---

## Risk dashboard — Year 1 focus

The seven highest-scoring risks define the Year-1 management agenda:

| Risk | Active monitoring |
|---|---|
| R1 — Bedfordshire pilot conversion | Weekly pipeline review with CEO; pilot-to-paid forecast updated each Friday. Standing fortnightly check-in with Bedfordshire Director of Student Services. |
| R2 — Co-founder appointment | Term sheet + commencement date frozen by end M2. |
| R3 — Pre-seed bridge timing | Investor pipeline reviewed fortnightly; data-room kept current. |
| R4 — Safeguarding false negative | Sample of flagged + un-flagged cases reviewed each week by CEO + clinical advisor (informal until Q2 Y2). |
| R5 — Safeguarding false positive | Same review cadence as R4. |
| R6 — Regulatory compliance | Quarterly review with legal counsel (via NatWest Mishcon panel). |
| R7 — Cyber breach | Monthly secrets-rotation; quarterly dependency audit. |

---

## Risks accepted (🟢)

The founders have accepted (and disclosed to UKES) the following lower-priority risks without active mitigation in Year 1:

- **R-A1** Foreign-exchange exposure on USD-denominated cloud bills — accepted: < 10% of COGS.
- **R-A2** Personal liability for limited director duties — accepted with standard D&O insurance to be in place post-seed.
- **R-A3** Domain-name / trademark dispute with similar-name companies — accepted; full UKIPO and EUIPO trademark searches completed pre-incorporation; no conflicts found.

---

## Governance

- **Monthly:** Founders review the full register; update RAG scores; surface new risks; close mitigated risks.
- **Quarterly:** External advisor (NatWest Accelerator programme manager) reviews the register and challenges any rosy scoring.
- **Post pre-seed (Sep Y1):** Risk register becomes a standing board paper.
- **Post seed (Q2 Y2):** Independent non-executive director appointed to chair an audit & risk sub-committee.

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
| **Beta users** | ~50 across 3 UK universities |
| **Anchor pilot discussion currently in progress** | **University of Bedfordshire** — direct relationship via former SU presidency |
| **Starting cash** | **£6,000 (£3,000 from each of 2 founders)** |
| **In-kind support** | £31,000/yr from NatWest Accelerator (office, legal, accountancy, mentoring) |
| **Funding ask Y1** | £150,000 pre-seed bridge — **Dec 2026 (M7)**, after the 3-month Bedfordshire pilot completes |
| **3-yr revenue** | £16k → £176k → £659k |
| **3-yr UK jobs** | 2 → 6 → 12 |
| **Op profit positive** | Q4 Year 3 |
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
3. **Founder–institution fit.** Yusuf Quadri served as **University of Bedfordshire Student Union President for two consecutive years (2021–2023)**, representing the student body at senior-management level. The first paying pilot is now currently in progress with the same university.
4. **Two complementary founders** — product/safeguarding lead (Yusuf Quadri) + engineering/ML lead (Co-Founder TBC). Both UK-resident, full-time, signing customary vesting at pre-seed close.

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
- **Anchor pilot live with University of Bedfordshire** — the founder's former institution where he served two terms as SU President (2021–2023). The 12-week pilot launches **Sep 2026 (M4)** and completes **Nov 2026 (M6)**; conversion conversations open **Dec 2026 (M7)**, which is also when the pre-seed bridge lands.
- Two independent UK-bank programme validations: **Santander Universities Pre-Incubator (2025)** + **NatWest Accelerator (joined 16 March 2026)**.
- £6,000 founder cash (£3k each) + £31,000 in-kind NatWest support **carries the business through Y1 with positive monthly closing cash balances** (see Page 9).
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

### B2B pilot conversion track-record (live)

- **University of Bedfordshire** — anchor pilot discussion currently in progress. Lead founder served two terms as SU President there (2021–2023); direct relationships with student services and safeguarding leads.
- **Two further peer institutions** — early-stage pilot scoping (anonymised for now).
- **Beta cohort active** — 50 students across 3 universities use DEQUAD weekly.

### Y1 marketing spend: £3,600

Only ~30% of revenue because (a) founder organic outreach is the primary B2B channel and (b) the NatWest network gives warm introductions to university IT/wellbeing leads.

---

## Page 7 — Founders

### Yusuf Quadri — CEO / Product & Safeguarding Lead

- UK-resident, full-time on DEQUAD.
- **University of Bedfordshire Student Union President 2021–2023** (two consecutive terms). Represented the student body at senior-management level on student-services, safeguarding and welfare policy. This is the basis of DEQUAD's anchor pilot relationship with the same university.
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

### Wider founding team — joining at incorporation (EMI options, **no Y1 salary**)

- **Dr Gerald Marfo — Chief Marketing Officer** · PhD in Digital Marketing; owns Y1 marketing strategy and measurement. **Equity-only Y1**; salaried from Q2 Y2.
- **Adedapo Ajuwon — Senior Software Engineer** · supports CTO on platform engineering, infrastructure, reliability. **Equity-only Y1**; salaried from Q1 Y2.
- **Chinyere Jennifer — Senior Advisor (Programme & Delivery)** · Senior PM Consultant at **MIGSO-PCUBED** with LLM background. **Advisor on EMI options**; MIGSO-PCUBED remains her primary employer.

Full CVs in Appendix N (`N_wider_team_cvs.pdf`).

### Y1 founder compensation

- £0 in M1–M6 (Jun–Nov 2026) (personal savings).
- £1,500/month each from **M7 (Dec 2026)** once the £150k pre-seed bridge lands.
- Materially below market — signals genuine founder commitment.

---

## Page 8 — Funding ladder

| Round | Timing | Amount | Use of funds |
|---|---|---:|---|
| Founder equity (£3,000 × 2) | Day 1 | **£6,000** | Incorporation, domains, IP filings, hosting. |
| R&D tax credit | End Y1 | ~£3,600 | Recycled into engineering. |
| **Pre-seed bridge** | **Dec 2026 (M7)** — after the 3-month Bedfordshire pilot completes and conversion discussions open | **£150,000** | First 4 hires, 18-month runway, dual mobile builds. |
| Seed round | Q2 Y2 | £750,000 | 20-uni scale, ML team, NHS-ICB channel. |
| Series A | Q1 Y4 | £3–5m | EU + AU launch, federated-learning, 30+ FTE. |

The **pre-seed is gated on the 3-month Bedfordshire pilot completing in Nov 2026 (M6) with positive outcome data** — the round will only be approached after that institution provides commercial validation (pilot-conversion conversation opens Dec 2026). This is deliberate; it forces customer-led growth.

---

## Page 9 — Year-1 cash flow (the critical view)

### Monthly closing cash balance is positive every single month of Year 1

| Month | Inflows | Outflows | Closing balance |
|---|---:|---:|---:|
| **M1 (Jun 2026)** — incorporation | £6,000 founder | (~£1,460) | **£4,540** |
| M2 (Jul 2026) | — | (~£330) | **£4,210** |
| M3 (Aug 2026) | £200 sales | (~£460) | **£3,950** |
| **M4 (Sep 2026)** — pilot launch (academic year start) | £350 | (~£630) | **£3,670** |
| M5 (Oct 2026) — pilot month 2 | £500 | (~£600) | **£3,570** |
| **M6 (Nov 2026)** — 3-month pilot completes; lowest cash | £700 | (~£720) | **£3,550** |
| **M7 (Dec 2026) — £150k pre-seed lands + Bedfordshire conversion conversations open** | **£150,800** | (£4,670) | **£149,680** |
| M8 (Jan 2027) | £1,600 | (£4,430) | **£146,850** |
| M9 (Feb 2027) | £2,100 | (£4,390) | **£144,560** |
| M10 (Mar 2027) | £2,700 | (£4,420) | **£142,840** |
| M11 (Apr 2027) | £3,100 | (£4,390) | **£141,550** |
| **M12 (May 2027)** — Y1 close | £3,938 | (£4,460) | **£141,028** |

> **The £6,000 founder cash buffer means cash never dips below £3,500** in any month before the pre-seed bridge — a significantly more comfortable runway than the £3k starting case. The 3-month Bedfordshire pilot (Sep–Nov 2026, M4–M6) and the M7 (Dec 2026) conversion-conversation window is the single critical commercial event of Year 1, and the founders' direct relationship with the university (via the former SU presidency) is the principal de-risking factor.

The full monthly schedule is in `DEQUAD_Financial_Model.xlsx`, sheet "Cash Flow Y1 (mo)".

---

## Page 10 — Three-year P&L summary

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | £15,988 | £175,808 | £659,280 |
| Cost of Sales | (£1,440) | (£15,600) | (£54,000) |
| Gross Profit | £14,548 | £160,208 | £605,280 |
| Gross margin % | 91.0% | 91.1% | 91.8% |
| Total overheads | (£28,620) | (£231,480) | (£579,260) |
| **EBITDA** | **(£14,072)** | **(£71,272)** | **£26,020** |
| **Operating profit** | **(£14,372)** | **(£72,772)** | **£21,520** |

**Operating profit positive in Q4 Year 3.** Cumulative loss before profitability ≈ £87k — small for a venture-funded company because the NatWest Accelerator + lean founder pay materially reduce Y1 + Y2 burn.

---

## Page 11 — Job creation and economic impact

### Headcount

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Founders | 2 | 2 | 2 |
| Customer Success | 0 | 1 | 2 |
| Engineering | 0 | 1 | 3 |
| Safeguarding & Trust | 0 | 1 | 1 |
| Marketing & Partnerships | 0 | 1 | 1 |
| Data / ML | 0 | 0 | 1 |
| Mobile | 0 | 0 | 1 |
| Founders' Associate | 0 | 0 | 1 |
| **Total UK jobs** | **2** | **6** | **12** |

### Beyond direct jobs

- **University safeguarding capacity:** every institution onboarded gains an early-warning system that increases the practical reach of their existing wellbeing teams.
- **Student-rep / ambassador programme:** ~12 paid student ambassadors by end Y3.
- **NHS ICB pilot (Y3):** establishes a public-sector revenue line.

---

## Page 12 — R&D activity (tax-credit eligible)

R&D investment is **£22.5k (Y1)** → **£60k (Y2)** → **£110k (Y3)**, focused on three bets:

1. **Identity-and-intent verification engine** — `.ac.uk` classifier, attestation, admin queue, future OCR student-ID flow.
2. **Wellbeing inference & safeguarding triage** — PHQ-9-lite mood model + risk-signal NLU + federated learning roadmap.
3. **Privacy & compliance infrastructure** — DPIA pipeline, OSA-2023 reporting, hash-based de-identification.

Estimated SME R&D tax credit recoverable in the following accounting period:
- Y1 → ~£3,600
- Y2 → ~£9,600
- Y3 → ~£17,600

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

The £31k of in-kind support is **the reason £3,000 of founder cash is sufficient** to carry the business through Year 1. Without the accelerator, the same operating profile would require ~£40k of additional cash investment up front.

---

## Page 14 — Risk register (summary)

The 12 key risks the founders have identified and their mitigations:

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | First-pilot conversion slips beyond Dec 2026 (M7) | High | 3 LOIs in parallel; pivot to NHS ICB pilot if HEI cycle delayed. |
| R2 | Co-founder hire delayed | High | Y1 build is solo-doable; founder personally covers technical work until co-founder onboarded. |
| R3 | Pre-seed bridge slips | High | Tight Y1 burn means £3k carries 6 months; founders top up personal funds for any small gaps. |
| R4 | Safeguarding incident (false negative) | High | Human-in-the-loop for all high-risk flags; insurance in place; clinical advisory board recruited Q2 Y2. |
| R5 | Togetherall/TalkCampus copy `.ac.uk` verification | Medium | First-mover land grab; safeguarding webhook + insights dashboard are deeper moats. |
| R6 | OfS / Online Safety Act non-compliance | Medium | OSA risk assessment and reporting flows already shipped; ICO DPIA drafted; legal review via NatWest Mishcon panel. |
| R7 | Cyber breach | Medium | Cyber Essentials in progress; pen-test scheduled Q2 Y2; insurance £1m. |
| R8 | Cost-of-living squeeze on premium subscriptions | Medium | B2B revenue covers fixed costs; premium is upside. |
| R9 | Negative PR from a misidentified case | Medium | Reactive media plan; clinical advisory board; transparent reporting. |
| R10 | International expansion delayed | Low | UK-only revenue alone supports Series A. |
| R11 | LLM cost spike (model price changes) | Low | Multi-provider abstraction in place; can swap OpenAI ↔ Anthropic ↔ Gemini in < 1 day. |
| R12 | Tighter immigration regime affecting talent | Low | Both co-founders are already UK-resident; first 6 hires all UK-based. |

Full risk register in `DEQUAD_Risk_Register.pdf`.

---

## Page 15 — Decision summary

DEQUAD is a **production-ready, accelerator-validated, bootstrap-credible** UK software business that meets the **innovation**, **viability** and **scalability** criteria for Innovator Founder endorsement.

### Three things this submission demonstrates

1. **Real product, real users** — the MVP is live, has beta users at three universities, and is governed by a DPIA-cleared safeguarding policy that ships before public launch.
2. **Capital efficiency** — the business can survive Year 1 on **£6,000 of founder cash** because of the NatWest Accelerator in-kind support and a 6-month no-salary founder commitment. The pre-seed bridge is conservatively timed for **Dec 2026 (M7)** — immediately after the 3-month Bedfordshire pilot completes (Nov 2026) and conversion conversations open.
3. **Credible UK growth** — 2 to 12 UK jobs in 3 years, 1 to 20 paying universities, operating profit positive Q4 Y3.

### What endorsement enables

- The lead applicant retains UK residency to continue building DEQUAD full-time.
- The co-founder (UK-resident already) joins formally as CTO at incorporation.
- £150k of UK pre-seed capital enters the company in **Dec 2026 (M7)**, unlocking the first 4 UK hires.
- A measurable, defensible improvement in UK student wellbeing infrastructure.

---

### Endorsement Body decision matrix

| Criterion | Evidence in this pack |
|---|---|
| **Innovation** | Sections 2–4 of Business Plan; competitor matrix Page 4; R&D Section Page 12. |
| **Viability** | Production MVP; NatWest Accelerator membership; Y1 monthly cash flow Page 9. |
| **Scalability** | Market sizing Page 5; gross-margin trajectory Page 10; international optionality Page 2. |
| **Genuine UK economic benefit** | Job creation Page 11; UK university wellbeing impact; NHS ICB pilot Y3. |
| **Founder credibility** | Page 7 + CVs in Appendix B and B-2. |
| **Capital sufficiency** | £3k + £31k in-kind + £150k pre-seed funding path Page 8 + 9. |

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
> **None of the team is currently drawing a salary.** Each has accepted an
> EMI share-option grant and is contributing time on a pure-equity basis
> pending the close of the pre-seed round in September Year 1. This is a
> material signal of belief in the mission and materially strengthens the
> leadership profile without adding to cash burn.

---

## N.1 — Dr Gerald Marfo · Chief Marketing Officer

| Field | Value |
|---|---|
| **Role at DEQUAD** | Chief Marketing Officer (founding team member) |
| **Working pattern Y1** | Equity-only — **no Y1 salary**; salaried role to commence after seed close (Q2 Y2) |
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
| **Working pattern Y1** | Equity-only — **no Y1 salary**; salaried role to commence Q1 Y2 |
| **Cash investment** | £0 — joining as senior team member |
| **Equity** | EMI options with 4-year vest, 1-year cliff |

### Summary

Adedapo Ajuwon is a senior software engineer working alongside the CTO on the DEQUAD production stack. He contributes to both backend (FastAPI / MongoDB) and frontend (Expo / React Native universal) development, infrastructure, and operational reliability.

### Responsibilities

- Production reliability and performance of the DEQUAD platform
- Feature delivery in collaboration with the CTO — peer matching, mood tracker, safeguarding webhook, admin tooling
- Code review and engineering standards across the team
- Mentoring the next backend engineer hire (Q1 Y2)

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
