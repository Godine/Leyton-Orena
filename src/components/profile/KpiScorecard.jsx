import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Minus, X as XIcon, AlertTriangle, FileSpreadsheet, ArrowUpRight, Coins } from 'lucide-react'
import {
  resolveKpiName, getResultsFor, FISCAL_MONTHS,
} from '../../kpi/data/kpiData.js'
import { useKpiStore } from '../../store/useKpiStore.js'
import {
  scoreMonthlyKpi, scoreQuarterlyKpi,
  monthlyPoints, quarterPoints, monthScored, quarterScored,
  monthHasData, quarterHasData,
} from '../../kpi/scoring.js'

const STATUS = {
  hit:   { color: '#F75C03', label: 'Hit',    Icon: Check },
  near:  { color: '#E0A400', label: 'Near',   Icon: AlertTriangle },
  miss:  { color: '#E5484D', label: 'Missed', Icon: XIcon },
  na:    { color: '#8A8F9C', label: 'N/A',    Icon: Minus },
  empty: { color: '#8A8F9C', label: '—',      Icon: Minus },
}
const KPI_NAME = {
  1: 'YTD target by value', 2: 'Planned accounts delivered', 3: 'Invoiced in first 15 days',
  4: 'Recurring retention', 5: 'Recurring conversion < 9mo', 6: 'New business < 60 days',
}
const pct = (r, dp = 0) => (r == null ? '—' : `${(r * 100).toFixed(dp)}%`)

export default function KpiScorecard({ consultant }) {
  const overrides = useKpiStore((s) => s.overrides)
  const extra = useKpiStore((s) => s.extraConsultants)
  const kpiName = useMemo(() => resolveKpiName(consultant.name, extra), [consultant.name, extra])
  const results = useMemo(() => (kpiName ? getResultsFor(kpiName, overrides) : {}), [kpiName, overrides])

  const model = useMemo(() => {
    if (!kpiName) return null
    const months = FISCAL_MONTHS.filter((m) => monthHasData(results, m.period))
    const quarters = [1, 2, 3, 4].filter((q) => quarterHasData(results, q))
    const monthRows = months.map((m) => ({
      key: m.label, period: m.period, scored: monthScored(m.period),
      pts: monthlyPoints(results, m.period),
      cells: [1, 2, 3].map((k) => ({ kpi: k, sc: scoreMonthlyKpi(k, results[`month:${m.period}:${k}`], m.period) })),
    }))
    const quarterRows = quarters.map((q) => ({
      key: `Q${q}`, quarter: q, scored: quarterScored(q),
      pts: quarterPoints(results, q),
      cells: [4, 5, 6].map((k) => ({ kpi: k, sc: scoreQuarterlyKpi(k, results[`quarter:${q}:${k}`]) })),
    }))
    const total = monthRows.reduce((a, r) => a + r.pts, 0) + quarterRows.reduce((a, r) => a + r.pts, 0)
    const maxPossible = monthRows.length * 3 + quarterRows.length * 3
    return { monthRows, quarterRows, total, maxPossible }
  }, [kpiName, results])

  if (!kpiName) {
    return (
      <div className="arena-card p-8 text-center">
        <FileSpreadsheet size={22} className="mx-auto text-arena-muted mb-2" />
        <div className="font-display font-black text-arena-ink">No KPI workbook data</div>
        <p className="text-sm text-arena-muted mt-1 max-w-sm mx-auto">
          {consultant.name} isn’t in the imported KPI workbook (Jul–Sep 2026). Once the live engine runs,
          every consultant’s KPIs will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Hero — total KPI points */}
      <div className="arena-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-arena-amber/15 grid place-items-center text-arena-amber shrink-0">
            <Coins size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">KPI points earned</div>
            <div className="font-display font-black text-arena-ink leading-none mt-0.5" style={{ fontSize: '2.6rem' }}>
              {model.total}<span className="text-arena-muted text-xl font-bold"> / {model.maxPossible}</span>
            </div>
            <div className="text-xs text-arena-muted mt-0.5">across Jul–Sep 2026 + Q1 (workbook)</div>
          </div>
        </div>

        {/* per-period breakdown */}
        <div className="md:ml-auto flex flex-wrap gap-2">
          {[...model.monthRows, ...model.quarterRows].map((r) => (
            <PeriodChip key={r.key} label={r.key} pts={r.pts} scored={r.scored} />
          ))}
        </div>
      </div>

      {/* Per-month KPI performance */}
      <ScoreTable title="Monthly KPIs 1–3" kpis={[1, 2, 3]} rows={model.monthRows} />
      {model.quarterRows.length > 0 && (
        <ScoreTable title="Quarterly KPIs 4–6" kpis={[4, 5, 6]} rows={model.quarterRows} />
      )}

      <div className="flex items-center justify-between text-xs text-arena-muted">
        <span className="inline-flex items-center gap-1.5"><FileSpreadsheet size={12} /> Imported · official scoring starts Sep (monthly) / Q2 (quarterly)</span>
        <Link to={`/performance?consultant=${encodeURIComponent(kpiName)}`} className="inline-flex items-center gap-1 text-arena-amber font-display font-bold hover:underline">
          Full dashboard <ArrowUpRight size={13} />
        </Link>
      </div>
    </div>
  )
}

function PeriodChip({ label, pts, scored }) {
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border px-3 py-2 min-w-[86px]">
      <div className="text-[9px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="font-display font-black text-arena-ink text-lg tabular-nums">{pts}<span className="text-arena-muted text-[11px] font-bold">/3</span></span>
        <Pips n={pts} dim={!scored} />
      </div>
      {!scored && <div className="text-[9px] uppercase tracking-wider text-arena-muted font-display font-bold mt-0.5">Not scored</div>}
    </div>
  )
}

// Rows = periods, columns = the KPIs. Cell = status tint + %.
function ScoreTable({ title, kpis, rows }) {
  return (
    <section>
      <h3 className="font-display font-black text-arena-ink text-base mb-2">{title}</h3>
      <div className="arena-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 360 }}>
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.12em] text-arena-muted font-display font-bold">
                <th className="text-left px-3 py-2">Period</th>
                {kpis.map((k) => (
                  <th key={k} className="px-1 py-2 text-center" title={KPI_NAME[k]}>K{k}</th>
                ))}
                <th className="px-3 py-2 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <motion.tr key={r.key} className="border-t border-arena-border"
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ri * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-display font-bold text-arena-ink">{r.key}</span>
                    {!r.scored && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-arena-muted font-display font-bold">· not scored</span>}
                  </td>
                  {r.cells.map(({ kpi, sc }) => (
                    <HeatCell key={kpi} sc={sc} scored={r.scored} kpi={kpi} period={r.key} />
                  ))}
                  <td className="px-3 py-2 text-right">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <Pips n={r.pts} dim={!r.scored} />
                      <span className="font-display font-black text-arena-ink text-sm tabular-nums w-7 text-right">{r.pts}/3</span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function HeatCell({ sc, scored, kpi, period }) {
  if (!sc || sc.status === 'empty') return <td className="p-1"><div className="h-8 grid place-items-center text-arena-muted/25">·</div></td>
  const s = STATUS[sc.status]
  const tint = scored ? `${s.color}22` : 'transparent'
  const ring = scored ? `inset 0 0 0 1px ${s.color}44` : 'inset 0 0 0 1px rgb(var(--arena-border-rgb))'
  return (
    <td className="p-1">
      <div className="group relative h-8 rounded-md grid place-items-center" style={{ background: tint, boxShadow: ring, opacity: scored ? 1 : 0.55 }}>
        <span className="text-[11px] font-display font-bold tabular-nums text-arena-ink">{sc.status === 'na' ? 'N/A' : pct(sc.ratio)}</span>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 rounded-md text-[10px] font-display font-bold bg-arena-ink text-arena-bg opacity-0 group-hover:opacity-100 transition-opacity">
          K{kpi} · {KPI_NAME[kpi]} · {period} · {sc.status === 'na' ? 'N/A' : pct(sc.ratio, 1)}
        </span>
      </div>
    </td>
  )
}

function Pips({ n, dim }) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full"
          style={{ background: i < (n ?? 0) ? '#F75C03' : 'rgb(var(--arena-border-rgb))', opacity: dim ? 0.45 : 1 }} />
      ))}
    </span>
  )
}
