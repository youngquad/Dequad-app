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
| **Funding ask Y1** | £150,000 pre-seed bridge (Sep Y1, post-pilot conversion) |
| **3-yr revenue** | £12k → £186k → £699k |
| **3-yr UK jobs** | 2 → 6 → 12 |
| **Op profit positive** | Q3 Year 3 |
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
- **Anchor pilot live with University of Bedfordshire** — the founder's former institution where he served two terms as SU President (2021–2023). Pilot target signature Q2 Y1, conversion to paid SaaS Q3 Y1 (Sep), which is also when the pre-seed bridge lands.
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
| ASP per uni | £12k–£20k | £40k+ | £25k | £18k | n/a | n/a |

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

- £0 in Q1–Q2 (personal savings).
- £1,500/month each from M7 (Sep Y1) once the £150k pre-seed bridge lands.
- Materially below market — signals genuine founder commitment.

---

## Page 8 — Funding ladder

| Round | Timing | Amount | Use of funds |
|---|---|---:|---|
| Founder equity (£3,000 × 2) | Day 1 | **£6,000** | Incorporation, domains, IP filings, hosting. |
| R&D tax credit | End Y1 | ~£3,600 | Recycled into engineering. |
| **Pre-seed bridge** | **Sep Y1** (after Bedfordshire pilot converts) | **£150,000** | First 4 hires, 18-month runway, dual mobile builds. |
| Seed round | Q2 Y2 | £750,000 | 20-uni scale, ML team, NHS-ICB channel. |
| Series A | Q1 Y4 | £3–5m | EU + AU launch, federated-learning, 30+ FTE. |

The **pre-seed is contingent on the University of Bedfordshire pilot converting** — the round will only be approached after that institution provides commercial validation. This is deliberate; it forces customer-led growth.

---

## Page 9 — Year-1 cash flow (the critical view)

### Monthly closing cash balance is positive every single month of Year 1

| Month | Inflows | Outflows | Closing balance |
|---|---:|---:|---:|
| M1 (Mar) — incorporation | £6,000 founder | (~£1,090) | **£4,910** |
| M2 (Apr) | — | (~£820) | **£4,090** |
| M3 (May) | £200 sales | (~£860) | **£3,430** |
| M4 (Jun) | £350 | (~£780) | **£3,000** |
| M5 (Jul) | £500 | (~£780) | **£2,720** |
| M6 (Aug) | £700 | (~£750) | **£2,670** |
| **M7 (Sep) — £150k pre-seed lands + Bedfordshire pilot converts** | **£150,800** | (£4,830) | **£148,640** |
| M8 (Oct) | £1,100 | (£4,750) | **£144,990** |
| M9 (Nov) | £1,350 | (£4,750) | **£141,590** |
| M10 (Dec) | £1,700 | (£4,830) | **£138,460** |
| M11 (Jan) | £2,100 | (£4,810) | **£135,750** |
| M12 (Feb) | £3,188 | (£5,910) | **£133,028** |

> **The £6,000 founder cash buffer means cash never dips below £2,500** in any month before the pre-seed bridge — a significantly more comfortable runway than the £3k starting case. The Bedfordshire pilot conversion in M7 is the single critical commercial event of Year 1, and the founders' direct relationship with the university (via the former SU presidency) is the principal de-risking factor.

The full monthly schedule is in `DEQUAD_Financial_Model.xlsx`, sheet "Cash Flow Y1 (mo)".

---

## Page 10 — Three-year P&L summary

| | Y1 | Y2 | Y3 |
|---|---:|---:|---:|
| Revenue | £11,988 | £185,808 | £699,280 |
| Cost of Sales | (£1,440) | (£15,600) | (£54,000) |
| Gross Profit | £10,548 | £170,208 | £645,280 |
| Gross margin % | 88.0% | 91.6% | 92.3% |
| Total overheads | (£28,620) | (£231,480) | (£579,260) |
| **EBITDA** | **(£18,072)** | **(£61,272)** | **£66,020** |
| **Operating profit** | **(£18,372)** | **(£62,772)** | **£61,520** |

**Operating profit positive in Q3 Year 3.** Cumulative loss before profitability ≈ £81k — small for a venture-funded company because the NatWest Accelerator + lean founder pay materially reduce Y1 + Y2 burn.

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
| R1 | First-pilot conversion slips beyond Sep Y1 | High | 3 LOIs in parallel; pivot to NHS ICB pilot if HEI cycle delayed. |
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
2. **Capital efficiency** — the business can survive Year 1 on **£3,000 of founder cash** because of the NatWest Accelerator in-kind support and a 6-month no-salary founder commitment. The pre-seed bridge is conservatively timed for *after* the first paid pilot converts.
3. **Credible UK growth** — 2 to 12 UK jobs in 3 years, 1 to 20 paying universities, operating profit positive Q3 Y3.

### What endorsement enables

- The lead applicant retains UK residency to continue building DEQUAD full-time.
- The co-founder (UK-resident already) joins formally as CTO at incorporation.
- £150k of UK pre-seed capital enters the company in Sep Y1, unlocking the first 4 UK hires.
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

*Prepared for UKES short-track endorsement review — February 2026.*
*Companion documents: `DEQUAD_UKES_Business_Plan.pdf`, `DEQUAD_Financial_Model.xlsx`, `DEQUAD_Risk_Register.pdf`.*
