"""Render the DEQUAD pitch deck markdown to a landscape A4 PDF.

One slide per page. Brand palette matches the landing page / business plan.
Run with:  python /app/visa_appendices/build_pitch_deck.py
Output:    /app/visa_appendices/DEQUAD_Pitch_Deck.pdf
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import markdown

APPDIR = Path("/app/visa_appendices")
CHROME = shutil.which("google-chrome") or shutil.which("chromium") or "/root/bin/chromium"

CSS = """
@page { size: A4 landscape; margin: 0; }
* { box-sizing: border-box; }
body {
  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  color: #0F2942;
  background: #F6FAFE;
  margin: 0;
  padding: 0;
  font-size: 13pt;
  line-height: 1.5;
}
.slide {
  width: 297mm;
  height: 210mm;
  padding: 24mm 28mm;
  page-break-after: always;
  page-break-inside: avoid;
  background: #F6FAFE;
  position: relative;
  overflow: hidden;
}
.slide:last-child { page-break-after: auto; }
.slide.cover {
  background: linear-gradient(135deg, #0F2942 0%, #1A3F60 60%, #2C5680 100%);
  color: #F6FAFE;
  padding: 40mm 32mm;
}
.slide.cover h1 {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 84pt;
  font-weight: 800;
  margin: 0 0 6mm 0;
  letter-spacing: -2px;
  color: #F6FAFE;
  border: none;
}
.slide.cover h2 {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 28pt;
  font-weight: 400;
  margin: 0 0 14mm 0;
  color: #B7D4EE;
  border: none;
}
.slide.cover p { font-size: 13pt; line-height: 1.7; opacity: 0.92; }
.slide.cover p strong { color: #4FB89F; }

.slide h2 {
  font-family: "Playfair Display", Georgia, serif;
  color: #0F2942;
  font-size: 32pt;
  font-weight: 700;
  margin: 0 0 10mm 0;
  letter-spacing: -1px;
  border-bottom: 3px solid #5B9BD5;
  padding-bottom: 4mm;
  display: inline-block;
}
.slide h3 {
  font-size: 16pt;
  color: #0F2942;
  margin-top: 6mm;
}
.slide blockquote {
  border-left: 4px solid #4FB89F;
  margin: 6mm 0;
  padding: 4mm 8mm;
  background: #FFFFFF;
  font-size: 14pt;
  line-height: 1.7;
  border-radius: 4px;
}
.slide p { margin: 4mm 0; }
.slide strong { color: #0F2942; font-weight: 700; }
.slide ul { padding-left: 8mm; }
.slide li { margin-bottom: 3mm; }
.slide table {
  width: 100%;
  border-collapse: collapse;
  margin: 4mm 0;
  font-size: 11pt;
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(15, 41, 66, 0.06);
}
.slide th {
  background: #0F2942;
  color: #FFFFFF;
  padding: 6px 10px;
  text-align: left;
  font-weight: 700;
  font-size: 10pt;
  letter-spacing: 0.3px;
}
.slide td {
  padding: 5px 10px;
  border-bottom: 1px solid #DDE8F2;
  vertical-align: top;
}
.slide tr:last-child td { border-bottom: none; }
.slide tr:nth-child(even) td { background: #EDF4FB; }
.slide hr { display: none; }

/* Page number watermark */
.slide:not(.cover)::after {
  content: "DEQUAD · UKES Pre-Seed Deck · February 2026";
  position: absolute;
  bottom: 8mm;
  right: 28mm;
  font-size: 9pt;
  color: #94A3B0;
  letter-spacing: 1px;
}
"""

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DEQUAD — Pre-Seed Pitch Deck</title>
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>
"""


def main() -> None:
    md_path = APPDIR / "DEQUAD_Pitch_Deck.md"
    html_path = APPDIR / "DEQUAD_Pitch_Deck.html"
    pdf_path = APPDIR / "DEQUAD_Pitch_Deck.pdf"

    md_text = md_path.read_text(encoding="utf-8")
    # Strip the lone "---" horizontal-rule separators we used between slides
    # so they don't render an <hr/> inside the slide content. The .slide
    # <div> blocks are still parsed correctly as raw HTML by markdown.
    html_body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "attr_list", "sane_lists", "md_in_html"],
    )
    html_path.write_text(TEMPLATE.format(css=CSS, body=html_body), encoding="utf-8")

    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{html_path}",
    ]
    subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    size_kb = pdf_path.stat().st_size // 1024
    print(f"wrote {pdf_path} ({size_kb} KB)")


if __name__ == "__main__":
    main()
