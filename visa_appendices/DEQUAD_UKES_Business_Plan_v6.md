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
| **Founder capital** | £6,000 share capital (£3,000 per founder), paid into the company account at incorporation |
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
| Company | DEQUAD Ltd incorporated 18 August 2026; £6,000 founder share capital paid in. |
| Third-party validation | Santander Universities Pre-Incubator (completed 2025); NatWest Accelerator, London (joined 16 March 2026). |
| Users | Closed beta with verified University of Bedfordshire students. |
| Commercial pipeline | Early, informal conversations with the University of Bedfordshire about an unpaid pilot. **Nothing is signed.** The base case assumes no institutional revenue at all in Year 1. |

### The financial plan at a glance

The plan is **self-funded**. The £6,000 of founder capital, the in-kind support of the NatWest Accelerator, and revenue earned along the way fund every month of the forecast. No external investment, grant or tax credit is assumed. Cash stays positive in every one of the 36 months. The lowest month-end balance is £639 (Sep-27).

| Base case | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) |
|---|---:|---:|---:|
| Total revenue | £569 | £22,111 | £54,308 |
| Gross margin | n/a | 87.9% | 89.3% |
| Profit / (loss) after tax | (£4,020) | £8,514 | £3,194 |
| Closing cash | £1,980 | £11,826 | £20,568 |
| Paying partner universities (year end) | 0 | 1 | 3 |
| Insights Starter subscriptions (year end) | 2 | 6 | 11 |
| Verified students on platform (year end) | 320 | 1,820 | 5,820 |
| Team headcount / FTE (year end) | 2 / 2.00 (founders unpaid) | 2 / 2.00 (founders unpaid) | 3 / 2.25 |

The base case is deliberately cautious: one paying university in Year 2 and three by the end of Year 3. That is about 1% of UK higher-education providers. A **growth case** (Section 10.5), also fully reconciled, shows what happens if seven universities and one NHS Integrated Care Board sign by the end of Year 3. In that case DEQUAD creates **three full-time UK jobs at £25,000 a year plus a part-time safeguarding role**, pays both founders, and still ends Year 3 with £32,347 in the bank.

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
- **The founder is the customer's peer.** University buyers are student-services and safeguarding professionals. The CEO does safeguarding work professionally and has led a students' union. He can talk to buyers in their own language, and he has existing relationships at the University of Bedfordshire, our proposed pilot partner.
- **The cost base is very lean.** Year 1 cash costs are about £400 a month. NatWest Accelerator support (office, legal and accountancy, in kind until March 2027) and founders who take no pay in Years 1–2 mean the £6,000 of share capital is enough to reach the first institutional revenue.
- **Viability does not depend on a single deal.** Section 12.3 shows that even if **no university licence is ever signed**, the company stays solvent for all three years on Premium and Starter revenue, with costs held at Year 1 levels (Year 3 revenue £12,744; closing cash £7,478). Founders' pay and the first hire are the things that would wait.
- **Willingness to pay is already proven.** UK universities already buy digital student-support services. Togetherall alone reports more than 200 education-institution partners, and UniBuddy has a large UK university client base. Universities have budgets for this kind of product; DEQUAD offers a more complete one.
- **The founders are committed.** Both founders have each put £3,000 of personal money into share capital and signed commitment undertakings (Appendix C).

### 3.3 Scalability

- **Software economics.** An extra student costs DEQUAD pennies a month in hosting and AI inference. Gross margin rises to **89.3% in Year 3**. Revenue rises from £569 to £54,308 over three years in the base case, while the team grows by only one part-time role.
- **A repeatable route into universities.** Each licence follows the same path: an unpaid pilot or Starter subscription, then a 6-week onboarding, then an annual licence. The licence-management tooling that adds a university's domains and unlocks every one of its students is already built. Adding a university is a configuration job, not an engineering project.
- **Network effects within each campus.** Every new verified student makes DEQUAD more useful to every other student at the same university. That drives organic sign-ups and lowers acquisition cost (Section 16).
- **National scale.** The UK has 2.9 million higher-education students (HESA 2023/24) at about 285 providers. The growth case needs only 7 of them to sign within three years.
- **International scale.** The verification engine is a configurable domain allow-list, not a rule hard-coded to `.ac.uk`. The same mechanism works for `.edu` (US), `.edu.au` (Australia) and European academic domains. We see international expansion as a post-Year-3 opportunity, not part of this forecast.
- **Job creation.** The base case grows from 2 unpaid founders to a paid team of 3 (2.25 FTE) by the end of Year 3. The growth case reaches **6 people**: both founders paid, three full-time hires at £25,000 a year, and a part-time Safeguarding & Trust Lead. All of these roles are UK-based and funded from revenue.

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
| **SOM (Year 3, base case)** | 3 partner licences + 11 Starter subscriptions + Premium | Section 11 | **£54,308** (c.1% of SAM) |

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
| **2. Land (institution)** | Unpaid 12-week pilot proposed to the University of Bedfordshire, plus Starter subscriptions sold to students' unions and departments | Pilot targeted for Jan–Mar 2027 (**not signed**); first Starter subscription Apr 2027 |
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
| Verified students (year end) | 320 | 1,820 | 5,820 |
| Premium subscribers (year end) | 5 | 20 | 59 |
| Insights Starter subscriptions (year end) | 2 | 6 | 11 |
| Partner-university licences (year end) | 0 | 1 | 3 |
| Students covered by licences | 0 | 10,000 | 26,000 |

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| Live, full-featured product on web, Android and iOS, so build risk is retired | Very small cash base (£6,000); no external funding |
| A CEO who practises safeguarding and has led a students' union: strong credibility with buyers | No signed pilot, letter of intent or paying institution yet |
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

**DEQUAD does not need external investment to deliver this plan.** The plan's cash requirement is the founders' £6,000 share capital, plus in-kind support already secured.

| Source | Amount | Status |
|---|---|---|
| Founder share capital: Yusuf Quadri | £3,000 | **Paid** at incorporation (18 Aug 2026) |
| Founder share capital: Yusuff Adeagbo | £3,000 | **Paid** at incorporation (18 Aug 2026) |
| NatWest Accelerator in-kind support (office space, legal, accountancy, mentoring) | Non-cash | **Active** until March 2027 |
| **Total cash funding assumed** | **£6,000** | |

### 10.2 How the £6,000 is used (Year 1)

Year 1 net cash outflow is £4,020. It covers hosting and AI inference, developer accounts, insurance, ICO registration, UK trademark filing (3 classes), Cyber Essentials, the pilot, and a small student-acquisition budget. The company ends Year 1 with £1,980 in the bank. From Year 2, licence fees invoiced annually in advance turn cash flow positive.

### 10.3 Why we are not raising now

Raising equity before a university has paid would mean selling a large share of the company at a low valuation. The disciplined route is to prove conversion with one paying university first. That makes the business investable on better terms, and the plan does not depend on it.

### 10.4 Future investment (optional, not assumed)

When the first licence has renewed and at least three universities are paying (base case: during Year 3), the founders may raise a **pre-seed round of about £250,000**, for example under SEIS/EIS. The purpose would be to speed up the hiring in the growth case and expand to further-education and international markets. This is an option, not a requirement. None of the forecasts in this plan include it.

### 10.5 Growth case: fully reconciled, still self-funded

The growth case uses the same model and the same costs, with faster institutional adoption: 2 licences in Year 2, 7 by the end of Year 3, plus one NHS ICB contract from March 2029. It is funded entirely from revenue (no external investment) and pays for the three full-time hires.

| Growth case | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) |
|---|---:|---:|---:|
| Total revenue | £569 | £36,763 | £149,301 |
| Operating profit / (loss) | (£4,020) | £20,824 | (£17,496) |
| Closing cash | £1,980 | £30,012 | £32,347 |
| Headcount (year end) | 2 | 2 | 6 |

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) |
|---|---:|---:|---:|
| Partner-university licences (year end) | 0 | 2 | 7 |
| Students covered by licences (year end) | 0 | 20,000 | 71,000 |
| Insights Starter subscriptions (year end) | 2 | 8 | 15 |
| Cumulative verified students (year end) | 320 | 2,820 | 11,820 |
| Premium subscribers (year end) | 5 | 29 | 95 |
| NHS ICB contracts (year end) | 0 | 0 | 1 |

The growth-case operating loss in Year 3 is a deliberate investment in the team ahead of the licence revenue the team wins. It is paid for out of cash built up in Year 2, and cash stays positive in every month (lowest £358, Sep-27). By the final quarter of Year 3, the growth case is profitable month by month again, with the full team in place. Growth-case P&L, cash flow and staffing are at Appendix F.

---

## 11. Revenue and Cost of Sales Forecast

All figures are in GBP and exclude VAT. DEQUAD is not VAT-registered: base-case turnover stays below the £90,000 registration threshold. Year 1 = September 2026 to August 2027.

### 11.1 Customer acquisition (base case)

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) |
|---|---:|---:|---:|
| New verified student sign-ups in year | 300 | 1,500 | 4,000 |
| Cumulative verified students (year end) | 320 | 1,820 | 5,820 |
| Monthly active students (year end) | 211 | 1,130 | 3,283 |
| Premium subscribers (year end) | 5 | 20 | 59 |
| Premium subscribers (average in year) | 3.7 | 15.5 | 49.4 |
| Insights Starter subscriptions (year end) | 2 | 6 | 11 |
| Insights Starter subscriptions (average) | 0.6 | 4.8 | 8.9 |
| Partner-university licences (year end) | 0 | 1 | 3 |
| Students covered by partner licences (year end) | 0 | 10,000 | 26,000 |

**Key acquisition assumptions**

- **Students.** New verified sign-ups of 300 / 1,500 / 4,000 a year, spread across the academic calendar (16% Sep, 14% Oct, 12% Jan, 13% Aug for pre-arrival, and lower in summer). Active students decline by 6% a month without new sign-ups. The opening beta cohort is 20 verified accounts.
- **Premium conversion.** Premium goes live from November 2026. Conversion is 2.5% / 3.5% / 4.5% of active students *who are not covered by a university licence* (licensed students get Premium features free through their university). Licence coverage is assumed to be 50% of active students in Year 2 and 60% in Year 3.
- **Insights Starter.** 2 subscriptions by the end of Year 1 (first in April 2027), 6 by the end of Year 2, 11 by the end of Year 3 (one cancellation assumed in Year 3).
- **Partner licences.** None in Year 1. Licence 1 (c.10,000 students, the anchor university after the pilot) from October 2027. Licence 2 (c.10,000 students) from September 2028. Licence 3 (c.6,000 students) from March 2029. All renew annually.

**Quarterly customer and revenue profile**

| Quarter | New sign-ups | Verified students | Premium subs | Starter subs | Licences | Revenue |
|---|---:|---:|---:|---:|---:|---:|
| Y1 Q1 (Sep-26 – Nov-26) | 120 | 140 | 3 | 0 | 0 | £15 |
| Y1 Q2 (Dec-26 – Feb-27) | 75 | 215 | 4 | 0 | 0 | £55 |
| Y1 Q3 (Mar-27 – May-27) | 48 | 263 | 5 | 1 | 0 | £175 |
| Y1 Q4 (Jun-27 – Aug-27) | 57 | 320 | 5 | 2 | 0 | £325 |
| Y2 Q1 (Sep-27 – Nov-27) | 600 | 920 | 13 | 4 | 1 | £3,993 |
| Y2 Q2 (Dec-27 – Feb-28) | 375 | 1,295 | 17 | 5 | 1 | £5,874 |
| Y2 Q3 (Mar-28 – May-28) | 240 | 1,535 | 18 | 6 | 1 | £6,069 |
| Y2 Q4 (Jun-28 – Aug-28) | 285 | 1,820 | 20 | 6 | 1 | £6,174 |
| Y3 Q1 (Sep-28 – Nov-28) | 1,600 | 3,420 | 44 | 8 | 2 | £11,669 |
| Y3 Q2 (Dec-28 – Feb-29) | 1,000 | 4,420 | 53 | 8 | 2 | £11,983 |
| Y3 Q3 (Mar-29 – May-29) | 640 | 5,060 | 55 | 10 | 3 | £15,228 |
| Y3 Q4 (Jun-29 – Aug-29) | 760 | 5,820 | 59 | 11 | 3 | £15,428 |

### 11.2 Revenue forecast

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Partner-university licences (£2/student/yr) | – | £18,333 | £46,000 | £64,333 |
| Insights Starter (£49.99/month) | £350 | £2,849 | £5,349 | £8,548 |
| DEQUAD Premium (£4.99/month) | £220 | £928 | £2,959 | £4,107 |
| NHS ICB contracts | – | – | – | – |
| **Total revenue** | **£569** | **£22,111** | **£54,308** | **£76,988** |

Licence revenue is recognised evenly over each 12-month term, although cash arrives up front (Section 12). Premium revenue is shown gross; app-store and payment fees sit in cost of sales.

### 11.3 Cost of sales

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Cloud hosting & database | £470 | £722 | £1,458 | £2,651 |
| AI inference (safeguarding triage, cohort analysis) | £259 | £786 | £1,769 | £2,814 |
| Email, push & SMS | £132 | £196 | £380 | £708 |
| Payment processing & app-store fees | £29 | £147 | £398 | £573 |
| University onboarding & pilot delivery | £300 | £600 | £1,200 | £2,100 |
| Customer-success tooling | – | £220 | £600 | £820 |
| **Total cost of sales** | **£1,190** | **£2,671** | **£5,805** | **£9,665** |
| **Gross profit** | **(£620)** | **£19,440** | **£48,503** | **£67,323** |
| **Gross margin** | **n/a** | **87.9%** | **89.3%** | **87.4%** |

**Cost-of-sales drivers.** Hosting: £35 a month plus £0.02 per registered student. AI inference: £20 a month plus £0.01 per active student, plus £40 a month per licensed institution for cohort analysis. Email, push and SMS: £10 a month plus £0.005 per registered student. Payment fees: a blended 10% on Premium (Stripe plus the App Store and Google Play 15% small-business rate), 1.9% on Starter, nil on licences paid by bank transfer. Onboarding: £600 per new licence (training, travel and materials) plus £300 for pilot delivery. Year 1 gross profit is negative because the minimum platform cost comes before revenue does.

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (base case)

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Opening cash | £6,000 | £1,980 | £11,826 | £6,000 |
| Receipts — Premium & Starter subscriptions | £569 | £3,778 | £8,308 | £12,655 |
| Receipts — licences & contracts (annual in advance) | – | £20,000 | £52,000 | £72,000 |
| **Total receipts** | **£569** | **£23,778** | **£60,308** | **£84,655** |
| Cost of sales | (£1,190) | (£2,671) | (£5,805) | (£9,665) |
| Staff costs (salaries, NI, pension) | – | – | (£29,050) | (£29,050) |
| Marketing | (£800) | (£3,500) | (£6,000) | (£10,300) |
| Other overheads (software, insurance, professional, office, compliance, travel) | (£2,600) | (£6,261) | (£8,721) | (£17,582) |
| Capital expenditure | – | (£1,500) | (£1,200) | (£2,700) |
| Corporation tax paid | – | – | (£790) | (£790) |
| **Total payments** | **(£4,590)** | **(£13,932)** | **(£51,566)** | **(£70,087)** |
| **Net cash flow** | **(£4,020)** | **£9,846** | **£8,742** | **£14,568** |
| **Closing cash** | **£1,980** | **£11,826** | **£20,568** | **£20,568** |

**Cash-timing assumptions.** Licences are invoiced on signature, one month before each term starts, and paid on 30-day terms. Premium and Starter are collected monthly by card. Suppliers are paid in the month incurred, by card or direct debit. Insurance is paid in monthly instalments. Corporation tax is paid nine months and one day after each 31 August year end.

### 12.2 Monthly cash flow

**Year 1 (FY27): Sep 2026 – Aug 2027**

| £ | Sep-26 | Oct-26 | Nov-26 | Dec-26 | Jan-27 | Feb-27 | Mar-27 | Apr-27 | May-27 | Jun-27 | Jul-27 | Aug-27 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Opening cash | £6,000 | £5,519 | £4,933 | £4,662 | £4,054 | £3,470 | £3,209 | £2,968 | £2,766 | £2,572 | £2,386 | £2,248 |  |
| **Receipts** | **–** | **–** | **£15** | **£15** | **£20** | **£20** | **£25** | **£75** | **£75** | **£75** | **£125** | **£125** | **£569** |
| Cost of sales | (£67) | (£69) | (£71) | (£72) | (£373) | (£74) | (£75) | (£77) | (£77) | (£77) | (£78) | (£80) | (£1,190) |
| Staff | – | – | – | – | – | – | – | – | – | – | – | – | – |
| Marketing | (£128) | (£112) | (£80) | (£32) | (£96) | (£72) | (£56) | (£40) | (£32) | (£24) | (£24) | (£104) | (£800) |
| Other overheads | (£286) | (£405) | (£135) | (£519) | (£135) | (£135) | (£135) | (£160) | (£160) | (£160) | (£160) | (£210) | (£2,600) |
| Capex | – | – | – | – | – | – | – | – | – | – | – | – | – |
| Corp. tax | – | – | – | – | – | – | – | – | – | – | – | – | – |
| **Net cash flow** | **(£481)** | **(£586)** | **(£271)** | **(£608)** | **(£584)** | **(£261)** | **(£241)** | **(£202)** | **(£194)** | **(£186)** | **(£137)** | **(£269)** | **(£4,020)** |
| **Closing cash** | **£5,519** | **£4,933** | **£4,662** | **£4,054** | **£3,470** | **£3,209** | **£2,968** | **£2,766** | **£2,572** | **£2,386** | **£2,248** | **£1,980** |  |

**Year 2 (FY28): Sep 2027 – Aug 2028**

| £ | Sep-27 | Oct-27 | Nov-27 | Dec-27 | Jan-28 | Feb-28 | Mar-28 | Apr-28 | May-28 | Jun-28 | Jul-28 | Aug-28 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Opening cash | £1,980 | £639 | £19,245 | £18,645 | £15,769 | £15,100 | £14,590 | £14,151 | £13,780 | £13,492 | £13,238 | £12,978 |  |
| **Receipts** | **£190** | **£20,205** | **£265** | **£265** | **£275** | **£335** | **£340** | **£340** | **£390** | **£390** | **£385** | **£400** | **£23,778** |
| Cost of sales | (£90) | (£759) | (£166) | (£167) | (£174) | (£180) | (£184) | (£186) | (£188) | (£189) | (£190) | (£197) | (£2,671) |
| Staff | – | – | – | – | – | – | – | – | – | – | – | – | – |
| Marketing | (£560) | (£490) | (£350) | (£140) | (£420) | (£315) | (£245) | (£175) | (£140) | (£105) | (£105) | (£455) | (£3,500) |
| Other overheads | (£881) | (£350) | (£350) | (£1,334) | (£350) | (£350) | (£350) | (£350) | (£350) | (£350) | (£350) | (£900) | (£6,261) |
| Capex | – | – | – | (£1,500) | – | – | – | – | – | – | – | – | (£1,500) |
| Corp. tax | – | – | – | – | – | – | – | – | – | – | – | – | – |
| **Net cash flow** | **(£1,341)** | **£18,606** | **(£600)** | **(£2,876)** | **(£669)** | **(£510)** | **(£439)** | **(£371)** | **(£288)** | **(£254)** | **(£260)** | **(£1,152)** | **£9,846** |
| **Closing cash** | **£639** | **£19,245** | **£18,645** | **£15,769** | **£15,100** | **£14,590** | **£14,151** | **£13,780** | **£13,492** | **£13,238** | **£12,978** | **£11,826** |  |

**Year 3 (FY29): Sep 2028 – Aug 2029**

| £ | Sep-28 | Oct-28 | Nov-28 | Dec-28 | Jan-29 | Feb-29 | Mar-29 | Apr-29 | May-29 | Jun-29 | Jul-29 | Aug-29 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Opening cash | £11,826 | £27,156 | £42,366 | £39,073 | £35,003 | £31,648 | £28,026 | £36,314 | £33,321 | £30,429 | £26,800 | £24,004 |  |
| **Receipts** | **£20,505** | **£20,545** | **£619** | **£619** | **£699** | **£664** | **£12,724** | **£729** | **£774** | **£769** | **£814** | **£844** | **£60,308** |
| Cost of sales | (£886) | (£308) | (£324) | (£328) | (£348) | (£359) | (£1,029) | (£435) | (£439) | (£441) | (£444) | (£463) | (£5,805) |
| Staff | (£2,613) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£2,403) | (£29,050) |
| Marketing | (£960) | (£840) | (£600) | (£240) | (£720) | (£540) | (£420) | (£300) | (£240) | (£180) | (£180) | (£780) | (£6,000) |
| Other overheads | (£715) | (£584) | (£584) | (£1,718) | (£584) | (£984) | (£584) | (£584) | (£584) | (£584) | (£584) | (£634) | (£8,721) |
| Capex | – | (£1,200) | – | – | – | – | – | – | – | – | – | – | (£1,200) |
| Corp. tax | – | – | – | – | – | – | – | – | – | (£790) | – | – | (£790) |
| **Net cash flow** | **£15,331** | **£15,209** | **(£3,292)** | **(£4,070)** | **(£3,356)** | **(£3,622)** | **£8,288** | **(£2,993)** | **(£2,892)** | **(£3,629)** | **(£2,797)** | **(£3,436)** | **£8,742** |
| **Closing cash** | **£27,156** | **£42,366** | **£39,073** | **£35,003** | **£31,648** | **£28,026** | **£36,314** | **£33,321** | **£30,429** | **£26,800** | **£24,004** | **£20,568** |  |

The tightest point is Sep-27, when the freshers'-season marketing spend and the annual software renewals fall just before the first licence fee is received. Cash is still positive at £639. If the first licence is delayed, the founders will hold back the Year 2 equipment purchases, paid search and B2B event spend (about £2,400 in total) until it is received. Section 12.3 shows the company stays solvent even if it never arrives.

### 12.3 Downside test: no university ever signs

If **no partner licence is signed at any point** in the three years, DEQUAD still trades on Premium and Starter revenue (Year 3 revenue £12,744). In this case the founders hold every overhead, including marketing, at its Year 1 level, work remotely, and hold back founder pay, the Year 3 hire and equipment purchases. The company never runs out of cash: the lowest balance is £818, and it ends Year 3 with £7,478. The business survives the failure of its main commercial assumption. What depends on that assumption is growth and jobs, not survival.

---

## 13. Profit & Loss Forecast (base case)

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| **Revenue** | **£569** | **£22,111** | **£54,308** | **£76,988** |
| Cost of sales | (£1,190) | (£2,671) | (£5,805) | (£9,665) |
| **Gross profit** | **(£620)** | **£19,440** | **£48,503** | **£67,323** |
| Salaries | – | – | (£28,000) | (£28,000) |
| Employer NI (after Employment Allowance) | – | – | – | – |
| Employer pension (3%) | – | – | (£840) | (£840) |
| Other staff costs (DBS, induction) | – | – | (£210) | (£210) |
| Advertising & marketing | (£800) | (£3,500) | (£6,000) | (£10,300) |
| Software & developer accounts | (£639) | (£1,159) | (£1,639) | (£3,437) |
| Insurance (PI, cyber, public & employers' liability) | (£600) | (£1,100) | (£1,750) | (£3,450) |
| Accountancy & bookkeeping | – | (£600) | (£1,230) | (£1,830) |
| Legal | – | (£900) | (£400) | (£1,300) |
| Office / co-working | (£125) | (£600) | (£1,200) | (£1,925) |
| Compliance (ICO, Cyber Essentials, IP, filings) | (£756) | (£486) | (£486) | (£1,728) |
| Travel & campus visits | (£360) | (£1,200) | (£1,800) | (£3,360) |
| Bank, telephone & internet | (£120) | (£216) | (£216) | (£552) |
| **Total overheads** | **(£3,400)** | **(£9,761)** | **(£43,771)** | **(£56,932)** |
| **EBITDA** | **(£4,020)** | **£9,679** | **£4,732** | **£10,391** |
| Depreciation | – | (£375) | (£867) | (£1,242) |
| **Operating profit / (loss)** | **(£4,020)** | **£9,304** | **£3,865** | **£9,149** |
| Corporation tax (19%, after losses b/f and 100% AIA) | – | (£790) | (£671) | (£1,461) |
| **Profit / (loss) after tax** | **(£4,020)** | **£8,514** | **£3,194** | **£7,688** |
| Net margin | n/a | 38.5% | 5.9% |  |

**Corporation tax computation**

|  | Operating result | Add back depreciation | Less AIA | Tax-adjusted result | Losses c/f | CT @19% | Paid |
|---|---:|---:|---:|---:|---:|---:|---:|
| Year 1 | (£4,020) | – | – | (£4,020) | £4,020 | – | Jun-28 |
| Year 2 | £9,304 | £375 | (£1,500) | £8,179 | – | £790 | Jun-29 |
| Year 3 | £3,865 | £867 | (£1,200) | £3,532 | – | £671 | Jun-30 (after forecast) |

Year 1's loss is carried forward against Year 2 profits. Equipment qualifies for the 100% Annual Investment Allowance. Profits are below £50,000, so the 19% small profits rate applies.

**Commentary.** Year 1 is a deliberate investment year, with a loss of (£4,020) absorbed by founder capital. Year 2 turns profitable (£8,514 after tax) on the first licence and a cost base still carried by unpaid founders. In Year 3 the company starts paying both founders and makes its first hire, and still makes a profit (£3,194). Profit is not the aim in the early years; showing that the company can pay for its own team from revenue is.

---

## 14. Balance Sheet Forecast (base case)

| At 31 August | 2027 (Y1) | 2028 (Y2) | 2029 (Y3) |
|---|---:|---:|---:|
| Fixed assets at cost | – | £1,500 | £2,700 |
| Less accumulated depreciation | – | (£375) | (£1,242) |
| **Net book value of fixed assets** | **–** | **£1,125** | **£1,458** |
| Stock | – | – | – |
| Trade debtors (licence invoices, 30-day terms) | – | £20,000 | £20,000 |
| Cash at bank | £1,980 | £11,826 | £20,568 |
| **Total assets** | **£1,980** | **£32,951** | **£42,026** |
| Deferred income (licence fees invoiced in advance) | – | (£21,667) | (£27,667) |
| Corporation tax payable | – | (£790) | (£671) |
| **Total liabilities** | **–** | **(£22,457)** | **(£28,338)** |
| **Net assets** | **£1,980** | **£10,494** | **£13,688** |
| Share capital (founders, £3,000 each) | £6,000 | £6,000 | £6,000 |
| Profit & loss reserve | (£4,020) | £4,494 | £7,688 |
| **Total shareholders' funds** | **£1,980** | **£10,494** | **£13,688** |

The balance sheet is generated by the same model as the P&L and cash flow, and balances in every year. **Deferred income** is licence fees invoiced in advance but not yet earned. This is a sign of healthy, up-front payment terms, not debt. There are no borrowings, no external shareholders and no share premium.

---

## 15. Forecasted Stock Levels

DEQUAD is a software business and **holds no stock**. Promotional materials for freshers' events are bought for immediate use and expensed as marketing.

|  | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening stock | – | – | – |
| Purchases | – | – | – |
| Closing stock | – | – | – |

---

## 16. Forecasted Advertising and Marketing Expenditure

| Channel | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Student ambassador programme (incentives, referral rewards) | £300 | £900 | £1,500 | £2,700 |
| Freshers' / Welcome Week stands & printed materials | £200 | £700 | £1,000 | £1,900 |
| Instagram & TikTok (organic content + boosted posts) | £150 | £700 | £1,200 | £2,050 |
| Google Search ads (brand + 'student friends' terms) | – | £300 | £600 | £900 |
| Content, SEO & safeguarding white paper | £50 | £300 | £500 | £850 |
| B2B events & PR (AMOSSHE, UUK, Wonkhe, NatWest network) | £100 | £600 | £1,200 | £1,900 |
| **Total advertising & marketing** | **£800** | **£3,500** | **£6,000** | **£10,300** |
| Marketing as % of revenue | n/a | 15.8% | 11.0% |  |
| Blended cost per verified student sign-up | £2.67 | £2.33 | £1.50 |  |

**Spend by quarter.** Spend is weighted to the academic calendar, peaking at freshers' season.

|  | Q1 Sep–Nov | Q2 Dec–Feb | Q3 Mar–May | Q4 Jun–Aug | Total |
|---|---:|---:|---:|---:|---:|
| Year 1 | £320 | £200 | £128 | £152 | £800 |
| Year 2 | £1,400 | £875 | £560 | £665 | £3,500 |
| Year 3 | £2,400 | £1,500 | £960 | £1,140 | £6,000 |

Institutional sales are led by the founders and cost very little in cash. Event attendance and sector PR are the main paid B2B items. Paid search and boosted social posts only start in Year 2, when cost per sign-up can be measured against Premium conversion. In the growth case, marketing is 1.5× the base in Year 2 and 2× the base in Year 3 (Appendix F).

---

## 17. Forecasted Fixed Asset Schedule

DEQUAD's main asset, the software platform, was built by the founders and is not capitalised. Development costs are expensed, which is prudent and simplifies R&D tax-relief claims. Tangible assets are limited to IT equipment, depreciated straight-line over 3 years from the month of purchase.

| Asset | Acquired | Cost | Dep'n Y1 | Dep'n Y2 | Dep'n Y3 | NBV at Y3 end |
|---|---|---:|---:|---:|---:|---:|
| QA test handsets (1 x iOS, 1 x Android, refurbished) | Dec-27 | £600 | – | £150 | £200 | £250 |
| Development laptop (CTO replacement) | Dec-27 | £900 | – | £225 | £300 | £375 |
| Laptop — Safeguarding & Trust Lead | Oct-28 | £850 | – | – | £260 | £590 |
| Campus event kit (banner, display) | Oct-28 | £350 | – | – | £107 | £243 |
| **Total** |  | **£2,700** | **–** | **£375** | **£867** | **£1,458** |

**Net book value movement**

|  | Opening NBV | Additions | Depreciation | Closing NBV |
|---|---:|---:|---:|---:|
| Year 1 | – | – | – | – |
| Year 2 | – | £1,500 | (£375) | £1,125 |
| Year 3 | £1,125 | £1,200 | (£867) | £1,458 |

Founders use their own existing laptops in Year 1. All purchases are timed after licence cash has been received.

---

## 18. Forecasted Staff Costs

### 18.1 Roles and pay (base case)

| Role | Paid from | FTE | Y1 salary | Y2 salary | Y3 salary | Y3 employer NI (gross) | Y3 pension 3% |
|---|---|---:|---:|---:|---:|---:|---:|
| Founder & CEO — Yusuf Quadri | Sep-28 | 1.00 | – | – | £10,000 | £750 | £300 |
| Co-founder & CTO — Yusuff Adeagbo | Sep-28 | 1.00 | – | – | £10,000 | £750 | £300 |
| Safeguarding & Trust Lead (part-time, c.10 hrs/wk) | Sep-28 | 0.25 | – | – | £8,000 | £450 | £240 |

### 18.2 Total staff costs (base case)

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Gross salaries | – | – | £28,000 | £28,000 |
| Employer NI before allowance (15% above £5,000) | – | – | £1,950 | £1,950 |
| Less Employment Allowance | – | – | (£1,950) | (£1,950) |
| Employer pension (3% of salary) | – | – | £840 | £840 |
| Other staff costs (enhanced DBS, induction & safeguarding training) | – | – | £210 | £210 |
| **Total staff cost** | **–** | **–** | **£29,050** | **£29,050** |
| Headcount at year end (incl. 2 founders) | 2 | 2 | 3 |  |
| FTE at year end | 2.00 | 2.00 | 2.25 |  |

**Basis of calculation**

- **Employer National Insurance:** 15% on earnings above the £5,000 secondary threshold (2025/26 rates). DEQUAD qualifies for the **£10,500 Employment Allowance** because a non-director employee is on the payroll, so no employer NI is payable in the base case.
- **Pension:** DEQUAD pays a 3% employer contribution on **all** salaries, even where earnings are below the £10,000 auto-enrolment trigger. This is a deliberate fair-employer policy.
- **Other staff costs:** enhanced DBS check and safeguarding induction for each new employee. Employers' liability insurance is in the insurance line.
- **Founders:** paid as directors through PAYE from Year 3. Before then, both are unpaid (Section 7.1).

### 18.3 Growth-case staffing

| Role (growth case) | Paid from | FTE | Annual salary |
|---|---|---:|---:|
| Founder & CEO — Yusuf Quadri | Sep-28 | 1.00 | £20,000 |
| Co-founder & CTO — Yusuff Adeagbo | Sep-28 | 1.00 | £20,000 |
| Safeguarding & Trust Lead (part-time) | Sep-28 | 0.25 | £8,000 |
| Sales Lead (full-time) | Sep-28 | 1.00 | £25,000 |
| Support Agent (full-time) | Oct-28 | 1.00 | £25,000 |
| Student Ambassador (full-time) | Oct-28 | 1.00 | £25,000 |

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Gross salaries | – | – | £118,833 | £118,833 |
| Employer NI (after Employment Allowance) | – | – | £2,950 | £2,950 |
| Employer pension (3%) | – | – | £3,565 | £3,565 |
| **Total staff cost** | **–** | **–** | **£126,188** | **£126,188** |
| Headcount at year end | 2 | 2 | 6 |  |

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
| Funding | £6,000 founder share capital only; no loans, grants, investment or R&D tax credits |
| Prices | Premium £4.99/month; Insights Starter £49.99/month; Licence £2.00/enrolled student/year |
| Billing | Licences invoiced annually, one month before each term, on 30-day terms; revenue recognised monthly |
| In-kind support | NatWest Accelerator office space, legal and accountancy support until March 2027 |
| Corporation tax | 19% small profits rate; losses carried forward; 100% AIA on equipment; paid 9 months + 1 day after year end |
| Employer NI | 15% above £5,000 per employee; £10,500 Employment Allowance |
| Pension | 3% employer contribution on all salaries |
| VAT | Not registered; base-case turnover below £90,000 |
| Depreciation | IT equipment, straight-line over 36 months |

### F.2 Growth case — Profit & Loss

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| **Revenue** | **£569** | **£36,763** | **£149,301** | **£186,634** |
| Cost of sales | (£1,190) | (£4,053) | (£12,881) | (£18,124) |
| **Gross profit** | **(£620)** | **£32,710** | **£136,420** | **£168,510** |
| Salaries | – | – | (£118,833) | (£118,833) |
| Employer NI (after Employment Allowance) | – | – | (£2,950) | (£2,950) |
| Employer pension (3%) | – | – | (£3,565) | (£3,565) |
| Other staff costs (DBS, induction) | – | – | (£840) | (£840) |
| Advertising & marketing | (£800) | (£5,250) | (£12,000) | (£18,050) |
| Software & developer accounts | (£639) | (£1,159) | (£1,639) | (£3,437) |
| Insurance (PI, cyber, public & employers' liability) | (£600) | (£1,100) | (£2,350) | (£4,050) |
| Accountancy & bookkeeping | – | (£600) | (£1,710) | (£2,310) |
| Legal | – | (£900) | (£400) | (£1,300) |
| Office / co-working | (£125) | (£600) | (£3,600) | (£4,325) |
| Compliance (ICO, Cyber Essentials, IP, filings) | (£756) | (£486) | (£486) | (£1,728) |
| Travel & campus visits | (£360) | (£1,200) | (£3,600) | (£5,160) |
| Bank, telephone & internet | (£120) | (£216) | (£216) | (£552) |
| **Total overheads** | **(£3,400)** | **(£11,511)** | **(£152,189)** | **(£167,100)** |
| **EBITDA** | **(£4,020)** | **£21,199** | **(£15,770)** | **£1,409** |
| Depreciation | – | (£375) | (£1,726) | (£2,101) |
| **Operating profit / (loss)** | **(£4,020)** | **£20,824** | **(£17,496)** | **(£692)** |
| Corporation tax (19%, after losses b/f and 100% AIA) | – | (£2,979) | – | (£2,979) |
| **Profit / (loss) after tax** | **(£4,020)** | **£17,845** | **(£17,496)** | **(£3,671)** |
| Net margin | n/a | 48.5% | -11.7% |  |

### F.3 Growth case — Cash flow

|  | Year 1 (FY27) | Year 2 (FY28) | Year 3 (FY29) | 3-yr total |
|---|---:|---:|---:|---:|
| Opening cash | £6,000 | £1,980 | £30,012 | £6,000 |
| Receipts — Premium & Starter subscriptions | £569 | £5,097 | £12,134 | £17,800 |
| Receipts — licences & contracts (annual in advance) | – | £40,000 | £162,000 | £202,000 |
| **Total receipts** | **£569** | **£45,097** | **£174,134** | **£219,800** |
| Cost of sales | (£1,190) | (£4,053) | (£12,881) | (£18,124) |
| Staff costs (salaries, NI, pension) | – | – | (£126,188) | (£126,188) |
| Marketing | (£800) | (£5,250) | (£12,000) | (£18,050) |
| Other overheads (software, insurance, professional, office, compliance, travel) | (£2,600) | (£6,261) | (£14,001) | (£22,862) |
| Capital expenditure | – | (£1,500) | (£3,750) | (£5,250) |
| Corporation tax paid | – | – | (£2,979) | (£2,979) |
| **Total payments** | **(£4,590)** | **(£17,064)** | **(£171,800)** | **(£193,453)** |
| **Net cash flow** | **(£4,020)** | **£28,033** | **£2,335** | **£26,347** |
| **Closing cash** | **£1,980** | **£30,012** | **£32,347** | **£32,347** |

*In the growth case, turnover would pass the £90,000 VAT registration threshold during Year 3. Universities cannot usually recover VAT, so DEQUAD would review licence pricing at that point. The growth-case figures are shown net of VAT.*

---

*All figures are forecasts, not guarantees. This business plan was prepared by Yusuf Quadri (Founder & CEO) with Yusuff Adeagbo (Co-founder & CTO) for the UK Innovator Founder endorsement application to UKES. Version 6.0, October 2026.*
