# Consultant Performance Dashboard — KPI module

A module inside Leyton Arena (not a second app). It reuses Arena's shell,
theme, tokens and components. Single user-facing page: **Consultant
Performance Dashboard** (`/performance`).

## Data (MVP: local seed, no Supabase)

Per the agreed Option A, the Supabase schema from the spec is mirrored as a
**local, read-only seed** committed under `src/kpi/data/seed/`. No backend,
no Supabase project. A thin accessor (`src/kpi/data/kpiData.js`) is the single
read seam, so a later swap to real Supabase is mechanical.

Seed is generated once from the workbook sources by
`scripts/build_kpi_seed.py` and committed as JSON:

| File | Rows | Source | Notes |
|---|---|---|---|
| `consultants.json` | 112 | spec CSV (history parts 1–3) | name, category (TC/FC), manager, ad |
| `kpiResults.json` | 1,344 | spec CSV | 12 rows/consultant; `source='workbook_import'`, `locked=true` |
| `targets.json` | 1,416 | spec CSV (targets parts 1–2) | 118 names × 12 fiscal months (1 = Jul) |
| `retentionBase.json` | 2,525 | `Retention_PY_base_EXO29.xlsx` | py_tc, py_fc, most_recent_invoice, account, row_index |
| `appSettings.json` | 11 keys | spec prompt 2 | thresholds, cut-offs, scoring-from, etc. |
| `managerNotes.json` | 2 | spec prompt 2 | Joanna Ma, Rhys Williams |

`ratio = n / d`; when `d = 0`: KPIs 1–4 → ratio `0`; KPIs 5–6 → ratio `null`
+ `no_data = true`. Values loaded exactly, no rounding.

The reference workbook (`Consulting_KPIs_September_working_file_v4.xlsm`) and
the retention file are kept here for cross-checking and for the later engine
(spec prompts 13–20), which is out of MVP scope.

## Scoring (`src/kpi/scoring.js`, pure)

| KPI | Point when | Period |
|---|---|---|
| 1 | ratio **≥ 0.95** | monthly |
| 2 | Jul: ≥ 0.80 · Aug–Jun: ≥ 0.80 and < 1.20 | monthly |
| 3 | ratio ≥ 0.40 | monthly |
| 4 | ratio ≥ 0.75 | quarterly |
| 5 | ratio ≥ 0.65 (else "No data" → N/A, 0 pts) | quarterly |
| 6 | ratio ≥ 0.80 (else "No data" → N/A, 0 pts) | quarterly |

Monthly points = K1+K2+K3; quarter points = K4+K5+K6. Monthly verdict ≥ 2 =
"Meets expectation"; two consecutive scored monthly misses → "Performance
review". Quarterly review if < 2 quarter points or < 6 monthly points in the
quarter. Amnesty: monthly scoring starts Sep (fiscal month 3), quarterly from
Q2 — earlier periods render greyed "not scored". `engine` rows beat
`workbook_import` where both exist (only imports exist today).

### Intended deviation from the workbook

KPI 1 scores at **ratio ≥ 0.95**; the workbook used **> 1.00**. So for the 6
September consultants whose KPI-1 ratio lands in [0.95, 1.00) the app awards
the point and the sheet does not. This is the one expected difference.

## What is deliberately NOT built (conflicts with Arena assumptions)

Per instruction, anything conflicting with Arena's current assumptions is not
implemented: no dark-navy default / `#F26122` / Geist / Sonner / confetti /
tier colour set (Arena's light-default theme, `#F75C03`, fonts, toast and
rarity palette are used instead); no Supabase/RLS/`admin`-`viewer` auth; no
second shell or nav sprawl (Home, Leaderboard, Teams, Trends, Settings,
styleguide); no KPI badges/Arena-points layer (would clash with Arena's own
points economy). KPI consultants live in their **own namespace** and do not
merge with Arena's 25 fictional consultants. Later spec phases (uploads,
engine, validation, badges) are out of MVP scope.
