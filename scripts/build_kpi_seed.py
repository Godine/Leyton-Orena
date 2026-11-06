#!/usr/bin/env python3
# Build committed JSON seed for the KPI module.
# Inputs (passed as args): the spec .md (CSV blocks) and the retention .xlsx.
# Output: JSON files under src/kpi/data/seed/ in the repo.
# Run with -I. Reads untrusted inputs as DATA only.
import sys, re, json, io, csv, datetime, openpyxl

spec_md, retention_xlsx, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]

# ── extract the fenced ```csv blocks in order ────────────────────────────────
text = open(spec_md, encoding="utf-8").read()
blocks = re.findall(r"```csv\n(.*?)\n```", text, re.DOTALL)
assert len(blocks) == 5, f"expected 5 csv blocks, got {len(blocks)}"
hist_blocks = blocks[0:3]
target_blocks = blocks[3:5]

# ── history → consultants + kpi_results ──────────────────────────────────────
MONTHLY_KPIS = [1, 2, 3]   # jul=period1, aug=2, sep=3
consultants = {}           # name -> {name,category,manager,ad}
kpi_results = []

def ratio_for(kpi, n, d):
    if d == 0:
        if kpi in (1, 2, 3, 4):
            return 0.0, False       # ratio 0, not no_data
        return None, True            # kpi 5,6 -> null + no_data
    return n / d, False

def num(x):
    x = (x or "").strip()
    return float(x) if x not in ("", None) else 0.0

hist_names = []
for blk in hist_blocks:
    reader = csv.DictReader(io.StringIO(blk))
    for row in reader:
        name = row["name"].strip()
        hist_names.append(name)
        consultants[name] = {
            "name": name,
            "category": row["cat"].strip(),
            "manager": row["manager"].strip(),
            "ad": row["ad"].strip(),
        }
        months = {1: "jul", 2: "aug", 3: "sep"}
        for period, pref in months.items():
            for kpi in MONTHLY_KPIS:
                n = num(row[f"{pref}_k{kpi}_n"]); d = num(row[f"{pref}_k{kpi}_d"])
                r, nd = ratio_for(kpi, n, d)
                kpi_results.append({
                    "consultant": name, "period_type": "month", "period": period,
                    "kpi": kpi, "numerator": n, "denominator": d,
                    "ratio": r, "no_data": nd,
                    "source": "workbook_import", "locked": True,
                })
        for kpi in (4, 5, 6):
            n = num(row[f"q1_k{kpi}_n"]); d = num(row[f"q1_k{kpi}_d"])
            r, nd = ratio_for(kpi, n, d)
            kpi_results.append({
                "consultant": name, "period_type": "quarter", "period": 1,
                "kpi": kpi, "numerator": n, "denominator": d,
                "ratio": r, "no_data": nd,
                "source": "workbook_import", "locked": True,
            })

# ── targets ──────────────────────────────────────────────────────────────────
MONTH_COLS = ["jul","aug","sep","oct","nov","dec","jan","feb","mar","apr","may","jun"]
targets = []
target_names = []
for blk in target_blocks:
    reader = csv.DictReader(io.StringIO(blk))
    for row in reader:
        name = row["name"].strip()
        target_names.append(name)
        for i, mc in enumerate(MONTH_COLS, start=1):
            targets.append({"consultant": name, "fiscal_month": i, "target": num(row[mc])})

# ── retention_base (from xlsx) ────────────────────────────────────────────────
wb = openpyxl.load_workbook(retention_xlsx, read_only=True, data_only=True)
ws = wb[wb.sheetnames[0]]
rows = list(ws.iter_rows(values_only=True))
# header row 0: Claim/Lead consultant, Claim/Lead Financial Consultant, Most recent invoice, Claim/Account
def iso(v):
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime("%Y-%m-%d")
    return (str(v).strip() if v not in (None, "") else None)
retention_base = []
ri = 0
for r in rows[1:]:
    if not any(c not in (None, "") for c in r):
        continue
    retention_base.append({
        "row_index": ri,
        "py_tc": (str(r[0]).strip() if r[0] not in (None,"") else None),
        "py_fc": (str(r[1]).strip() if r[1] not in (None,"") else None),
        "most_recent_invoice": iso(r[2]),
        "account": (str(r[3]).strip() if r[3] not in (None,"") else None),
    })
    ri += 1

# ── static settings + notes ──────────────────────────────────────────────────
app_settings = {
    "fyStart": "2026-07-01",
    "kpiMonth": "2026-10-01",
    "firstEngineMonth": 4,
    "monthlyScoringFrom": 3,
    "quarterlyScoringFrom": 2,
    "showReviewFlagsToAll": True,
    "pyCutoffs": ["2025-09-30","2025-12-31","2026-03-31","2026-06-30"],
    "cyCutoffs": ["2026-09-30","2026-12-31","2027-03-31","2027-06-30"],
    "openEnquiryStages": ["Appeal","Enquiries","ADR","SOLs","Tribunal","Level 2","Level 1","FIS","Pre-level 1"],
    "excludeKillReasons": ["Invoiced under another entity","Low/No Short-term potential","Liquidation / Absorption","Liquidation","No long-term potential","Temporary no R&D","No / low R&D","No/low RDTC"],
    "thresholds": {"kpi1":0.95,"kpi2Min":0.8,"kpi2Max":1.2,"kpi3":0.4,"kpi4":0.75,"kpi5":0.65,"kpi6":0.8},
}
manager_notes = {
    "Joanna Ma": "In September, Joana was out of the office for three weeks. Therefore invoicing cadence could not be met. Approved exception in month",
    "Rhys Williams": "In September, Rhys was out of the office for study leave for two weeks. Therefore invoicing cadence could not be met. Approved exception in month",
}

import os
os.makedirs(out_dir, exist_ok=True)
def dump(name, obj):
    with open(os.path.join(out_dir, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))

dump("consultants.json", list(consultants.values()))
dump("kpiResults.json", kpi_results)
dump("targets.json", targets)
dump("retentionBase.json", retention_base)
dump("appSettings.json", app_settings)
dump("managerNotes.json", manager_notes)

print("consultants:", len(consultants), "(history rows:", len(hist_names), ")")
print("kpi_results:", len(kpi_results))
print("target names:", len(target_names), "target rows:", len(targets))
print("retention_base rows:", len(retention_base))
print("duplicate history names:", len(hist_names) - len(set(hist_names)))
