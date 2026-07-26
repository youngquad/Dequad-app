# DEQUAD — Innovator Founder Endorsement Submission Package

**Endorsing body:** UK Endorsement Services Ltd (UKES)
**Applicant:** Yusuf Quadri
**Business:** DEQUAD (DEQUAD Ltd in formation)
**Live product:** https://dequad.co.uk
**Submission date:** ___________________

---

## Package contents

### Master document
- 📄 **`/app/INNOVATOR_VISA_DEQUAD.md`** — Full 21-section endorsement application (~10,000 words)
- 📄 **`/app/visa_appendices/INNOVATOR_VISA_DEQUAD.html`** — Web-ready version of the master document
- 📄 **`/app/visa_appendices/DEQUAD_Pitch_OnePager.html`** — 1-page pitch (open in browser, "Print → Save as PDF" for A4 output)

### Outreach
- 📨 **`UKES_outreach_emails.md`** — 3-email sequence for engaging UKES pre-submission

### Appendices

| Code | Filename | What it contains | Status |
|---|---|---|---|
| **A** | `A_founder_academic_certificates.md` | Academic qualifications register + verification routes | ⚠️ Applicant to complete with real certificates |
| **B** | `B_founder_cv.md` | Founder CV (template — fill in personal history) | ⚠️ Applicant to complete |
| **C** | `C_personal_commitment_undertaking.md` | Signed Innovator Founder personal undertaking | ⚠️ Applicant to sign |
| **D** | `D_wellbeing_baseline_methodology.md` | Technical methodology paper on per-user baseline detection | ✅ Complete |
| **E** | `E_dpia.md` | UK GDPR Data Protection Impact Assessment | ✅ Complete (DPO review pending) |
| **F** | `F_financial_model.csv` | 5-year P&L, cashflow, headcount model (open in Excel/Numbers) | ✅ Complete |
| **G** | `G_job_descriptions.md` | All 42 UK FTE roles with salary bands + DEI commitments | ✅ Complete |
| **H** | `H_university_letter_of_interest_template.md` | LOI template for partner universities | ⚠️ Real letters to be collected |
| **I** | `I_online_safety_act_compliance.md` | OSA 2023 compliance opinion (internal — external opinion pending) | ✅ Complete (external opinion ETA Month 2 post-endorsement) |
| **J** | `J_architecture_diagram.md` | Technology stack, security controls, scalability plan | ✅ Complete |
| **K** | `K_product_screenshots.md` | Register of product screenshots (live link supplied to UKES) | ⚠️ Screenshots to be captured before submission |

---

## What's needed from the applicant before submission

A pre-submission checklist:

### Must do
- [ ] **A** — Scan academic certificates + ECCTIS statement (if non-UK qualifications)
- [ ] **B** — Fill in CV with real employment history
- [ ] **C** — Sign + witness the personal-commitment undertaking
- [ ] **H** — Collect at least one written Letter of Interest from a UK university (Manchester verbal interest noted)
- [ ] **K** — Capture 15 product screenshots from the live app at `dequad.co.uk`
- [ ] Decide on UK registered-office address for DEQUAD Ltd
- [ ] Confirm UK mobile number for contact

### Should do
- [ ] Engage external Data Protection Officer (recommended: The DPO Centre) and have them counter-sign the DPIA in Appendix E
- [ ] Engage external solicitor (Online Safety Act specialism) and commission the formal legal opinion referenced in Appendix I
- [ ] Open conversation with at least 2 more UK universities (additional LOIs strengthen the application)
- [ ] Open quote with Hiscox + Markel for D&O / Cyber / PI / PL insurance — attach quotes to Appendix B/G evidence pack

### Nice to have
- [ ] Apply to Innovate UK Smart Grant (mental-health stream) in parallel — strengthens viability evidence
- [ ] Apply for inclusion on the JISC Library framework
- [ ] Schedule introductory call with the NHS Innovation Accelerator

---

## How to convert everything to PDF for UKES

UKES accepts submissions via their online portal (preferred) or by email. Most assessors prefer searchable PDFs.

### Option 1 — Web browser "Print to PDF" (simplest)

Open each `.html` file in Chrome/Safari → File → Print → Save as PDF → A4 portrait.

### Option 2 — Command line via pandoc + Chrome

```bash
# Install Chrome (if not already)
# Mac: brew install --cask google-chrome
# Linux: apt-get install -y chromium

# Convert each markdown file
cd /app/visa_appendices
for f in *.md; do
  pandoc "$f" -o "${f%.md}.html" --standalone --metadata title="$(basename "$f" .md)"
  chromium --headless --no-sandbox --print-to-pdf="${f%.md}.pdf" \
           --print-to-pdf-no-header "file://$(pwd)/${f%.md}.html" 2>/dev/null
done
```

### Option 3 — Use the helper script

```bash
bash /app/visa_appendices/build_pdfs.sh
```

(Script provided in the package — see below.)

---

## Suggested filing order for UKES

Most endorsing bodies want documents in a specific order. UKES's published guidance asks for:

1. **Cover letter** _(not yet drafted — applicant to write 1-page intro on company letterhead once DEQUAD Ltd is incorporated)_
2. **Master endorsement document** — `INNOVATOR_VISA_DEQUAD.pdf`
3. **Appendix A → K in alphabetical order**
4. **Cross-cutting evidence pack** — Letters of Interest, insurance quotes, IP filings, founder credentials

A combined PDF can be generated with:

```bash
pdfunite /app/INNOVATOR_VISA_DEQUAD.pdf /app/visa_appendices/A_*.pdf /app/visa_appendices/B_*.pdf \
         /app/visa_appendices/C_*.pdf /app/visa_appendices/D_*.pdf /app/visa_appendices/E_*.pdf \
         /app/visa_appendices/F_*.pdf /app/visa_appendices/G_*.pdf /app/visa_appendices/H_*.pdf \
         /app/visa_appendices/I_*.pdf /app/visa_appendices/J_*.pdf /app/visa_appendices/K_*.pdf \
         /app/visa_appendices/DEQUAD_Full_Submission.pdf
```

(Requires `poppler-utils` — `apt-get install -y poppler-utils`)

---

## Realism notes (for the applicant's own QA)

UKES assessors are quick to reject applications that look "AI-generated startup hype". The package above is deliberately:

- **Conservative on numbers** — £3.6m ARR by Y5 is below what a comparable SaaS would project; chosen for credibility, not aspirational drama.
- **Specific on UK regulation** — references OfS B3, OSA 2023 schedules, DPA 2018 Sch 1, NICE NG133, NHS DSPT, Cyber Essentials Plus. These are the touch-points UKES expects.
- **Honest about what's not done** — DPO not yet appointed, external OSA opinion not yet commissioned, formal LOIs not yet collected. All flagged as "ETA Month N post-endorsement" rather than hidden.
- **Verifiable** — the live product at `dequad.co.uk` is the strongest credibility signal an Innovator Founder can present. Mention it everywhere.

If you have any other questions, ask the assistant — most adjustments are 5-minute edits.
