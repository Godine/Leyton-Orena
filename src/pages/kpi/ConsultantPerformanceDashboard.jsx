import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Flame, Check, ChevronDown, FileSpreadsheet, User, ShieldAlert } from 'lucide-react'
import ProgressRing from '../../components/shared/ProgressRing.jsx'
import {
  getConsultants, getResultsFor, getTargets, getManagerNote,
  getManagers, getADs, FISCAL_MONTHS,
} from '../../kpi/data/kpiData.js'
import {
  scoreMonthlyKpi, scoreQuarterlyKpi, kpiThreshold, KPI2_CAP,
  monthlyPoints, quarterPoints, monthlyVerdict, quarterlyVerdict,
  meetsStreak, monthScored, quarterScored, monthHasData, quarterHasData,
} from '../../kpi/scoring.js'

// Status → colour. Arena palette: hit = brand orange, near = amber,
// miss = coral, N/A & not-scored = muted grey.
const STATUS = {
  hit:   { color: '#F75C03', label: 'Hit' },
  near:  { color: '#ffc800', label: 'Near miss' },
  miss:  { color: '#ff4b4b', label: 'Missed' },
  na:    { color: '#8e8ea0', label: 'N/A' },
  empty: { color: '#8e8ea0', label: '—' },
}

const KPI_META = {
  1: { short: 'K1', name: 'YTD target by value',        unit: '%' },
  2: { short: 'K2', name: 'Planned accounts delivered', unit: '%' },
  3: { short: 'K3', name: 'Invoiced in first 15 days',  unit: '%' },
  4: { short: 'K4', name: 'Recurring retention',        unit: '%' },
  5: { short: 'K5', name: 'Recurring conversion <9mo',  unit: '%' },
  6: { short: 'K6', name: 'New business <60 days',      unit: '%' },
}

const pct = (r) => (r == null ? '—' : `${(r * 100).toFixed(1)}%`)
const money = (v) => (v == null ? '—' : v.toLocaleString('en-GB', { maximumFractionDigits: 2 }))
const initials = (name = '') => name.split(/[\s-]+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `hsl(${hue} 55% 42%)`
}

export default function ConsultantPerformanceDashboard() {
  const consultants = useMemo(() => getConsultants(), [])
  const managers = useMemo(() => getManagers(), [])
  const ads = useMemo(() => getADs(), [])

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')        // All | TC | FC
  const [manager, setManager] = useState('All')
  const [ad, setAd] = useState('All')
  const [selected, setSelected] = useState(consultants[0]?.name ?? null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return consultants
      .filter((c) => cat === 'All' || c.category === cat)
      .filter((c) => manager === 'All' || c.manager === manager)
      .filter((c) => ad === 'All' || c.ad === ad)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [consultants, query, cat, manager, ad])

  return (
    <div className="space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber">
            <User className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
          <span className="arena-chip bg-arena-surface2 text-arena-muted inline-flex items-center gap-1.5">
            <FileSpreadsheet size={12} /> Imported from workbook · Jul–Sep 2026 + Q1
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-arena-amber">Consultant Performance</span> Dashboard
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Six KPIs across the fiscal year. KPIs 1–3 are monthly; 4–6 are quarterly.
          A point is earned when a KPI clears its threshold. Monthly scoring starts in September,
          quarterly from Q2 — earlier periods show greyed as “not scored”.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 xl:gap-6">
        <Roster
          rows={filtered}
          selected={selected}
          onSelect={setSelected}
          query={query} onQuery={setQuery}
          cat={cat} onCat={setCat}
          manager={manager} onManager={setManager} managers={managers}
          ad={ad} onAd={setAd} ads={ads}
          total={consultants.length}
        />
        {selected
          ? <Detail key={selected} name={selected} />
          : <div className="arena-card p-12 text-center text-arena-muted">Pick a consultant to see their performance.</div>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function Roster({ rows, selected, onSelect, query, onQuery, cat, onCat, manager, onManager, managers, ad, onAd, ads, total }) {
  return (
    <aside className="arena-card p-3 lg:sticky lg:top-4 self-start">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-arena-bg/60 border border-arena-border">
        <Search size={15} className="text-arena-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search consultants…"
          className="flex-1 bg-transparent text-sm text-arena-ink placeholder:text-arena-muted focus:outline-none font-display font-bold"
        />
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <Seg value={cat} onChange={onCat} options={['All', 'TC', 'FC']} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Picker value={manager} onChange={onManager} options={managers} allLabel="All managers" />
        <Picker value={ad} onChange={onAd} options={ads} allLabel="All ADs" />
      </div>

      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold px-1">
        {rows.length} of {total}
      </div>

      <ul className="mt-1 max-h-[62vh] overflow-y-auto pr-1 space-y-1">
        {rows.map((c) => {
          const active = c.name === selected
          return (
            <li key={c.name}>
              <button
                onClick={() => onSelect(c.name)}
                className={[
                  'w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors',
                  active ? 'bg-arena-amber/15 ring-1 ring-inset ring-arena-amber/40' : 'hover:bg-arena-surface2/60',
                ].join(' ')}
              >
                <span className="h-8 w-8 rounded-lg grid place-items-center text-[11px] font-display font-black text-white shrink-0"
                  style={{ background: avatarColor(c.name) }}>
                  {initials(c.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-display font-bold text-arena-ink truncate">{c.name}</span>
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold truncate">
                    {c.category} · {c.manager}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {rows.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-arena-muted">No consultants match those filters.</li>
        )}
      </ul>
    </aside>
  )
}

function Seg({ value, onChange, options }) {
  return (
    <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={['px-3 py-1 rounded-full transition-colors', o === value ? 'bg-arena-amber text-arena-bg shadow-glow-amber' : 'text-arena-muted hover:text-arena-ink'].join(' ')}>
          {o}
        </button>
      ))}
    </div>
  )
}

function Picker({ value, onChange, options, allLabel }) {
  return (
    <span className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-arena-bg/70 border border-arena-border rounded-full pl-3 pr-7 py-1.5 text-[11px] font-display font-bold text-arena-ink focus:outline-none cursor-pointer">
        <option value="All">{allLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function Detail({ name }) {
  const consultant = useMemo(() => getConsultants().find((c) => c.name === name), [name])
  const results = useMemo(() => getResultsFor(name), [name])
  const note = getManagerNote(name)
  const streak = meetsStreak(results)

  // Months that actually have data (for the month picker).
  const dataMonths = FISCAL_MONTHS.filter((m) => monthHasData(results, m.period))
  const defaultMonth = dataMonths.length ? dataMonths[dataMonths.length - 1].period : 1
  const [month, setMonth] = useState(defaultMonth)
  const monthMeta = FISCAL_MONTHS.find((m) => m.period === month) ?? FISCAL_MONTHS[0]
  const quarter = monthMeta.quarter

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="arena-card p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="h-14 w-14 rounded-2xl grid place-items-center text-base font-display font-black text-white shrink-0"
            style={{ background: avatarColor(name) }}>
            {initials(name)}
          </span>
          <div>
            <div className="font-display font-black text-arena-ink text-2xl leading-tight">{name}</div>
            <div className="text-xs text-arena-muted font-display font-bold uppercase tracking-[0.16em]">
              {consultant?.category} · Mgr {consultant?.manager} · AD {consultant?.ad}
            </div>
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arena-bg/60 border border-arena-border text-sm font-display font-black text-arena-ink">
            <Flame size={15} className="text-accent-coral" strokeWidth={2.6} />
            {streak}<span className="text-arena-muted font-bold text-xs">mo streak</span>
          </span>
        </div>
      </div>

      {note && (
        <div className="arena-card p-4 ring-1 ring-inset ring-arena-amber/30 flex items-start gap-2.5">
          <ShieldAlert size={16} className="text-arena-amber mt-0.5 shrink-0" />
          <div className="text-sm text-arena-ink/90"><span className="font-display font-black">Manager note · </span>{note}</div>
        </div>
      )}

      {/* Month picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">Period</span>
        {dataMonths.map((m) => (
          <button key={m.period} onClick={() => setMonth(m.period)}
            className={['px-3 py-1.5 rounded-full text-xs font-display font-bold transition-colors',
              m.period === month ? 'bg-arena-amber text-arena-bg shadow-glow-amber' : 'bg-arena-bg/70 border border-arena-border text-arena-muted hover:text-arena-ink'].join(' ')}>
            {m.label} 2026
          </button>
        ))}
      </div>

      {/* 6 KPI rings */}
      <section>
        <h2 className="font-display font-black text-arena-ink text-lg mb-3">
          {monthMeta.label} snapshot · KPIs 1–3 monthly, 4–6 quarter-to-date (Q{quarter})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((kpi) => (
            <KpiRingCard key={kpi} kpi={kpi} periodType="month" period={month} fiscalMonth={month} results={results} scored={monthScored(month)} />
          ))}
          {[4, 5, 6].map((kpi) => (
            <KpiRingCard key={kpi} kpi={kpi} periodType="quarter" period={quarter} results={results} scored={quarterScored(quarter)} />
          ))}
        </div>
      </section>

      {/* Monthly grid */}
      <MonthlyGrid results={results} />
      {/* Quarterly grid */}
      <QuarterlyGrid results={results} />
      {/* Trends */}
      <TrendStrip results={results} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function KpiRingCard({ kpi, periodType, period, fiscalMonth, results, scored }) {
  const r = results[`${periodType}:${period}:${kpi}`]
  const sc = periodType === 'month'
    ? scoreMonthlyKpi(kpi, r, fiscalMonth)
    : scoreQuarterlyKpi(kpi, r)
  const meta = KPI_META[kpi]
  const thr = kpiThreshold(kpi)
  const color = scored ? STATUS[sc.status]?.color ?? STATUS.empty.color : '#8e8ea0'
  const ratio = sc.ratio
  const ringRatio = ratio == null ? 0 : Math.min(1, ratio / (kpi === 2 ? KPI2_CAP : 1))

  return (
    <div className="arena-card p-4 flex items-center gap-4">
      <ProgressRing ratio={ringRatio} size={84} stroke={8} color={color}>
        <div className="text-center">
          <div className="font-display font-black text-arena-ink text-base leading-none tabular-nums">
            {sc.status === 'na' ? 'N/A' : pct(ratio)}
          </div>
          {scored && sc.point === 1 && <Check size={14} className="mx-auto mt-1" style={{ color }} strokeWidth={3} />}
        </div>
      </ProgressRing>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{meta.short}</div>
        <div className="font-display font-bold text-arena-ink text-sm leading-tight">{meta.name}</div>
        <div className="mt-1 text-[11px] text-arena-muted tabular-nums" title={ratio == null ? '' : `ratio ${ratio}`}>
          {r ? <>n {money(r.numerator)} / d {money(r.denominator)}</> : 'no data'}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider font-display font-bold" style={{ color }}>
          {!scored ? 'Not scored' : `${STATUS[sc.status]?.label ?? '—'} · thr ${Math.round(thr * 100)}%${kpi === 2 ? '–120%' : ''}`}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function Cell({ sc, scored }) {
  if (!sc || sc.status === 'empty') {
    return <td className="px-1.5 py-1.5 text-center text-arena-muted/40">·</td>
  }
  const color = scored ? STATUS[sc.status].color : '#8e8ea0'
  const bg = scored ? `${color}1f` : 'transparent'
  return (
    <td className="px-1 py-1 text-center">
      <span
        className="inline-block min-w-[46px] px-1.5 py-1 rounded-md text-[11px] font-display font-bold tabular-nums"
        style={{ background: bg, color: scored ? color : '#8e8ea0', opacity: scored ? 1 : 0.55 }}
        title={sc.ratio == null ? 'N/A' : `ratio ${sc.ratio}`}
      >
        {sc.status === 'na' ? 'N/A' : pct(sc.ratio)}
      </span>
    </td>
  )
}

function MonthlyGrid({ results }) {
  const months = FISCAL_MONTHS
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3">Monthly KPIs 1–3</h2>
      <div className="arena-card p-3 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">
              <th className="text-left px-2 py-1.5">KPI</th>
              {months.map((m) => (
                <th key={m.period} className={['px-1 py-1.5 text-center', monthScored(m.period) ? '' : 'opacity-50'].join(' ')}>{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((kpi) => (
              <tr key={kpi} className="border-t border-arena-border">
                <td className="px-2 py-1.5 text-xs font-display font-bold text-arena-ink whitespace-nowrap">{KPI_META[kpi].short} {KPI_META[kpi].name}</td>
                {months.map((m) => {
                  const r = results[`month:${m.period}:${kpi}`]
                  const sc = r ? scoreMonthlyKpi(kpi, r, m.period) : null
                  return <Cell key={m.period} sc={sc} scored={monthScored(m.period)} />
                })}
              </tr>
            ))}
            {/* Points + verdict row */}
            <tr className="border-t border-arena-border bg-arena-surface2/30">
              <td className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">Points / verdict</td>
              {months.map((m) => {
                const has = monthHasData(results, m.period)
                const scored = monthScored(m.period)
                const pts = has ? monthlyPoints(results, m.period) : null
                const v = monthlyVerdict(results, m.period /* prevWasMiss */)
                return (
                  <td key={m.period} className="px-1 py-1.5 text-center align-top">
                    {has ? (
                      <div className="flex flex-col items-center gap-1">
                        <Pips n={pts} dim={!scored} />
                        <VerdictDot v={v} />
                      </div>
                    ) : <span className="text-arena-muted/40">·</span>}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function QuarterlyGrid({ results }) {
  const quarters = [1, 2, 3, 4]
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3">Quarterly KPIs 4–6</h2>
      <div className="arena-card p-3 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">
              <th className="text-left px-2 py-1.5">KPI</th>
              {quarters.map((q) => (
                <th key={q} className={['px-2 py-1.5 text-center', quarterScored(q) ? '' : 'opacity-50'].join(' ')}>Q{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[4, 5, 6].map((kpi) => (
              <tr key={kpi} className="border-t border-arena-border">
                <td className="px-2 py-1.5 text-xs font-display font-bold text-arena-ink whitespace-nowrap">{KPI_META[kpi].short} {KPI_META[kpi].name}</td>
                {quarters.map((q) => {
                  const r = results[`quarter:${q}:${kpi}`]
                  const sc = r ? scoreQuarterlyKpi(kpi, r) : null
                  return <Cell key={q} sc={sc} scored={quarterScored(q)} />
                })}
              </tr>
            ))}
            <tr className="border-t border-arena-border bg-arena-surface2/30">
              <td className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">Points / verdict</td>
              {quarters.map((q) => {
                const has = quarterHasData(results, q)
                const scored = quarterScored(q)
                const pts = has ? quarterPoints(results, q) : null
                const v = quarterlyVerdict(results, q)
                return (
                  <td key={q} className="px-2 py-1.5 text-center align-top">
                    {has ? (
                      <div className="flex flex-col items-center gap-1">
                        <Pips n={pts} dim={!scored} />
                        <VerdictDot v={v} />
                      </div>
                    ) : <span className="text-arena-muted/40">·</span>}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Pips({ n, dim }) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 rounded-full"
          style={{ background: i < (n ?? 0) ? '#F75C03' : 'rgba(255,255,255,0.12)', opacity: dim ? 0.4 : 1 }} />
      ))}
    </span>
  )
}

const VERDICT_STYLE = {
  meets:        { color: '#F75C03', label: 'Meets' },
  below:        { color: '#ff4b4b', label: 'Below' },
  review:       { color: '#ff4b4b', label: 'Review' },
  'not-scored': { color: '#8e8ea0', label: 'Not scored' },
  empty:        { color: '#8e8ea0', label: '—' },
}
function VerdictDot({ v }) {
  const s = VERDICT_STYLE[v.kind] ?? VERDICT_STYLE.empty
  return (
    <span className="text-[9px] uppercase tracking-wider font-display font-bold whitespace-nowrap" style={{ color: s.color }}>
      {s.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-KPI trend line with a dashed threshold (and the 120% cap for KPI 2).
function TrendStrip({ results }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3">Trends</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((kpi) => (
          <TrendCard key={kpi} kpi={kpi}
            points={FISCAL_MONTHS.filter((m) => results[`month:${m.period}:${kpi}`])
              .map((m) => ({ label: m.label, ratio: results[`month:${m.period}:${kpi}`].ratio }))} />
        ))}
        {[4, 5, 6].map((kpi) => (
          <TrendCard key={kpi} kpi={kpi}
            points={[1, 2, 3, 4].filter((q) => results[`quarter:${q}:${kpi}`])
              .map((q) => ({ label: `Q${q}`, ratio: results[`quarter:${q}:${kpi}`].ratio }))} />
        ))}
      </div>
    </section>
  )
}

function TrendCard({ kpi, points }) {
  const meta = KPI_META[kpi]
  const thr = kpiThreshold(kpi)
  const cap = kpi === 2 ? KPI2_CAP : null
  const W = 220, H = 70, padX = 8, padY = 10
  const maxR = Math.max(1.2, cap ?? 1, ...points.map((p) => (p.ratio ?? 0)), thr) * 1.05
  const x = (i) => padX + (points.length <= 1 ? (W - 2 * padX) / 2 : (i / (points.length - 1)) * (W - 2 * padX))
  const y = (r) => H - padY - ((r ?? 0) / maxR) * (H - 2 * padY)
  const line = points.map((p, i) => `${x(i)},${y(p.ratio)}`).join(' ')
  return (
    <div className="arena-card p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-display font-bold text-arena-ink">{meta.short} {meta.name}</div>
        <div className="text-[10px] text-arena-muted font-display font-bold">thr {Math.round(thr * 100)}%</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[70px]">
        <line x1={padX} x2={W - padX} y1={y(thr)} y2={y(thr)} stroke="#8e8ea0" strokeWidth="1" strokeDasharray="3 3" />
        {cap && <line x1={padX} x2={W - padX} y1={y(cap)} y2={y(cap)} stroke="#ff4b4b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
        {points.length > 1 && <polyline points={line} fill="none" stroke="#F75C03" strokeWidth="2" />}
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.ratio)} r="3" fill="#F75C03" />
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-arena-muted font-display font-bold">
        {points.length ? points.map((p, i) => <span key={i}>{p.label}</span>) : <span>No data yet</span>}
      </div>
    </div>
  )
}
