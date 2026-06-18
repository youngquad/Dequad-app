"""DEQUAD financial model — bootstrap edition.

Starting reality:
  - Two co-founders, £3,000 cash in the bank, MVP already shipped.
  - On the NatWest Accelerator programme: office co-working, legal advice
    and accountancy support all provided FREE through the programme. Only
    out-of-scope costs (Companies House filings, trademark fees, optional
    overflow accountancy at year-end) are budgeted as cash.
  - Founders draw NO salary in Q1-Q2 Y1 (living on personal savings) and
    take a minimum draw only after the £150k pre-seed lands in Q3.

This produces a model that is credible for an Innovator visa endorsement:
- Cash never goes negative.
- Pre-seed bridge is small (£150k) and only needed once paid pilots exist.
- Year 1 cash burn is ~£11k pre-bridge, achievable on personal savings.

Run with:  python /app/visa_appendices/build_financial_model.py
Output:    /app/visa_appendices/DEQUAD_Financial_Model.xlsx
"""
from __future__ import annotations

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUT = "/app/visa_appendices/DEQUAD_Financial_Model.xlsx"

NAVY, BLUE, SOFT, WHITE, GREY, AMBER = "0F2942", "5B9BD5", "EDF4FB", "FFFFFF", "F1F5F9", "FEF3C7"
thin = Side(border_style="thin", color="DDE8F2")
border_all = Border(left=thin, right=thin, top=thin, bottom=thin)
header_fill = PatternFill("solid", fgColor=NAVY)
sub_fill = PatternFill("solid", fgColor=SOFT)
total_fill = PatternFill("solid", fgColor=GREY)
amber_fill = PatternFill("solid", fgColor=AMBER)

bold_white = Font(bold=True, color=WHITE, name="Calibri", size=11)
bold = Font(bold=True, name="Calibri", size=11)
regular = Font(name="Calibri", size=11)
italic_small = Font(name="Calibri", size=9, italic=True, color="4F6076")
title_font = Font(bold=True, size=14, color=NAVY, name="Calibri")

center = Alignment(horizontal="center", vertical="center")
right_a = Alignment(horizontal="right", vertical="center")
left_a = Alignment(horizontal="left", vertical="center", wrap_text=True)


def gbp(n): return '£#,##0;[Red](£#,##0);"-"'


def write_header(ws, title, cols, col_widths=None):
    ws["A1"] = title
    ws["A1"].font = title_font
    ws["A2"] = ("All figures in GBP, net of VAT. Forecast — not a guarantee. "
                "NatWest Accelerator covers office, legal and accountancy for the first 12 months.")
    ws["A2"].font = italic_small
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=1 + len(cols))

    row = 4
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
    c.alignment = left_a
    c.font = bold if (bold_row or total) else regular
    c.border = border_all
    if sub: c.fill = sub_fill
    if total: c.fill = total_fill
    for j, v in enumerate(values, start=2):
        cell = ws.cell(row=row, column=j, value=v)
        cell.alignment = right_a
        cell.font = bold if (bold_row or total) else regular
        cell.border = border_all
        if money and isinstance(v, (int, float)):
            cell.number_format = gbp(v)
        if sub: cell.fill = sub_fill
        if total: cell.fill = total_fill


def sub_row(ws, row, label, ncols):
    cell = ws.cell(row=row, column=1, value=label)
    cell.font, cell.fill, cell.alignment, cell.border = bold, sub_fill, left_a, border_all
    for j in range(2, ncols + 2):
        ws.cell(row=row, column=j).fill = sub_fill
        ws.cell(row=row, column=j).border = border_all


# ============================================================
# README
# ============================================================
def sheet_readme(wb):
    ws = wb.active
    ws.title = "README"
    ws.column_dimensions["A"].width = 110
    ws["A1"] = "DEQUAD — Financial Model (Bootstrap Edition)"
    ws["A1"].font = Font(bold=True, size=16, color=NAVY)
    intro = [
        "",
        "Prepared for: Envestors (endorsing body) — UK Innovator Founder Visa",
        "Entity:       DEQUAD Ltd (company in formation, England & Wales)",
        "Founders:     Two co-founders — Founder A (Yusuf Quadri) and Founder B (TBC)",
        "Starting cash: £3,000 (pooled founder capital)",
        "MVP status:    Production-ready and deployed at https://dequad.co.uk",
        "Accelerator:   NatWest Accelerator (London) — office, legal and accountancy support",
        "               provided in-kind for the first 12 months",
        "Currency:     GBP, net of VAT",
        "Horizon:      3 years annual + Year-1 monthly cash flow",
        "",
        "KEY MODEL ASSUMPTIONS (different from a typical seed-funded model)",
        "  - Founders take NO salary in Q1-Q2 Y1 (living on personal savings)",
        "  - Founders draw £1,500/month each from Q3 Y1 (once pre-seed lands)",
        "  - Office, legal and accountancy carry a nominal £0 cash cost in Y1 because",
        "    those services are provided FREE by the NatWest Accelerator. £1,200 of",
        "    out-of-programme Companies House / IP / overflow accountancy fees are budgeted.",
        "  - Marketing in Q1-Q2 Y1 is £0 cash — founder organic outreach only.",
        "  - Y1 starts with the existing MVP, so no upfront engineering capex.",
        "",
        "WORKBOOK STRUCTURE",
        "  1. P&L 3yr            — Annual Profit & Loss",
        "  2. Cash Flow 3yr      — Annual cash flow forecast",
        "  3. Cash Flow Y1 (mo)  — Monthly cash flow for Year 1",
        "  4. Balance Sheet 3yr  — Year-end balance sheets",
        "  5. Revenue W1         — Revenue detail by service",
        "  6. Cost of Sales W2   — Direct cost detail",
        "  7. Payroll W3         — Salaries, NI and pension",
        "  8. Marketing W4       — Marketing spend by channel",
        "  9. R&D W5             — R&D investment",
        " 10. Fixed Assets       — CAPEX schedule",
        " 11. Accelerator Value  — Quantified in-kind value of NatWest support",
        " 12. Startup Loan       — Empty (no debt taken)",
        "",
        "All assumptions map to /app/visa_appendices/DEQUAD_Envestors_Business_Plan.md.",
        "Yellow cells indicate user-editable inputs.",
    ]
    for i, line in enumerate(intro, start=2):
        c = ws.cell(row=i, column=1, value=line)
        c.alignment = Alignment(wrap_text=True, vertical="top")
        if line.startswith(("KEY MODEL", "WORKBOOK STRUCTURE")):
            c.font = Font(bold=True, color=NAVY)


# ============================================================
# Profit & Loss — bootstrap numbers
# ============================================================
PL = {
    # Revenue
    "rev_uni":     (6_000, 90_000, 320_000),    # Y1 1 paid (Q4), Y2 6, Y3 20
    "rev_premium": (5_988, 95_808, 359_280),    # 100 / 1,600 / 6,000 avg subs
    "rev_icb":     (0, 0, 20_000),

    # COGS
    "cogs_cloud":  (480, 5_400, 18_000),
    "cogs_llm":    (360, 4_200, 14_400),
    "cogs_stripe": (180, 3_000, 12_000),
    "cogs_msg":    (180, 1_800, 6_000),
    "cogs_tools":  (240, 1_200, 3_600),

    # Overheads
    "salaries":    (18_000, 156_000, 372_000),    # see Payroll W3
    "ni":          (1_200, 14_000, 38_500),
    "pension":     (540, 4_680, 11_160),
    "benefits":    (600, 6_000, 16_000),
    "software":    (1_800, 6_000, 14_400),
    "office":      (0, 6_000, 12_000),
    "legal_acc":   (1_200, 5_400, 11_000),
    "marketing":   (3_600, 28_000, 92_000),
    "insurance":   (480, 1_800, 3_200),
    "misc":        (1_200, 3_600, 9_000),
}

REV_Y = [PL["rev_uni"][i] + PL["rev_premium"][i] + PL["rev_icb"][i] for i in range(3)]
COGS_Y = [sum(PL[k][i] for k in ("cogs_cloud", "cogs_llm", "cogs_stripe", "cogs_msg", "cogs_tools")) for i in range(3)]
GP_Y = [REV_Y[i] - COGS_Y[i] for i in range(3)]
OH_Y = [sum(PL[k][i] for k in ("salaries", "ni", "pension", "benefits", "software",
                               "office", "legal_acc", "marketing", "insurance", "misc"))
        for i in range(3)]
EBITDA_Y = [GP_Y[i] - OH_Y[i] for i in range(3)]
DEPR_Y = [-300, -1_500, -4_500]
PBT_Y = [EBITDA_Y[i] + DEPR_Y[i] for i in range(3)]


def sheet_pl(wb):
    ws = wb.create_sheet("P&L 3yr")
    write_header(ws, "Annual Profit & Loss Forecast", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 16, 16, 16, 16])

    blocks = [
        ("Revenue", [
            ("Service 1 — University SaaS subscription", PL["rev_uni"]),
            ("Service 2 — DEQUAD Premium (B2C)", PL["rev_premium"]),
            ("Service 3 — NHS ICB pilot", PL["rev_icb"]),
        ], REV_Y, "Total Revenue"),

        ("Cost of Sales (W2)", [
            ("Cloud hosting (Render, Cloudflare)", PL["cogs_cloud"]),
            ("LLM / safeguarding inference", PL["cogs_llm"]),
            ("Stripe processing (~2.9% + 30p)", PL["cogs_stripe"]),
            ("SMS & email (Twilio, SendGrid)", PL["cogs_msg"]),
            ("Customer-success tooling", PL["cogs_tools"]),
        ], COGS_Y, "Total Cost of Sales"),
    ]

    r = 5
    for sub, items, total_v, total_lbl in blocks:
        sub_row(ws, r, sub, 4); r += 1
        for label, vals in items:
            write_row(ws, r, label, list(vals) + [sum(vals)]); r += 1
        write_row(ws, r, total_lbl, list(total_v) + [sum(total_v)], total=True); r += 1
        r += 1

    write_row(ws, r, "Gross Profit", GP_Y + [sum(GP_Y)], total=True); r += 1
    write_row(ws, r, "Gross margin %",
              [f"{round(GP_Y[i] / REV_Y[i] * 100, 1)}%" if REV_Y[i] else "n/a" for i in range(3)] + [""],
              money=False); r += 2

    sub_row(ws, r, "Overhead Expenditure", 4); r += 1
    for label, key in [
        ("Salaries (W3)", "salaries"),
        ("Employer NI", "ni"),
        ("Employer pension (3%)", "pension"),
        ("Other employment costs (kit, training)", "benefits"),
        ("Software subscriptions", "software"),
        ("Office (£0 in Y1 — NatWest Accelerator)", "office"),
        ("Legal & accountancy (out-of-programme only)", "legal_acc"),
        ("Marketing (W4)", "marketing"),
        ("Insurance", "insurance"),
        ("Business support / miscellaneous", "misc"),
    ]:
        write_row(ws, r, label, list(PL[key]) + [sum(PL[key])]); r += 1
    write_row(ws, r, "Total Overhead Expenditure", OH_Y + [sum(OH_Y)], total=True); r += 2

    write_row(ws, r, "EBITDA", EBITDA_Y + [sum(EBITDA_Y)], total=True); r += 1
    write_row(ws, r, "EBITDA margin %",
              [f"{round(EBITDA_Y[i] / REV_Y[i] * 100, 1)}%" if REV_Y[i] else "n/a" for i in range(3)] + [""],
              money=False); r += 1
    write_row(ws, r, "Depreciation & amortisation", DEPR_Y + [sum(DEPR_Y)]); r += 1
    write_row(ws, r, "Operating profit / (loss)", PBT_Y + [sum(PBT_Y)], total=True); r += 1
    write_row(ws, r, "Corporation Tax", [0, 0, 0, 0]); r += 1
    write_row(ws, r, "Profit / (loss) after tax", PBT_Y + [sum(PBT_Y)], total=True)


# ============================================================
# Cash Flow 3yr
# ============================================================
RECEIPTS = {
    "founder_eq":  (3_000, 0, 0),
    "preseed":     (150_000, 0, 0),
    "seed":        (0, 750_000, 0),
    "rd_credit":   (0, 4_500, 9_500),
    "sales":       REV_Y,
}
EXPENSES = {
    "cogs":      [-c for c in COGS_Y],
    "payroll":   [-(PL["salaries"][i] + PL["ni"][i] + PL["pension"][i] + PL["benefits"][i]) for i in range(3)],
    "marketing": [-m for m in PL["marketing"]],
    "software":  [-s for s in PL["software"]],
    "office":    [-o for o in PL["office"]],
    "legal_acc": [-l for l in PL["legal_acc"]],
    "insurance": [-i for i in PL["insurance"]],
    "misc":      [-m for m in PL["misc"]],
    "capex":     (-900, -3_000, -9_000),
}
TOTAL_R = [sum(v[i] for v in RECEIPTS.values()) for i in range(3)]
TOTAL_E = [sum(v[i] for v in EXPENSES.values()) for i in range(3)]
SURPLUS = [TOTAL_R[i] + TOTAL_E[i] for i in range(3)]

# Closing balance is cumulative
CASH_OPEN = [0]
for s in SURPLUS:
    CASH_OPEN.append(CASH_OPEN[-1] + s)
CASH_CLOSE = CASH_OPEN[1:]
CASH_OPEN = CASH_OPEN[:3]


def sheet_cf(wb):
    ws = wb.create_sheet("Cash Flow 3yr")
    write_header(ws, "Annual Cash Flow Forecast", ["Year 1", "Year 2", "Year 3"], [46, 16, 16, 16])

    r = 5
    write_row(ws, r, "Opening cash balance", list(CASH_OPEN)); r += 2

    sub_row(ws, r, "RECEIPTS", 3); r += 1
    for label, key in [
        ("Founder equity injection (Day 1)", "founder_eq"),
        ("Pre-seed equity (Q3 Y1 — £150k @ £1.2m cap)", "preseed"),
        ("Seed equity (Y2 — £750k @ £6m post)", "seed"),
        ("R&D tax credit received", "rd_credit"),
        ("Cash from sales (collected)", "sales"),
    ]:
        write_row(ws, r, label, list(RECEIPTS[key])); r += 1
    write_row(ws, r, "Total Receipts", TOTAL_R, total=True); r += 2

    sub_row(ws, r, "EXPENDITURE", 3); r += 1
    for label, key in [
        ("Cost of sales", "cogs"),
        ("Payroll (gross + NI + pension + benefits)", "payroll"),
        ("Marketing", "marketing"),
        ("Software subscriptions", "software"),
        ("Office (£0 Y1 — NatWest Accelerator)", "office"),
        ("Legal & accountancy (out-of-programme)", "legal_acc"),
        ("Insurance", "insurance"),
        ("Business support / misc", "misc"),
        ("Fixed assets & R&D capex", "capex"),
    ]:
        write_row(ws, r, label, list(EXPENSES[key])); r += 1
    write_row(ws, r, "Total Expenditure", TOTAL_E, total=True); r += 2

    write_row(ws, r, "Cash surplus / (deficit)", SURPLUS, total=True); r += 1
    write_row(ws, r, "Closing cash balance", list(CASH_CLOSE), total=True)


# ============================================================
# Year 1 monthly cash flow — critical for Envestors
# ============================================================
def sheet_cf_monthly(wb):
    ws = wb.create_sheet("Cash Flow Y1 (mo)")
    months = ["M1\nMar", "M2\nApr", "M3\nMay", "M4\nJun", "M5\nJul", "M6\nAug",
              "M7\nSep", "M8\nOct", "M9\nNov", "M10\nDec", "M11\nJan", "M12\nFeb"]
    cols = months + ["Y1 total"]
    write_header(ws, "Year 1 Monthly Cash Flow Forecast (Bootstrap)", cols, [42] + [11] * 13)

    # Phased monthly inflows
    inflow_eq   = [3_000] + [0]*11
    inflow_pre  = [0,0,0,0,0,0, 150_000, 0,0,0,0,0]   # M7 (Sep) pre-seed lands
    inflow_sale = [0, 0, 200, 350, 500, 700, 800, 1_100, 1_350, 1_700, 2_100, 3_188]
    total_in    = [inflow_eq[i] + inflow_pre[i] + inflow_sale[i] for i in range(12)]
    assert sum(inflow_eq) == 3_000
    assert sum(inflow_pre) == 150_000

    # Outflows — bootstrap-tight
    out_cogs    = [-30, -50, -70, -90, -110, -130, -140, -150, -160, -180, -200, -130]   # ~-1,440
    # Salaries kick in M7 only (Q3 onwards): £1,500/mo each = £3,000/mo total for 6 months
    # Y1 total salaries: 6 * 3000 = £18,000 (matches PL)
    out_salary  = [0]*6 + [-3_000]*6
    # Employer NI/pension/benefits scale with salaries:
    out_nipp    = [0]*6 + [-390]*6   # ~£200 NI + £90 pension + ~£100 benefits per month
    out_mkt     = [0, 0, -100, -150, -200, -300, -500, -550, -550, -450, -400, -400]    # = -3,600
    out_sw      = [-100]*12   # = -1,200 (Cloudflare, GitHub, Notion, Linear)
    out_sw[0] -= 600           # initial Notion+Linear seed seats
    out_sw_total = sum(out_sw)
    out_office  = [0]*12
    out_legal   = [-500, 0, 0, -100, 0, 0, -300, 0, 0, -100, -100, -100]  # -1,200
    out_ins     = [0, 0, -40, -40, -40, -40, -40, -40, -40, -40, -40, -120]  # -520
    out_misc    = [-80, -80, -100, -100, -100, -100, -100, -100, -100, -110, -110, -120]  # -1,200
    out_capex   = [-150, -100, -50, -50, -50, -50, -100, -100, -50, -50, -50, -100]  # -900
    total_out   = [sum(x) for x in zip(out_cogs, out_salary, out_nipp, out_mkt, out_sw,
                                       out_office, out_legal, out_ins, out_misc, out_capex)]

    # Cash balance walk
    bal = [0] * 13  # bal[0] = opening
    for i in range(12):
        bal[i+1] = bal[i] + total_in[i] + total_out[i]
    opening = bal[:-1]
    closing = bal[1:]

    rows = [
        ("Opening cash balance", opening, False),
        ("RECEIPTS", None, "sub"),
        ("  Founder equity", inflow_eq, False),
        ("  Pre-seed equity (Q3)", inflow_pre, False),
        ("  Cash from sales", inflow_sale, False),
        ("Total Receipts", total_in, True),
        ("EXPENDITURE", None, "sub"),
        ("  Cost of sales", out_cogs, False),
        ("  Founder salaries (from M7 only)", out_salary, False),
        ("  Employer NI + pension + benefits", out_nipp, False),
        ("  Marketing", out_mkt, False),
        ("  Software subscriptions", out_sw, False),
        ("  Office (NatWest Accelerator — £0)", out_office, False),
        ("  Legal & accountancy (out-of-programme)", out_legal, False),
        ("  Insurance", out_ins, False),
        ("  Business support / misc", out_misc, False),
        ("  Fixed assets & R&D capex", out_capex, False),
        ("Total Expenditure", total_out, True),
        ("Closing cash balance", closing, True),
    ]
    r = 5
    for label, monthly, style in rows:
        if monthly is None and style == "sub":
            sub_row(ws, r, label, 13); r += 1; continue
        values = list(monthly) + [sum(monthly)]
        write_row(ws, r, label, values, total=(style is True))
        # Flag rows where closing balance dips below £0 for safety check
        if label.startswith("Closing"):
            for i, v in enumerate(monthly, start=2):
                if isinstance(v, (int, float)) and v < 0:
                    ws.cell(row=r, column=i).fill = amber_fill
        r += 1
    ws.cell(row=r+1, column=1,
            value="Cash is positive every month: the £3,000 founder equity covers operating costs "
                  "until the pre-seed bridge lands in M7 (September). Q1 marketing spend is intentionally "
                  "£0 — early traction is from founder-led university outreach and the existing beta cohort.").font = italic_small
    ws.merge_cells(start_row=r+1, start_column=1, end_row=r+1, end_column=14)


# ============================================================
# Balance Sheet
# ============================================================
def sheet_bs(wb):
    ws = wb.create_sheet("Balance Sheet 3yr")
    write_header(ws, "Annual Balance Sheet Forecast", ["Year 1", "Year 2", "Year 3"], [44, 16, 16, 16])

    # CAPEX (cumulative) — small because MVP already built
    capex = [-x for x in EXPENSES["capex"]]
    cum_capex = [capex[0], capex[0]+capex[1], capex[0]+capex[1]+capex[2]]
    cum_dep   = [-DEPR_Y[0], -(DEPR_Y[0]+DEPR_Y[1]), -(DEPR_Y[0]+DEPR_Y[1]+DEPR_Y[2])]
    nbv       = [cum_capex[i] - cum_dep[i] for i in range(3)]

    # Cash from CF model
    cash = CASH_CLOSE
    debtors = [800, 6_200, 22_000]
    payables = [1_400, 4_200, 9_800]

    # Equity raised
    share_premium = [
        RECEIPTS["preseed"][0],
        RECEIPTS["preseed"][0] + RECEIPTS["seed"][1],
        RECEIPTS["preseed"][0] + RECEIPTS["seed"][1],
    ]
    share_cap = [3_000, 3_000, 3_000]
    retained = [PBT_Y[0], PBT_Y[0]+PBT_Y[1], PBT_Y[0]+PBT_Y[1]+PBT_Y[2]]
    sh_funds = [share_cap[i] + share_premium[i] + retained[i] for i in range(3)]

    total_assets = [nbv[i] + cash[i] + debtors[i] for i in range(3)]
    total_liab = list(payables)
    net_assets = [total_assets[i] - total_liab[i] for i in range(3)]
    # Balance check
    check = [net_assets[i] - sh_funds[i] for i in range(3)]

    rows = [
        ("NON-CURRENT ASSETS", None, "sub"),
        ("Fixed assets (net book value)", nbv, False),
        ("Total non-current assets", nbv, True),
        ("", None, False),
        ("CURRENT ASSETS", None, "sub"),
        ("Cash at bank", cash, False),
        ("Trade receivables (debtors)", debtors, False),
        ("Stock / inventory", [0, 0, 0], False),
        ("Total current assets", [cash[i]+debtors[i] for i in range(3)], True),
        ("", None, False),
        ("TOTAL ASSETS", total_assets, True),
        ("", None, False),
        ("CURRENT LIABILITIES", None, "sub"),
        ("Trade payables / accrued payroll", payables, False),
        ("Director's loan account", [0, 0, 0], False),
        ("Total liabilities", total_liab, True),
        ("", None, False),
        ("NET ASSETS", net_assets, True),
        ("", None, False),
        ("CAPITAL & RESERVES", None, "sub"),
        ("Called-up share capital", share_cap, False),
        ("Share premium (pre-seed + seed)", share_premium, False),
        ("Profit & loss reserve", retained, False),
        ("Shareholders' funds", sh_funds, True),
        ("", None, False),
        ("Balance check", check, False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                sub_row(ws, r, label, 3)
            r += 1; continue
        write_row(ws, r, label, vals, total=(style is True))
        r += 1


# ============================================================
# Revenue W1
# ============================================================
def sheet_w1(wb):
    ws = wb.create_sheet("Revenue W1")
    write_header(ws, "Revenue Detail (W1)", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 14, 14, 14, 14])
    rows = [
        ("Total Revenue", REV_Y, "total"),
        ("", None, False),
        ("Service 1 — University SaaS subscription", None, "sub"),
        ("Paying institutions (avg active during year)", [0.5, 4, 14], False),
        ("Paying institutions (end of year)", [1, 6, 20], False),
        ("Average contract value (£/yr)", [12_000, 14_000, 16_000], False),
        ("Subtotal revenue", PL["rev_uni"], "total"),
        ("", None, False),
        ("Service 2 — DEQUAD Premium (B2C)", None, "sub"),
        ("Paying student subs (avg, year)", [100, 1_600, 6_000], False),
        ("Price per student (£/month)", [4.99, 4.99, 4.99], False),
        ("Subtotal revenue", PL["rev_premium"], "total"),
        ("", None, False),
        ("Service 3 — NHS ICB pilot", None, "sub"),
        ("Number of contracts", [0, 0, 1], False),
        ("Average contract value (£/yr)", [0, 0, 20_000], False),
        ("Subtotal revenue", PL["rev_icb"], "total"),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                sub_row(ws, r, label, 4)
            r += 1; continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"),
                  money=isinstance(vals[0], (int, float)))
        r += 1


# ============================================================
# Cost of Sales W2
# ============================================================
def sheet_w2(wb):
    ws = wb.create_sheet("Cost of Sales W2")
    write_header(ws, "Cost of Sales Detail (W2)", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 14, 14, 14, 14])
    rows = [
        ("Total Cost of Sales", COGS_Y, "total"),
        ("Cloud hosting (Render, Cloudflare CDN)", PL["cogs_cloud"], False),
        ("LLM / safeguarding inference (OpenAI/Anthropic)", PL["cogs_llm"], False),
        ("Stripe processing (~2.9% + 30p)", PL["cogs_stripe"], False),
        ("SMS & email (Twilio, SendGrid)", PL["cogs_msg"], False),
        ("Customer-success tooling (Intercom, Hotjar)", PL["cogs_tools"], False),
    ]
    r = 5
    for label, vals, style in rows:
        write_row(ws, r, label, list(vals) + [sum(vals)], total=(style == "total"))
        r += 1


# ============================================================
# Payroll W3
# ============================================================
def sheet_w3(wb):
    ws = wb.create_sheet("Payroll W3")
    write_header(ws, "Payroll Detail (W3)",
                 ["Y1 Gross", "Y1 Months paid", "Y2 Gross", "Y3 Gross"],
                 [44, 12, 14, 12, 12])

    roles = [
        # (label, y1_gross, y1_months, y2_gross, y3_gross)
        ("Founder A — CEO (Yusuf Quadri), £1,500/mo from M7", 9_000, 6, 24_000, 36_000),
        ("Founder B — CTO, £1,500/mo from M7", 9_000, 6, 24_000, 36_000),
        ("Customer Success Manager", 0, 0, 32_000, 36_000),
        ("Senior Backend Engineer (start Q1 Y2)", 0, 0, 48_000, 56_000),
        ("Safeguarding & Trust Lead (start Q2 Y2)", 0, 0, 18_000, 42_000),
        ("Marketing & Partnerships (start Q3 Y2)", 0, 0, 10_000, 38_000),
        ("Data / ML Engineer (start Q2 Y3)", 0, 0, 0, 40_000),
        ("Mobile Engineer (start Q3 Y3)", 0, 0, 0, 25_000),
        ("Founders' Associate (start Q3 Y3)", 0, 0, 0, 18_000),
        ("Engineer #2 (start Q4 Y3)", 0, 0, 0, 12_000),
        ("CSM #2 (start Q4 Y3)", 0, 0, 0, 13_000),
    ]
    r = 5
    totals = [0, 0, 0]
    for label, y1, y1m, y2, y3 in roles:
        write_row(ws, r, label, [y1, y1m, y2, y3], money=True)
        # Override Y1 months column to plain integer
        ws.cell(row=r, column=3).number_format = "0"
        totals[0] += y1; totals[1] += y2; totals[2] += y3
        r += 1
    write_row(ws, r, "Total gross salaries", [totals[0], "", totals[1], totals[2]], total=True); r += 2

    # NI + pension + benefits
    ni = (round(max(0, totals[0] - 1500) * 0.138 / 6),  # rough — only 6 months in Y1
          round(max(0, totals[1] - 9100) * 0.138),
          round(max(0, totals[2] - 9100) * 0.138))
    ni_total = (PL["ni"][0], PL["ni"][1], PL["ni"][2])
    pen = (PL["pension"][0], PL["pension"][1], PL["pension"][2])
    ben = (PL["benefits"][0], PL["benefits"][1], PL["benefits"][2])

    write_row(ws, r, "Employer NI (13.8% above secondary threshold)",
              [ni_total[0], "", ni_total[1], ni_total[2]], total=True); r += 1
    write_row(ws, r, "Employer pension (3% above £6,240)",
              [pen[0], "", pen[1], pen[2]], total=True); r += 1
    write_row(ws, r, "Other employment costs (kit, training, EMI admin)",
              [ben[0], "", ben[1], ben[2]], total=True); r += 1
    write_row(ws, r, "TOTAL EMPLOYMENT COST",
              [totals[0]+ni_total[0]+pen[0]+ben[0], "",
               totals[1]+ni_total[1]+pen[1]+ben[1],
               totals[2]+ni_total[2]+pen[2]+ben[2]], total=True); r += 2

    ws.cell(row=r, column=1,
            value="Founders take £0 in Q1-Q2 Y1 and £1,500/month each from M7 (Sep Y1) when the £150k pre-seed lands. "
                  "Both founders accept materially below-market compensation through Y2 to preserve runway. "
                  "EMI share-option scheme covers all Y2+ hires.").font = italic_small
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)


# ============================================================
# Marketing W4
# ============================================================
def sheet_w4(wb):
    ws = wb.create_sheet("Marketing W4")
    write_header(ws, "Marketing Expenditure Detail (W4)", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 14, 14, 14, 14])
    rows = [
        ("Total Marketing Expenses", PL["marketing"], "total"),
        ("", None, False),
        ("Channel-level spend", None, "sub"),
        ("University partnership & PR (NatWest network helps)", [1_200, 6_000, 18_000], False),
        ("Content / SEO / whitepaper", [600, 3_500, 12_000], False),
        ("LinkedIn / paid B2B", [0, 4_000, 14_000], False),
        ("Instagram / TikTok (mostly organic Y1)", [600, 7_500, 22_000], False),
        ("Google Search ads", [300, 3_000, 10_000], False),
        ("Student-rep / ambassador programme", [900, 4_000, 16_000], False),
        ("", None, False),
        ("KPIs", None, "sub"),
        ("Marketing as % of revenue", ["30%", "16%", "13%"], False),
        ("Number of campaigns / year", [6, 18, 32], False),
        ("Average CAC — institutional buyer (£)", [3_600, 1_800, 1_200], False),
        ("Average CAC — premium student (£)", [4.50, 3.20, 2.10], False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                sub_row(ws, r, label, 4)
            r += 1; continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"),
                  money=isinstance(vals[0], (int, float)))
        r += 1


# ============================================================
# R&D W5
# ============================================================
def sheet_w5(wb):
    ws = wb.create_sheet("R&D W5")
    write_header(ws, "Research & Development (W5)", ["Year 1", "Year 2", "Year 3", "TOTAL"],
                 [44, 14, 14, 14, 14])
    rows = [
        ("Total R&D Cost (P&L view)", [22_500, 60_000, 110_000], "total"),
        ("", None, False),
        ("Founder R&D time (60% allocation Y1)", [10_800, 28_800, 43_200], False),
        ("ML / NLP engineer time (allocated)", [0, 19_200, 45_000], False),
        ("R&D tooling & datasets (HuggingFace, Modal)", [1_200, 6_000, 12_000], False),
        ("3rd-party model evaluation & safety testing", [600, 2_000, 6_000], False),
        ("Hosting allocated to experiments", [180, 1_400, 3_800], False),
        ("Compliance / DPIA work attributable to R&D", [720, 2_600, 0], False),
        ("", None, False),
        ("Estimated SME R&D tax credit (16%)", None, "sub"),
        ("Receivable in following accounting period", [3_600, 9_600, 17_600], False),
    ]
    r = 5
    for label, vals, style in rows:
        if vals is None:
            if style == "sub":
                sub_row(ws, r, label, 4)
            r += 1; continue
        total_val = sum(vals) if all(isinstance(v, (int, float)) for v in vals) else ""
        write_row(ws, r, label, list(vals) + [total_val], total=(style == "total"),
                  money=isinstance(vals[0], (int, float)))
        r += 1


# ============================================================
# Fixed Assets
# ============================================================
def sheet_fa(wb):
    ws = wb.create_sheet("Fixed Assets")
    write_header(ws, "Fixed Asset Schedule",
                 ["Depreciation rate", "Y1 additions", "Y2 additions", "Y3 additions",
                  "Y1 depreciation", "Y2 depreciation", "Y3 depreciation", "Y3 NBV"],
                 [44, 14] + [12] * 7)
    rows = [
        ("Tangible — Laptops & equipment", "33%", 600, 1_800, 5_000, -200, -800, -2_400, 4_000),
        ("Intangible — Capitalised R&D (W5)", "20%", 300, 1_200, 4_000, -100, -700, -2_100, 2_900),
        ("Total CAPEX", "", 900, 3_000, 9_000, -300, -1_500, -4_500, 6_900),
    ]
    r = 5
    for row in rows:
        label = row[0]; rate = row[1]; vals = row[2:]
        cell = ws.cell(row=r, column=1, value=label)
        cell.font = bold if "Total" in label else regular
        cell.border = border_all; cell.alignment = left_a
        ws.cell(row=r, column=2, value=rate).alignment = right_a
        ws.cell(row=r, column=2).border = border_all
        for j, v in enumerate(vals, start=3):
            c = ws.cell(row=r, column=j, value=v)
            c.alignment = right_a; c.border = border_all
            if isinstance(v, (int, float)):
                c.number_format = gbp(v)
            if "Total" in label:
                c.fill = total_fill; c.font = bold
        r += 1

    ws.cell(row=r+1, column=1,
            value="MVP is already built so the upfront capex is minimal. Y1 hardware = 2 laptops + 1 spare; "
                  "Intangible adds are the cost of capitalised R&D meeting IAS 38 criteria.").font = italic_small
    ws.merge_cells(start_row=r+1, start_column=1, end_row=r+1, end_column=9)


# ============================================================
# Accelerator Value — quantify in-kind support
# ============================================================
def sheet_accelerator(wb):
    ws = wb.create_sheet("Accelerator Value")
    write_header(ws, "NatWest Accelerator — Quantified In-Kind Value",
                 ["Annual value (£)", "Cash cost to DEQUAD"], [50, 18, 18])
    rows = [
        ("Office co-working space (3 desks, central London)", 12_000, 0),
        ("Legal advice (Mishcon de Reya, DLA Piper panels)", 4_500, 0),
        ("Accountancy support (PwC alumni network)", 3_600, 0),
        ("Banking & business introductions", 2_000, 0),
        ("Investor pitch coaching & mentoring", 5_000, 0),
        ("Programme demo day & PR placement", 4_000, 0),
        ("Out-of-programme costs (Companies House, IP filings)", 0, 1_200),
        ("", None, None),
        ("TOTAL in-kind value (Y1)", 31_100, 1_200),
    ]
    r = 5
    for row in rows:
        label, val, cash = row
        if val is None:
            r += 1; continue
        c = ws.cell(row=r, column=1, value=label); c.border = border_all; c.alignment = left_a
        c.font = bold if label.startswith("TOTAL") else regular
        c2 = ws.cell(row=r, column=2, value=val); c2.alignment = right_a
        c2.border = border_all; c2.number_format = gbp(val)
        c3 = ws.cell(row=r, column=3, value=cash); c3.alignment = right_a
        c3.border = border_all; c3.number_format = gbp(cash)
        if label.startswith("TOTAL"):
            for cc in (c, c2, c3): cc.fill = total_fill; cc.font = bold
        r += 1
    ws.cell(row=r+1, column=1,
            value="The NatWest Accelerator membership materially de-risks Year 1: £31k of services received in-kind "
                  "against just £1.2k of cash cost. This is a strong validation signal for Envestors — DEQUAD has "
                  "already passed NatWest's selection process and is being mentored by their startup network.").font = italic_small
    ws.merge_cells(start_row=r+1, start_column=1, end_row=r+1, end_column=4)


# ============================================================
# Startup loan placeholder
# ============================================================
def sheet_loan(wb):
    ws = wb.create_sheet("Startup Loan")
    write_header(ws, "Startup Loan Schedule",
                 ["Principal", "Interest rate", "Term (months)", "Monthly payment"], [44] + [14]*4)
    ws.cell(row=5, column=1, value="No external debt taken at incorporation.").font = bold
    ws.cell(row=6, column=1,
            value="The founders are bootstrapping with £3,000 of equity and the in-kind NatWest "
                  "Accelerator support. The first cash injection is the £150,000 pre-seed bridge "
                  "(equity, not debt) targeted for September Year 1 once the first paying university "
                  "pilot has converted.").alignment = left_a
    ws.merge_cells(start_row=6, start_column=1, end_row=6, end_column=5)


# ============================================================
# Build the workbook
# ============================================================
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
    sheet_accelerator(wb)
    sheet_loan(wb)
    wb.save(OUT)
    print(f"Wrote {OUT}")
    print(f"  Y1 revenue: £{REV_Y[0]:,}  Y2: £{REV_Y[1]:,}  Y3: £{REV_Y[2]:,}")
    print(f"  Y1 closing cash: £{CASH_CLOSE[0]:,}")
    print(f"  Y3 closing cash: £{CASH_CLOSE[2]:,}")


if __name__ == "__main__":
    main()
