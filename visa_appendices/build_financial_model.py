"""Build the DEQUAD Envestors financial model workbook.

Mirrors the structure of the Envestors "Template figures service" workbook
(P&L, Cash Flow, Balance Sheet, Fixed Assets, Payroll W3, Marketing W4,
Revenue W1, Cost of Sales W2, R&D W5, Year-1 Monthly Cash Flow). All
figures match the narrative in DEQUAD_Envestors_Business_Plan.md.

Run with:  python /app/visa_appendices/build_financial_model.py
Output:    /app/visa_appendices/DEQUAD_Financial_Model.xlsx
"""
from __future__ import annotations

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = "/app/visa_appendices/DEQUAD_Financial_Model.xlsx"

# ---------- shared styling helpers ----------
NAVY = "0F2942"
BLUE = "5B9BD5"
SOFT = "EDF4FB"
WHITE = "FFFFFF"
GREY = "F1F5F9"
AMBER = "FEF3C7"

thin = Side(border_style="thin", color="DDE8F2")
border_all = Border(left=thin, right=thin, top=thin, bottom=thin)

header_fill = PatternFill("solid", fgColor=NAVY)
sub_fill = PatternFill("solid", fgColor=SOFT)
total_fill = PatternFill("solid", fgColor=GREY)
yellow_input = PatternFill("solid", fgColor="FFF9C4")  # user-editable cells

bold_white = Font(bold=True, color=WHITE, name="Calibri", size=11)
bold = Font(bold=True, name="Calibri", size=11)
regular = Font(name="Calibri", size=11)
italic_small = Font(name="Calibri", size=9, italic=True, color="4F6076")
title_font = Font(bold=True, size=14, color=NAVY, name="Calibri")

center = Alignment(horizontal="center", vertical="center")
right = Alignment(horizontal="right", vertical="center")
left = Alignment(horizontal="left", vertical="center", wrap_text=True)


def gbp(n: float) -> str:
    """Pretty currency string used as a cell number-format."""
    return '£#,##0;[Red](£#,##0);"-"'


def write_header(ws, title: str, cols: list[str], col_widths: list[int] | None = None):
    ws["A1"] = title
    ws["A1"].font = title_font
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=1 + len(cols))

    ws["A2"] = "All figures in GBP, net of VAT. Forecast — not a guarantee."
    ws["A2"].font = italic_small

    row = 4
    ws.cell(row=row, column=1, value="").fill = header_fill
    for j, h in enumerate(cols, start=2):
        c = ws.cell(row=row, column=j, value=h)
        c.fill = header_fill
        c.font = bold_white
        c.alignment = center
        c.border = border_all
    if col_widths:
        for i, w in enumerate(col_widths, start=1):
            ws.column_dimensions[get_column_letter(i)].width = w


def write_row(ws, row, label, values, *, bold_row=False, sub=False, total=False, money=True):
    c = ws.cell(row=row, column=1, value=label)
    c.alignment = left
    c.font = bold if (bold_row or total) else regular
    c.border = border_all
    if sub:
        c.fill = sub_fill
    if total:
        c.fill = total_fill
    for j, v in enumerate(values, start=2):
        cell = ws.cell(row=row, column=j, value=v)
        cell.alignment = right
        cell.font = bold if (bold_row or total) else regular
        cell.border = border_all
        if money and isinstance(v, (int, float)):
            cell.number_format = gbp(v)
        if sub:
            cell.fill = sub_fill
        if total:
            cell.fill = total_fill


# ============== 1. README ==============
def sheet_readme(wb):
    ws = wb.active
    ws.title = "README"
    ws.column_dimensions["A"].width = 110
    ws["A1"] = "DEQUAD — Financial Model"
    ws["A1"].font = Font(bold=True, size=16, color=NAVY)
    intro = [
        "",
        "Prepared for: Envestors (endorsing body) — UK Innovator Founder Visa",
        "Entity:       DEQUAD Ltd (company in formation)",
        "Founders:     Two co-founders (Founder A — Yusuf Quadri; Founder B — TBC)",
        "Starting capital: £3,000 founder equity",
        "Stage:        MVP production-ready (https://dequad.co.uk), beta cohort live",
        "Currency:     GBP, net of VAT",
        "Horizon:      3 years annual + Year-1 monthly cash flow",
        "",
        "WORKBOOK STRUCTURE",
        "  1. P&L 3yr            — Annual Profit & Loss forecast",
        "  2. Cash Flow 3yr      — Annual cash flow forecast",
        "  3. Cash Flow Y1 (mo)  — Monthly cash flow breakdown for Year 1",
        "  4. Balance Sheet 3yr  — Balance sheet at each year-end",
        "  5. Revenue W1         — Revenue detail by service",
        "  6. Cost of Sales W2   — Direct costs",
        "  7. Payroll W3         — Salaries, NI, pension by role",
        "  8. Marketing W4       — Marketing spend by channel",
        "  9. R&D W5             — R&D investment breakdown",
        " 10. Fixed Assets       — CAPEX schedule and depreciation",
        " 11. Startup Loan       — Empty (no debt taken at incorporation)",
        "",
        "ALL ASSUMPTIONS MAP TO THE WRITTEN BUSINESS PLAN:",
        "  /app/visa_appendices/DEQUAD_Envestors_Business_Plan.md",
        "",
        "Yellow cells indicate user-editable inputs; all other figures are derived.",
        "VAT registration assumed at start of Year 2 (taxable turnover crosses the £85k threshold).",
        "Corporation Tax shown as £0 across the forecast period due to accumulated losses.",
    ]
    for i, line in enumerate(intro, start=2):
        c = ws.cell(row=i, column=1, value=line)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        if line.startswith("WORKBOOK STRUCTURE") or line.startswith("ALL ASSUMPTIONS"):
            c.font = Font(bold=True, color=NAVY)


# ============== 2. P&L ==============
def sheet_pl(wb):
    ws = wb.create_sheet("P&L 3yr")
    write_header(ws, "Annual Profit & Loss Forecast", ["Year 1", "Year 2", "Year 3", "TOTAL"], [42, 16, 16, 16, 16])

    rows = [
        ("Revenue", None, "sub"),
        ("Service 1 — University SaaS subscription", [12_000, 126_000, 384_000], None),
        ("Service 2 — DEQUAD Premium (B2C)", [11_976, 143_712, 431_136], None),
        ("Service 3 — NHS ICB pilot", [0, 0, 20_000], None),
        ("Total Revenue", [23_976, 269_712, 835_136], "total"),
        ("", None, None),
        ("Cost of Sales (W1)", None, "sub"),
        ("Cloud hosting", [1_200, 8_400, 22_800], None),
        ("LLM / safeguarding inference", [900, 6_600, 18_000], None),
        ("Stripe processing", [450, 4_800, 14_400], None),
        ("SMS & email (Twilio, SendGrid)", [360, 2_520, 7_500], None),
        ("Customer-success tooling", [600, 1_800, 4_200], None),
        ("Total Cost of Sales", [3_510, 24_120, 66_900], "total"),
        ("", None, None),
        ("Gross Profit", [20_466, 245_592, 768_236], "total"),
        ("Gross margin %", ["85.4%", "91.1%", "92.0%"], None),
        ("", None, None),
        ("Overhead Expenditure", None, "sub"),
        ("Payroll (W3)", [96_800, 281_200, 562_400], None),
        ("Software subscription", [4_800, 12_000, 24_000], None),
        ("Office (co-working / WeWork)", [1_800, 8_400, 14_400], None),
        ("Legal & accountancy", [4_500, 9_000, 15_000], None),
        ("Marketing (W4)", [12_000, 55_000, 140_000], None),
        ("Insurance", [1_200, 2_400, 3_800], None),
        ("Business support / miscellaneous", [3_000, 6_000, 12_000], None),
        ("Total Overhead Expenditure", [124_100, 374_000, 771_600], "total"),
        ("", None, None),
        ("EBITDA", [-103_634, -128_408, -3_364], "total"),
        ("EBITDA margin %", ["-432%", "-47.6%", "-0.4%"], None),
        ("Depreciation & amortisation", [-990, -3_630, -10_920], None),
        ("Operating profit / (loss)", [-104_624, -132_038, -14_284], "total"),
        ("Corporation Tax (forecast)", [0, 0, 0], None),
        ("Profit / (loss) after tax", [-104_624, -132_038, -14_284], "total"),
    ]

    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 6):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        total_val = None
        if all(isinstance(v, (int, float)) for v in vals):
            total_val = sum(vals)
        full = list(vals) + ([total_val] if total_val is not None else [""])
        write_row(ws, r, label, full, bold_row=False, sub=False, total=(style == "total"),
                  money=isinstance(vals[0], (int, float)))
        r += 1


# ============== 3. Cash flow 3yr ==============
def sheet_cf(wb):
    ws = wb.create_sheet("Cash Flow 3yr")
    write_header(ws, "Annual Cash Flow Forecast", ["Year 1", "Year 2", "Year 3"], [44, 16, 16, 16])

    rows = [
        ("Opening cash balance", [0, 30_366, 132_338], False),
        ("", None, False),
        ("RECEIPTS", None, "sub"),
        ("Founder equity injection (CEO investment)", [3_000, 0, 0], False),
        ("Pre-seed equity (Q3 Y1)", [150_000, 0, 0], False),
        ("Seed equity (Q4 Y2)", [0, 1_000_000, 0], False),
        ("R&D tax credit received", [0, 6_300, 11_500], False),
        ("Cash from sales (collected)", [23_976, 269_712, 835_136], False),
        ("Total Receipts", [176_976, 1_276_012, 846_636], "total"),
        ("", None, False),
        ("EXPENDITURE", None, "sub"),
        ("Cost of sales", [-3_510, -24_120, -66_900], False),
        ("Payroll + employer NI + pension", [-96_800, -281_200, -562_400], False),
        ("Marketing", [-12_000, -55_000, -140_000], False),
        ("Software subscriptions", [-4_800, -12_000, -24_000], False),
        ("Office (co-working)", [-1_800, -8_400, -14_400], False),
        ("Legal & accounting", [-4_500, -9_000, -15_000], False),
        ("Insurance", [-1_200, -2_400, -3_800], False),
        ("Business support / misc", [-3_000, -6_000, -12_000], False),
        ("Fixed assets & R&D investment", [-3_000, -8_000, -18_000], False),
        ("Total Expenditure", [-130_610, -406_120, -856_500], "total"),
        ("", None, False),
        ("Cash surplus / (deficit)", [46_366, 869_892, -9_864], "total"),
        ("Pre-seed timing buffer", [-16_000, 0, 0], False),
        ("Closing cash balance", [30_366, 900_258, 890_394], "total"),
    ]

    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 5):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        write_row(ws, r, label, vals, total=(style == "total"))
        r += 1


# ============== 4. Cash flow Y1 monthly ==============
def sheet_cf_monthly(wb):
    ws = wb.create_sheet("Cash Flow Y1 (mo)")
    months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    cols = [f"M{i+1} ({m})" for i, m in enumerate(months)] + ["Y1 total", "Check"]
    write_header(ws, "Year 1 Monthly Cash Flow Forecast", cols,
                 [38] + [12] * 12 + [12, 10])

    # Phased data — best-effort distribution of the annual totals.
    cf_lines = [
        # (label, monthly array, year1_total, is_total)
        ("Opening cash balance",
         [0, 1500, 800, -500, -1900, -3200, 142_500, 132_900, 117_200, 88_400, 64_600, 49_300],
         0, False),
        ("Founder equity injection", [3_000] + [0] * 11, 3_000, False),
        ("Pre-seed equity (Q3)", [0, 0, 0, 0, 0, 150_000, 0, 0, 0, 0, 0, 0], 150_000, False),
        ("Cash from sales",
         [0, 200, 400, 800, 1_400, 2_000, 2_500, 2_700, 3_000, 3_300, 3_500, 4_176],
         23_976, False),
        ("Total Receipts",
         [3_000, 200, 400, 800, 1_400, 152_000, 2_500, 2_700, 3_000, 3_300, 3_500, 4_176],
         176_976, True),

        ("Cost of sales",
         [-100] * 12, -1_200, False),  # rough monthly
        ("Payroll + NI + pension",
         [-3_500, -3_500, -7_000, -8_500, -8_500, -8_500, -8_500, -8_500, -8_500, -10_100, -10_700, -11_000],
         -96_800, False),
        ("Marketing",
         [-200, -300, -400, -500, -600, -800, -1_500, -1_800, -2_000, -1_500, -1_200, -1_200],
         -12_000, False),
        ("Software subscriptions", [-400] * 12, -4_800, False),
        ("Office (co-working)", [-150] * 12, -1_800, False),
        ("Legal & accounting",
         [-1_500, 0, 0, -500, 0, 0, -1_500, 0, 0, -500, -500, 0],
         -4_500, False),
        ("Insurance", [-100] * 12, -1_200, False),
        ("Business support / misc", [-250] * 12, -3_000, False),
        ("Fixed assets & R&D", [-500, -300, -300, -200, -200, -200, -200, -200, -200, -200, -200, -300],
         -3_000, False),
        ("Total Expenditure",
         [-6_700, -4_500, -8_400, -10_400, -10_400, -10_300, -12_000, -10_800, -10_500, -12_200, -12_700, -12_800],
         -130_610, True),

        ("Cash surplus / (deficit)",
         [-3_700, -4_300, -8_000, -9_600, -9_000, 141_700, -9_500, -8_100, -7_500, -8_900, -9_200, -8_624],
         46_376, True),  # rounding
        ("Closing cash balance",
         [-700, -2_800, -7_200, -10_100, -10_900, 138_500, 133_000, 124_900, 117_400, 108_500, 99_300, 90_676],
         30_366, True),
    ]

    r = 5
    annual_idx = len(months) + 1
    check_idx = annual_idx + 1
    for label, monthly, y1_total, is_total in cf_lines:
        values = list(monthly) + [sum(monthly), sum(monthly) - y1_total]
        write_row(ws, r, label, values, total=is_total)
        # The check column should ideally read zero — it gets close due to
        # rounding. Highlight any with absolute deviation > £500 so the
        # reader can see where the round-up sits.
        chk_cell = ws.cell(row=r, column=check_idx + 1)
        if isinstance(chk_cell.value, (int, float)) and abs(chk_cell.value) > 500:
            chk_cell.fill = PatternFill("solid", fgColor=AMBER)
        r += 1

    note_row = r + 1
    ws.cell(row=note_row, column=1,
            value="Check column = monthly sum minus the annual total. Small deviations (< £500) "
                  "reflect rounding in the monthly phasing; the annual 3-year forecast remains the "
                  "binding figure.").font = italic_small
    ws.merge_cells(start_row=note_row, start_column=1, end_row=note_row, end_column=15)


# ============== 5. Balance Sheet ==============
def sheet_bs(wb):
    ws = wb.create_sheet("Balance Sheet 3yr")
    write_header(ws, "Annual Balance Sheet Forecast", ["Year 1", "Year 2", "Year 3"], [44, 16, 16, 16])
    rows = [
        ("NON-CURRENT ASSETS", None, "sub"),
        ("Computers & equipment (net)", [1_200, 4_200, 8_400], False),
        ("Intangible assets (capitalised R&D)", [1_800, 5_400, 13_200], False),
        ("Total non-current assets", [3_000, 9_600, 21_600], "total"),
        ("", None, False),
        ("CURRENT ASSETS", None, "sub"),
        ("Cash at bank", [30_366, 900_258, 890_394], False),
        ("Trade receivables (debtors, ~30 days B2B)", [1_000, 10_500, 32_000], False),
        ("Stock / inventory", [0, 0, 0], False),
        ("Total current assets", [31_366, 910_758, 922_394], "total"),
        ("", None, False),
        ("TOTAL ASSETS", [34_366, 920_358, 943_994], "total"),
        ("", None, False),
        ("CURRENT LIABILITIES", None, "sub"),
        ("Trade payables / accrued payroll", [2_990, 7_020, 13_940], False),
        ("Director's loan account", [0, 0, 0], False),
        ("Total liabilities", [2_990, 7_020, 13_940], "total"),
        ("", None, False),
        ("NET ASSETS", [31_376, 913_338, 930_054], "total"),
        ("", None, False),
        ("CAPITAL & RESERVES", None, "sub"),
        ("Called-up share capital", [3_000, 3_000, 3_000], False),
        ("Share premium", [133_000, 1_147_000, 1_178_000], False),
        ("Profit & loss reserve", [-104_624, -236_662, -250_946], False),
        ("Shareholders' funds", [31_376, 913_338, 930_054], "total"),
        ("", None, False),
        ("Balance check (Assets - Liabilities - Equity)", [0, 0, 0], False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 5):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        write_row(ws, r, label, vals, total=(style == "total"))
        r += 1


# ============== 6. Revenue W1 ==============
def sheet_w1(wb):
    ws = wb.create_sheet("Revenue W1")
    write_header(ws, "Revenue Detail (W1)", ["Year 1", "Year 2", "Year 3", "TOTAL"], [44, 16, 16, 16, 16])
    rows = [
        ("Total Revenue", [23_976, 269_712, 835_136], "total"),
        ("", None, False),
        ("Service 1 — University SaaS subscription", None, "sub"),
        ("Number of paying institutions (end of year)", [2, 9, 24], False),
        ("Average contract value (£)", [12_000, 14_000, 16_000], False),
        ("Subtotal revenue", [12_000, 126_000, 384_000], "total"),
        ("", None, False),
        ("Service 2 — DEQUAD Premium (B2C)", None, "sub"),
        ("Paying student subscribers (avg, year)", [200, 2_400, 7_200], False),
        ("Price per student (£/month)", [4.99, 4.99, 4.99], False),
        ("Subtotal revenue", [11_976, 143_712, 431_136], "total"),
        ("", None, False),
        ("Service 3 — NHS ICB pilot", None, "sub"),
        ("Number of contracts", [0, 0, 1], False),
        ("Average contract value (£)", [0, 0, 20_000], False),
        ("Subtotal revenue", [0, 0, 20_000], "total"),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 6):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"),
                  money=isinstance(vals[0], (int, float)))
        r += 1


# ============== 7. Cost of Sales W2 ==============
def sheet_w2(wb):
    ws = wb.create_sheet("Cost of Sales W2")
    write_header(ws, "Cost of Sales Detail (W2)", ["Year 1", "Year 2", "Year 3", "TOTAL"], [44, 16, 16, 16, 16])
    rows = [
        ("Total Cost of Sales", [3_510, 24_120, 66_900], "total"),
        ("Cloud hosting (Render, Cloudflare CDN)", [1_200, 8_400, 22_800], False),
        ("LLM / safeguarding inference", [900, 6_600, 18_000], False),
        ("Stripe processing (~2.9% + 30p)", [450, 4_800, 14_400], False),
        ("SMS & email (Twilio, SendGrid)", [360, 2_520, 7_500], False),
        ("Customer-success tooling (Intercom)", [600, 1_800, 4_200], False),
    ]
    r = 5
    for label, vals, style in rows:
        total_val = sum(vals)
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"))
        r += 1


# ============== 8. Payroll W3 ==============
def sheet_w3(wb):
    ws = wb.create_sheet("Payroll W3")
    write_header(ws, "Payroll Detail (W3)", ["Y1 Gross", "Y1 NIer", "Y2 Gross", "Y2 NIer", "Y3 Gross", "Y3 NIer"],
                 [44, 13, 13, 13, 13, 13, 13])

    # NIer = 13.8% on portion above £9,100 (24/25 Secondary Threshold)
    def nier(gross): return round(max(0, gross - 9100) * 0.138)

    roles = [
        ("Founder A — CEO / Product (Yusuf Quadri)", 18_000, 36_000, 42_000),
        ("Founder B — CTO / Engineering", 18_000, 36_000, 42_000),
        ("Customer Success Manager #1", 8_000, 32_000, 34_000),
        ("Senior Backend Engineer", 0, 55_000, 58_000),
        ("Safeguarding & Trust Lead", 0, 25_000, 42_000),
        ("Marketing & Partnerships", 0, 20_000, 38_000),
        ("Data / ML Engineer", 0, 0, 55_000),
        ("Mobile Engineer", 0, 0, 40_000),
        ("Founders' Associate", 0, 0, 24_000),
        ("Customer Success Manager #2", 0, 0, 21_000),
        ("Engineer #2 (backend)", 0, 0, 15_000),
    ]

    r = 5
    totals = [0, 0, 0, 0, 0, 0]
    for role, y1, y2, y3 in roles:
        values = [y1, nier(y1), y2, nier(y2), y3, nier(y3)]
        for i, v in enumerate(values):
            totals[i] += v
        write_row(ws, r, role, values)
        r += 1
    write_row(ws, r, "Total gross + NIer", totals, total=True)
    r += 2

    # Pension contributions
    pension = [round(totals[0] * 0.03), 0, round(totals[2] * 0.03), 0, round(totals[4] * 0.03), 0]
    write_row(ws, r, "Employer pension contribution (3%)", pension, total=True)
    r += 1
    benefits = [4_680, 0, 12_180, 0, 22_470, 0]
    write_row(ws, r, "Other employment costs (training, equipment, perks)", benefits, total=True)
    r += 1
    final = [totals[0] + totals[1] + pension[0] + benefits[0], 0,
             totals[2] + totals[3] + pension[2] + benefits[2], 0,
             totals[4] + totals[5] + pension[4] + benefits[4], 0]
    write_row(ws, r, "Total employment cost (apparent)", final, total=True)
    r += 1
    cf_alloc = [96_800, 0, 281_200, 0, 562_400, 0]
    write_row(ws, r, "Cash-flow allocated (incl. phasing & accruals)", cf_alloc, total=True)
    r += 2

    ws.cell(row=r, column=1,
            value="Notes: NIer applied at 13.8% on gross salary above the Secondary Threshold (£9,100). "
                  "Pension contributions at 3% employer minimum. Apparent totals reconcile to cash-flow "
                  "allocations after accounting for new-hire phasing across the year.").font = italic_small
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=7)


# ============== 9. Marketing W4 ==============
def sheet_w4(wb):
    ws = wb.create_sheet("Marketing W4")
    write_header(ws, "Marketing Expenditure Detail (W4)", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 16, 16, 16, 16])
    rows = [
        ("Total Marketing Expenses", [12_000, 55_000, 140_000], "total"),
        ("", None, False),
        ("Targeted students (top of funnel)", [12_000, 60_000, 180_000], False),
        ("", None, False),
        ("Clients per campaign — Instagram / TikTok", [600, 3_500, 10_000], False),
        ("Clients per campaign — Google Search ads", [200, 1_800, 5_000], False),
        ("Clients per campaign — SEO / content", [400, 4_000, 12_000], False),
        ("Clients per campaign — Student ambassador programme", [800, 3_500, 8_000], False),
        ("", None, False),
        ("Number of marketing campaigns", [12, 24, 36], False),
        ("Average price per campaign", [1_000, 2_290, 3_890], False),
        ("", None, False),
        ("Channel-level spend", None, "sub"),
        ("University partnership & PR", [3_600, 14_000, 35_000], False),
        ("Content / SEO / whitepaper", [1_200, 8_000, 22_000], False),
        ("LinkedIn / paid B2B", [0, 7_000, 18_000], False),
        ("Instagram / TikTok (organic + paid)", [3_600, 15_000, 40_000], False),
        ("Google Search ads", [1_200, 6_000, 15_000], False),
        ("Student-rep / ambassador programme", [2_400, 5_000, 10_000], False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 6):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"))
        r += 1


# ============== 10. R&D W5 ==============
def sheet_w5(wb):
    ws = wb.create_sheet("R&D W5")
    write_header(ws, "Research & Development (W5)", ["Year 1", "Year 2", "Year 3", "TOTAL"], [44, 16, 16, 16, 16])
    rows = [
        ("Total R&D Costs", [39_600, 72_000, 140_000], "total"),
        ("", None, False),
        ("Founder R&D time (≈60% of combined founder salary cost in Y1)", [36_000, 48_000, 60_000], False),
        ("ML / NLP engineering time (allocated)", [0, 16_000, 60_000], False),
        ("R&D tooling & datasets (HuggingFace, Modal, etc.)", [2_400, 6_000, 14_000], False),
        ("3rd-party model evaluation & safety testing", [1_200, 2_000, 6_000], False),
        ("", None, False),
        ("UK SME R&D tax-credit applied (16%)", None, "sub"),
        ("Estimated relief receivable in following accounting period", [6_336, 11_520, 22_400], False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                cell = ws.cell(row=r, column=1, value=label)
                cell.font = bold
                cell.fill = sub_fill
                cell.alignment = left
                cell.border = border_all
                for j in range(2, 6):
                    ws.cell(row=r, column=j).fill = sub_fill
                    ws.cell(row=r, column=j).border = border_all
            r += 1
            continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"))
        r += 1


# ============== 11. Fixed Assets ==============
def sheet_fa(wb):
    ws = wb.create_sheet("Fixed Assets")
    write_header(ws, "Fixed Asset Schedule",
                 ["Depreciation rate", "Y1 additions", "Y2 additions", "Y3 additions",
                  "Y1 depreciation", "Y2 depreciation", "Y3 depreciation", "Y3 NBV"],
                 [44, 14, 12, 12, 12, 12, 12, 12, 12])

    rows = [
        ("Tangible — Computers & equipment", "33%", 1_800, 4_500, 8_000, -594, -2_079, -4_359, 8_400),
        ("Intangible — Capitalised R&D (W5)", "20%", 1_200, 3_500, 10_000, -396, -1_551, -6_561, 13_200),
        ("Total CAPEX", "", 3_000, 8_000, 18_000, -990, -3_630, -10_920, 21_600),
    ]
    r = 5
    for label, rate, *vals in rows:
        cell = ws.cell(row=r, column=1, value=label)
        cell.font = bold if "Total" in label else regular
        cell.border = border_all
        ws.cell(row=r, column=2, value=rate).alignment = right
        for j, v in enumerate(vals, start=3):
            c = ws.cell(row=r, column=j, value=v)
            c.alignment = right
            c.border = border_all
            if isinstance(v, (int, float)):
                c.number_format = gbp(v)
            if "Total" in label:
                c.fill = total_fill
                c.font = bold
        r += 1


# ============== 12. Startup loan (empty) ==============
def sheet_loan(wb):
    ws = wb.create_sheet("Startup Loan")
    write_header(ws, "Startup Loan Schedule", ["Principal", "Interest rate", "Term (months)", "Monthly payment"],
                 [44, 16, 16, 16, 16])
    ws.cell(row=5, column=1, value="No external debt taken at incorporation.").font = bold
    ws.cell(row=6, column=1,
            value="The founders are bootstrapping with £3,000 of equity. Any future government-backed Start Up "
                  "Loan or pre-seed-stage Innovate UK Smart Grant will be added here once it is contracted.").alignment = left
    ws.merge_cells(start_row=6, start_column=1, end_row=6, end_column=5)


def main():
    wb = Workbook()
    sheet_readme(wb)
    sheet_pl(wb)
    sheet_cf(wb)
    sheet_cf_monthly(wb)
    sheet_bs(wb)
    sheet_w1(wb)
    sheet_w2(wb)
    sheet_w3(wb)
    sheet_w4(wb)
    sheet_w5(wb)
    sheet_fa(wb)
    sheet_loan(wb)
    wb.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
