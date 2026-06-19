"""Convert DEQUAD markdown documents to standalone branded PDFs.

Run with:  python /app/visa_appendices/build_ukes_pdf.py
Outputs:
  - /app/visa_appendices/DEQUAD_UKES_Business_Plan.html
  - /app/visa_appendices/DEQUAD_UKES_Business_Plan.pdf
  - /app/visa_appendices/B_cofounder_cv_template.html / .pdf
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import markdown

APPDIR = Path("/app/visa_appendices")
CHROME = shutil.which("google-chrome") or shutil.which("chromium") or "/root/bin/chromium"

CSS = """
@page { size: A4; margin: 22mm 18mm; }
body {
  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #0F2942;
  line-height: 1.55;
  font-size: 11.5pt;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 8px;
}
h1 {
  color: #0F2942;
  font-size: 26pt;
  border-bottom: 2px solid #5B9BD5;
  padding-bottom: 6px;
  page-break-after: avoid;
}
h2 {
  color: #0F2942;
  font-size: 17pt;
  margin-top: 32px;
  border-bottom: 1px solid #DDE8F2;
  padding-bottom: 4px;
  page-break-after: avoid;
}
h3 { color: #0F2942; font-size: 13pt; margin-top: 22px; page-break-after: avoid; }
h4 { color: #4F6076; font-size: 11pt; margin-top: 16px; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 10pt;
  page-break-inside: avoid;
}
th {
  background: #EDF4FB;
  color: #0F2942;
  text-align: left;
  padding: 7px 9px;
  border: 1px solid #DDE8F2;
}
td { padding: 6px 9px; border: 1px solid #DDE8F2; vertical-align: top; }
tr:nth-child(even) td { background: #F8FBFD; }
code { background: #F1F5F9; padding: 2px 5px; border-radius: 4px; font-size: 9.5pt; }
blockquote {
  border-left: 3px solid #5B9BD5;
  margin: 14px 0;
  padding: 4px 14px;
  background: #EDF4FB;
  color: #4F6076;
}
hr { border: 0; border-top: 1px dashed #DDE8F2; margin: 24px 0; }
ul, ol { padding-left: 22px; }
li { margin-bottom: 4px; }
strong { color: #0F2942; }
"""

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>
"""


def build(md_path: Path, html_path: Path, pdf_path: Path, title: str) -> None:
    md_text = md_path.read_text(encoding="utf-8")
    html_body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "toc", "attr_list", "sane_lists"],
    )
    html_path.write_text(TEMPLATE.format(title=title, css=CSS, body=html_body), encoding="utf-8")
    print(f"wrote {html_path}")

    cmd = [
        CHROME,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{html_path}",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if pdf_path.exists() and pdf_path.stat().st_size > 30_000:
        print(f"wrote {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")
    else:
        print(f"WARN: {pdf_path} suspiciously small")
        print("stderr:", res.stderr[-400:])


def merge_master_pdf() -> None:
    """Combine every UKES-pack PDF into one master submission file.

    Order chosen to read naturally for a reviewer: Decision Brief first
    (the 15-page UKES short-track summary), then full Business Plan,
    then each appendix in alphabetical reference order. The Excel
    Financial Model cannot be embedded — it stays as a sibling file
    alongside the master PDF.
    """
    try:
        from pypdf import PdfWriter
    except ImportError:
        print("pypdf not installed — skipping master merge")
        return

    order = [
        # Cover email (what UKES sees first — sent as the email body itself)
        ("UKES_Submission_Cover_Email.pdf", "00 Cover Email"),
        # Decision Brief — 15-page UKES short-track summary
        ("DEQUAD_UKES_Decision_Brief.pdf", "01 Decision-Maker Brief (15 pages)"),
        # Full plan
        ("DEQUAD_UKES_Business_Plan.pdf", "02 Business Plan"),
        # Pitch deck (visual narrative)
        ("DEQUAD_Pitch_Deck.pdf", "03 Pitch Deck (12 slides)"),
        # Risk register
        ("DEQUAD_Risk_Register.pdf", "04 Risk Register"),
        # Founder CVs
        ("B_founder_cv.pdf", "05 Appendix B — Yusuf Quadri CV"),
        ("B_cofounder_cv.pdf", "06 Appendix B-2 — Yusuff Adeagbo CV"),
        # New appendices
        ("N_wider_team_cvs.pdf", "07 Appendix N — Wider Team CVs"),
        ("O_safeguarding_certifications.pdf", "08 Appendix O — Safeguarding Certifications"),
        # Original supporting appendices (built in prior session)
        ("A_founder_academic_certificates.pdf", "09 Appendix A — Founder Academic Certificates"),
        ("C_personal_commitment_undertaking.pdf", "10 Appendix C — Personal Commitment"),
        ("D_wellbeing_baseline_methodology.pdf", "11 Appendix D — Wellbeing Baseline Methodology"),
        ("E_dpia.pdf", "12 Appendix E — DPIA"),
        ("G_job_descriptions.pdf", "13 Appendix G — Job Descriptions"),
        ("H_university_letter_of_interest_template.pdf", "14 Appendix H — University LOI Template"),
        ("I_online_safety_act_compliance.pdf", "15 Appendix I — Online Safety Act Compliance"),
        ("J_architecture_diagram.pdf", "16 Appendix J — Architecture Diagram"),
        ("K_product_screenshots.pdf", "17 Appendix K — Product Screenshots"),
    ]

    writer = PdfWriter()
    included = 0
    missing = []
    for filename, bookmark in order:
        path = APPDIR / filename
        if not path.exists():
            missing.append(filename)
            continue
        page_start = len(writer.pages)
        writer.append(str(path))
        writer.add_outline_item(bookmark, page_start)
        included += 1

    out = APPDIR / "DEQUAD_UKES_FULL_SUBMISSION.pdf"
    with open(out, "wb") as fp:
        writer.write(fp)
    size_kb = out.stat().st_size // 1024
    print(f"merged {included} PDFs → {out} ({size_kb} KB)")
    if missing:
        print(f"  (missing — skipped: {missing})")


def main() -> None:
    jobs = [
        (
            APPDIR / "UKES_Submission_Cover_Email.md",
            APPDIR / "UKES_Submission_Cover_Email.html",
            APPDIR / "UKES_Submission_Cover_Email.pdf",
            "DEQUAD — UKES Submission Cover Email",
        ),
        (
            APPDIR / "DEQUAD_UKES_Business_Plan.md",
            APPDIR / "DEQUAD_UKES_Business_Plan.html",
            APPDIR / "DEQUAD_UKES_Business_Plan.pdf",
            "DEQUAD — Business Plan (UKES Submission)",
        ),
        (
            APPDIR / "DEQUAD_UKES_Decision_Brief.md",
            APPDIR / "DEQUAD_UKES_Decision_Brief.html",
            APPDIR / "DEQUAD_UKES_Decision_Brief.pdf",
            "DEQUAD — Decision-Maker Brief (15 pages)",
        ),
        (
            APPDIR / "DEQUAD_Risk_Register.md",
            APPDIR / "DEQUAD_Risk_Register.html",
            APPDIR / "DEQUAD_Risk_Register.pdf",
            "DEQUAD — Risk Register",
        ),
        (
            APPDIR / "B_cofounder_cv.md",
            APPDIR / "B_cofounder_cv.html",
            APPDIR / "B_cofounder_cv.pdf",
            "DEQUAD — Co-Founder CV (Yusuff Adeagbo)",
        ),
        (
            APPDIR / "N_wider_team_cvs.md",
            APPDIR / "N_wider_team_cvs.html",
            APPDIR / "N_wider_team_cvs.pdf",
            "DEQUAD — Appendix N: Wider Founding Team CVs",
        ),
        (
            APPDIR / "O_safeguarding_certifications.md",
            APPDIR / "O_safeguarding_certifications.html",
            APPDIR / "O_safeguarding_certifications.pdf",
            "DEQUAD — Appendix O: Yusuf Quadri Safeguarding Certifications",
        ),
    ]

    # Earlier-session appendices that already exist as markdown — render to
    # PDF too so the master combined PDF can include them.
    for ref in [
        ("A_founder_academic_certificates", "DEQUAD — Appendix A: Founder Academic Certificates"),
        ("B_founder_cv", "DEQUAD — Appendix B: Founder CV (Yusuf Quadri)"),
        ("C_personal_commitment_undertaking", "DEQUAD — Appendix C: Personal Commitment & Undertaking"),
        ("D_wellbeing_baseline_methodology", "DEQUAD — Appendix D: Wellbeing Baseline Methodology"),
        ("E_dpia", "DEQUAD — Appendix E: DPIA"),
        ("G_job_descriptions", "DEQUAD — Appendix G: Job Descriptions"),
        ("H_university_letter_of_interest_template", "DEQUAD — Appendix H: University LOI Template"),
        ("I_online_safety_act_compliance", "DEQUAD — Appendix I: Online Safety Act Compliance"),
        ("J_architecture_diagram", "DEQUAD — Appendix J: Architecture Diagram"),
        ("K_product_screenshots", "DEQUAD — Appendix K: Product Screenshots"),
    ]:
        slug, title = ref
        md_path = APPDIR / f"{slug}.md"
        if md_path.exists():
            jobs.append((md_path, APPDIR / f"{slug}.html", APPDIR / f"{slug}.pdf", title))
    for md, html, pdf, title in jobs:
        if not md.exists():
            print(f"SKIP {md} — does not exist")
            continue
        build(md, html, pdf, title)

    merge_master_pdf()


if __name__ == "__main__":
    main()
