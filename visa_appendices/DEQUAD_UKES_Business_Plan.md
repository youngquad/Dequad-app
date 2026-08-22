# DEQUAD
## Business Plan — UK Innovator Founder Visa
### Endorsement Application to UKES

---

**Entity:** DEQUAD Ltd (Company No. 17405964, incorporated in England & Wales)
**Founders:** **Yusuf Quadri (CEO)** and **Yusuff Adeagbo (CTO)**
**Wider founding team:** Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior Software Engineer), Chinyere Jennifer (Senior Project Management Consultant, advisor)
**Headquarters:** London, United Kingdom — NatWest Accelerator (hosted)
**Trading domain:** dequad.co.uk
**Business start date:** **18 August 2026** (incorporation)
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
| **Working product — fully featured** | Production deployment at dequad.co.uk. Closed beta: **20 verified student accounts at the University of Bedfordshire** (10 daily-active over 6 weeks). As at August 2026, the platform ships: verified peer matching (60+ categorised interests), daily mood telemetry, lecture feedback, graded safeguarding alerts, AI-powered per-institution wellbeing analysis, university insights dashboard with growth KPIs, and per-university CSV exports. Engineering build cost in Y1: **zero** — the MVP and all Y1 features are already built. |
| **Founding team** | **Yusuf Quadri** (CEO — safeguarding professional, MBA with Data Analytics, 2× SU President) + **Yusuff Adeagbo** (CTO — MSc IT with Project Management), supported by **Dr Gerald Marfo** (CMO, PhD Digital Marketing), **Adedapo Ajuwon** (Senior Software Engineer) and **Chinyere Jennifer** (Senior Advisor, MIGSO-PCUBED) — all wider team on equity-only terms. |
| **Two independent validations** | **Santander Universities Pre-Incubator** (completed 2025) and **NatWest Accelerator London** (joined 16 March 2026). Two UK high-street banks independently selected this team through competitive processes. |
| **Pilot conversations under way — nothing signed** | Early-stage conversations with the **University of Bedfordshire** Director of Student Services — the institution whose students the founder represented for two years. No pilot agreement, LOI or date is confirmed; the platform is already built and ready to onboard as soon as (and if) an agreement is reached. |
| **In-kind runway** | NatWest Accelerator provides London office, legal and accountancy support worth **£31,100/yr** in-kind through Y1, reducing DEQUAD's cash overheads. |
| **Self-funded, conservative forecast** | Y1 revenue ~£150 → Y2 ~£16,000 → Y3 ~£48,000, funded entirely by the founders' **£6,000 opening capital** plus revenue generated in the period. **No pre-seed, seed or other external investment is assumed anywhere in this plan.** The base case assumes **zero institutional revenue in Y1** (no pilot is yet signed); one paying university is modelled as a Y2 upside contingent on conversion, rising to c.1.5 by Y3. |
| **UK jobs** | Conservative base case: 2 founders (Y1–Y2, unpaid) → 3 people / c.2.5 FTE by Y3. **Job-creation target:** 5 people (2 founders + 3 full-time hires) once institutional revenue scales via pilot conversion — each of the 3 hires sustained at least 12 months at an average salary of £25,000/year, funded from revenue generated after piloting, meeting the Innovator Founder settlement job-creation criterion. |

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
| **Student (consumer)** | Free core product. Optional **DEQUAD Premium**: advanced match filters, unlimited chats, profile boost. | **£4.99/month** via Stripe (integrated and test-verified; first live revenue expected from M7 from the existing beta cohort, independent of whether any university pilot converts). |

The dual-sided model matters: students adopt because the core product is free and genuinely useful; universities pay because DEQUAD gives their safeguarding teams the early-warning layer regulators now require.

---

## 3. Innovation, Viability and Scalability

### 3.1 Innovation

DEQUAD's innovation claim is not any single feature — every individual element below can be found somewhere in the market. It is the **combination**, shipped as one product, that does not exist anywhere else in the UK today. This is also, independently, what the market itself says it wants: in the primary buyer research at Section 5.2, 9 of 11 university safeguarding and student-services leads interviewed named *identity-verified peer networks* as their single biggest unmet need — not a founder assertion, a validated gap.

1. **Closed-network identity verification.** DEQUAD is the only UK student platform enforcing `.ac.uk` student-domain verification with an explicit student-status attestation, a curated UK-student-domain allow-list, and a human admin review queue for ambiguous accounts — with an OCR-based student-ID check already scoped as the next hardening step (Section 4.1; architecture at Appendix J). Generic social apps cannot retrofit this without abandoning their open-network model; it has to be built in from day one, which is exactly what DEQUAD did.
2. **The verification → connection → telemetry → safeguarding loop.** Each element exists somewhere in the market; the **integrated loop** exists nowhere else. Wellbeing signals are only actionable when tied to a verified identity inside an institution that can respond — which is exactly the configuration DEQUAD ships.
3. **Practitioner-designed safeguarding.** The triage thresholds, referral pathways and escalation policy were authored by a founder who performs statutory-adjacent safeguarding work weekly at Change Grow Live, modelled on UUK Stepchange and Suicide-Safer Universities guidance. Competing products bolt moderation on; DEQUAD is built outward from the safeguarding case-file. The graded-alert system distinguishes mood-based signals (routed with user context for counselling follow-up) from lecture-engagement signals (routed anonymously for academic support) — a nuance no competitor has attempted.
4. **AI-powered per-institution wellbeing intelligence.** The University Insights Dashboard now incorporates a GPT-4o-mini inference layer that reads multi-signal cohort data and generates a structured wellbeing analysis: a 0–100 wellbeing score (colour-coded with trend arrows), a ranked list of key concerns, a list of positive indicators, and prioritised, actionable recommendations — all rendered in human-readable English for safeguarding staff who are not data analysts. This converts a raw-numbers dashboard into a decision-support tool — a capability no university wellbeing platform currently provides.
5. **Compliance as a feature.** Online Safety Act 2023 risk assessment, in-app reporting, UK GDPR DPIA and lawful-basis register shipped **before** first institutional sale — turning the sector's biggest procurement objection into our opening slide. Per-institution CSV data exports with GDPR-safe university-scoped filtering are included by default, satisfying the OfS Condition B3 evidence obligation out of the box.

**Why this is hard to copy, not just hard to imagine.** The feature-by-feature comparison in Section 6 already shows no competitor holding more than two of these ten capabilities at once. The harder question — could Togetherall or TalkCampus simply copy the `.ac.uk` layer? — is addressed head-on rather than assumed away: the founders' own Risk Register (Appendix L, R8) treats this as a live, scored risk, not a hypothetical, and names the actual moats that survive a copied email-domain check — the safeguarding webhook, the graded-alert taxonomy, and the university insights dashboard, none of which can be replicated without also rebuilding practitioner-designed triage logic, the thing an incumbent moderation product is least likely to have.

### 3.2 Viability

- **The product is built and live.** The largest single risk in most early-stage plans — can they ship? — is already retired. dequad.co.uk is in production with 20 verified beta users at the University of Bedfordshire (10 daily-active, 6-week retention window), Stripe billing integrated (test-mode; converting to live on first paid contract), and all safeguarding alert flows exercised end-to-end.
- **The founder does this job professionally.** Safeguarding-first is not a marketing phrase: the CEO manages safeguarding caseloads at Change Grow Live and has NHS mental-health ward experience. This is decisive credibility in university procurement conversations, which are led by safeguarding and student-services professionals.
- **A trusted route into a prospective anchor customer.** Two years as Bedfordshire SU President gives DEQUAD direct, warm relationships with the Director of Student Services, safeguarding leads and senior leadership. A 12-week pilot has been **proposed** for **M4–M6** — this is a target timeline only; no agreement is signed, and the pilot may be delayed, altered or may not proceed.
- **Two independent third-party validations.** Santander Universities Pre-Incubator (completed 2025) and NatWest Accelerator London (admitted 16 March 2026) — both competitive selection processes assessing team and product quality.
- **Proven willingness to pay.** Togetherall and TalkCampus charge UK universities £15k–£60k/yr and hold 100+ UK customers between them, for products missing DEQUAD's verification and triage capabilities.
- **A cash plan that survives scrutiny — and needs no pilot to succeed.** £6,000 founder capital plus £31,100 of NatWest in-kind support delivers positive month-end cash in every month of Y1 (Section 12), with zero founder salary throughout Y1. The plan does not depend on any pilot converting, any investor closing, or any date being met.

### 3.3 Scalability

DEQUAD scales the way a software business is supposed to: revenue grows far faster than cost or headcount, because the product — not additional people — carries the growth.

- **Revenue grows sharply while the core team barely grows at all.** Total revenue rises from a deliberately small £150 in Y1 — reflecting a self-funded, pre-institutional-revenue starting point — to £48,000 by Y3, while the founder-led core team grows from 2 unpaid founders to just 3 people (c.2.5 FTE) over the same period (Section 18). That gap between revenue growth and headcount growth *is* the scalability case, made concrete rather than asserted.
- **Software-only marginal cost.** An incremental student costs ~£0.05/month in hosting; gross margin reaches **87.3%** by Y3.
- **Intra-institution network effects.** Every additional verified student raises the platform's value for every other student at the same university — driving the organic growth that keeps CAC falling (Section 16).
- **Repeatable institutional rollout.** Each new university onboards through a templated 6-week implementation. This 3-year plan conservatively models c.1.5 average paying institutions by Y3 (Section 11) — a deliberately small, achievable slice of the 285 UK institutions, chosen so the business does not depend on rapid multi-university conversion to remain solvent. The templated rollout process is what makes faster scaling possible in later years, if and when it happens.
- **International optionality is architectural, not aspirational.** The `.ac.uk` verification engine (Section 3.1) is built as a configurable domain allow-list, not a hard-coded UK rule — the same mechanism maps directly onto `.edu` (US), `.edu.au` (Australia) and EU academic domains without re-architecting the product, addressing a £180m English-language HE TAM post-Y3. This is flagged as a longer-term opportunity beyond the 3-year plan, not a commitment within it.
- **Team scale plan in place, sequenced to revenue.** Conservative base case: headcount grows 2 (unpaid founders) → 2 → 3 (c.2.5 FTE) across the 3-year forecast, all UK-based. **Job-creation target:** 5 people (2 founders + 3 full-time hires, each sustained 12+ months at an average salary of £25,000/year) once institutional revenue scales via pilot conversion (§10.4) — funded from revenue generated after piloting, meeting the Innovator Founder settlement job-creation criterion.

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
| **Closed beta at the University of Bedfordshire** | **20 verified students** onboarded, 10 daily-active over 6 weeks | Retention, mood-check completion, match-to-chat conversion, escalation false-positive rate | Live product, not prototype |

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

**Conservative base case** — this plan makes **one** funded hire within the 3-year forecast, timed strictly to revenue rather than to any funding round:

| Role | Hire date | Basis | Y3 gross |
|---|---|---|---:|
| Safeguarding & Trust Lead (part-time, ~10 hrs/wk) | Y3 — contingent on 2+ paying universities | Funded entirely by institutional revenue, not investment | £8,000 |

Headcount (conservative base case): **2 (Y1, founders unpaid) → 2 (Y2, founders unpaid) → 3 people / 2.5 FTE (Y3, founders on modest pay + 1 part-time hire)** — all UK-based, entirely self-funded from revenue.

**Job-creation target, upside case (§10.4):** once institutional revenue scales beyond this base case via pilot conversion, headcount grows to **5 people (2 founders + 3 full-time hires)** — see Appendix G for role-by-role detail (Sales Lead, Support Agent, Student Ambassador). Each of the 3 hires is sustained for at least 12 months at an average salary of £25,000/year, funded entirely from revenue generated after piloting, meeting the Innovator Founder settlement job-creation criterion.

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
| Company incorporated | **M1 (18 August 2026)** — ✅ Complete | DEQUAD Ltd (Company No. 17405964) registered at Companies House. |
| Platform feature buildout | **M1–M3** — ✅ Complete | University AI analytics, graded safeguarding alerts, categorised interest matching, per-university data exports all shipped and live. |
| Pilot agreement — **target, not signed** | Proposed for **M4** — academic year start | Nothing is agreed or scheduled. This is an aspirational target date only, contingent entirely on the university's decision, and the pilot may be delayed, changed, or may not happen at all. |
| Pilot delivery (if agreed) | **M4–M6** | Founder-led implementation, if the pilot proceeds; weekly office hours; mid-pilot steering-group review. |
| Review & conversion discussions (if a pilot occurs) | **M7 onwards** | Outcomes readout; commercial conversation opens. No revenue is assumed from Bedfordshire until a formal SaaS contract is signed. |
| Target paid signature (upside case) | **M8–M9** | Target paid SaaS agreement covering the following academic year — no guarantee; not assumed in the Y1 base case (Section 11), modelled only as a Y2 upside. |

The Y1 base-case forecast assumes **zero institutional revenue** — no pilot signed, no conversion. One paying institution is modelled only as a Y2 upside if the Bedfordshire conversation converts; this is a target, not a commitment. No other institutions are in active conversation at the date of this plan.

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| Production MVP live with real beta students — build risk retired. | Cash-light start (£6,000 founder capital, no external investment). |
| CEO is a practising safeguarding professional (CGL + NHS) — unmatched credibility with university safeguarding buyers. | Two-person core team — key-person risk until the first hire (base case) or the three-hire job-creation target (upside case) lands in Y3. |
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
| Accountancy support (PwC alumni network) | £3,600 |
| Banking & business introductions | £2,000 |
| Investor pitch coaching & mentoring | £5,000 |
| Demo day & PR placement | £4,000 |
| **Total in-kind value (Y1)** | **£31,100** |

This support is why £6,000 of founder cash is sufficient: DEQUAD pays no rent, lawyers or accountants in cash during Y1.

### 10.4 Funding — self-funded, no external investment assumed

| Source | Timing | Detail | Amount |
|---|---|---|---:|
| **Founder equity** ✅ | Day 1 (18 August 2026) | Yusuf Quadri (£3,000) + Yusuff Adeagbo (£3,000) — already invested, evidenced by Form SH01 | **£6,000** |

**This £6,000 is the only funding assumed anywhere in this business plan.** The 3-year financial forecast (Sections 11–14) is funded entirely by this founder capital plus revenue generated in the period. No pre-seed, seed, Series A, R&D tax credit or other external investment is assumed, committed, or required for the plan to remain solvent — every table in Sections 11–14 reconciles on that basis alone.

If institutional traction significantly exceeds this conservative forecast — for example, 6+ paying universities converting after the pilot stage — the resulting institutional revenue funds this plan's job-creation target: **3 full-time UK roles, each sustained for at least 12 months at an average salary of £25,000/year**, meeting the Innovator Founder settlement job-creation criterion. This growth is funded entirely from revenue generated after piloting, not external investment, and is not part of the conservative £48,000 Y3 base case reconciled in Sections 11–14 (Appendix F).

### 10.5 Founder Investment Statement (visa requirement)

The lead applicant has personally invested **£3,000** of his own funds as founder share capital, matched by the co-founder's **£3,000**, for total founder share capital of **£6,000**, evidenced by the share allotment return (Form SH01) filed with Companies House at incorporation (Company No. 17405964, 18 August 2026). **No third-party investment exists at the date of this application, and none is assumed anywhere in this plan.** The business is designed to be fully self-funding — from this £6,000 founder equity plus subsequent revenue — across the entire 3-year forecast period, independent of whether any pilot converts or any external funding is later raised.

---

## 11. Revenue and Cost of Sales Forecast

This is a deliberately conservative, self-funded forecast: it assumes **zero institutional revenue in Y1** (no pilot is signed at the date of this plan), rising only if the Bedfordshire conversation converts to a Y2 upside. Institutional conversion is a target, not a commitment. Customer-acquisition numbers: 0 average paying institutions in Y1, 0.5 in Y2 (one pilot converting mid-year, contingent), c.1.5 in Y3; and 5 → 100 → 300 average paying premium students, funded entirely by the £6,000 founder capital plus revenue (Section 12).

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
| Average paying students | 5 | 100 | 300 |
| Price (£/mo) | 4.99 | 4.99 | 4.99 |
| Subtotal | **£150** | **£6,000** | **£18,000** |
| **NHS ICB pilot** | | | |
| Subtotal | **£0** | **£0** | **£0** |
| **Total revenue** | **£150** | **£16,000** | **£48,000** |

_Y1 note: no institutional revenue is assumed — nothing is signed. Premium subscriptions are modelled independently of the Bedfordshire pilot, drawn from the existing 20-person beta cohort and modest organic growth; 5 average paying subscribers is a conservative estimate, not tied to any pilot outcome. Y2 note: 0.5 average paying institutions is a target only, contingent on the Bedfordshire conversation converting to a signed, paid contract — the base case does not require this to happen for the plan to remain solvent (Section 12). Y3 note: 1.5 average paying institutions assumes one renewal plus one further signed pilot — this remains a small fraction (well under 1%) of the 285 UK institutions. No NHS ICB revenue is assumed within this 3-year plan._

### 11.2 Cost of sales

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting | £600 | £1,200 | £2,400 |
| LLM / safeguarding inference (OpenAI API) | £400 | £900 | £1,800 |
| Stripe processing (~5% of B2C revenue at low volume) | £50 | £90 | £180 |
| SMS & email | £150 | £400 | £800 |
| Customer-success tooling | £200 | £500 | £900 |
| **Total cost of sales** | **£1,400** | **£3,100** | **£6,100** |
| **Gross profit** | **(£1,250)** | **£12,900** | **£41,900** |
| **Gross margin %** | n/a — revenue too small to be meaningful | 80.6% | 87.3% |

_Y1 gross profit is negative because minimum viable infrastructure cost (hosting, safeguarding-inference API) exceeds the small Y1 revenue base — normal for a pre-revenue-stage bootstrap and fully absorbed within the £6,000 founder capital (Section 12)._

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (GBP)

No external investment, grant or tax credit is assumed anywhere in this table — the business is funded entirely by the founders' £6,000 opening capital plus revenue generated in each period.

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | 6,000 | 1,470 | 7,770 |
| Cash from sales | 150 | 16,000 | 48,000 |
| **Total receipts** | **150** | **16,000** | **48,000** |
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
| **Net cash movement** | **(4,530)** | **6,300** | **8,200** |
| **Closing cash balance** | **1,470** | **7,770** | **15,970** |

_This is a self-funded plan: it does not require any pilot to convert, any investor to close, or any grant to be awarded to remain solvent. Closing cash stays positive throughout, growing from the £6,000 opening balance to c.£15,970 by the end of Y3 — modest, but achievable and fully within the founders' own control. If institutional revenue is delayed or does not materialise at all, Y1–Y2 costs are scoped to still fit comfortably within the £6,000 founder capital plus modest premium revenue alone (see 12.2)._

### 12.2 Year 1 monthly cash flow — the critical view

The Y1 plan is built to survive on **£6,000 of founder capital alone**, with no institutional revenue and no external funding assumed at any point:

- **M1–M3:** operating burn of ≈£250–£400/month (hosting, tooling, incorporation costs), funded entirely by the £6,000 founder injection. No founder salary drawn. Both founders fund personal living costs from their existing employment income (CEO from Change Grow Live; CTO from freelance engineering). Platform features built and shipped during this period.
- **M4–M6:** if the proposed 12-week Bedfordshire pilot goes ahead, it is planned as **no-fee**, so it generates no institutional cash receipts in this window; if it does not go ahead, costs are unaffected since none were budgeted against it. Burn stays in the same ≈£300–£450/month range.
- **M7–M12:** modest premium-subscription revenue begins from the existing beta cohort as Stripe billing goes live; no founder salary is drawn in Y1 regardless of whether any pilot converts.

Because **no funding round, tax credit or pilot conversion is required** for the plan to work, there is no "funding cliff" and no single point of failure: the business survives the entirety of Y1 on founder capital and organic premium revenue alone, closing the year with roughly **£1,470** in the bank.

---

## 13. Annual Profit & Loss Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | 150 | 16,000 | 48,000 |
| Cost of sales | (1,400) | (3,100) | (6,100) |
| **Gross profit / (loss)** | **(1,250)** | **12,900** | **41,900** |
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
| **EBITDA** | **(3,930)** | **6,900** | **9,900** |
| Depreciation & amortisation | (150) | (400) | (700) |
| **Operating profit / (loss)** | **(4,080)** | **6,500** | **9,200** |
| Corporation tax | 0 | (500) | (1,200) |
| **Profit / (loss) after tax** | **(4,080)** | **6,000** | **8,000** |

This is a self-funded plan: it assumes **no equity investment of any kind** — Y1's small loss is absorbed entirely by the £6,000 founder capital, not by any pre-seed or seed round. Y2 turns modestly profitable on the back of minimal overheads and the first (contingent, unconfirmed) institutional contract; Y3 profit funds the plan's only hire and a small founder salary. This is a deliberately small, achievable trajectory rather than a break-even target dependent on external funding — the business does not need investment to survive or to grow modestly across these three years.

---

## 14. Balance Sheet Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Fixed assets (net) | 450 | 650 | 1,150 |
| Cash at bank | 1,470 | 7,770 | 15,970 |
| Trade receivables | 0 | 500 | 1,500 |
| Stock / inventory | 0 | 0 | 0 |
| **Total assets** | **1,920** | **8,920** | **18,620** |
| Trade payables | 0 | (1,000) | (2,700) |
| **Net assets** | **1,920** | **7,920** | **15,920** |
| Share capital | 6,000 | 6,000 | 6,000 |
| Share premium | 0 | 0 | 0 |
| Profit & loss reserve | (4,080) | 1,920 | 9,920 |
| **Shareholders' funds** | **1,920** | **7,920** | **15,920** |

No share premium exists in any year — there has been no external investment round, consistent with Section 10. Shareholders' funds grow from the £6,000 founder investment (less the small Y1 trading loss) to c.£15,920 by Y3, entirely through trading, not fundraising.

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

### 18.3 Y3 — conservative base case (first modest pay, first hire)

| Role | Y3 gross |
|---|---:|
| Founder A (CEO) — £500/mo | £6,000 |
| Founder B (CTO) — £500/mo | £6,000 |
| Safeguarding & Trust Lead (part-time, ~10 hrs/wk) | £8,000 |
| **Total Y3 gross** | **£20,000** |

Employer NI ~£900 + pension ~£350 + other employment costs ~£250 = **£21,500 total Y3 employment cost**, funded entirely by Y3 revenue (Section 11).

Headcount (conservative base case): **2 unpaid founders (Y1) → 2 unpaid founders (Y2) → 3 people / 2.5 FTE (Y3)** — all UK-based, entirely self-funded from the £48,000 conservative Y3 revenue.

**Job-creation target (upside case, §10.4):** if institutional revenue scales beyond this base case once pilot universities convert (6+ paying universities), the plan's job-creation target is **5 people (2 founders + 3 full-time hires)**, each of the 3 hires sustained at least 12 months at an average salary of £25,000/year — funded entirely from revenue generated after piloting, meeting the Innovator Founder settlement job-creation criterion. This upside is not reconciled in the conservative model below.

### 18.4 Equity

The wider founding team (Section 7.2) hold EMI options on equity-only terms. Option grants for the 3 Y3 hires are TBC.

---

## 19. Appendices

| Ref | Document | File |
|---|---|---|
| A | Founder academic certificates (Yusuf Quadri) | `A_founder_academic_certificates.md` |
| B | **Founder CV — Yusuf Quadri (updated August 2026)** | `B_founder_cv.md` |
| B-2 | Co-Founder CV — Yusuff Adeagbo (CTO) | `B_cofounder_cv.md` |
| C | Personal commitment & undertaking | `C_personal_commitment_undertaking.md` |
| D | Wellbeing baseline methodology | `D_wellbeing_baseline_methodology.md` |
| E | Data Protection Impact Assessment (DPIA) | `E_dpia.md` |
| F | Financial model (annotated) | See Appendix F below |
| G | Job description for the base-case hire, plus the plan's three-hire job-creation target (Year 3) | `G_job_descriptions.md` |
| H | University Letters of Interest (template) | `H_university_letter_of_interest_template.md` |
| I | Online Safety Act 2023 compliance statement | `I_online_safety_act_compliance.md` |
| J | Architecture diagram | `J_architecture_diagram.md` |
| K | Product screenshots | `K_product_screenshots.md` |
| L | Risk Register (UKES) | `DEQUAD_Risk_Register.md` |
| M | Decision-Maker Brief (UKES short track) | `DEQUAD_UKES_Decision_Brief.md` |
| N | Wider Founding Team CVs — Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior SWE), Chinyere Jennifer (Advisor) | `N_wider_team_cvs.md` |
| O | Yusuf Quadri — Safeguarding & Clinical-Awareness Certifications | `O_safeguarding_certifications.md` |

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
| Premium subscribers (avg) | 5 | 100 | 300 |
| Premium ARR (£4.99/mo) | £150 | £6,000 | £18,000 |
| **TOTAL REVENUE** | **£150** | **£16,000** | **£48,000** |

*Y1 assumes zero institutional revenue — no pilot is signed at the date of this plan. Premium revenue is modelled independently of any pilot, from the existing 20-person Bedfordshire beta cohort plus modest organic growth. Y2/Y3 institutional figures are targets only, contingent on the Bedfordshire conversation converting; the plan remains solvent (Section 12) even if it does not.*

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
| **Gross profit / (loss)** | **(£1,250)** | **£12,900** | **£41,900** |
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
| Depreciation & amortisation | £150 | £400 | £700 |
| **Total OPEX** | **£2,830** | **£6,400** | **£32,700** |
| **Operating result** | **(£4,080)** | **£6,500** | **£9,200** |

*Fixed assets capex (£600 / £600 / £1,200) is a balance-sheet item, capitalised and depreciated over its useful life rather than expensed in full — it appears as a cash outflow in the Cash Flow Forecast (§F.4) but not in Total OPEX above, which instead includes the depreciation charge.*

---

## F.4 Annual Cash Flow Forecast

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | £6,000 | £1,470 | £7,770 |
| Cash from sales | £150 | £16,000 | £48,000 |
| **Total receipts** | **£150** | **£16,000** | **£48,000** |
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
| **Net cash movement** | **(£4,530)** | **£6,300** | **£8,200** |
| **Closing cash balance** | **£1,470** | **£7,770** | **£15,970** |

*No pre-seed, seed or R&D tax credit is assumed. Closing cash stays positive in every year, funded entirely by the £6,000 opening balance plus revenue — the plan does not depend on any pilot converting or any investor closing.*

---

## F.5 Funding — self-funded only

| Source | Timing | Amount | Status |
|---|---|---:|---|
| Founder equity injection | M1 | £6,000 | **Delivered — the only funding in this plan** |

No pre-seed, seed, Series A or other external investment is assumed, committed, or required anywhere in this 3-year model. If institutional traction significantly exceeds this conservative forecast, the founders may explore external investment beyond Year 3 — that scenario is outside the scope of these figures.

---

## F.6 Headcount Plan

**Conservative base case** (reconciled against the £48,000 Y3 revenue above):

| Role | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Founders (CEO + CTO) | 2 (unpaid) | 2 (unpaid) | 2 (modest pay) |
| Safeguarding & Trust Lead (part-time) | 0 | 0 | 1 |
| **Total headcount / FTE** | **2 / 0 FTE (unpaid)** | **2 / 0 FTE (unpaid)** | **3 / c.2.5 FTE** |

*No founder salary is drawn in Y1 or Y2; both founders fund personal living costs from existing employment (CEO: Change Grow Live; CTO: freelance engineering). Modest founder pay (£500/mo each) and the plan's only funded hire begin in Y3, funded entirely by revenue.*

**Job-creation target, upside case (§10.4):** once institutional revenue scales beyond this base case via pilot conversion, headcount grows to **5 (2 founders + 3 full-time hires)**, each of the 3 hires sustained at least 12 months at an average salary of £25,000/year — funded entirely from revenue generated after piloting, meeting the Innovator Founder settlement job-creation criterion.

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
2. **Premium pricing:** £4.99/month (£59.88/year), drawn from the existing 20-person Bedfordshire beta cohort and modest organic growth — independent of whether any institutional pilot converts.
3. **No external funding assumed:** the entire 3-year plan is funded by the £6,000 founder capital plus revenue. No pre-seed, seed, grant or R&D tax credit is assumed or required.
4. **Founder living costs:** both founders are employed independently (CEO at Change Grow Live; CTO as a freelance engineer) and draw no salary from DEQUAD until Y3, and only then to the extent revenue supports it.
5. **Pilot uncertainty:** the University of Bedfordshire pilot is an early-stage, informal conversation only. No agreement, LOI or date is signed. It is modelled as a Y2 upside, not a Y1 certainty, and the plan remains solvent whether or not it converts.
6. **No break-even target is set for this 3-year window** — the plan targets modest, growing profitability and a growing cash reserve (Section 13), not a specific break-even date tied to external funding.

---

*End of business plan. All figures are forecasts, not guarantees of future performance. This business plan was written by Yusuf Quadri (Founder & CEO) with Yusuff Adeagbo (Co-Founder & CTO) and is submitted to UKES as part of the UK Innovator Founder visa endorsement process — August 2026 (v5.0, self-funded 3-year revision).*
