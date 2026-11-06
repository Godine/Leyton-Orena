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

export function getConsultants() {
  return consultants
}

export function getConsultant(name) {
  return consultants.find((c) => c.name === name) ?? null
}

// Returns { 'month:3:1': row, 'quarter:1:4': row, … } for a consultant.
export function getResultsFor(name) {
  const m = _byConsultant.get(name)
  return m ? Object.fromEntries(m) : {}
}

export function getResult(name, periodType, period, kpi) {
  const m = _byConsultant.get(name)
  return m ? m.get(`${periodType}:${period}:${kpi}`) ?? null : null
}

export function getTargets(name) {
  return _targetsByConsultant.get(name) ?? {}
}

export function getManagerNote(name) {
  return managerNotes[name] ?? null
}

// Distinct managers / ADs for filters.
export function getManagers() {
  return [...new Set(consultants.map((c) => c.manager))].filter(Boolean).sort()
}
export function getADs() {
  return [...new Set(consultants.map((c) => c.ad))].filter(Boolean).sort()
}
