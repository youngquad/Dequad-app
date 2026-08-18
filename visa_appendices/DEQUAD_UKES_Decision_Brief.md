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

- Software-only marginal cost → gross margin reaches ~87% by Y3.
- Within-institution network effects accelerate intra-uni adoption.
- 6-week implementation per new university enables a repeatable rollout process, deliberately modelled conservatively at c.1.5 paying institutions by Y3 (out of 285 total UK) so the plan does not depend on rapid conversion.
- Closed-network model maps cleanly to `.edu` / `.edu.au` / EU domains post-Y3 → **£180m TAM** in EN-language HE markets, as a longer-term opportunity beyond this 3-year plan.

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
| UK universities served | 0 signed (in conversation) | ~60 | ~30 | 200+ | n/a | n/a |
| ASP per uni | **£2/enrolled student/yr** (~£20k for a 10k-student uni) | £40k+ | £25k | £18k | n/a | n/a |

**DEQUAD would displace** Togetherall and TalkCampus (price/feature) on the B2B side, and **co-exist** with UniBuddy (orthogonal pre-enrolment market), if and when institutional conversations convert. Consumer competitors (Bumble BFF, Discord) lack institutional features entirely.

---

## Page 5 — Market

### UK addressable market

| Tier | Definition | Size |
|---|---|---:|
| **TAM** | All UK universities + ICBs + UK student premium subs | **£86m/yr** |
| **SAM** | Russell-Group + post-92 unis > 10k students + their ICBs | **£28m/yr** |
| **SOM (5-yr, long-term reference only)** | 12% SAM capture | **£3.4m ARR by Y5** |

*The SOM above is a long-term market-opportunity reference point, not a forecast — the committed 3-year plan (Page 10) targets a far smaller, self-funded base of c.£48k revenue by Y3.*

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
| **Universities** | "See loneliness early. Act before it becomes a crisis." | Direct DSS outreach + UUK Charter webinar + NatWest network intros | 12-week free pilot → paid SaaS (target, not guaranteed) |
| **NHS ICBs** | "Population-level student wellbeing data, anonymised and audit-ready." | Direct outreach to MH commissioners | Not part of this 3-year plan |

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
- **University of Bedfordshire Student Union President 2021–2023** (two consecutive terms). Represented the student body at senior-management level on student-services, safeguarding and welfare policy. This is the basis of DEQUAD's prospective pilot conversation with the same university.
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

**No pre-seed, seed, Series A, grant or R&D tax credit is assumed anywhere in this 3-year plan.** The full financial model (Page 10; main Business Plan Sections 11–14) is funded entirely by this £6,000 plus revenue generated in the period, and remains solvent even if institutional revenue is £0 throughout. If institutional traction significantly exceeds this conservative forecast, the founders may explore external investment beyond Year 3 — that is a future option, not a plan dependency.

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

R&D is delivered as unpaid founder time throughout Y1–Y2, plus modest paid capacity from Y3, focused on three bets:

1. **Identity-and-intent verification engine** — `.ac.uk` classifier, attestation, admin queue, future OCR student-ID flow.
2. **Wellbeing inference & safeguarding triage** — PHQ-9-lite mood model + risk-signal NLU + federated learning roadmap.
3. **Privacy & compliance infrastructure** — DPIA pipeline, OSA-2023 reporting, hash-based de-identification.

**No SME R&D tax credit is assumed as an inflow in this plan** — qualifying PAYE spend is minimal while founders are unpaid. It is treated as a possible future upside, to be explored with NatWest's in-kind accountancy support once qualifying costs exist, not something the plan relies on.

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

The key risks the founders have identified and their mitigations:

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Bedfordshire pilot conversation never converts — nothing is signed | Medium | The plan is solvent at zero institutional revenue throughout Y1–Y3 (Page 9–10); no cost line depends on this converting. Two further pilot conversations scoped as independent upside. |
| R2 | Co-founder hire delayed | High | Y1 build is solo-doable; founder personally covers technical work until co-founder onboarded. |
| R3 | Institutional/premium revenue falls short of plan targets | Medium | No funding round is required at any point; the only consequence is that the single Y3 hire and modest founder pay are delayed, not that the business fails. |
| R4 | Safeguarding incident (false negative) | High | Human-in-the-loop for all high-risk flags; insurance in place; clinical advisory board recruited Q2 Y2. |
| R5 | Togetherall/TalkCampus copy `.ac.uk` verification | Medium | First-mover land grab; safeguarding webhook + insights dashboard are deeper moats. |
| R6 | OfS / Online Safety Act non-compliance | Medium | OSA risk assessment and reporting flows already shipped; ICO DPIA drafted; legal review via NatWest Mishcon panel. |
| R7 | Cyber breach | Medium | Cyber Essentials in progress; pen-test scheduled Q2 Y2; insurance £1m. |
| R8 | Cost-of-living squeeze on premium subscriptions | Medium | Costs are scoped to survive on premium revenue alone if institutional revenue is delayed. |
| R9 | Negative PR from a misidentified case | Medium | Reactive media plan; clinical advisory board; transparent reporting. |
| R10 | International expansion delayed | Low | Not part of this 3-year plan; UK-only focus is deliberate and does not depend on any funding round. |
| R11 | LLM cost spike (model price changes) | Low | Multi-provider abstraction in place; can swap OpenAI ↔ Anthropic ↔ Gemini in < 1 day. |
| R12 | Tighter immigration regime affecting talent | Low | Both co-founders are already UK-resident; the plan's only hire is UK-based. |

Full risk register in `DEQUAD_Risk_Register.pdf`.

---

## Page 15 — Decision summary

DEQUAD is a **production-ready, accelerator-validated, self-funded** UK software business that meets the **innovation**, **viability** and **scalability** criteria for Innovator Founder endorsement.

### Three things this submission demonstrates

1. **Real product, real users** — the MVP is live, has real beta users at the University of Bedfordshire, and is governed by a DPIA-cleared safeguarding policy that ships before public launch.
2. **Capital efficiency and self-sufficiency** — the business survives all three years on **£6,000 of founder cash plus revenue alone**, with no external funding assumed, committed, or required at any point. The NatWest Accelerator in-kind support and an extended no-salary founder commitment (Y1–Y2) make this possible.
3. **Credible, honestly-scoped UK growth** — 2 unpaid founders (Y1–Y2) growing to 3 people / c.2.5 FTE by Y3, all self-funded from revenue; 0 to c.1.5 average paying universities by Y3, modelled as a target, not a guarantee.

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
| **Scalability** | Market sizing Page 5; gross-margin trajectory Page 10; international optionality noted as a longer-term ambition, Page 2. |
| **Genuine UK economic benefit** | Job creation Page 11; UK university wellbeing impact if a pilot converts. |
| **Founder credibility** | Page 7 + CVs in Appendix B and B-2. |
| **Capital sufficiency** | £6k founder capital + £31k in-kind (NatWest) is the entire funding basis for the 3-year plan — no external round assumed. Page 8 + 9. |

---

*Written and prepared by Yusuf Quadri, Founder & CEO, DEQUAD Ltd — for UKES short-track endorsement review, June 2026.*
*Companion documents: `DEQUAD_UKES_Business_Plan.pdf`, `DEQUAD_Financial_Model.xlsx`, `DEQUAD_Risk_Register.pdf`.*
