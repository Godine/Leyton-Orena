import { create } from 'zustand'
import { normName } from '../kpi/data/kpiData.js'

// Client-side override layer for KPI data (Option A — no backend). Uploaded
// spreadsheets are parsed in the browser and stored here as `engine` rows that
// win over the committed workbook seed. Persisted to localStorage so an upload
// survives reloads; "Reset to workbook" clears it.
const LS_OVERRIDES = 'arena-kpi-overrides'
const LS_EXTRA = 'arena-kpi-extra'
const LS_UPLOADS = 'arena-kpi-uploads'

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function save(key, value) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore quota */ }
}

export const useKpiStore = create((set, get) => ({
  // { [consultantName]: { 'month:4:1': row, 'quarter:2:4': row, … } }
  overrides: load(LS_OVERRIDES, {}),
  // consultants that only exist in an upload (not in the committed seed)
  extraConsultants: load(LS_EXTRA, []),
  // [{ id, fileName, at, rowCount, consultantCount, matched, added, periods:[] }]
  uploads: load(LS_UPLOADS, []),

  hasOverrides: () => Object.keys(get().overrides).length > 0,

  // Apply a parsed upload (see parseKpiWorkbook). Merges per consultant/period.
  applyUpload: ({ overrides: ov, extraConsultants: ex = [], meta }) =>
    set((state) => {
      const mergedOv = { ...state.overrides }
      for (const [name, periods] of Object.entries(ov)) {
        mergedOv[name] = { ...(mergedOv[name] || {}), ...periods }
      }
      const seen = new Set(state.extraConsultants.map((c) => normName(c.name)))
      const mergedEx = [...state.extraConsultants]
      for (const c of ex) {
        if (!seen.has(normName(c.name))) { mergedEx.push(c); seen.add(normName(c.name)) }
      }
      const uploads = [{ id: `u-${Date.now()}`, at: Date.now(), ...meta }, ...state.uploads].slice(0, 20)
      save(LS_OVERRIDES, mergedOv)
      save(LS_EXTRA, mergedEx)
      save(LS_UPLOADS, uploads)
      return { overrides: mergedOv, extraConsultants: mergedEx, uploads }
    }),

  resetUploads: () =>
    set(() => {
      save(LS_OVERRIDES, {})
      save(LS_EXTRA, [])
      save(LS_UPLOADS, [])
      return { overrides: {}, extraConsultants: [], uploads: [] }
    }),
}))
