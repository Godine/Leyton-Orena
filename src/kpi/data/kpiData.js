// KPI module data access. Option A: local seed mirroring the Supabase schema
// (tables: consultants, targets, kpi_results, retention_base, manager_notes,
// app_settings). Seeded from the workbook CSVs + retention .xlsx, all rows
// source='workbook_import', locked=true. Read-only for now; the `engine`
// source and uploads come later (spec prompts 13–20), out of MVP scope.
import consultantsSeed from './seed/consultants.json'
import kpiResultsSeed from './seed/kpiResults.json'
import targetsSeed from './seed/targets.json'
import retentionBaseSeed from './seed/retentionBase.json'
import appSettings from './seed/appSettings.json'
import managerNotes from './seed/managerNotes.json'

export const SETTINGS = appSettings

// Fiscal calendar: month 1 = July … 12 = June.
export const FISCAL_MONTHS = [
  { period: 1, key: 'jul', label: 'Jul', quarter: 1 },
  { period: 2, key: 'aug', label: 'Aug', quarter: 1 },
  { period: 3, key: 'sep', label: 'Sep', quarter: 1 },
  { period: 4, key: 'oct', label: 'Oct', quarter: 2 },
  { period: 5, key: 'nov', label: 'Nov', quarter: 2 },
  { period: 6, key: 'dec', label: 'Dec', quarter: 2 },
  { period: 7, key: 'jan', label: 'Jan', quarter: 3 },
  { period: 8, key: 'feb', label: 'Feb', quarter: 3 },
  { period: 9, key: 'mar', label: 'Mar', quarter: 3 },
  { period: 10, key: 'apr', label: 'Apr', quarter: 4 },
  { period: 11, key: 'may', label: 'May', quarter: 4 },
  { period: 12, key: 'jun', label: 'Jun', quarter: 4 },
]

export const consultants = consultantsSeed
export const retentionBase = retentionBaseSeed

// Index kpi_results by consultant for quick profile lookups. When both a
// workbook_import and engine row exist for the same key, the engine row wins
// (spec prompt 8). Only import rows exist today, but honour the precedence.
const _byConsultant = new Map()
for (const r of kpiResultsSeed) {
  if (!_byConsultant.has(r.consultant)) _byConsultant.set(r.consultant, new Map())
  const m = _byConsultant.get(r.consultant)
  const key = `${r.period_type}:${r.period}:${r.kpi}`
  const existing = m.get(key)
  if (!existing || (existing.source !== 'engine' && r.source === 'engine')) m.set(key, r)
}

const _targetsByConsultant = new Map()
for (const t of targetsSeed) {
  if (!_targetsByConsultant.has(t.consultant)) _targetsByConsultant.set(t.consultant, {})
  _targetsByConsultant.get(t.consultant)[t.fiscal_month] = t.target
}

// Normalise names so spelling/case/accent variants collapse to one person.
export function normName(n = '') {
  return String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// ── Override layer ───────────────────────────────────────────────────────────
// Uploaded spreadsheets add `engine`/`upload` rows that win over workbook_import
// (spec prompt 8). `overrides` is { [name]: { 'month:4:1': row, … } } and
// `extraConsultants` are consultants that only exist in an upload. Both are
// passed in by the store so this module stays pure and side-effect free.
export const SEED_CONSULTANTS = consultants

export function getConsultants(extra = []) {
  if (!extra || extra.length === 0) return consultants
  const seen = new Set(consultants.map((c) => normName(c.name)))
  const add = extra.filter((c) => !seen.has(normName(c.name)))
  return add.length ? [...consultants, ...add] : consultants
}

export function getConsultant(name, extra = []) {
  return getConsultants(extra).find((c) => c.name === name) ?? null
}

// Returns { 'month:3:1': row, 'quarter:1:4': row, … } for a consultant, with any
// uploaded overrides merged over the workbook baseline.
export function getResultsFor(name, overrides = null) {
  const m = _byConsultant.get(name)
  const base = m ? Object.fromEntries(m) : {}
  const ov = overrides && overrides[name]
  return ov ? { ...base, ...ov } : base
}

export function getResult(name, periodType, period, kpi, overrides = null) {
  const key = `${periodType}:${period}:${kpi}`
  const ov = overrides && overrides[name] && overrides[name][key]
  if (ov) return ov
  const m = _byConsultant.get(name)
  return m ? m.get(key) ?? null : null
}

export function getTargets(name) {
  return _targetsByConsultant.get(name) ?? {}
}

export function getManagerNote(name) {
  return managerNotes[name] ?? null
}

// Distinct managers / ADs for filters (includes uploaded consultants).
export function getManagers(extra = []) {
  return [...new Set(getConsultants(extra).map((c) => c.manager))].filter(Boolean).sort()
}
export function getADs(extra = []) {
  return [...new Set(getConsultants(extra).map((c) => c.ad))].filter(Boolean).sort()
}

// ── Link Arena consultants (own roster) to their KPI workbook record by name ──
// Arena spelling → KPI spelling for the few that differ beyond case/accents.
const ARENA_TO_KPI = { 'scott toner': 'scott tonner', 'henry shipley': 'henry shiplee' }

// Returns the canonical KPI consultant name for an Arena name, or null. Includes
// any uploaded consultants so freshly-added people resolve too.
export function resolveKpiName(arenaName, extra = []) {
  const index = new Map()
  for (const c of getConsultants(extra)) index.set(normName(c.name), c.name)
  const k = normName(arenaName)
  const target = ARENA_TO_KPI[k] ?? k
  return index.get(target) ?? null
}
