# DEQUAD — 1-Page Pitch

_Prepared for UK Endorsement Services Ltd as part of the Innovator Founder route enquiry. Designed to be printed or rendered as a single A4 PDF._

---

## DEQUAD
**The closed-network student wellbeing platform built for UK universities.**

🌐 **https://dequad.co.uk** — live product · 📍 London, United Kingdom · 👤 Founder: Yusuf Quadri

---

### The problem

> Over half of UK university students feel frequently lonely (ONS, 2023). One in three develops a diagnosable mental-health condition during their degree (Student Minds, 2024). University counselling waits average six weeks.

University services are overwhelmed. The Office for Students' Condition B3 (2023) and the Higher Education Mental Health Charter now require a **whole-university** approach with proactive, out-of-hours peer support — a category no UK platform serves.

### What we do

DEQUAD is a **closed**, identity-verified social network for UK university students. Three integrated services in a single mobile + web app:

| | |
|---|---|
| **Verified peer matching** | `.ac.uk` email gate. Matches based on course, society, lifestyle. **Not a dating app.** |
| **Daily wellbeing tracking** | Per-user baseline detection identifies deterioration ~3 weeks earlier than self-report. |
| **Safeguarding & 24/7 support** | Real-time crisis-keyword scanning escalates to trained safeguarding leads at the partner university. |

### How we make money

- **Universities pay** £1.50–£2.80 per student per year (below the cost of expanding in-house counselling).
- **NHS Integrated Care Boards** commission from Year 3.
- **Premium student features** (groups, events) — £19.99 / year.
- **Anonymised research data licences** to NIHR / MQ Mental Health (Year 4+).

> **Year 5 ARR target: £4.6m.** Break-even Q3 Year 3. Funding required: £900k to break-even.

### Why DEQUAD wins

| Incumbents | Why they lose this market |
|---|---|
| Togetherall | Anonymous text forum only; no peer matching; no university scope |
| Spectrum.Life | Phone EAP; no student-facing peer features |
| Calm / Headspace | Solo apps; no institutional safety story |
| Bumble BFF / Yubo | No verification, no safeguarding partnership, US brand baggage |

DEQUAD is the **only** UK platform combining `.ac.uk` verification + peer matching + per-user wellbeing baselines + safeguarding-led messaging.

### Why now

- **Online Safety Act 2023** — Schedule 11 raises compliance costs for incumbents; rewards UK-domiciled, safeguarding-first products.
- **OfS B3 + HE Mental Health Charter** — 90+ UK universities under regulatory pressure to procure peer-wellbeing tooling.
- **JISC** finds **78% of UK universities** plan to procure digital-wellbeing platforms in 2025–2027.

### The founder

**Yusuf Quadri** — full-stack founder. Built the entire DEQUAD platform end-to-end to live, working condition (FastAPI backend, React Native/Expo native + web frontends, Stripe billing, safeguarding pipeline, admin dashboard). University of Manchester pilot interest already secured.

### UK impact (5-year plan)

| | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|---|---|---|---|---|---|
| Partner universities | 3 | 10 | 25 | 50 | 100 |
| Students reached | 15k | 80k | 200k | 500k | 1.2m |
| UK FTE jobs created | 4 | 10 | 19 | 30 | **42** |
| ARR | £22.5k | £150k | £600k | £2.0m | **£4.6m** |

### The ask

We are seeking UKES endorsement under the Innovator Founder route to formally launch DEQUAD Ltd from a UK base, hire 42 UK-based employees over five years, deliver measurable mental-health outcomes for UK university students, and contribute to the UK's public-benefit innovation ecosystem.

---

### Contact

**Yusuf Quadri** · Founder & CEO · quadri.yusuf@dequad.com · https://dequad.co.uk

---

*Innovation. Viability. Scalability — evidence for all three statutory criteria provided in the full endorsement document (INNOVATOR_VISA_DEQUAD.md) plus 13 supporting appendices.*

---

## How to convert this to PDF

```bash
# Install pandoc + wkhtmltopdf if not already present
apt-get install -y pandoc wkhtmltopdf

# Convert with a clean style sheet
pandoc /app/visa_appendices/pitch_one_pager.md \
       -o /app/visa_appendices/DEQUAD_Pitch_OnePager.pdf \
       --pdf-engine=wkhtmltopdf \
       --variable=geometry:a4paper,margin=14mm \
       --variable=fontsize:10pt \
       --variable=mainfont:Helvetica
```
