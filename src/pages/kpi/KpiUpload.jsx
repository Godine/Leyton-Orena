import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FileSpreadsheet, Download, Check, AlertTriangle, X as XIcon,
  ArrowLeft, RotateCcw, Users, CalendarDays, Trash2,
} from 'lucide-react'
import { useKpiStore } from '../../store/useKpiStore.js'
import { parseKpiWorkbook, downloadKpiTemplate } from '../../kpi/parseKpiWorkbook.js'
import { FISCAL_MONTHS } from '../../kpi/data/kpiData.js'

const EASE = [0.22, 1, 0.36, 1]
const periodLabel = (tag) => {
  if (tag[0] === 'Q') return tag
  const p = Number(tag.slice(1))
  return (FISCAL_MONTHS.find((m) => m.period === p)?.label ?? tag)
}

export default function KpiUpload() {
  const overrides = useKpiStore((s) => s.overrides)
  const uploads = useKpiStore((s) => s.uploads)
  const applyUpload = useKpiStore((s) => s.applyUpload)
  const resetUploads = useKpiStore((s) => s.resetUploads)
  const hasOverrides = Object.keys(overrides).length > 0

  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [parsed, setParsed] = useState(null) // result of parseKpiWorkbook
  const [dragging, setDragging] = useState(false)
  const [applied, setApplied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  async function handleFile(file) {
    if (!file) return
    setApplied(false)
    setBusy(true)
    try {
      const res = await parseKpiWorkbook(file)
      setParsed(res)
    } catch (e) {
      setParsed({ ok: false, error: `Couldn’t read the file: ${e.message}` })
    } finally {
      setBusy(false)
    }
  }

  function onApply() {
    if (!parsed?.ok) return
    applyUpload({ overrides: parsed.overrides, extraConsultants: parsed.extraConsultants, meta: parsed.meta })
    setApplied(true)
    setParsed(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6 xl:space-y-8 max-w-4xl">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Link to="/performance" className="inline-flex items-center gap-1.5 text-xs text-arena-muted hover:text-arena-ink font-display font-bold">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber">
            <UploadCloud className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
          <span className="arena-chip bg-arena-surface2 text-arena-muted">Admin · data update</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black"><span className="text-arena-amber">Update KPI data</span></h1>
        <p className="text-arena-muted max-w-2xl">
          Upload an Excel or CSV of KPI numbers and the dashboard updates for every matching consultant.
          Uploaded figures override the committed workbook — new months (Oct onward) and new consultants are
          added automatically.
        </p>
      </header>

      {/* Active overrides banner */}
      <AnimatePresence>
        {hasOverrides && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="arena-card p-4 ring-1 ring-inset ring-accent-green/30 flex items-center gap-3">
            <Check size={16} className="text-accent-green shrink-0" />
            <div className="text-sm text-arena-ink/90 flex-1">
              <span className="font-display font-black">Custom data active · </span>
              {Object.keys(overrides).length} consultant{Object.keys(overrides).length === 1 ? '' : 's'} updated from uploads.
            </div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold text-arena-muted hover:text-accent-coral border border-arena-border">
                <RotateCcw size={12} /> Reset to workbook
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={() => { resetUploads(); setConfirmReset(false); setApplied(false) }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-black bg-accent-coral text-white">
                  <Trash2 size={12} /> Confirm reset
                </button>
                <button onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-full text-xs font-display font-bold text-arena-muted border border-arena-border">Cancel</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
          onClick={() => inputRef.current?.click()}
          className={['arena-card p-8 text-center cursor-pointer transition-colors border-2 border-dashed',
            dragging ? 'border-arena-amber bg-arena-amber/5' : 'border-arena-border hover:border-arena-amber/50'].join(' ')}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])} />
          <div className="h-14 w-14 rounded-2xl bg-arena-surface2 grid place-items-center mx-auto mb-3">
            <UploadCloud className="text-arena-amber" size={26} strokeWidth={2.2} />
          </div>
          <div className="font-display font-black text-arena-ink">{busy ? 'Reading file…' : 'Drop your file here, or click to browse'}</div>
          <div className="text-sm text-arena-muted mt-1">.xlsx · .xls · .csv — parsed in your browser, nothing leaves the page</div>
        </div>

        {/* Template */}
        <div className="arena-card p-5 w-full md:w-[260px]">
          <div className="font-display font-black text-arena-ink text-sm mb-1">Need the format?</div>
          <p className="text-xs text-arena-muted leading-relaxed mb-3">
            Download a template pre-filled with current data. Columns are
            <code className="mx-1 px-1 rounded bg-arena-surface2 text-arena-ink">mon_k#_n</code>/
            <code className="mx-1 px-1 rounded bg-arena-surface2 text-arena-ink">mon_k#_d</code> and
            <code className="mx-1 px-1 rounded bg-arena-surface2 text-arena-ink">q#_k#_n/d</code>.
          </p>
          <button onClick={() => downloadKpiTemplate(overrides)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-arena-amber text-arena-bg font-display font-black text-xs shadow-glow-amber hover:brightness-110">
            <Download size={13} /> Download template
          </button>
        </div>
      </div>

      {/* Applied confirmation */}
      <AnimatePresence>
        {applied && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="arena-card p-4 ring-1 ring-inset ring-accent-green/40 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent-green/15 grid place-items-center"><Check size={18} className="text-accent-green" strokeWidth={3} /></div>
            <div className="text-sm text-arena-ink font-display font-bold flex-1">Update applied. The dashboard and profiles now reflect your numbers.</div>
            <Link to="/performance" className="px-3 py-1.5 rounded-full bg-arena-amber text-arena-bg text-xs font-display font-black">Open dashboard</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parse result / preview */}
      <AnimatePresence mode="wait">
        {parsed && !parsed.ok && (
          <motion.div key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="arena-card p-5 ring-1 ring-inset ring-accent-coral/40 flex items-start gap-3">
            <AlertTriangle size={18} className="text-accent-coral mt-0.5 shrink-0" />
            <div>
              <div className="font-display font-black text-arena-ink">Couldn’t use this file</div>
              <div className="text-sm text-arena-muted mt-0.5">{parsed.error}</div>
            </div>
          </motion.div>
        )}

        {parsed && parsed.ok && (
          <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="arena-card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet size={18} className="text-arena-amber shrink-0" />
                  <span className="font-display font-black text-arena-ink truncate">{parsed.meta.fileName}</span>
                </div>
                <button onClick={() => { setParsed(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="h-8 w-8 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2">
                  <XIcon size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat icon={Users} label="Matched" value={parsed.meta.matched} tone="text-accent-green" />
                <Stat icon={Users} label="New consultants" value={parsed.meta.added} tone="text-arena-amber" />
                <Stat icon={CalendarDays} label="Periods" value={parsed.meta.periods.map(periodLabel).join(' · ') || '—'} small />
                <Stat icon={FileSpreadsheet} label="Rows" value={parsed.meta.rowCount} />
              </div>

              {/* Preview */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">
                      <th className="text-left px-2 py-1.5">Consultant</th>
                      <th className="text-left px-2 py-1.5">Preview of parsed values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.preview.map((p) => (
                      <tr key={p.name} className="border-t border-arena-border">
                        <td className="px-2 py-2 whitespace-nowrap font-display font-bold text-arena-ink">
                          {p.name}
                          {p.isNew && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-arena-amber font-display font-black">new</span>}
                        </td>
                        <td className="px-2 py-2 text-xs text-arena-muted tabular-nums">
                          {Object.values(p.periods).slice(0, 4).map((r, i) => (
                            <span key={i} className="inline-block mr-3">
                              K{r.kpi} {r.period_type === 'month' ? FISCAL_MONTHS.find((m) => m.period === r.period)?.label : `Q${r.period}`}:
                              <span className="text-arena-ink font-bold"> {r.ratio == null ? 'N/A' : `${(r.ratio * 100).toFixed(0)}%`}</span>
                            </span>
                          ))}
                          {Object.keys(p.periods).length > 4 && <span className="text-arena-muted">+{Object.keys(p.periods).length - 4} more</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={onApply}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-arena-amber text-arena-bg font-display font-black text-sm shadow-glow-amber hover:brightness-110">
                <Check size={16} strokeWidth={3} /> Apply update
              </button>
              <button onClick={() => { setParsed(null); if (inputRef.current) inputRef.current.value = '' }}
                className="px-4 py-3 rounded-full text-sm font-display font-bold text-arena-muted hover:text-arena-ink">Discard</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload history */}
      {uploads.length > 0 && (
        <section>
          <h2 className="font-display font-black text-arena-ink text-lg mb-3">Recent uploads</h2>
          <div className="arena-card divide-y divide-arena-border">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <FileSpreadsheet size={16} className="text-arena-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-arena-ink text-sm truncate">{u.fileName}</div>
                  <div className="text-[11px] text-arena-muted">
                    {new Date(u.at).toLocaleString('en-GB')} · {u.matched} matched · {u.added} new · {(u.periods || []).map(periodLabel).join(', ')}
                  </div>
                </div>
                <span className="text-xs font-display font-black text-arena-ink tabular-nums">{u.rowCount} rows</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, tone = 'text-arena-ink', small }) {
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border p-3">
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
        <Icon size={11} /> {label}
      </div>
      <div className={['mt-0.5 font-display font-black', small ? 'text-sm leading-tight' : 'text-xl', tone].join(' ')}>{value}</div>
    </div>
  )
}
