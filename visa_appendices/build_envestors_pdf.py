"""Convert DEQUAD markdown documents to standalone branded PDFs.

Run with:  python /app/visa_appendices/build_envestors_pdf.py
Outputs:
  - /app/visa_appendices/DEQUAD_Envestors_Business_Plan.html
  - /app/visa_appendices/DEQUAD_Envestors_Business_Plan.pdf
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


def main() -> None:
    jobs = [
        (
            APPDIR / "DEQUAD_Envestors_Business_Plan.md",
            APPDIR / "DEQUAD_Envestors_Business_Plan.html",
            APPDIR / "DEQUAD_Envestors_Business_Plan.pdf",
            "DEQUAD — Business Plan (Envestors Submission)",
        ),
        (
            APPDIR / "DEQUAD_Envestors_Decision_Brief.md",
            APPDIR / "DEQUAD_Envestors_Decision_Brief.html",
            APPDIR / "DEQUAD_Envestors_Decision_Brief.pdf",
            "DEQUAD — Decision-Maker Brief (15 pages)",
        ),
        (
            APPDIR / "DEQUAD_Risk_Register.md",
            APPDIR / "DEQUAD_Risk_Register.html",
            APPDIR / "DEQUAD_Risk_Register.pdf",
            "DEQUAD — Risk Register",
        ),
        (
            APPDIR / "B_cofounder_cv_template.md",
            APPDIR / "B_cofounder_cv_template.html",
            APPDIR / "B_cofounder_cv_template.pdf",
            "DEQUAD — Co-Founder CV (Template)",
        ),
    ]
    for md, html, pdf, title in jobs:
        if not md.exists():
            print(f"SKIP {md} — does not exist")
            continue
        build(md, html, pdf, title)


if __name__ == "__main__":
    main()
