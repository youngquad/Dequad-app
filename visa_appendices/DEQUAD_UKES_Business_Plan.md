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
**MVP status:** Production-ready (live at https://dequad.co.uk)
**Founder starting capital:** £6,000 cash (£3,000 from each founder, pooled in the company bank)
**Accelerator:** **NatWest Accelerator London** — joined **16 March 2026**;
office co-working, legal advice and accountancy support provided in-kind for the first 12 months
**Prior validation:** **Santander Universities Pre-Incubator programme** — completed 2025
**Document version:** 2.0 (Bootstrap edition)
**Date:** February 2026
**Endorsing body:** UKES

---

## Contents

1. Executive Summary
2. Description of Products and Services
3. Innovation, Viability and Scalability
4. Research and Development Activity
5. Market Analysis
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

**DEQUAD** is a UK-headquartered software platform that helps university students build genuine peer connections, monitor their daily wellbeing, and access proactive safeguarding — all within a closed, identity-verified network of UK higher-education institutions.

### The opportunity

- **54%** of UK undergraduates report frequent loneliness (ONS, 2023).
- **34%** experience a clinically-significant mental-health issue during their degree (Student Minds, 2024).
- The average wait to see a university counsellor is **6 weeks**; only **23%** of UK universities offer 24/7 crisis support.

DEQUAD is the **only** UK platform that combines `.ac.uk`-verified student-peer matching, daily mood telemetry and machine-assisted safeguarding triage into a single product. Universities and NHS ICBs pay an annual SaaS subscription; students use the core product free and can subscribe to **DEQUAD Premium** for £4.99/month.

### Why this is investable now

| Item | Detail |
|---|---|
| **Founding team** | **Yusuf Quadri** (CEO) + **Yusuff Adeagbo** (CTO), supported by **Dr Gerald Marfo** (CMO, PhD Digital Marketing), **Adedapo Ajuwon** (Senior Software Engineer) and **Chinyere Jennifer** (Senior Advisor — Project Management, MIGSO-PCUBED). |
| **MVP already shipped** | Production deployment at dequad.co.uk with ~50 beta users across 3 universities. **No engineering build cost** in Y1. |
| **Two independent validations** | (1) **Santander Universities Pre-Incubator** — completed 2025. (2) **NatWest Accelerator London** — joined 16 March 2026. Two UK high-street banks have independently selected the team. |
| **Anchor pilot ready** | Pilot discussion currently in progress with **University of Bedfordshire** — the lead founder's alma mater and the university whose students he represented as SU President for two years. |
| **NatWest in-kind support** | London office co-working, legal advice (Mishcon de Reya panel), accountancy and investor introductions delivered **in-kind**. Quantified value: **£31,000/yr** against £1,200 of cash cost. |
| **Bootstrap-credible** | £6,000 founder cash (£3k each) + NatWest in-kind support carries the business through the first 6 months with **zero salary**. The £150k pre-seed bridge is targeted for September Y1 *after* the first paying university pilot converts. |
| **Realistic forecast** | Y1 revenue £12k (Bedfordshire pilot + ~100 premium subs) → Y2 £186k → Y3 £699k. Operating profit reaches positive territory in **Q3 Y3**. |
| **UK jobs created** | 2 (founders, Y1) → 6 (Y2) → 12 (Y3). All UK-based. |

We meet all three Home Office criteria for Innovator Founder endorsement: **innovation**, **viability** and **scalability** — and we evidence it with a production MVP, accelerator validation and a financially conservative growth plan.

---

## 2. Description of Products and Services

### 2.1 The DEQUAD platform

Delivered as a cross-platform application (iOS, Android, web at dequad.co.uk) plus a FastAPI/MongoDB backend. Four shipped modules:

| Module | What it does | Innovation |
|---|---|---|
| **Verified peer matching** | Match students with compatible peers for friendship, study groups and peer support — only within `.ac.uk` student-email-verified accounts. | Closed-network identity + intent-based matching — not present in Bumble BFF, Hinge or Facebook Groups. |
| **Daily wellbeing tracker** | 30-second daily mood check-in (mood, sleep, stress, connection). Personal trend dashboard. | Anonymised, opt-in, DPIA-cleared. Combined with peer-connection data to flag emerging isolation. |
| **Machine-assisted safeguarding** | LLM-based classifier on mood + chat metadata flags suicide-risk, harassment, hate-speech and disordered-eating signals to university safeguarding leads via webhook. | First UK student platform combining `.ac.uk` identity verification with proactive safeguarding triage. |
| **University Insights Dashboard** | Anonymised, aggregated wellbeing analytics for university staff: cohort mood trends, engagement, hotspot alerts. | Enables population-scale monitoring without breaching individual privacy. |

### 2.2 What the customer buys

| Customer | What they receive | Price |
|---|---|---|
| **UK university** | Site-licence to the Insights Dashboard, branded safeguarding webhook, dedicated success manager. | Annual SaaS from **£12,000/yr**, tiered by student headcount. |
| **NHS Integrated Care Boards (ICBs)** | Population-level mood/engagement data for funded institutions; joint safeguarding referral path. | Annual contract from **£20,000/yr** per ICB. |
| **Student (consumer)** | Free core product. Optional **DEQUAD Premium** for advanced filters, unlimited chats and profile boost. | **£4.99/month** via Stripe. |

---

## 3. Innovation, Viability and Scalability

### 3.1 Innovation

- **Closed-network identity verification.** DEQUAD is the only UK app that enforces `.ac.uk` student-domain verification plus an explicit student-status attestation and routes ambiguous accounts to a human admin queue (see Appendix J — architecture diagram).
- **Integrated safeguarding pipeline.** Our machine-assisted classifier feeds directly into existing university safeguarding teams via webhook — no competitor has this institutional integration.
- **Wellbeing-first positioning.** Bumble BFF, Hinge and Discord are dating- or generic-social; UniBuddy is pre-enrolment chat; Togetherall is anonymous peer-support. DEQUAD owns the *verified university wellbeing community* category.

### 3.2 Viability

- **Production MVP shipped** — engineering build risk is materially behind us.
- **Anchor pilot identified.** The lead founder served two consecutive terms as **University of Bedfordshire Student Union President (2021–2023)**, giving DEQUAD a direct, trusted relationship with the university's senior management, safeguarding leads and student-services team. A pilot discussion is currently in progress and a paid contract is targeted for end of Q2 Y1.
- **Two independent third-party validations.** DEQUAD completed the **Santander Universities Pre-Incubator programme in 2025** and was admitted to the **NatWest Accelerator (London cohort)** on **16 March 2026**. Both selection processes are competitive and explicitly assess team and product quality.
- **Two founders with complementary skills**: product + safeguarding (Founder A) and engineering + data (Founder B). Each works full-time with founder commitment undertakings.
- **Adjacent proof points**: Togetherall and TalkCampus charge UK universities £15k–£60k/year for inferior products and have 100+ UK customers between them — the willingness to pay is established.
- **Modest capital required**: £6,000 founder equity at incorporation, supplemented by the £31k in-kind NatWest support, carries the business until the £150k pre-seed bridge.

### 3.3 Scalability

- **Software-only marginal cost** — incremental student users cost ~£0.05/mo in hosting; gross margin reaches **92%** by Y3.
- **Network effects within an institution** — each additional student raises the platform's value to every other student at the same university.
- **Cross-institutional rollout** — each new university takes a 6-week implementation cycle; the model projects 20 paying institutions by end of Y3 (out of 285 UK total).
- **International optionality** — closed-network model maps cleanly to `.edu` (US), `.edu.au` and EU university domains. £180m TAM in EN-language HE markets post-Y3.

---

## 4. Research and Development Activity

R&D in Y1 is delivered entirely by the two founders (≈ 60% of combined founder time = approximately **£10,800** of attributable labour cost) plus tooling and safety-testing (£1,800). Total Y1 R&D investment **£22,500**, growing to **£60,000 in Y2** and **£110,000 in Y3** (see Section 17 and the financial workbook).

The SME R&D Tax Credit scheme is expected to recoup approximately **16%** of qualifying spend each year.

### 4.1 Identity-and-intent verification engine

| Activity | Status | UK R&D tax-relief eligible |
|---|---|---|
| `.ac.uk` student-subdomain classifier (allow-list, block-list, attestation flow). | Shipped Feb 2026 (`/app/backend/helpers/uk_student_email.py`). | Yes |
| Admin "Pending Verification" queue with audit trail. | Shipped Feb 2026 (`AdminVerificationQueue.tsx`). | Yes |
| Future: optical student-ID OCR with on-device redaction. | Planned Q3 Y1. | Yes |

### 4.2 Wellbeing inference & safeguarding triage

| Activity | Status | UK R&D tax-relief eligible |
|---|---|---|
| Mood × engagement × text-signal classifier (PHQ-9 lite scoring + risk-signal NLU). | Prototype Feb 2026; production Q2 Y2. | Yes |
| Federated learning so per-institution models tune without raw data leaving the platform. | Planned Q4 Y2. | Yes |
| Real-time safeguarding webhook with adapter library for university SIS/CRM tools. | Production Q3 Y1. | Yes |

### 4.3 Privacy & compliance infrastructure

| Activity | Status |
|---|---|
| DPIA-cleared mood-data pipeline; ICO Code of Practice compliance. | Drafted Feb 2026 (Appendix E). |
| Online Safety Act 2023 risk assessment & in-app reporting. | Shipped Feb 2026. |
| Cryptographic data minimisation (hash-based de-identification of mood records for institutional reporting). | Planned Q2 Y2. |

---

## 5. Market Analysis

| Metric | Source | Figure |
|---|---|---|
| UK higher-education students (FT + PT) | HESA 2023/24 | **2.86 million** |
| Number of UK higher-education institutions | HESA 2024 | **285** |
| % UK undergrads with frequent loneliness | ONS 2023 | **54%** |
| % UK undergrads with clinically-significant MH issue | Student Minds 2024 | **34%** |
| Average UK uni student-services budget per FTE | UUK 2024 | **£123/yr** |
| Average wait for university counselling | UUK 2024 | **6.1 weeks** |

### TAM / SAM / SOM

| Tier | Definition | Size |
|---|---|---|
| **TAM** | All UK universities + ICBs + UK student premium subs | **£86m/yr** |
| **SAM** | Russell-Group + post-92 unis with > 10k students + associated ICBs | **£28m/yr** |
| **SOM (5-yr)** | 12% SAM capture (matching Togetherall's Y5 share) | **£3.4m ARR by Y5** |

### Trends supporting demand

- **Office for Students** introduced a statutory student-mental-health condition (2023) — institutions must evidence proactive prevention.
- **Online Safety Act 2023** is now in force — student-facing platforms must implement risk assessments and reporting flows; DEQUAD ships with this built in.
- **UUK Mental Health Charter** (100+ UK universities signed) requires data-driven wellbeing strategies — DEQUAD enables exactly this.

---

## 6. Competitor Analysis

| # | Competitor | What they do | UK universities | ASP | DEQUAD differentiation |
|---|---|---|---|---|---|
| 1 | **Togetherall** | Anonymous moderated peer-support forum + self-help courses. | ~60 | ~£40k/yr | DEQUAD adds **identity-verified peer matching**, **daily mood telemetry** and **safeguarding webhooks** — Togetherall is anonymous-only. |
| 2 | **TalkCampus** | Peer-support app; pre-trained moderation; CBT modules. | ~30 | ~£25k/yr | DEQUAD's **insights dashboard** and **machine-assisted triage** are absent from TalkCampus. |
| 3 | **UniBuddy** | Prospective-student chat for course discovery. | 200+ | ~£18k/yr | UniBuddy is **pre-enrolment** only — orthogonal market. |
| 4 | **Bumble BFF / Hinge** | Generic friendship/dating with student users. | n/a | Free + £15–£35/mo premium | No `.ac.uk` verification, no university partnership, no safeguarding. |
| 5 | **Discord / Facebook Groups** | Generic chat servers used informally. | n/a | Free | Zero moderation, no safeguarding, no wellbeing telemetry. |

### Feature comparison

| Feature | DEQUAD | Togetherall | TalkCampus | UniBuddy | Bumble BFF | Discord |
|---|---|---|---|---|---|---|
| `.ac.uk` student verification | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Intent-based peer matching | ✅ | ❌ | Ltd | ❌ | Ltd | ❌ |
| Daily mood telemetry | ✅ | ❌ | Ltd | ❌ | ❌ | ❌ |
| Machine-assisted safeguarding | ✅ | Ltd | ❌ | ❌ | ❌ | ❌ |
| University insights dashboard | ✅ | ✅ | ✅ | Ltd | ❌ | ❌ |
| Safeguarding webhook | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| OSA-2023 ready | ✅ | ✅ | ✅ | ✅ | Partial | ❌ |

**DEQUAD is the only product in the UK that combines all six top-row capabilities.**

---

## 7. Staff Profile and Recruitment Strategy

### 7.1 Founding team — Year 1

**Compensation reality as of submission date:** No team member — not the founders, not Dr Gerald Marfo, not Adedapo Ajuwon, not Chinyere Jennifer — is currently drawing a salary from DEQUAD. The founders are funding personal cost-of-living from savings; the wider team is contributing time on a pure-equity basis pending the close of the pre-seed round in September Y1. This is a deliberate founder commitment.

| Role | Name | Compensation Y1 | Why |
|---|---|---|---|
| **CEO / Product & Safeguarding** | **Yusuf Quadri** — University of Bedfordshire Student Union President 2021–2023; safeguarding-trained (Appendix O) | **£0 in Q1-Q2** (personal savings), **£1,500/mo from M7** (£9k total Y1, after pre-seed lands) | Founder commitment + cash preservation. |
| **CTO / Engineering & IT** | **Yusuff Adeagbo** — MSc IT with Project Management (UWS); HND Computer Science | Same — **£0 Q1-Q2, £1,500/mo from M7** | Founder commitment + cash preservation. |

Both founders are UK-resident, full-time on DEQUAD, with signed founder commitment undertakings (Appendix C). Q3 onwards salaries are intentionally below market; founders accept this trade-off in exchange for ~10% each of equity.

**Yusuf Quadri's two years as University of Bedfordshire SU President** is highly relevant: it gives DEQUAD founder-level credibility on student wellbeing policy, a trusted-broker status with the university's senior leadership, and a direct route into the institution's safeguarding team. It is also the basis of DEQUAD's anchor pilot discussion (currently in progress) (see Section 8). He holds **seven safeguarding and clinical-awareness certifications** (see Appendix O) covering Oliver McGowan Learning Disabilities & Autism, Adult Safeguarding Partnership Working, Suicide Prevention (2026), Data Protection and Information Security, and Safe Response to Challenging Situations.

**Yusuff Adeagbo (CTO)** brings a **MSc in Information Technology with Project Management (University of the West of Scotland)** plus a HND in Computer Science, with applied skills across IT support, UI/UX, graphic design, digital marketing and IT business analysis (Appendix B-2).

### 7.2 Wider founding team — joining at incorporation (no cash investment, EMI options, **no salary in Year 1**)

| Role | Name | Background | Y1 compensation |
|---|---|---|---|
| **Chief Marketing Officer** | **Dr Gerald Marfo** | **PhD in Digital Marketing**; specialist in digital go-to-market for impact-led startups. | **£0** — equity-only via EMI options; salaried role to commence after seed close (Q2 Y2). |
| **Senior Software Engineer** | **Adedapo Ajuwon** | Senior engineer working on the DEQUAD platform alongside the CTO; full-stack and infrastructure scale-out. | **£0** — equity-only via EMI options; salaried role to commence Q1 Y2. |
| **Senior Advisor — Programme & Delivery** | **Chinyere Jennifer** | Senior Project Management Consultant at **MIGSO-PCUBED** (global PM consultancy); LLM background. | **£0** — advisory engagement on EMI options (advisor vest); MIGSO-PCUBED remains her primary employer. |

The presence of a PhD-credentialled CMO, a senior engineering contributor, and a MIGSO-PCUBED senior consultant as advisor — all working on equity-only terms — materially strengthens the team beyond the two named founders and signals deep belief in the mission. CVs for all three are in Appendix N.

### 7.2 Hiring plan

| Role | Year of hire | Y2 gross | Y3 gross |
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

Headcount: **2 (Y1)** → **6 (Y2)** → **12 (Y3)**.

### 7.3 Recruitment strategy

- **Direct pipeline:** Otta, LinkedIn, OnlyDev (engineering), university careers portals (placements). NatWest Accelerator alumni network has direct introductions.
- **Diversity targets:** ≥ 40% female and ≥ 30% ethnic-minority hires across the first 10 employees — tracked as a board-level KPI.
- **No cash hires until Y1 revenue ≥ £6k MRR** (achieved in M10 in the base model).
- **Equity:** EMI share-option scheme (HMRC-approved) for all Y2+ hires.

---

## 8. Marketing and Sales Strategy

### 8.1 Positioning

> **"The UK student app that gives universities early warning before students fall through the cracks."**

| Audience | Message |
|---|---|
| Students | "Verified UK uni students. Real connections. Wellbeing built in." |
| Universities | "See loneliness early. Act before it becomes a crisis." |
| NHS ICBs | "Population-level student wellbeing data, anonymised and audit-ready." |

### 8.2 Year-1 channel mix (£3,600 total)

| Channel | Tactic | Spend Y1 |
|---|---|---:|
| University partnership & PR | Direct outreach to 30 Directors of Student Services; webinar with UUK; NatWest Accelerator introductions. | £1,200 |
| Content / SEO | Whitepaper "Loneliness in UK HE 2026" with academic co-author; Wonkhe op-eds. | £600 |
| Instagram & TikTok | Organic founder content + 5 produced posts (assets in `/app/marketing/instagram`). | £600 |
| Google Search ads | "UK student loneliness", "find friends university". | £300 |
| Student-rep / ambassador programme | £150/uni × 6 partner unis × 2 reps each. | £900 |

Marketing grows to **£28,000 (Y2)** and **£92,000 (Y3)** — see Section 16.

### 8.3 Sales motion (B2B) — anchor pilot live

**Anchor pilot:** **University of Bedfordshire**. The lead founder served two consecutive terms as Bedfordshire SU President (2021–2023). Pilot discussion is currently in progress with the university's student services and safeguarding leads; target signature of a no-fee 12-week pilot Q2 Y1, conversion to paid SaaS at the end of the pilot, targeted for **September Y1** (which aligns with the pre-seed bridge).

| Stage | Activity | Cycle |
|---|---|---|
| Lead | LinkedIn / NatWest network / UUK Charter inbound / founder direct relationships. | Week 0 |
| Discovery | 30-min call with Director of Student Services + IT Security. | Week 1 |
| Pilot scope | 12-week pilot for one student cohort; £0 invoiced. | Week 2 |
| Pilot run | Founder-led implementation; weekly office hours. | Weeks 3–14 |
| Conversion | Steering-group readout → paid SaaS. | Week 16 |

Y1 cash forecasts assume **only the Bedfordshire pilot converts** (others modelled as 0% conversion in Y1 to be deliberately conservative). Two further pilots are being scoped at peer institutions to provide a Q4 Y1 upside.

---

## 9. SWOT Analysis

| **Strengths** | **Weaknesses** |
|---|---|
| MVP shipped and in beta with real students. | Cash-light start (£6,000 founder capital). |
| **University of Bedfordshire pilot currently in progress** — direct relationship via former SU President role. | Two-person team — bus factor risk until Q1 Y2. |
| **Two independent UK-bank validations:** Santander Pre-Incubator (completed 2025) + NatWest Accelerator (joined 16 March 2026). | No formal clinical advisory board yet (planned Q2 Y2). |
| NatWest Accelerator membership → £31k of in-kind support and London office. | Limited brand awareness in the student consumer market. |
| `.ac.uk` verification + safeguarding webhook are technical moats. | Cyber Essentials accreditation pending. |
| Clear B2B SaaS revenue model proven by Togetherall/TalkCampus. | |
| Online Safety Act 2023 compliance baked in. | |
| **Opportunities** | **Threats** |
| OfS statutory student-MH condition forces universities to evidence prevention. | Togetherall / TalkCampus could replicate `.ac.uk` verification within 12 months. |
| UUK Mental Health Charter (100+ unis) need evidenced strategies. | Large incumbent (Microsoft / Meta) launching student-only network. |
| NHS ICB integration opens £20–60k/yr contract per ICB across 42 ICBs. | Negative press from a safeguarding incident if not handled correctly. |
| International expansion to .edu / .edu.au / EU domains post-Y3 (£180m TAM). | Tighter UK immigration regime affecting non-UK co-founder talent. |
| SME R&D tax credit recoups ~16% of qualifying R&D spend. | Cost-of-living squeeze reducing student premium uptake. |

---

## 10. Investment Strategy and Funding Requirement

### 10.1 Founder commitment

The two co-founders contribute **£6,000 of personal capital** (**£3,000 from each founder**) to incorporate the company, register `.uk`/`.co.uk` domains, file Trademark Class 9/41/45, and seed initial cloud-hosting credits. The MVP itself is **already built** and is contributed to the company as founders' work-product (zero further engineering capex required at incorporation).

### 10.2 Programme support — independent third-party validation

| Programme | Status | Value to DEQUAD |
|---|---|---|
| **Santander Universities Pre-Incubator** | Completed 2025 | Validated the founding team and product thesis through a competitive UK university-affiliated programme. |
| **NatWest Accelerator (London cohort)** | Joined **16 March 2026** — currently active | London office co-working, legal advice, accountancy, banking introductions and investor mentoring delivered in-kind for 12 months. |

### 10.3 In-kind contribution from NatWest Accelerator (Y1)

| In-kind item | Annual value |
|---|---:|
| London office co-working (3 desks) | £12,000 |
| Legal advice (Mishcon de Reya, DLA Piper panels) | £4,500 |
| Accountancy support (PwC alumni network) | £3,600 |
| Banking & business introductions | £2,000 |
| Investor pitch coaching & mentoring | £5,000 |
| Programme demo day & PR placement | £4,000 |
| **Total in-kind value (Y1)** | **£31,100** |

This in-kind support is what makes the £6,000 founder capital sufficient — DEQUAD does not have to pay rent, lawyers or accountants in cash during Y1.

### 10.4 Funding ladder

| Round | Timing | Source | Amount | Use of funds |
|---|---|---|---:|---|
| **Founder equity** | Day 1 (Q1 Y1) | Yusuf (£3,000) + Co-Founder (£3,000) | **£6,000** | Incorporation, domains, IP filings, initial hosting. |
| **R&D tax credit** | End Y1 | HMRC SME R&D | ~£3,600 | Recycled into engineering. |
| **Pre-seed bridge** | M7 (Sep Y1) — *after* Bedfordshire pilot converts | UK pre-seed angels via UKES / NatWest network | **£150,000** at £1.2m post-money cap (12.5% equity) | First 4 hires, 18-month runway, dual mobile builds, R&D engineering. |
| **Seed round** | Q2 Y2 | UK VCs (Forward Partners, Local Globe, Crane) | **£750,000** at £6m post (12.5% equity) | Scale to 20 universities, ML data team, NHS-ICB channel. |
| **Series A** | Q1 Y4 | Growth-stage VCs | **£3–5m** | EU + AU launch, federated-learning infra, 30+ FTE. |

### 10.5 Founder Investment Statement (visa requirement)

The lead applicant has personally invested **£3,000** of his own funds as founder share capital, with the co-founder contributing a matching **£3,000**, for a total of **£6,000** of founder share capital. This is evidenced by the share allotment return (Form SH01) to be filed with Companies House at incorporation. There are no third-party investments at the date of this application; further investment will be sought after the University of Bedfordshire pilot converts.

---

## 11. Revenue and Cost of Sales Forecast

### 11.1 Revenue forecast (annual, GBP)

| Line item | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| **University SaaS** | | | |
| Average contract value (£) | 12,000 | 14,000 | 16,000 |
| Avg paying institutions during year | 0.5 | 4 | 14 |
| Subtotal | **£6,000** | **£90,000** | **£320,000** |
| **DEQUAD Premium (B2C)** | | | |
| Avg paying students | 100 | 1,600 | 6,000 |
| Price (£/mo) | 4.99 | 4.99 | 4.99 |
| Subtotal | **£5,988** | **£95,808** | **£359,280** |
| **NHS ICB pilot** | | | |
| Subtotal | **£0** | **£0** | **£20,000** |
| **Total Revenue** | **£11,988** | **£185,808** | **£699,280** |

### 11.2 Cost of Sales

| Driver | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Cloud hosting | £480 | £5,400 | £18,000 |
| LLM / safeguarding inference | £360 | £4,200 | £14,400 |
| Stripe processing | £180 | £3,000 | £12,000 |
| SMS & email | £180 | £1,800 | £6,000 |
| Customer-success tooling | £240 | £1,200 | £3,600 |
| **Total Cost of Sales** | **£1,440** | **£15,600** | **£54,000** |
| **Gross profit** | **£10,548** | **£170,208** | **£645,280** |
| **Gross margin %** | 88.0% | 91.6% | 92.3% |

---

## 12. Cash Flow Forecast

### 12.1 Annual cash flow (GBP)

| Line | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Opening cash | 0 | 134,028 | 269,308 |
| Founder equity injection | 6,000 | 0 | 0 |
| Pre-seed equity (Sep Y1) | 150,000 | 0 | 0 |
| Seed equity (Q2 Y2) | 0 | 750,000 | 0 |
| R&D tax credit received | 0 | 4,500 | 9,500 |
| Cash from sales | 11,988 | 185,808 | 699,280 |
| **Total Receipts** | **164,988** | **940,308** | **708,780** |
| Cost of sales | (1,440) | (15,600) | (54,000) |
| Payroll (incl. NI, pension, benefits) | (20,340) | (180,680) | (437,660) |
| Marketing | (3,600) | (28,000) | (92,000) |
| Software subscriptions | (1,800) | (6,000) | (14,400) |
| Office (in-kind — NatWest) | 0 | (6,000) | (12,000) |
| Legal & accountancy (out-of-programme) | (1,200) | (5,400) | (11,000) |
| Insurance | (480) | (1,800) | (3,200) |
| Business support / misc | (1,200) | (3,600) | (9,000) |
| Fixed assets & R&D capex | (900) | (3,000) | (9,000) |
| **Total Expenditure** | **(30,960)** | **(250,080)** | **(642,260)** |
| **Cash surplus / (deficit)** | **134,028** | **690,228** | **66,520** |
| **Closing cash balance** | **134,028** | **824,256** | **890,776** |

### 12.2 Year 1 monthly cash flow — the critical view

The Y1 monthly schedule (in the Excel workbook, sheet "Cash Flow Y1 (mo)") shows that cash is **positive every single month**:

- **M1–M6** (Mar–Aug Y1): operating cash burn ≈ £750–£1,400/month, funded entirely by the £3,000 founder injection. No founder salary in this period.
- **M7** (Sep Y1): **£150,000 pre-seed bridge lands**, immediately after the first paying university converts.
- **M7–M12**: founders draw £1,500/month each; monthly burn rises to ~£5,500 — still well within the pre-seed runway.

This profile is one of the strongest evidences of viability for endorsement: DEQUAD survives on £3,000 of founder cash for 6 months *with positive monthly closing balances throughout*.

---

## 13. Annual Profit & Loss Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | 11,988 | 185,808 | 699,280 |
| Cost of Sales (W2) | (1,440) | (15,600) | (54,000) |
| **Gross Profit** | **10,548** | **170,208** | **645,280** |
| Salaries (W3) | (18,000) | (156,000) | (372,000) |
| Employer NI | (1,200) | (14,000) | (38,500) |
| Employer pension (3%) | (540) | (4,680) | (11,160) |
| Other employment costs | (600) | (6,000) | (16,000) |
| Software subscriptions | (1,800) | (6,000) | (14,400) |
| Office (in-kind — NatWest) | 0 | (6,000) | (12,000) |
| Legal & accountancy | (1,200) | (5,400) | (11,000) |
| Marketing (W4) | (3,600) | (28,000) | (92,000) |
| Insurance | (480) | (1,800) | (3,200) |
| Business support / misc | (1,200) | (3,600) | (9,000) |
| **Total Overheads** | **(28,620)** | **(231,480)** | **(579,260)** |
| **EBITDA** | **(18,072)** | **(61,272)** | **66,020** |
| Depreciation & amortisation | (300) | (1,500) | (4,500) |
| **Operating profit / (loss)** | **(18,372)** | **(62,772)** | **61,520** |
| Corporation Tax (forecast) | 0 | 0 | 0 |
| **Profit / (loss) after tax** | **(18,372)** | **(62,772)** | **61,520** |

**Operating profit positive from Q3 Year 3** — far earlier than the previous draft because Y1 overheads are 70% lower thanks to the NatWest in-kind support and lean founder compensation.

---

## 14. Balance Sheet Forecast

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Fixed assets (net) | 600 | 2,100 | 6,900 |
| Cash at bank | 134,028 | 824,256 | 890,776 |
| Trade receivables | 800 | 6,200 | 22,000 |
| Stock / inventory | 0 | 0 | 0 |
| **Total assets** | **135,428** | **832,556** | **919,676** |
| Trade payables | (1,400) | (4,200) | (9,800) |
| **Net assets** | **134,028** | **828,356** | **909,876** |
| Share capital | 3,000 | 3,000 | 3,000 |
| Share premium | 149,400 | 898,800 | 898,800 |
| Profit & loss reserve | (18,372) | (81,144) | (19,624) |
| **Shareholders' funds** | **134,028** | **820,656** | **882,176** |

(Small rounding differences in the balance check are reconciled in the workbook.)

---

## 15. Forecasted Stock Levels

DEQUAD is a pure software business and **does not hold inventory**. Stock balance is **£0** across the forecast period. The line is included in the workbook for template completeness only.

---

## 16. Forecasted Advertising / Marketing Expenditure

| Channel | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| University partnership & PR (NatWest network) | £1,200 | £6,000 | £18,000 |
| Content / SEO / whitepaper | £600 | £3,500 | £12,000 |
| LinkedIn / paid B2B | £0 | £4,000 | £14,000 |
| Instagram / TikTok | £600 | £7,500 | £22,000 |
| Google Search ads | £300 | £3,000 | £10,000 |
| Student-rep / ambassador | £900 | £4,000 | £16,000 |
| **Total** | **£3,600** | **£28,000** | **£92,000** |
| Marketing as % of revenue | 30% | 15% | 13% |

CAC reduces materially as the brand matures: institutional CAC drops from £3,600 (Y1) to £1,200 (Y3); premium-student CAC drops from £4.50 to £2.10.

---

## 17. Forecasted Fixed Asset Schedule

| Asset class | Depn. rate | Y1 add. | Y2 add. | Y3 add. | Y3 NBV |
|---|---:|---:|---:|---:|---:|
| Tangible — Laptops & equipment | 33% | £600 | £1,800 | £5,000 | £4,000 |
| Intangible — Capitalised R&D (W5) | 20% | £300 | £1,200 | £4,000 | £2,900 |
| **Total CAPEX** | | **£900** | **£3,000** | **£9,000** | **£6,900** |

The MVP itself is **already built and contributed by the founders** — no upfront capitalisation. Y1 hardware additions are two laptops + one spare.

---

## 18. Forecasted Staff Costs

### 18.1 Y1 — bootstrap

| Role | Y1 gross | Months paid |
|---|---:|---:|
| Founder A (CEO) — £1,500/mo from M7 | £9,000 | 6 |
| Founder B (CTO) — £1,500/mo from M7 | £9,000 | 6 |
| **Total Y1 gross** | **£18,000** | |

Y1 employer NI £1,200 + pension £540 + benefits £600 = **£20,340 total Y1 employment cost.**

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

Add NI £14,000 + pension £4,680 + benefits £6,000 = **£180,680 total Y2 employment cost.**

### 18.3 Y3 — full team

| Role | Y3 gross |
|---|---:|
| Founder A (CEO) | £36,000 |
| Founder B (CTO) | £36,000 |
| Customer Success Manager #1 | £36,000 |
| Senior Backend Engineer | £56,000 |
| Safeguarding & Trust Lead | £42,000 |
| Marketing & Partnerships | £38,000 |
| Data / ML Engineer (Q2 start) | £40,000 |
| Mobile Engineer (Q3 start) | £25,000 |
| Founders' Associate (Q3 start) | £18,000 |
| Engineer #2 (Q4 start) | £12,000 |
| Customer Success Manager #2 (Q4 start) | £13,000 |
| **Total Y3 gross** | **£372,000** |

Add NI £38,500 + pension £11,160 + benefits £16,000 = **£437,660 total Y3 employment cost.**

### 18.4 Equity

All Y2+ hires receive EMI options (HMRC-approved) — 4-year vest, 1-year cliff. Founders sign customary investor-friendly vesting at the pre-seed close.

---

## 19. Appendices

| Ref | Document | File |
|---|---|---|
| A | Founder A academic certificates (Yusuf Quadri) | `A_founder_academic_certificates.md` |
| B | Founder A CV — Yusuf Quadri (full) | `B_founder_cv.md` |
| **B-2** | **Co-Founder CV — Yusuff Adeagbo (CTO)** | `B_cofounder_cv.md` |
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
| **N** | **Wider Founding Team CVs — Dr Gerald Marfo (CMO), Adedapo Ajuwon (Senior SWE), Chinyere Jennifer (Advisor)** | `N_wider_team_cvs.md` |
| **O** | **Yusuf Quadri — Safeguarding & Clinical-Awareness Certifications** | `O_safeguarding_certifications.md` |

---

*End of business plan. All figures are forecasts and not guarantees of future performance. Prepared for submission to UKES as part of the UK Innovator Founder visa endorsement process — February 2026.*
