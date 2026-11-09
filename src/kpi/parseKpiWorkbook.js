import * as XLSX from 'xlsx'
import { FISCAL_MONTHS, getConsultants, getResultsFor, normName } from '../kpi/data/kpiData.js'

// Month abbreviation → fiscal period (1 = Jul … 12 = Jun).
const MONTH_TO_PERIOD = Object.fromEntries(FISCAL_MONTHS.map((m) => [m.key, m.period]))

// Header patterns: "<mon>_k<n>_<n|d>" (monthly 1–3) or "q<q>_k<n>_<n|d>" (quarterly 4–6).
const MONTH_COL = /^([a-z]{3})_k([1-6])_([nd])$/
const QUARTER_COL = /^q([1-4])_k([1-6])_([nd])$/

const MONEY = (v) => `£${Number(v).toLocaleString('en-GB', { maximumFractionDigits: 0 })}`

function provided(v) {
  if (v == null) return false
  if (typeof v === 'string' && v.trim() === '') return false
  return true
}
function num(v) {
  if (!provided(v)) return 0
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[, £]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// ratio = n/d; d==0 → KPIs 1–4 ratio 0, KPIs 5–6 null + no_data (spec).
function ratioFor(kpi, n, d) {
  if (d === 0) return kpi <= 4 ? { ratio: 0, no_data: false } : { ratio: null, no_data: true }
  return { ratio: n / d, no_data: false }
}

// Parse a File (xlsx/xls/csv) into an override set + metadata. Returns
// { ok, error?, overrides, extraConsultants, meta, preview }.
export async function parseKpiWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return { ok: false, error: 'No sheet found in the file.' }

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true })
  if (!rows.length) return { ok: false, error: 'The first sheet is empty.' }

  // Normalise header keys (lower/trim) once, per row via a key map.
  const firstKeys = Object.keys(rows[0])
  const keyMap = {} // normalised -> original
  for (const k of firstKeys) keyMap[k.trim().toLowerCase()] = k
  const nameKey = keyMap['name']
  if (!nameKey) return { ok: false, error: 'Missing a "name" column. Download the template to see the expected format.' }

  // Which columns are KPI values?
  const kpiCols = []
  for (const normk of Object.keys(keyMap)) {
    let mm = normk.match(MONTH_COL)
    if (mm && MONTH_TO_PERIOD[mm[1]]) {
      kpiCols.push({ orig: keyMap[normk], periodType: 'month', period: MONTH_TO_PERIOD[mm[1]], kpi: Number(mm[2]), nd: mm[3] })
      continue
    }
    mm = normk.match(QUARTER_COL)
    if (mm) {
      kpiCols.push({ orig: keyMap[normk], periodType: 'quarter', period: Number(mm[1]), kpi: Number(mm[2]), nd: mm[3] })
    }
  }
  if (!kpiCols.length) {
    return { ok: false, error: 'No KPI value columns found (expected e.g. "oct_k1_n", "oct_k1_d", "q2_k4_n"…). Download the template.' }
  }

  const catKey = keyMap['cat'] || keyMap['category']
  const mgrKey = keyMap['manager']
  const adKey = keyMap['ad']

  // Existing roster for match/new detection.
  const existing = new Set(getConsultants().map((c) => normName(c.name)))

  const overrides = {}
  const extraConsultants = []
  const periodsTouched = new Set()
  let matched = 0, added = 0, skipped = 0
  const preview = []

  for (const row of rows) {
    const rawName = String(row[nameKey] ?? '').trim()
    if (!rawName) { skipped += 1; continue }

    // group columns by period → raw {n, d} per kpi (keep raw to tell blank from 0)
    const byKey = {}
    for (const col of kpiCols) {
      const key = `${col.periodType}:${col.period}:${col.kpi}`
      byKey[key] = byKey[key] || { periodType: col.periodType, period: col.period, kpi: col.kpi, raw: {} }
      byKey[key].raw[col.nd] = row[col.orig]
    }

    const periods = {}
    for (const [key, v] of Object.entries(byKey)) {
      // A period with no numerator AND no denominator supplied is left untouched.
      if (!provided(v.raw.n) && !provided(v.raw.d)) continue
      const n = num(v.raw.n), d = num(v.raw.d)
      const { ratio, no_data } = ratioFor(v.kpi, n, d)
      periods[key] = {
        consultant: rawName, period_type: v.periodType, period: v.period, kpi: v.kpi,
        numerator: n, denominator: d, ratio, no_data, source: 'engine', locked: false,
      }
      periodsTouched.add(`${v.periodType === 'month' ? 'M' : 'Q'}${v.period}`)
    }
    if (!Object.keys(periods).length) { skipped += 1; continue }

    overrides[rawName] = { ...(overrides[rawName] || {}), ...periods }

    const isExisting = existing.has(normName(rawName))
    if (isExisting) matched += 1
    else {
      added += 1
      extraConsultants.push({
        name: rawName,
        category: (row[catKey] ?? 'TC') || 'TC',
        manager: (row[mgrKey] ?? '') || rawName,
        ad: (row[adKey] ?? '') || rawName,
      })
    }

    if (preview.length < 6) {
      preview.push({ name: rawName, isNew: !isExisting, periods })
    }
  }

  const consultantCount = Object.keys(overrides).length
  if (!consultantCount) return { ok: false, error: 'No valid rows found (every row was missing a name or values).' }

  return {
    ok: true,
    overrides,
    extraConsultants,
    preview,
    meta: {
      fileName: file.name,
      rowCount: Object.values(overrides).reduce((a, m) => a + Object.keys(m).length, 0),
      consultantCount,
      matched,
      added,
      skipped,
      periods: [...periodsTouched].sort(),
    },
  }
}

export { MONEY }

// Build an editable template from the current data (seed + overrides already
// applied in the store are not needed here — the committed baseline is enough to
// show the format) and trigger a download.
export function downloadKpiTemplate(overrides = null) {
  const cols = ['name', 'cat', 'manager', 'ad']
  const months = ['jul', 'aug', 'sep', 'oct'] // Jul–Sep seeded + Oct blank to fill
  for (const m of months) for (const k of [1, 2, 3]) { cols.push(`${m}_k${k}_n`, `${m}_k${k}_d`) }
  for (const q of [1, 2]) for (const k of [4, 5, 6]) { cols.push(`q${q}_k${k}_n`, `q${q}_k${k}_d`) }

  const data = getConsultants().map((c) => {
    const r = getResultsFor(c.name, overrides)
    const row = { name: c.name, cat: c.category, manager: c.manager, ad: c.ad }
    for (const m of months) {
      const p = MONTH_TO_PERIOD[m]
      for (const k of [1, 2, 3]) {
        const cell = r[`month:${p}:${k}`]
        row[`${m}_k${k}_n`] = cell ? cell.numerator : ''
        row[`${m}_k${k}_d`] = cell ? cell.denominator : ''
      }
    }
    for (const q of [1, 2]) {
      for (const k of [4, 5, 6]) {
        const cell = r[`quarter:${q}:${k}`]
        row[`q${q}_k${k}_n`] = cell ? cell.numerator : ''
        row[`q${q}_k${k}_d`] = cell ? cell.denominator : ''
      }
    }
    return row
  })

  const ws = XLSX.utils.json_to_sheet(data, { header: cols })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'KPI data')
  XLSX.writeFile(wb, 'leyton-arena-kpi-template.xlsx')
}
