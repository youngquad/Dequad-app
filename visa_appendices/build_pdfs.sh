#!/usr/bin/env bash
# Convert all DEQUAD submission markdown files to standalone PDFs.
# Requires: pandoc, chromium (or chrome/chromium-browser).
#
# Usage:
#   bash /app/visa_appendices/build_pdfs.sh
#
# Output:
#   - One PDF per source markdown
#   - A combined PDF in /app/visa_appendices/DEQUAD_Full_Submission.pdf

set -euo pipefail

APPDIR="/app/visa_appendices"
MASTER="/app/INNOVATOR_VISA_DEQUAD.md"

# Style block injected into the generated HTML for clean print output.
read -r -d '' STYLE_CSS <<'EOF' || true
<style>
  body { font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
         max-width: 720px; margin: 24px auto; padding: 0 16px; color: #1c1917;
         line-height: 1.5; font-size: 11pt; }
  h1, h2, h3 { font-family: Georgia, "Times New Roman", serif; color: #0f2942;
               page-break-after: avoid; }
  h1 { font-size: 22pt; margin-top: 0; }
  h2 { font-size: 16pt; border-bottom: 1px solid #DDE8F2; padding-bottom: 4px; }
  h3 { font-size: 13pt; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0;
          font-size: 9.5pt; }
  th, td { border: 1px solid #DDE8F2; padding: 6px 10px; text-align: left;
           vertical-align: top; }
  th { background: #F6FAFE; }
  code { background: #F6FAFE; padding: 1px 4px; border-radius: 4px;
         font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9.5pt; }
  pre { background: #F6FAFE; padding: 10px; border-radius: 6px; overflow-x: auto;
        font-size: 9pt; }
  blockquote { border-left: 3px solid #5B9BD5; padding-left: 12px;
               color: #4F6076; margin: 12px 0; }
  hr { border: none; border-top: 1px solid #DDE8F2; margin: 24px 0; }
</style>
EOF

if ! command -v pandoc >/dev/null 2>&1; then
  echo "✖ pandoc not installed. Run: sudo apt-get install -y pandoc"
  exit 1
fi

CHROME=""
for c in chromium chromium-browser google-chrome google-chrome-stable; do
  if command -v "$c" >/dev/null 2>&1; then
    CHROME="$c"
    break
  fi
done
if [ -z "$CHROME" ]; then
  echo "⚠ No chromium/chrome detected. HTML files will be generated; convert to PDF in your browser (Print → Save as PDF)."
fi

mkdir -p "$APPDIR/pdf"

convert_one() {
  local src="$1"
  local base
  base="$(basename "$src" .md)"
  local html_path="$APPDIR/$base.html"
  local pdf_path="$APPDIR/pdf/$base.pdf"

  echo "→ Building $base.html"
  pandoc "$src" -o "$html_path" --standalone \
         --metadata title="$base" \
         --metadata pagetitle="$base" \
         --include-in-header=<(echo "$STYLE_CSS")

  if [ -n "$CHROME" ]; then
    echo "  → Converting to PDF via $CHROME"
    "$CHROME" --headless --disable-gpu --no-sandbox \
              --print-to-pdf="$pdf_path" \
              --print-to-pdf-no-header \
              "file://$html_path" >/dev/null 2>&1 || true
  fi
}

# Master doc
convert_one "$MASTER"

# Appendices
for f in "$APPDIR"/A_*.md "$APPDIR"/B_*.md "$APPDIR"/C_*.md "$APPDIR"/D_*.md \
         "$APPDIR"/E_*.md "$APPDIR"/G_*.md "$APPDIR"/H_*.md "$APPDIR"/I_*.md \
         "$APPDIR"/J_*.md "$APPDIR"/K_*.md \
         "$APPDIR"/UKES_outreach_emails.md \
         "$APPDIR"/pitch_one_pager.md; do
  [ -f "$f" ] && convert_one "$f"
done

# Build combined PDF if poppler-utils is available
if command -v pdfunite >/dev/null 2>&1 && [ -n "$CHROME" ]; then
  echo "→ Combining all PDFs into DEQUAD_Full_Submission.pdf"
  pdfunite "$APPDIR/pdf/INNOVATOR_VISA_DEQUAD.pdf" \
           "$APPDIR/pdf/A_"*.pdf "$APPDIR/pdf/B_"*.pdf "$APPDIR/pdf/C_"*.pdf \
           "$APPDIR/pdf/D_"*.pdf "$APPDIR/pdf/E_"*.pdf "$APPDIR/pdf/G_"*.pdf \
           "$APPDIR/pdf/H_"*.pdf "$APPDIR/pdf/I_"*.pdf "$APPDIR/pdf/J_"*.pdf \
           "$APPDIR/pdf/K_"*.pdf \
           "$APPDIR/DEQUAD_Full_Submission.pdf" 2>/dev/null || true
  echo "✓ Combined PDF at $APPDIR/DEQUAD_Full_Submission.pdf"
elif [ -z "$CHROME" ]; then
  echo "ℹ Install chromium then re-run to build PDFs:"
  echo "    sudo apt-get install -y chromium poppler-utils"
fi

echo
echo "✓ All HTML files in:  $APPDIR/"
[ -n "$CHROME" ] && echo "✓ All PDF files in:   $APPDIR/pdf/"
echo "Open INNOVATOR_VISA_DEQUAD.html in your browser to verify formatting."
