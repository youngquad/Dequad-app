# DEQUAD
## Business Plan — UK Innovator Founder Endorsement
### Submitted to UK Endorsing Services (UKES)

---

| | |
|---|---|
| **Company** | DEQUAD Ltd — Company No. 17405964, incorporated in England & Wales on 18 August 2026 |
| **Lead applicant** | Yusuf Quadri — Founder & Chief Executive Officer |
| **Co-founder** | Yusuff Adeagbo — Co-founder & Chief Technology Officer |
| **Wider founding team** | Dr Gerald Marfo (CMO) · Adedapo Ajuwon (Senior Software Engineer) · Chinyere Jennifer (Senior Advisor, Programme Delivery) |
| **Base** | London — NatWest Accelerator (London hub) |
| **Product** | Live in production at **dequad.co.uk** (web), Android and iOS |
| **Funding** | £14,000 total: £3,000 founders' capital, £3,000 friends & family equity, £8,000 strategic equity from a Nigerian company |
| **Financial year** | 1 September – 31 August (aligned to the UK academic year). Year 1 = FY27 (Sep 2026 – Aug 2027) |
| **Contact** | quadri.yusuf@dequad.com · 07928 132617 · linkedin.com/in/quadri-yusuf |
| **Version** | 6.0 — October 2026 (supersedes v5.0, August 2026) |

---

## Contents

1. Executive Summary
2. Products and Services
3. Innovation, Viability and Scalability
4. Research and Development
5. Market Analysis
6. Competitor Analysis
7. Staff Profile and Recruitment Strategy
8. Marketing and Sales Strategy
9. SWOT Analysis
10. Investment Strategy and Funding Requirement
11. Revenue and Cost of Sales Forecast (incl. customer acquisition)
12. Cash Flow Forecast
13. Profit & Loss Forecast
14. Balance Sheet Forecast
15. Forecasted Stock Levels
16. Forecasted Advertising and Marketing Expenditure
17. Forecasted Fixed Asset Schedule
18. Forecasted Staff Costs
19. Appendices (including CVs)

---

## 1. Executive Summary

### The business in one sentence

**DEQUAD is a UK software platform that connects university students with verified peers, measures their wellbeing day by day, and gives their university an early, privacy-safe warning when a student or a cohort is heading towards crisis.** Students use it for free; universities pay for it.

### The problem

Loneliness and poor mental health are among the biggest reasons UK students under-perform or drop out, and universities have very few tools that detect either early.

- More than one in four higher-education students in England (**26%**) reported feeling lonely "often or always" — over three times the rate for adults generally (8%) (ONS, Student Covid Insights Survey, 2021). Nearly one in four (**23%**) report feeling lonely "all" or "most" of the time even after the pandemic (Advance HE / HEPI Student Academic Experience Survey, 2022).
- University support services are reactive. They find out about a student in difficulty when the student asks for help, or when something has already gone wrong.
- Students who look for connection outside university-run services use open social apps or unmoderated group chats. These are not identity-verified, have no safeguarding, and are invisible to the university.

### The solution

DEQUAD closes a loop that no other UK product closes:

> **verified student identity → genuine peer connection → daily wellbeing signal → graded safeguarding alert → institutional action**

A student signs up with a UK university (`.ac.uk`) email address, is verified, and meets other verified students by shared interests. A 30-second daily mood check-in builds a personal wellbeing trend. When the platform detects warning signs, such as a run of very low mood, crisis language in chat, or falling engagement, it raises a graded alert to a trained human reviewer and, where the student's university is a partner, to that university's safeguarding team. Universities get an anonymised cohort dashboard and an AI-written wellbeing analysis that tells non-specialist staff, in plain English, where to act.

### Why this team

The lead founder, **Yusuf Quadri**, is a practising safeguarding professional. He is a Recovery Coordinator at Change Grow Live, where he makes safeguarding referrals and dynamic risk assessments every week. He is also a Clinical Support Worker at East London NHS Foundation Trust. He served **two terms as President of the University of Bedfordshire Students' Union (2021–23)**, representing more than 10,000 students and overseeing a £900,000 budget. DEQUAD's escalation design comes from a practitioner, not a textbook. The CTO, **Yusuff Adeagbo** (MSc IT with Project Management), leads engineering. Three senior specialists are contributing on equity-only terms: a PhD digital marketer (CMO), a senior full-stack engineer, and a senior programme-delivery consultant.

### Where the business is today (October 2026)

| Evidence | Status |
|---|---|
| Product | **Built and live.** Web, Android and iOS. The live product includes verified matching, chat, daily mood tracking, lecture feedback, graded safeguarding alerts, admin verification queue, university dashboard, AI cohort analysis, CSV exports, Stripe and in-app billing, and partner-university licence management. |
| Company | DEQUAD Ltd incorporated 18 August 2026. Funding of £14,000 committed: £3,000 founders' capital, £3,000 from friends and family, and £8,000 from a Nigerian company investor. |
| Third-party validation | Santander Universities Pre-Incubator (completed 2025); NatWest Accelerator, London (joined 16 March 2026). |
| Users | Closed beta with verified University of Bedfordshire students. |
| Commercial pipeline | **Conversations with the University of Bedfordshire about a pilot are ongoing.** No pilot agreement is signed yet. The base case assumes no institutional revenue at all in Year 1. |

### The financial plan at a glance

The plan is funded by **£14,000 of equity**: £3,000 from the founders, £3,000 from friends and family, and £8,000 from a strategic investor, a Nigerian company. Together with the in-kind support of the NatWest Accelerator and revenue earned along the way, this funds every month of the forecast. No loans, grants, tax credits or further investment are assumed. Cash stays positive in every one of the 36 months. The lowest month-end balance is {{MIN_CASH}} ({{MIN_CASH_MONTH}}).

{{TABLE_HEADLINE}}

The base case is deliberately cautious: one paying university in Year 2 and three by the end of Year 3. That is about 1% of UK higher-education providers. A **growth case** (Section 10.5), also fully reconciled, shows what happens if seven universities and one NHS Integrated Care Board sign by the end of Year 3. In that case DEQUAD creates **three full-time UK jobs at £25,000 a year plus a part-time safeguarding role**, pays both founders, and still ends Year 3 with {{G_CASH_Y3}} in the bank.

---

## 2. Products and Services

### 2.1 The platform

DEQUAD is a single codebase serving web (dequad.co.uk), Android and iOS (Expo / React Native), backed by a Python FastAPI service and MongoDB. It is built from five modules.

| Module | What it does | Why it matters |
|---|---|---|
| **1. Verified access** | Sign-up is restricted to UK university email domains. A policy engine classifies each address: known student sub-domains are approved automatically, staff and alumni patterns are rejected, and ambiguous domains need a student attestation plus review in an admin verification queue. Email one-time-passcode verification and rate-limited login protect accounts. | Everyone a student meets is a real, verified UK student. Our own research says this is the single biggest reason students would trust a friendship app, and it is the foundation for any safeguarding that names an individual. |
| **2. Connect (peer matching and chat)** | Interest-based discovery across 60+ interests in 6 categories, with distance and preference filters, mutual-like matching, AI-suggested icebreakers and in-app chat. Report-a-profile, a hate-speech and profanity filter and crisis-keyword scanning run across bios, chat and support messages. | It addresses loneliness directly by helping students form friendships and study groups, inside a moderated, compliant space. |
| **3. Wellbeing tracking** | A 30-second daily mood check-in, with an evening push reminder, plus lecture feedback. Students see their own trends over time. | It turns wellbeing from a one-off survey into a continuous signal that can show deterioration early. |
| **4. Safeguarding engine** | Graded alerts: (a) crisis language detected in chat or support, (b) low-mood streaks (mood ≤ 3 for three or more consecutive days), (c) falling lecture engagement, routed anonymously for academic support. Every automated flag goes to human review. Students always see crisis routes (Samaritans, 999, university support). | It is a proactive safety net designed by a practising safeguarding professional, with a human always making the final decision. |
| **5. University Insights** | An anonymised cohort dashboard (mood trends, engagement, growth and retention KPIs), an AI-generated wellbeing analysis (score, key concerns, positive indicators, prioritised recommendations), per-university CSV exports, and licence management that unlocks full access for every student at a partner university. | It gives student-services teams evidence to act on and to report against their mental-health and harassment obligations, without exposing individual data. |

### 2.2 How DEQUAD makes money

The business model is **freemium for students, paid for by institutions**. The pricing ladder below is already live in the product's billing code.

| Tier | Customer | What they get | Price |
|---|---|---|---|
| **DEQUAD Free** | Any verified UK student | Connect: discovery, 3 likes a week, matching, chat, Likes You | Free |
| **DEQUAD Premium** | Individual students | Mood tracking, lecture feedback, discovery filters, unlimited likes | **£4.99/month** (Stripe on web; App Store and Google Play in-app) |
| **Insights Starter** | Students' unions, academic departments, colleges, smaller providers | Self-serve university dashboard, anonymised insights, safeguarding alert reporting | **£49.99/month**, card billing via Stripe, cancel any time |
| **Partner-University Licence** | Universities | Full Premium access for **every** student on the university's domain(s), university dashboard, AI cohort analysis, safeguarding alert routing to the university's team, CSV exports, onboarding and a named success contact | **£2.00 per enrolled student per year** (a 10,000-student university pays £20,000), invoiced annually in advance |
| **NHS ICB partnership** *(growth case only)* | Integrated Care Boards | Population-level, anonymised student wellbeing data and a joint referral pathway | From £20,000/year |

**Why this structure works.** Students adopt DEQUAD because the social product is free and useful. The wellbeing features are what universities want their students to use, so a university licence "unlocks" them for its whole student body. That gives the university a reason to buy and DEQUAD a growing, verified user base to sell to. The Starter tier is a low-friction way in: a students' union or a single department can start for less than £600 a year on a credit card, then grow into a full licence.

---

## 3. Innovation, Viability and Scalability

### 3.1 Innovation

DEQUAD is not a new feature added to an existing app. It is a new combination of capabilities that, as far as our competitor research shows (Section 6), no UK product currently offers together.

1. **Closed, verified student network.** Generic social apps are open by design and cannot add strict university-domain verification without breaking their own growth model. Peer-support incumbents are anonymous by design, so they cannot identify a student at risk. DEQUAD was built from the start around verified identity, with a domain policy engine, student attestation and a human verification queue.
2. **The integrated loop.** Connection data, daily mood and engagement signals are combined for the same verified individual, inside an institution that can act. Each piece exists somewhere in the market; the joined-up loop does not.
3. **Practitioner-designed, graded safeguarding.** Alert thresholds and routes reflect real safeguarding practice. Mood-based concerns go to welfare follow-up. Engagement-based concerns go anonymously to academic support. Crisis language is escalated straight to human review. This separation, and the human-in-the-loop design, are deliberate safety choices.
4. **Decision support, not just dashboards.** A large-language-model layer reads multi-signal cohort data and returns a structured, plain-English analysis (a wellbeing score, the top concerns, positive indicators and prioritised actions) for staff who are not data analysts.
5. **Compliance built in from day one.** We drafted an Online Safety Act 2023 risk assessment, in-app reporting, a UK GDPR Data Protection Impact Assessment and per-institution data scoping before the first sale. This answers a major procurement objection before a buyer raises it.

**Defensibility.** A competitor could copy an email-domain check in weeks. It would be much harder to copy the safeguarding taxonomy, the human-review operating model, institutional trust and the longitudinal wellbeing data that builds up at each partner university. Over time, the verified network at each university also becomes more valuable to every student who joins it.

### 3.2 Viability

- **The build risk is already retired.** The product is live on web, Android and iOS, with billing, safeguarding and university tooling in production. Year 1 needs no development spend beyond hosting and tools.
- **The founder is the customer's peer.** University buyers are student-services and safeguarding professionals. The CEO does safeguarding work professionally and has led a students' union. He can talk to buyers in their own language, and he has existing relationships at the University of Bedfordshire, with whom pilot conversations are ongoing.
- **The cost base is very lean.** Year 1 cash costs are about £400 a month. NatWest Accelerator support (office, legal and accountancy, in kind until March 2027) and founders who take no pay in Years 1–2 mean the £14,000 of equity funding is more than enough to reach the first institutional revenue, with a cash reserve to spare.
- **Viability does not depend on a single deal.** Section 12.3 shows that even if **no university licence is ever signed**, the company stays solvent for all three years on Premium and Starter revenue, with costs held at Year 1 levels (Year 3 revenue {{DOWN_REV_Y3}}; closing cash {{DOWN_CASH_Y3}}). Founders' pay and the first hire are the things that would wait.
- **Willingness to pay is already proven.** UK universities already buy digital student-support services. Togetherall alone reports more than 200 education-institution partners, and UniBuddy has a large UK university client base. Universities have budgets for this kind of product; DEQUAD offers a more complete one.
- **The founders are committed, and others are backing them.** The founders have put £3,000 of their own money into the company and signed commitment undertakings (Appendix C). Friends and family (£3,000) and a Nigerian company (£8,000) have also chosen to invest.

### 3.3 Scalability

- **Software economics.** An extra student costs DEQUAD pennies a month in hosting and AI inference. Gross margin rises to **{{GM_Y3}} in Year 3**. Revenue rises from {{REV_Y1}} to {{REV_Y3}} over three years in the base case, while the team grows by only one part-time role.
- **A repeatable route into universities.** Each licence follows the same path: an unpaid pilot or Starter subscription, then a 6-week onboarding, then an annual licence. The licence-management tooling that adds a university's domains and unlocks every one of its students is already built. Adding a university is a configuration job, not an engineering project.
- **Network effects within each campus.** Every new verified student makes DEQUAD more useful to every other student at the same university. That drives organic sign-ups and lowers acquisition cost (Section 16).
- **National scale.** The UK has 2.9 million higher-education students (HESA 2023/24) at about 285 providers. The growth case needs only 7 of them to sign within three years.
- **International scale.** The verification engine is a configurable domain allow-list, not a rule hard-coded to `.ac.uk`. The same mechanism works for `.edu` (US), `.edu.au` (Australia) and European academic domains. We see international expansion as a post-Year-3 opportunity, not part of this forecast.
- **Job creation.** The base case grows from 2 unpaid founders to a paid team of {{HC_END}} ({{FTE_END}} FTE) by the end of Year 3. The growth case reaches **{{G_PEAK_HC}} people**: both founders paid, three full-time hires at £25,000 a year, and a part-time Safeguarding & Trust Lead. All of these roles are UK-based and funded from revenue.

---

## 4. Research and Development

R&D is at the heart of DEQUAD's innovation. The two technical assets that make the product hard to copy, the **verification engine** and the **safeguarding inference pipeline**, are original engineering by the founding team. R&D in Years 1–2 is done by the founders without pay. No SME R&D tax relief is assumed in the forecasts; the company will review eligibility with its accountant once qualifying PAYE costs exist (from Year 3).

### 4.1 R&D completed to date

| Work-stream | What was built | Status |
|---|---|---|
| Verification engine | UK student-email policy engine (approves known student sub-domains, rejects staff and alumni, flags ambiguous domains), student attestation, admin verification queue with audit trail, email one-time passcode, login lockout | **Live** |
| Safeguarding pipeline | Crisis-keyword and hate-speech filters across user-generated text; low-mood-streak detector; low-engagement alert channel; safeguarding alert dashboard with risk grading; alert-feedback loop that lets reviewers mark false positives | **Live** |
| AI cohort intelligence | Per-institution wellbeing analysis (structured LLM output: score, concerns, positive indicators, recommendations), streaming AI insight summaries, AI bio-writing help and icebreakers | **Live** |
| Entitlements and licensing | Freemium paywall; partner-university licences with domain matching (e.g. `beds.ac.uk` also covers `student.beds.ac.uk`), start and end dates, and enforcement at the API level | **Live** (built Sep–Oct 2026) |
| Security hardening | bcrypt password hashing, rate limiting, security headers, removal of personal data from API responses, chat safeguarding scanning | **Live** |

### 4.2 R&D roadmap (funded from operating cash; founder time in Years 1–2)

| Quarter | Objective | Measure of success |
|---|---|---|
| Y1 Q2–Q3 | **Pilot-grade evaluation of alert precision.** Measure false-positive and false-negative rates of the low-mood and crisis-language detectors against human-reviewer decisions during the proposed pilot (method in Appendix D). | Reviewer agreement ≥ 80%; every high-risk flag reviewed within 1 hour in service hours |
| Y1 Q3 | **Student-ID document check** with on-device redaction, for universities whose email domains cannot tell students from staff | Verification-queue manual workload down 50% |
| Y1 Q4 | **Microsoft 365 / Azure AD sign-in** (most UK universities use it) | Single sign-on live for the first partner |
| Y2 | **Personal baseline model.** Move from fixed thresholds to deviation from each student's own baseline (mood, sleep, engagement), reducing alerts for students whose "normal" is simply lower | False positives down ≥ 30% compared with fixed thresholds, with no fall in sensitivity |
| Y2 | **Safeguarding webhook and adapter library** to send graded alerts into universities' own case-management systems | Integrated with the first two partners |
| Y3 | **Privacy-preserving institutional analytics**: hash-based de-identification and minimum cohort sizes, so nobody can be re-identified from university reports | Independent DPIA review signed off |

**Governance.** Every model output that affects a student goes to a human reviewer. The CEO owns the safeguarding policy. A clinical and safeguarding advisory panel will be formed in Year 2 (Section 9).

---

## 5. Market Analysis

### 5.1 Market definition

DEQUAD sells into the **UK higher-education student-wellbeing and engagement software** market. Its users are students, and its buyers are university student-services, wellbeing and safeguarding teams, and in time NHS Integrated Care Boards.

| Indicator | Figure | Source |
|---|---|---|
| Students at UK higher-education providers | **2,904,425** (2023/24) | HESA, *Higher Education Student Statistics: UK 2023/24* |
| New entrants each year | ~1.32 million | HESA 2023/24 |
| UK higher-education providers | c.285 universities and HE colleges | HESA / Universities UK |
| Students feeling lonely "often or always" | 26%, compared with 8% of all adults | ONS Student Covid Insights Survey, 2021 |
| Students lonely "all or most of the time" | 23% | Advance HE / HEPI Student Academic Experience Survey, 2022 |

### 5.2 Market size

| Tier | Definition | Basis | Annual value |
|---|---|---|---|
| **TAM** | Every UK HE student covered by a licence at £2/year, plus a 1% Premium take-up among students not covered | 2.9m × £2 + (1% × 2.9m × £59.88) | **c.£7.5m** |
| **SAM** | Universities with 10,000+ students (where a dedicated wellbeing platform is most likely to be bought): about 100 providers, about 2.0m students | 2.0m × £2 + Premium share | **c.£5m** |
| **SOM (Year 3, base case)** | 3 partner licences + 11 Starter subscriptions + Premium | Section 11 | **{{REV_Y3}}** (c.1% of SAM) |

The headline per-student price is deliberately low so that the buying decision sits within a Director of Student Services' delegated budget authority. The larger long-term prize is adjacent: NHS ICB data partnerships, further-education colleges, and English-speaking international markets with the same domain-based verification. None of these is in the base-case forecast.

### 5.3 Market drivers

1. **Policy pressure on student mental health.** The Department for Education has called on all universities to join the University Mental Health Charter Programme, and the Higher Education Mental Health Implementation Taskforce has pushed institutions towards earlier identification of students at risk and better data sharing. Universities are expected to show **prevention**, not just reaction.
2. **OfS condition E6 (harassment and sexual misconduct).** In force from 1 August 2025, it requires English providers to take steps to prevent and respond to harassment, including in online spaces they facilitate. DEQUAD's reporting, language filtering and audit trail help evidence this.
3. **Online Safety Act 2023.** Ofcom's illegal-harms and children's-safety duties are now being enforced. Informal student group chats and open apps leave universities exposed to unmanaged risk; a compliant, moderated, verified space reduces it.
4. **Budget constraint.** Universities are under financial pressure. Low-cost, per-student SaaS that reduces counselling demand and improves retention is easier to justify than more staff. Our price is set for this environment.

### 5.4 Customer research

The founders have run structured discovery with students and university staff since 2024, through the Santander Pre-Incubator and NatWest Accelerator programmes and the CEO's students'-union network. This included student interviews and a student survey, conversations with student-services and safeguarding staff, and the closed beta at the University of Bedfordshire. Notes and survey records are kept on file and are available to UKES on request. The research produced five findings that shaped the product:

1. **Trust is the barrier to connection.** Students want more friends at university, but they are wary of open apps. "Everyone is a verified student at a real UK university" was the strongest reason students gave for being willing to try a friendship app.
2. **Price sensitivity.** Students see about £5 a month as the ceiling for optional premium features. This set the £4.99 Premium price.
3. **University buyers ask about safeguarding first.** Staff asked "what happens when a student is at risk?" before asking about engagement. So safeguarding is the core product, not an add-on.
4. **Named-individual escalation is the gap.** Anonymous peer-support tools cannot let a university act on a specific student at risk. Verified identity, with student consent and a clear lawful basis, can.
5. **Small contracts move quickly.** Pilots and contracts below formal tender thresholds can usually be approved within student services. This is why the plan uses unpaid pilots and a low-cost Starter tier as the way in.

---

## 6. Competitor Analysis

We compared DEQUAD with six alternatives that UK students or universities use today. They fall into three groups: institutional peer support (Togetherall, TalkCampus), institutional engagement (UniBuddy), youth mental-health services (Kooth / Qwell), and consumer social tools (Bumble For Friends, Discord and WhatsApp groups).

### 6.1 Competitor profiles

| # | Competitor | What it is | Business model | Strengths | Weaknesses compared with DEQUAD |
|---|---|---|---|---|---|
| 1 | **Togetherall** | Anonymous, clinically moderated online peer-support community with self-help courses | Institutional licence; reports 200+ education-institution partners | Strong clinical brand; 24/7 moderation; well-established with UK universities | Anonymous by design, so it cannot escalate a named student; no peer matching to build real-world friendships; no daily wellbeing telemetry |
| 2 | **TalkCampus** | Global peer-support app for students, with moderated conversations | Institutional licence | Large international student community; available 24/7 | Not limited to verified students at one university; no institutional early-warning dashboard tied to verified identity; focused on support rather than connection |
| 3 | **UniBuddy** | Peer-to-peer chat platform used mainly for student recruitment and onboarding | Institutional SaaS licence | Large UK client base; proves universities buy student-engagement SaaS | Built for recruitment and transition, not for wellbeing; no mood tracking or safeguarding layer |
| 4 | **Kooth / Qwell** | Digital mental-health services with counselling and community | Commissioned by NHS and local authorities; some institutional contracts | Clinical services and practitioners; NHS commissioning relationships | A clinical service rather than prevention through peer connection; not built around a verified university network; higher cost to commission |
| 5 | **Bumble For Friends (BFF)** | Consumer friendship-matching app | Free plus paid tiers | Large user base; polished matching experience | Not student-verified; no university partnership; no wellbeing or safeguarding; generates no institutional value |
| 6 | **Discord / WhatsApp / Instagram groups** | Informal student communities and group chats | Free | Students already use them; no friction | Unmoderated, unverified and invisible to the university; a growing Online Safety Act and E6 risk; no early warning |

### 6.2 Feature and benefit comparison

| Capability | **DEQUAD** | Togetherall | TalkCampus | UniBuddy | Kooth/Qwell | Bumble BFF | Discord/groups |
|---|---|---|---|---|---|---|---|
| Verified students only (university email) | ✅ | ❌ | ❌ | Partial | ❌ | ❌ | ❌ |
| Peer matching for real friendships | ✅ | ❌ | ❌ | Partial | ❌ | ✅ | Partial |
| Daily mood / wellbeing tracking | ✅ | Partial | Partial | ❌ | Partial | ❌ | ❌ |
| Graded safeguarding alerts with human review | ✅ | Partial (moderation) | Partial (moderation) | ❌ | ✅ (clinical) | ❌ | ❌ |
| Alerts routed to the student's university | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Anonymised university cohort dashboard | ✅ | ✅ | Partial | ✅ (engagement) | Partial | ❌ | ❌ |
| AI plain-English cohort analysis | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Free core product for students | ✅ | ✅ (if licensed) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Self-serve entry tier (under £600/year) | ✅ | ❌ | ❌ | ❌ | ❌ | n/a | n/a |
| Online Safety Act risk assessment and reporting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Partial |

*Comparison based on each competitor's public materials, reviewed October 2026. "Partial" means the capability exists in a limited or different form.*

### 6.3 Where DEQUAD wins, and where it does not

- **DEQUAD wins** where a university wants **prevention**: students who are not yet asking for help, but whose isolation and falling mood can be seen early, inside a space the university can stand behind.
- **Togetherall and Kooth win** where a university needs **clinical** support and 24/7 moderated services. DEQUAD does not compete with them on clinical care. We position DEQUAD as complementary: our alerts and signposting send students towards the university's existing clinical and counselling partners.
- **Price.** At £2 per student, DEQUAD is designed to cost less per student than established institutional platforms. For a mid-sized university, the decision can sit within a Director of Student Services' budget authority.

---

## 7. Staff Profile and Recruitment Strategy

### 7.1 Founders

| Role | Name | Background | Responsibilities |
|---|---|---|---|
| **Founder & CEO** | **Yusuf Quadri** | Recovery Coordinator, Change Grow Live (safeguarding referrals, risk assessment, multi-agency work); Clinical Support Worker, East London NHS FT; 2× President, University of Bedfordshire SU (2021–23, 10,000+ students, £900k budget); MBA with Data Analytics; MSc and BSc in International Relations; seven safeguarding and clinical-awareness certifications (Appendix O); B2B business development experience | Strategy, university sales and partnerships, safeguarding policy and review, product direction, finance, compliance |
| **Co-founder & CTO** | **Yusuff Adeagbo** | MSc Information Technology with Project Management (University of the West of Scotland); HND Computer Science; full-stack development, UI/UX, IT business analysis | Engineering, infrastructure, security, data protection by design, app-store releases, R&D roadmap |

**How the founders support themselves.** Neither founder draws a salary in Years 1–2. Both meet their personal living costs from existing professional income and savings until DEQUAD can pay them (from Year 3 in the base case). DEQUAD is their main business focus and the reason for this application. Founder pay is the first cost to grow as revenue grows (Section 18).

### 7.2 Wider founding team (equity-only)

| Role | Name | Contribution |
|---|---|---|
| Chief Marketing Officer | **Dr Gerald Marfo** (PhD, Digital Marketing) | Brand, two-sided go-to-market, measurement framework (cost per sign-up, conversion), campus campaigns |
| Senior Software Engineer | **Adedapo Ajuwon** | Additional full-stack engineering capacity, code review and release quality |
| Senior Advisor, Programme Delivery | **Chinyere Jennifer** (Senior Project Management Consultant, MIGSO-PCUBED) | Pilot governance, implementation planning, university onboarding playbook |

These team members hold EMI share options (4-year vesting, 1-year cliff). No salary is assumed for them in any scenario in this plan. CVs are at Appendix N.

### 7.3 Hiring plan

| Role | Base case | Growth case | Salary | Funded by |
|---|---|---|---|---|
| Founders (CEO and CTO) | Paid from Sep 2028 | Paid from Sep 2028 | £10,000 each (base); £20,000 each (growth) | Revenue |
| Safeguarding & Trust Lead (part-time, about 10 hours a week) | Sep 2028 | Sep 2028 | £8,000 | Licence revenue |
| Sales Lead (full-time) | — | Sep 2028 | £25,000 | Licence revenue |
| Support Agent (full-time) | — | Oct 2028 | £25,000 | Licence revenue |
| Student Ambassador (full-time) | — | Oct 2028 | £25,000 | Licence revenue |

Full job descriptions are at Appendix G. Every role is UK-based and paid through PAYE.

**Hiring gate.** The founders will only make a paid hire when cash at bank, plus licence income already contracted for the next 12 months, covers the new role's fully loaded cost for 12 months on top of all existing commitments. This is how the plan keeps job creation and cash safety in step.

### 7.4 Recruitment strategy

- **Channels.** Safeguarding roles: CharityJob, the AMOSSHE network, and NHS and charity networks. Sales and support: Otta, LinkedIn and the NatWest Accelerator alumni network. Student Ambassador: partner-university careers services and students'-union networks.
- **Safe recruitment.** Every role needs an enhanced DBS check, two references and DEQUAD's safeguarding induction, in line with Keeping Children Safe in Education and adult-safeguarding good practice. Some university users are under 18.
- **Fair process.** Every role is advertised openly for at least 14 days, with the salary published. CVs are shortlisted blind, and interviews are structured and scored.
- **Retention.** EMI options for all permanent staff, flexible and hybrid working, and protected time for training and reflective supervision for safeguarding staff.

---

## 8. Marketing and Sales Strategy

### 8.1 Positioning

> **"The verified student network that helps universities see loneliness early, before it becomes a crisis."**

| Audience | Core message | Proof point |
|---|---|---|
| Students | "Meet real students at your uni. Verified, safe, free." | `.ac.uk` verification; free Connect |
| Universities | "See wellbeing risk early. Act on evidence, not guesswork." | Graded alerts, AI cohort analysis, dashboard |
| Students' unions and departments | "Start this week for £49.99 a month." | Self-serve Starter tier |

### 8.2 Go-to-market: "land, prove, expand"

| Stage | What happens | Target timing (base case) |
|---|---|---|
| **1. Land (students)** | Ambassador-led launch at the University of Bedfordshire; freshers' and January welcome-week activity; social content made by students | Sep 2026 onwards |
| **2. Land (institution)** | Unpaid 12-week pilot with the University of Bedfordshire (conversations ongoing), plus Starter subscriptions sold to students' unions and departments | Pilot targeted for Jan–Mar 2027 (**not yet signed**); first Starter subscription Apr 2027 |
| **3. Prove** | Pilot readout: sign-ups, active use, mood-check completion, alert precision and staff feedback (method in Appendix D) | Apr–May 2027 |
| **4. Convert** | Annual licence for academic year 2027/28, invoiced in advance | First licence term from Oct 2027 (contingent) |
| **5. Expand** | Case study and referral used to win further universities; Starter customers upgraded to licences | 2 further licences in Year 3 (Sep 2028 and Mar 2029) |

### 8.3 Student acquisition

- **Student ambassadors.** Paid in referral rewards and vouchers; one per campus.
- **Campus moments.** Freshers' and January welcome weeks, society fairs and SU events. Sign-ups follow the academic calendar: about 30% fall in Sep–Oct and about 12% in January (see Section 11.1).
- **In-product virality.** Free Connect, mutual-match notifications and invite links. Each new verified student makes the network more useful to everyone else at the same university.
- **Content.** Instagram and TikTok content made by and for students; search-optimised guides on making friends at university.

### 8.4 Institutional sales

- **Founder-led selling** in Years 1–2, using the CEO's safeguarding credibility and students'-union network, and introductions from the NatWest Accelerator.
- **Sector presence.** AMOSSHE (the student-services organisation) events, Universities UK and Wonkhe events, and a DEQUAD safeguarding white paper.
- **Sales assets.** Pilot evaluation report, DPIA pack, OSA statement, security summary (Cyber Essentials from Year 1) and a standard licence agreement reviewed by solicitors.
- **Sales-cycle assumption.** 3–6 months from first meeting to contract for sub-threshold contracts, aligned to academic-year budgets.

### 8.5 Sales and marketing KPIs

| KPI | Y1 target | Y2 target | Y3 target |
|---|---|---|---|
| Verified students (year end) | {{REG_Y1}} | {{REG_Y2}} | {{REG_Y3}} |
| Premium subscribers (year end) | {{PREM_END_Y1}} | {{PREM_END_Y2}} | {{PREM_END_Y3}} |
| Insights Starter subscriptions (year end) | {{STARTER_END_Y1}} | {{STARTER_END_Y2}} | {{STARTER_END_Y3}} |
| Partner-university licences (year end) | {{LIC_END_Y1}} | {{LIC_END_Y2}} | {{LIC_END_Y3}} |
| Students covered by licences | {{LICSTUD_END_Y1}} | {{LICSTUD_END_Y2}} | {{LICSTUD_END_Y3}} |

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| Live, full-featured product on web, Android and iOS, so build risk is retired | Small funding base (£14,000) for a two-sided market |
| A CEO who practises safeguarding and has led a students' union: strong credibility with buyers | Bedfordshire pilot still under discussion; no signed pilot, letter of intent or paying institution yet |
| A distinctive integrated loop: verification, connection, wellbeing, safeguarding | Two-founder core team, so key-person risk until Year 3 |
| Freemium model with a self-serve paid entry tier, already live in billing | Founders are unpaid in Years 1–2 and have other commitments |
| Lean cost base; NatWest in-kind support until March 2027 | No clinical advisory panel yet (planned for Year 2) |
| Compliance work done before sale (OSA risk assessment, DPIA) | Limited brand awareness outside Bedfordshire |
| **Opportunities** | **Threats** |
| Policy pressure on prevention (Mental Health Charter, Taskforce, OfS E6) | Incumbents (Togetherall, TalkCampus, UniBuddy) add verification or matching |
| 2.9m students and c.285 providers; low price fits tight budgets | University budget cuts delay purchasing decisions |
| NHS ICB partnerships for population-level student data | A mishandled safeguarding incident damages trust |
| Further-education colleges and international `.edu` markets | Cost-of-living pressure lowers Premium take-up |
| SME R&D tax relief once qualifying costs exist | Changes to AI-provider pricing or regulation |

### 9.1 How we respond to the main risks

| Risk | Mitigation |
|---|---|
| No pilot or licence converts | The plan stays solvent without any licence (Section 12.3); Starter and Premium give revenue from other sources; the pipeline is widened to other universities through the NatWest and SU networks from Year 1 Q3 |
| Safeguarding incident | Human review of every high-risk flag; crisis routes always visible in the app; incident playbook written by the CEO; professional indemnity and cyber insurance from Month 1; clinical advisory panel in Year 2 |
| Data breach | Data minimised and identity separated from mood data; encryption; Cyber Essentials in Year 1; DPIA reviewed annually |
| Competitive copying | Move fast on the university relationships and longitudinal data that cannot be copied; position DEQUAD as complementary to clinical incumbents |
| Founder capacity | Founder pay starts in Year 3; the first hire takes over safeguarding review; the wider team adds equity-only capacity |

The full scored risk register is at Appendix L.

---

## 10. Investment Strategy and Funding Requirement

### 10.1 Funding requirement

DEQUAD needs **£14,000** to deliver this plan. It has three sources:

| Source | Amount | Form | Timing (as modelled) |
|---|---:|---|---|
| Founders' capital (Yusuf Quadri and Yusuff Adeagbo) | £3,000 | Ordinary shares | In the company account at the start of Year 1 (Sep 2026) |
| Friends and family | £3,000 | Ordinary shares | October 2026 |
| Strategic investor: Nigerian company | £8,000 | Ordinary shares | November 2026 |
| **Total cash funding** | **{{TOTAL_FUNDING}}** | | |
| NatWest Accelerator in-kind support (office space, legal, accountancy, mentoring) | Non-cash | | Active until March 2027 |

All three investments are equity. There is no debt to repay and no interest to pay. Shares for each investor will be issued and filed with Companies House (form SH01). The founders will keep a majority of the company. Evidence of each investor's identity and source of funds, including the Nigerian company's registration, the board resolution approving the investment and the bank transfer record, will be held on file and is available to UKES.

**Why a Nigerian strategic investor matters.** As well as cash, the investment is an early commercial link to one of Africa's largest higher-education markets. That supports the international scalability case in Section 3.3. Any expansion into that market is a post-Year-3 opportunity and is not in the forecast.

### 10.2 Use of funds

| Use | Year 1 | Funded by |
|---|---:|---|
| Platform running costs (hosting, AI inference, email/push, payment fees) | c.£900 | Founders' capital |
| Insurance, ICO registration, Cyber Essentials, UK trademark (3 classes), developer accounts, travel, office and bank | c.£2,600 | Founders' capital and friends & family |
| Bedfordshire pilot delivery (training, travel, materials) | £500 | Friends & family |
| Student acquisition and campus marketing | £1,500 | Friends & family |
| QA test devices (iOS and Android) | £600 | Friends & family |
| **Working-capital reserve** carried into Year 2 (freshers' season and first licence onboarding) | {{CASH_Y1}} | Nigerian company investment |

Year 1 net trading cash outflow is {{Y1_BURN}}. The company ends Year 1 with {{CASH_Y1}} in the bank. From Year 2, licence fees invoiced annually in advance turn cash flow positive. The investment means DEQUAD never needs to delay its freshers'-season activity while waiting for the first licence fee to arrive.

### 10.3 Why the round is small

The founders have deliberately raised only what the plan needs. Raising a large equity round before a university has paid would mean giving away a large share of the company at a low valuation. The disciplined route is to prove conversion with one paying university first, which makes DEQUAD investable on much better terms.

### 10.4 Future investment (optional, not assumed)

When the first licence has renewed and at least three universities are paying (base case: during Year 3), the founders may raise a **pre-seed round of about £250,000**, for example under SEIS/EIS. The purpose would be to speed up the hiring in the growth case and expand to further-education and international markets. This is an option, not a requirement. None of the forecasts in this plan include it.

### 10.5 Growth case: fully reconciled, no further investment

The growth case uses the same model and the same costs, with faster institutional adoption: 2 licences in Year 2, 7 by the end of Year 3, plus one NHS ICB contract from March 2029. It needs no investment beyond the £14,000 already committed; revenue pays for the three full-time hires.

{{TABLE_G_HEADLINE}}

{{TABLE_G_ACQ}}

The growth-case operating loss in Year 3 is a deliberate investment in the team ahead of the licence revenue the team wins. It is paid for out of cash built up in Year 2, and cash stays positive in every month (lowest {{G_MIN_CASH}}, {{G_MIN_CASH_MONTH}}). By the final quarter of Year 3, the growth case is profitable month by month again, with the full team in place. Growth-case P&L, cash flow and staffing are at Appendix F.

---

## 11. Revenue and Cost of Sales Forecast

All figures are in GBP and exclude VAT. DEQUAD is not VAT-registered: base-case turnover stays below the £90,000 registration threshold. Year 1 = September 2026 to August 2027.

### 11.1 Customer acquisition (base case)

{{TABLE_ACQUISITION}}

**Key acquisition assumptions**

- **Students.** New verified sign-ups of 300 / 1,500 / 4,000 a year, spread across the academic calendar (16% Sep, 14% Oct, 12% Jan, 13% Aug for pre-arrival, and lower in summer). Active students decline by 6% a month without new sign-ups. The opening beta cohort is 20 verified accounts.
- **Premium conversion.** Premium goes live from November 2026. Conversion is 2.5% / 3.5% / 4.5% of active students *who are not covered by a university licence* (licensed students get Premium features free through their university). Licence coverage is assumed to be 50% of active students in Year 2 and 60% in Year 3.
- **Insights Starter.** 2 subscriptions by the end of Year 1 (first in April 2027), 6 by the end of Year 2, 11 by the end of Year 3 (one cancellation assumed in Year 3).
- **Partner licences.** None in Year 1. Licence 1 (c.10,000 students, the anchor university after the pilot) from October 2027. Licence 2 (c.10,000 students) from September 2028. Licence 3 (c.6,000 students) from March 2029. All renew annually.

**Quarterly customer and revenue profile**

{{TABLE_ACQ_QUARTERLY}}

### 11.2 Revenue forecast

{{TABLE_REVENUE}}

Licence revenue is recognised evenly over each 12-month term, although cash arrives up front (Section 12). Premium revenue is shown gross; app-store and payment fees sit in cost of sales.

### 11.3 Cost of sales

{{TABLE_COS}}

**Cost-of-sales drivers.** Hosting: £35 a month plus £0.02 per registered student. AI inference: £20 a month plus £0.01 per active student, plus £40 a month per licensed institution for cohort analysis. Email, push and SMS: £10 a month plus £0.005 per registered student. Payment fees: a blended 10% on Premium (Stripe plus the App Store and Google Play 15% small-business rate), 1.9% on Starter, nil on licences paid by bank transfer. Onboarding: £600 per new licence (training, travel and materials) plus £300 for pilot delivery. Year 1 gross profit is negative because the minimum platform cost comes before revenue does.

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (base case)

{{TABLE_CASH_ANNUAL}}

**Cash-timing assumptions.** Licences are invoiced on signature, one month before each term starts, and paid on 30-day terms. Premium and Starter are collected monthly by card. Suppliers are paid in the month incurred, by card or direct debit. Insurance is paid in monthly instalments. Corporation tax is paid nine months and one day after each 31 August year end.

### 12.2 Monthly cash flow

**Year 1 (FY27): Sep 2026 – Aug 2027**

{{TABLE_CASH_MONTHLY_Y1}}

**Year 2 (FY28): Sep 2027 – Aug 2028**

{{TABLE_CASH_MONTHLY_Y2}}

**Year 3 (FY29): Sep 2028 – Aug 2029**

{{TABLE_CASH_MONTHLY_Y3}}

The tightest point is {{MIN_CASH_MONTH}} ({{MIN_CASH}}), before the friends-and-family and Nigerian-company investments arrive. After November 2026 the balance does not fall below about £7,000. If either investment arrives late, the founders will hold back Year 1 marketing and the test-device purchase until it lands. Section 12.3 shows the company stays solvent even if the first licence never arrives.

### 12.3 Downside test: no university ever signs

If **no partner licence is signed at any point** in the three years, DEQUAD still trades on Premium and Starter revenue (Year 3 revenue {{DOWN_REV_Y3}}). In this case the founders hold every overhead, including marketing, at its Year 1 level, work remotely, and hold back founder pay, the Year 3 hire and equipment purchases. The company never runs out of cash: the lowest balance is {{DOWN_MIN_CASH}}, and it ends Year 3 with {{DOWN_CASH_Y3}}. The business survives the failure of its main commercial assumption. What depends on that assumption is growth and jobs, not survival.

---

## 13. Profit & Loss Forecast (base case)

{{TABLE_PL}}

**Corporation tax computation**

{{TABLE_TAX}}

Year 1's loss is carried forward against Year 2 profits. Equipment qualifies for the 100% Annual Investment Allowance. Profits are below £50,000, so the 19% small profits rate applies.

**Commentary.** Year 1 is a deliberate investment year, with a loss of {{OP_Y1}} funded from the equity raised. Year 2 turns profitable ({{PAT_Y2}} after tax) on the first licence and a cost base still carried by unpaid founders. In Year 3 the company starts paying both founders and makes its first hire, and still makes a profit ({{PAT_Y3}}). Profit is not the aim in the early years; showing that the company can pay for its own team from revenue is.

---

## 14. Balance Sheet Forecast (base case)

{{TABLE_BS}}

The balance sheet is generated by the same model as the P&L and cash flow, and balances in every year. **Deferred income** is licence fees invoiced in advance but not yet earned. This is a sign of healthy, up-front payment terms, not debt. There are no borrowings. Shareholders' funds include the £14,000 of equity invested by the founders, friends and family, and the Nigerian company investor. The split between nominal share capital and share premium depends on the share price agreed for each allotment.

---

## 15. Forecasted Stock Levels

DEQUAD is a software business and **holds no stock**. Promotional materials for freshers' events are bought for immediate use and expensed as marketing.

{{TABLE_STOCK}}

---

## 16. Forecasted Advertising and Marketing Expenditure

{{TABLE_MARKETING}}

**Spend by quarter.** Spend is weighted to the academic calendar, peaking at freshers' season.

{{TABLE_MARKETING_Q}}

Institutional sales are led by the founders and cost very little in cash. Event attendance and sector PR are the main paid B2B items. Paid search and boosted social posts only start in Year 2, when cost per sign-up can be measured against Premium conversion. In the growth case, marketing is 1.5× the base in Year 2 and 2× the base in Year 3 (Appendix F).

---

## 17. Forecasted Fixed Asset Schedule

DEQUAD's main asset, the software platform, was built by the founders and is not capitalised. Development costs are expensed, which is prudent and simplifies R&D tax-relief claims. Tangible assets are limited to IT equipment, depreciated straight-line over 3 years from the month of purchase.

{{TABLE_FIXED_ASSETS}}

**Net book value movement**

{{TABLE_FA_ROLL}}

Founders use their own existing laptops in Year 1. All purchases are timed after licence cash has been received.

---

## 18. Forecasted Staff Costs

### 18.1 Roles and pay (base case)

{{TABLE_STAFF_ROLES}}

### 18.2 Total staff costs (base case)

{{TABLE_STAFF}}

**Basis of calculation**

- **Employer National Insurance:** 15% on earnings above the £5,000 secondary threshold (2025/26 rates). DEQUAD qualifies for the **£10,500 Employment Allowance** because a non-director employee is on the payroll, so no employer NI is payable in the base case.
- **Pension:** DEQUAD pays a 3% employer contribution on **all** salaries, even where earnings are below the £10,000 auto-enrolment trigger. This is a deliberate fair-employer policy.
- **Other staff costs:** enhanced DBS check and safeguarding induction for each new employee. Employers' liability insurance is in the insurance line.
- **Founders:** paid as directors through PAYE from Year 3. Before then, both are unpaid (Section 7.1).

### 18.3 Growth-case staffing

{{TABLE_G_STAFF}}

{{TABLE_G_STAFF_COST}}

The three full-time roles are each paid **£25,000 a year**, and the plan funds them for at least 12 months from licence revenue.

---

## 19. Appendices

| Ref | Document | File |
|---|---|---|
| A | Founder academic certificates — Yusuf Quadri | `A_founder_academic_certificates.pdf` |
| **B** | **CV — Yusuf Quadri, Founder & CEO** | `B_founder_cv.pdf` |
| **B-2** | **CV — Yusuff Adeagbo, Co-founder & CTO** | `B_cofounder_cv.pdf` |
| C | Personal commitment and undertaking | `C_personal_commitment_undertaking.pdf` |
| D | Wellbeing baseline and pilot evaluation methodology | `D_wellbeing_baseline_methodology.pdf` |
| E | Data Protection Impact Assessment | `E_dpia.pdf` |
| F | Financial model — 36-month workings, base and growth cases | `DEQUAD_Financial_Model_v6.xlsx` and Appendix F below |
| G | Job descriptions | `G_job_descriptions.pdf` |
| H | University letter of interest template | `H_university_letter_of_interest_template.pdf` |
| I | Online Safety Act 2023 compliance statement | `I_online_safety_act_compliance.pdf` |
| J | Architecture diagram | `J_architecture_diagram.pdf` |
| K | Product screenshots | `K_product_screenshots.pdf` |
| L | Risk register | `DEQUAD_Risk_Register.pdf` |
| **N** | **CVs — Dr Gerald Marfo, Adedapo Ajuwon, Chinyere Jennifer** | `N_wider_team_cvs.pdf` |
| O | Safeguarding and clinical-awareness certifications — Yusuf Quadri | `O_safeguarding_certifications.pdf` |

### 19.1 Founder CV summaries

**Yusuf Quadri — Founder & CEO.** Recovery Coordinator, Change Grow Live (2025–present): complex caseloads, safeguarding referrals, dynamic risk assessment, multi-agency coordination with clinicians, probation, housing and social care, and volunteer supervision. Clinical Support Worker, East London NHS Foundation Trust (2022–present): care for adults with mental-health conditions, learning disabilities and autism; escalating safeguarding concerns. President, University of Bedfordshire Students' Union (2021–2023, two terms): represented 10,000+ students and oversaw a £900,000 budget. Earlier B2B business development (UGC Planet, Mavin Care). MBA with Data Analytics (2024); MSc International Relations Management (2020); BSc International Relations & Diplomacy (2017). Full CV: Appendix B.

**Yusuff Adeagbo — Co-founder & CTO.** MSc Information Technology with Project Management, University of the West of Scotland (2022–2024); HND Computer Science. Full-stack engineering, UI/UX design, IT support and business analysis, and digital marketing for e-commerce. Leads DEQUAD's engineering, infrastructure, security and release management. Full CV: Appendix B-2.

---

# Appendix F — Financial Model Summary

*All financial tables in Sections 11–18 come from a single 36-month model (`build_business_plan_v6.py`; workbook `DEQUAD_Financial_Model_v6.xlsx`). The model checks that the balance sheet balances in every year.*

### F.1 Key assumptions

| Area | Assumption |
|---|---|
| Funding | £14,000 equity: founders £3,000 (Sep 2026), friends & family £3,000 (Oct 2026), Nigerian company £8,000 (Nov 2026); no loans, grants or R&D tax credits |
| Prices | Premium £4.99/month; Insights Starter £49.99/month; Licence £2.00/enrolled student/year |
| Billing | Licences invoiced annually, one month before each term, on 30-day terms; revenue recognised monthly |
| In-kind support | NatWest Accelerator office space, legal and accountancy support until March 2027 |
| Corporation tax | 19% small profits rate; losses carried forward; 100% AIA on equipment; paid 9 months + 1 day after year end |
| Employer NI | 15% above £5,000 per employee; £10,500 Employment Allowance |
| Pension | 3% employer contribution on all salaries |
| VAT | Not registered; base-case turnover below £90,000 |
| Depreciation | IT equipment, straight-line over 36 months |

### F.2 Growth case — Profit & Loss

{{TABLE_G_PL}}

### F.3 Growth case — Cash flow

{{TABLE_G_CASH_ANNUAL}}

*In the growth case, turnover would pass the £90,000 VAT registration threshold during Year 3. Universities cannot usually recover VAT, so DEQUAD would review licence pricing at that point. The growth-case figures are shown net of VAT.*

---

*All figures are forecasts, not guarantees. This business plan was prepared by Yusuf Quadri (Founder & CEO) with Yusuff Adeagbo (Co-founder & CTO) for the UK Innovator Founder endorsement application to UKES. Version 6.0, October 2026.*
