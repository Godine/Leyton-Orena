import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Flame, Check, Minus, X as XIcon, AlertTriangle, ChevronDown,
  FileSpreadsheet, User, ShieldAlert, Target, RotateCw, RotateCcw,
} from 'lucide-react'
import {
  getConsultants, getResultsFor, getManagerNote,
  getManagers, getADs, FISCAL_MONTHS,
} from '../../kpi/data/kpiData.js'
import {
  scoreMonthlyKpi, scoreQuarterlyKpi, kpiThreshold, KPI2_CAP,
  monthlyPoints, quarterPoints, monthlyVerdict, quarterlyVerdict,
  meetsStreak, monthScored, quarterScored, monthHasData, quarterHasData,
} from '../../kpi/scoring.js'

// Status is a RESERVED palette (not categorical): each state ships with an icon
// + label, never colour alone. Values/labels stay in ink tokens; colour lives
// on the mark (meter fill, chip tint, cell tint).
const STATUS = {
  hit:   { color: '#F75C03', label: 'Hit',    Icon: Check },
  near:  { color: '#E0A400', label: 'Near',   Icon: AlertTriangle },
  miss:  { color: '#E5484D', label: 'Missed', Icon: XIcon },
  na:    { color: '#8A8F9C', label: 'N/A',    Icon: Minus },
  empty: { color: '#8A8F9C', label: '—',      Icon: Minus },
}

const KPI_META = {
  1: { short: 'K1', name: 'YTD target by value' },
  2: { short: 'K2', name: 'Planned accounts delivered' },
  3: { short: 'K3', name: 'Invoiced in first 15 days' },
  4: { short: 'K4', name: 'Recurring retention' },
  5: { short: 'K5', name: 'Recurring conversion < 9mo' },
  6: { short: 'K6', name: 'New business < 60 days' },
}

const pct = (r, dp = 1) => (r == null ? '—' : `${(r * 100).toFixed(dp)}%`)
const money = (v) => (v == null ? '—' : v.toLocaleString('en-GB', { maximumFractionDigits: 0 }))
const initials = (name = '') => name.split(/[\s-]+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360} 52% 45%)`
}

const EASE = [0.22, 1, 0.36, 1]

// Count-up that animates on mount (not gated by scroll/in-view), so KPI values
// are always correct even below the fold — unlike an IntersectionObserver gate.
function CountUp({ value = 0, duration = 0.8, format = (v) => Math.round(v) }) {
  const [v, setV] = useState(value)
  const fromRef = useRef(0)
  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setV(from + (value - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{format(v)}</>
}

export default function ConsultantPerformanceDashboard() {
  const consultants = useMemo(() => getConsultants(), [])
  const managers = useMemo(() => getManagers(), [])
  const ads = useMemo(() => getADs(), [])

  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
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
      <motion.header className="relative flex flex-col gap-3 overflow-hidden"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F75C03, transparent 70%)' }} />
        <div className="flex items-center gap-3">
          <motion.div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber"
            initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
            <User className="text-arena-amber" size={24} strokeWidth={2.4} />
          </motion.div>
          <span className="arena-chip bg-arena-surface2 text-arena-muted inline-flex items-center gap-1.5">
            <FileSpreadsheet size={12} /> Imported from workbook · Jul–Sep 2026 + Q1
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-arena-amber">Consultant Performance</span> Dashboard
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Six KPIs across the fiscal year — three monthly, three quarterly. A point is earned when a KPI
          clears its threshold. Monthly scoring starts in September, quarterly from Q2.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 xl:gap-6">
        <Roster
          rows={filtered} selected={selected} onSelect={setSelected}
          query={query} onQuery={setQuery} cat={cat} onCat={setCat}
          manager={manager} onManager={setManager} managers={managers}
          ad={ad} onAd={setAd} ads={ads} total={consultants.length}
        />
        <AnimatePresence mode="wait">
          {selected
            ? <Detail key={selected} name={selected} />
            : <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="arena-card p-12 text-center text-arena-muted">Pick a consultant to see their performance.</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Roster (unchanged layout; list was fine) ────────────────────────────────
function Roster({ rows, selected, onSelect, query, onQuery, cat, onCat, manager, onManager, managers, ad, onAd, ads, total }) {
  return (
    <aside className="arena-card p-3 lg:sticky lg:top-4 self-start">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-arena-bg/60 border border-arena-border focus-within:border-arena-amber/60 transition-colors">
        <Search size={15} className="text-arena-muted shrink-0" />
        <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search consultants…"
          className="flex-1 bg-transparent text-sm text-arena-ink placeholder:text-arena-muted focus:outline-none font-display font-bold" />
      </div>
      <div className="mt-2"><Seg value={cat} onChange={onCat} options={['All', 'TC', 'FC']} /></div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Picker value={manager} onChange={onManager} options={managers} allLabel="All managers" />
        <Picker value={ad} onChange={onAd} options={ads} allLabel="All ADs" />
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold px-1">{rows.length} of {total}</div>
      <ul className="mt-1 max-h-[64vh] overflow-y-auto pr-1 space-y-1">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((c, i) => {
            const active = c.name === selected
            return (
              <motion.li key={c.name} layout
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.25), ease: EASE }}>
                <button onClick={() => onSelect(c.name)}
                  className="relative w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors hover:bg-arena-surface2/60">
                  {active && <motion.span layoutId="roster-active" className="absolute inset-0 rounded-xl bg-arena-amber/15 ring-1 ring-inset ring-arena-amber/40"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <span className="relative h-8 w-8 rounded-lg grid place-items-center text-[11px] font-display font-black text-white shrink-0"
                    style={{ background: avatarColor(c.name), boxShadow: active ? '0 0 0 2px rgba(255,200,0,0.5)' : undefined }}>
                    {initials(c.name)}
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-sm font-display font-bold text-arena-ink truncate">{c.name}</span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold truncate">{c.category} · {c.manager}</span>
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {rows.length === 0 && <li className="px-3 py-8 text-center text-sm text-arena-muted">No consultants match those filters.</li>}
      </ul>
    </aside>
  )
}

function Seg({ value, onChange, options }) {
  return (
    <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
      {options.map((o) => {
        const active = o === value
        return (
          <button key={o} onClick={() => onChange(o)}
            className={['relative px-3 py-1 rounded-full transition-colors', active ? 'text-arena-bg' : 'text-arena-muted hover:text-arena-ink'].join(' ')}>
            {active && <motion.span layoutId="seg-cat" className="absolute inset-0 rounded-full bg-arena-amber shadow-glow-amber" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o}</span>
          </button>
        )
      })}
    </div>
  )
}

function Picker({ value, onChange, options, allLabel }) {
  return (
    <span className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-arena-bg/70 border border-arena-border rounded-full pl-3 pr-7 py-1.5 text-[11px] font-display font-bold text-arena-ink focus:outline-none focus:border-arena-amber/60 cursor-pointer transition-colors">
        <option value="All">{allLabel}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
    </span>
  )
}

// ─── Detail ──────────────────────────────────────────────────────────────────
function Detail({ name }) {
  const consultant = useMemo(() => getConsultants().find((c) => c.name === name), [name])
  const results = useMemo(() => getResultsFor(name), [name])
  const note = getManagerNote(name)
  const streak = meetsStreak(results)

  const dataMonths = FISCAL_MONTHS.filter((m) => monthHasData(results, m.period))
  const defaultMonth = dataMonths.length ? dataMonths[dataMonths.length - 1].period : 1
  const [month, setMonth] = useState(defaultMonth)
  const monthMeta = FISCAL_MONTHS.find((m) => m.period === month) ?? FISCAL_MONTHS[0]
  const quarter = monthMeta.quarter

  // Period KPI evaluations.
  const monthlyEvals = [1, 2, 3].map((k) => ({ kpi: k, periodType: 'month', period: month, fiscalMonth: month, r: results[`month:${month}:${k}`], sc: scoreMonthlyKpi(k, results[`month:${month}:${k}`], month), scored: monthScored(month) }))
  const quarterlyEvals = [4, 5, 6].map((k) => ({ kpi: k, periodType: 'quarter', period: quarter, r: results[`quarter:${quarter}:${k}`], sc: scoreQuarterlyKpi(k, results[`quarter:${quarter}:${k}`]), scored: quarterScored(quarter) }))
  const allEvals = [...monthlyEvals, ...quarterlyEvals]
  const hits = allEvals.filter((e) => e.sc.status === 'hit').length
  const assessable = allEvals.filter((e) => e.sc.status !== 'na' && e.sc.status !== 'empty').length

  const mPts = monthHasData(results, month) ? monthlyPoints(results, month) : null
  const mVerdict = monthlyVerdict(results, month)
  const qPts = quarterHasData(results, quarter) ? quarterPoints(results, quarter) : null
  const qVerdict = quarterlyVerdict(results, quarter)

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }

  return (
    <motion.div className="space-y-5"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>

      {/* Identity + hero scorecard */}
      <motion.div className="arena-card p-5 md:p-6" variants={item} initial="hidden" animate="show">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <motion.span className="h-14 w-14 rounded-2xl grid place-items-center text-base font-display font-black text-white shrink-0"
              style={{ background: avatarColor(name) }} initial={{ scale: 0.7, rotate: -6 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}>{initials(name)}</motion.span>
            <div className="min-w-0">
              <div className="font-display font-black text-arena-ink text-2xl leading-tight truncate">{name}</div>
              <div className="text-xs text-arena-muted font-display font-bold uppercase tracking-[0.16em] truncate">
                {consultant?.category} · Mgr {consultant?.manager} · AD {consultant?.ad}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-display font-black text-arena-ink">
                <motion.span animate={{ scale: streak > 0 ? [1, 1.18, 1] : 1 }} transition={{ duration: 1.4, repeat: streak > 0 ? Infinity : 0 }}>
                  <Flame size={14} className="text-accent-coral" strokeWidth={2.6} />
                </motion.span>
                {streak}<span className="text-arena-muted font-bold">-month meets-expectation streak</span>
              </div>
            </div>
          </div>

          {/* Hero figure — KPIs hit this period */}
          <div className="lg:ml-auto flex items-center gap-5">
            <div className="text-right">
              <div className="font-display font-black text-arena-ink leading-none" style={{ fontSize: '3.25rem' }}>
                <CountUp value={hits} duration={0.7} format={(v) => Math.round(v)} />
                <span className="text-arena-muted text-2xl font-bold">/6</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mt-1">
                KPIs hit · {monthMeta.label} + Q{quarter}
              </div>
            </div>
            <div className="h-14 w-px bg-arena-border hidden sm:block" />
            <div className="grid grid-cols-2 gap-2">
              <ScoreTile label={`${monthMeta.label} points`} pts={mPts} verdict={mVerdict} scored={monthScored(month)} />
              <ScoreTile label={`Q${quarter} points`} pts={qPts} verdict={qVerdict} scored={quarterScored(quarter)} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {note && (
            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-xl bg-arena-amber/10 ring-1 ring-inset ring-arena-amber/30 p-3 flex items-start gap-2.5 overflow-hidden">
              <ShieldAlert size={15} className="text-arena-amber mt-0.5 shrink-0" />
              <div className="text-sm text-arena-ink/90"><span className="font-display font-black">Manager note · </span>{note}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls row: period + legend (one row above the charts) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mr-1">Period</span>
        {dataMonths.map((m) => {
          const active = m.period === month
          return (
            <button key={m.period} onClick={() => setMonth(m.period)}
              className={['relative px-3.5 py-1.5 rounded-full text-xs font-display font-bold transition-colors',
                active ? 'text-arena-bg' : 'bg-arena-bg/70 border border-arena-border text-arena-muted hover:text-arena-ink'].join(' ')}>
              {active && <motion.span layoutId="month-pill" className="absolute inset-0 rounded-full bg-arena-amber shadow-glow-amber" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
              <span className="relative">{m.label} 2026</span>
            </button>
          )
        })}
        <Legend />
      </div>

      {/* KPI meters */}
      <motion.section variants={container} initial="hidden" animate="show" key={`${name}-${month}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {allEvals.map((e) => (
            <KpiMeterCard key={e.kpi} e={e} variants={item} />
          ))}
        </div>
      </motion.section>

      {/* Heatmaps */}
      <HeatmapSection title="Monthly KPIs 1–3" kpis={[1, 2, 3]} cols={FISCAL_MONTHS}
        colKey={(m) => `month:${m.period}:`} colLabel={(m) => m.label} colScored={(m) => monthScored(m.period)}
        score={(k, r, m) => scoreMonthlyKpi(k, r, m.period)} results={results}
        pointsRow={FISCAL_MONTHS.map((m) => ({ has: monthHasData(results, m.period), pts: monthHasData(results, m.period) ? monthlyPoints(results, m.period) : null, scored: monthScored(m.period), verdict: monthlyVerdict(results, m.period) }))} />

      <HeatmapSection title="Quarterly KPIs 4–6" kpis={[4, 5, 6]} cols={[1, 2, 3, 4].map((q) => ({ q }))}
        colKey={(c) => `quarter:${c.q}:`} colLabel={(c) => `Q${c.q}`} colScored={(c) => quarterScored(c.q)}
        score={(k, r) => scoreQuarterlyKpi(k, r)} results={results}
        pointsRow={[1, 2, 3, 4].map((q) => ({ has: quarterHasData(results, q), pts: quarterHasData(results, q) ? quarterPoints(results, q) : null, scored: quarterScored(q), verdict: quarterlyVerdict(results, q) }))} />

      {/* Trends */}
      <TrendStrip results={results} />
    </motion.div>
  )
}

// ─── Hero sub-tiles ──────────────────────────────────────────────────────────
function ScoreTile({ label, pts, verdict, scored }) {
  const vs = VERDICT_STYLE[verdict.kind] ?? VERDICT_STYLE.empty
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border px-3 py-2 min-w-[120px]">
      <div className="text-[9px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{label}</div>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="font-display font-black text-arena-ink text-xl tabular-nums">{pts == null ? '—' : pts}<span className="text-arena-muted text-xs font-bold">/3</span></span>
        <Pips n={pts ?? 0} dim={!scored} />
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-display font-black" style={{ color: scored ? vs.color : '#8A8F9C' }}>
        <vs.Icon size={10} strokeWidth={3} />{scored ? vs.label : 'Not scored'}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="ml-auto flex items-center gap-3 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">
      {['hit', 'near', 'miss', 'na'].map((k) => {
        const s = STATUS[k]
        return (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />{s.label}
          </span>
        )
      })}
    </div>
  )
}

// How each KPI's numerator / denominator read in plain English, and whether
// they're money or counts — used to explain the "why" on the card back.
const KPI_EXPLAIN = {
  1: { num: 'Invoiced to date',       den: 'Cumulative target',   money: true,  verb: 'of target invoiced' },
  2: { num: 'Accounts delivered',     den: 'Accounts planned',    money: false, verb: 'of plan delivered' },
  3: { num: 'Invoiced before day 15', den: 'Total invoiced',      money: true,  verb: 'invoiced early' },
  4: { num: 'Accounts retained',      den: 'Recurring base',      money: false, verb: 'retained' },
  5: { num: 'Converted < 9 months',   den: 'Recurring claims',    money: false, verb: 'converted in time' },
  6: { num: 'Invoiced < 60 days',     den: 'New-business claims', money: false, verb: 'landed in 60 days' },
}

function fmtVal(v, isMoney) {
  if (v == null) return '—'
  return isMoney ? `£${v.toLocaleString('en-GB', { maximumFractionDigits: 0 })}` : `${Math.round(v)}`
}

// Plain-language reason for the score.
function kpiReason(e) {
  const { kpi, sc, scored, periodType } = e
  const thr = kpiThreshold(kpi)
  const cap = kpi === 2 ? KPI2_CAP : null
  const thrPct = Math.round(thr * 100)
  if (!scored) {
    return periodType === 'month'
      ? 'Not scored yet — monthly scoring starts in September.'
      : 'Not scored yet — quarterly scoring starts in Q2.'
  }
  if (sc.status === 'na') return 'No qualifying claims this period, so this KPI isn’t scored.'
  if (sc.status === 'hit') {
    return cap
      ? `Inside the ${thrPct}–${Math.round(cap * 100)}% band — 1 point earned.`
      : `Cleared the ${thrPct}% threshold — 1 point earned.`
  }
  if (cap && sc.ratio != null && sc.ratio >= cap) {
    return `Above the ${Math.round(cap * 100)}% ceiling — 0 points.`
  }
  const short = sc.ratio == null ? null : ((thr - sc.ratio) * 100)
  if (short != null && short > 0) {
    return `${short.toFixed(1)} points short of the ${thrPct}% threshold — 0 points.`
  }
  return `Below the ${thrPct}% threshold — 0 points.`
}

// ─── KPI meter card — flips to reveal the breakdown behind the number ─────────
function KpiMeterCard({ e, variants }) {
  const { kpi, r, sc, scored } = e
  const [flipped, setFlipped] = useState(false)
  const meta = KPI_META[kpi]
  const ex = KPI_EXPLAIN[kpi]
  const thr = kpiThreshold(kpi)
  const cap = kpi === 2 ? KPI2_CAP : null
  const statusKey = scored ? sc.status : 'na'
  const s = STATUS[statusKey]
  const noData = sc.status === 'na' || !r

  const faceBase = 'absolute inset-0 arena-card p-4 flex flex-col text-left'
  const hidden = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

  return (
    <motion.div variants={variants} className="relative" style={{ perspective: 1100 }}>
      <motion.div
        whileHover={{ y: -2 }}
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d', height: 190 }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {/* ── FRONT ── */}
        <button type="button" onClick={() => setFlipped(true)} aria-label={`${meta.name}: see why`}
          className={`${faceBase} gap-3`} style={hidden}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{meta.short}</div>
              <div className="font-display font-bold text-arena-ink text-sm leading-tight">{meta.name}</div>
            </div>
            <StatusChip statusKey={statusKey} scored={scored} />
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="font-display font-black text-arena-ink leading-none" style={{ fontSize: '1.9rem' }}>
              {sc.status === 'na' ? 'N/A'
                : sc.ratio == null ? '—'
                : <CountUp value={sc.ratio * 100} duration={0.9} format={(v) => `${v.toFixed(1)}%`} />}
            </div>
            <div className="text-[11px] text-arena-muted tabular-nums text-right leading-tight">
              {r ? <>n {money(r.numerator)}<br />d {money(r.denominator)}</> : 'no data'}
            </div>
          </div>

          <Meter kpi={kpi} ratio={sc.ratio} status={statusKey} scored={scored} thr={thr} cap={cap} />

          <div className="mt-auto flex items-center justify-between text-[10px] text-arena-muted font-display font-bold">
            <span className="inline-flex items-center gap-1"><Target size={10} /> Target {Math.round(thr * 100)}%{cap ? `–${Math.round(cap * 100)}%` : ''}</span>
            <span className="inline-flex items-center gap-1 text-arena-amber"><RotateCw size={10} strokeWidth={3} /> Why?</span>
          </div>
        </button>

        {/* ── BACK ── */}
        <button type="button" onClick={() => setFlipped(false)} aria-label={`${meta.name}: back`}
          className={`${faceBase} gap-2`} style={{ ...hidden, transform: 'rotateY(180deg)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{meta.short} · why this number</div>
            <RotateCcw size={12} className="text-arena-muted shrink-0" strokeWidth={2.6} />
          </div>

          {noData ? (
            <div className="flex-1 grid place-items-center text-center">
              <div className="text-sm text-arena-muted">No qualifying claims this period — nothing to score.</div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <ExRow label={ex.num} value={fmtVal(r.numerator, ex.money)} strong />
              <ExRow label={ex.den} value={fmtVal(r.denominator, ex.money)} />
              <div className="h-px bg-arena-border my-0.5" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-arena-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: scored ? s.color : '#8A8F9C' }} />
                  {sc.ratio == null ? '—' : `${(sc.ratio * 100).toFixed(1)}%`} {ex.verb}
                </span>
                <span className="text-[10px] font-display font-black" style={{ color: scored && sc.status === 'hit' ? '#F75C03' : '#8A8F9C' }}>
                  {scored ? (sc.status === 'hit' ? '+1 pt' : '0 pts') : '— pts'}
                </span>
              </div>
            </div>
          )}

          <div className="text-[11px] leading-snug" style={{ color: 'rgb(var(--arena-ink-rgb) / 0.75)' }}>
            {kpiReason(e)}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-arena-muted/70 font-display font-bold inline-flex items-center gap-1">
            <FileSpreadsheet size={9} /> Imported · line-item drill-down with the live engine
          </div>
        </button>
      </motion.div>
    </motion.div>
  )
}

function ExRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-arena-muted truncate">{label}</span>
      <span className={['tabular-nums font-display shrink-0', strong ? 'font-black text-arena-ink text-sm' : 'font-bold text-arena-ink/80 text-xs'].join(' ')}>{value}</span>
    </div>
  )
}

function StatusChip({ statusKey, scored }) {
  const s = STATUS[statusKey]
  const label = scored ? s.label : 'Not scored'
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-black shrink-0"
      style={{ background: `${s.color}1f` }}>
      <s.Icon size={11} strokeWidth={3} style={{ color: s.color }} />
      <span className="text-arena-ink">{label}</span>
    </span>
  )
}

// Meter: track (lighter step) + fill (status colour) + threshold tick. For KPI2
// the accepted band [0.8, 1.2] is shaded and the upper cap gets its own tick.
function Meter({ kpi, ratio, status, scored, thr, cap }) {
  const scaleMax = cap ? 1.35 : 1.2
  const color = scored ? STATUS[status].color : '#8A8F9C'
  const fillPct = ratio == null ? 0 : Math.max(0, Math.min(1, ratio / scaleMax)) * 100
  const thrPct = (thr / scaleMax) * 100
  const capPct = cap ? (cap / scaleMax) * 100 : null
  return (
    <div className="relative h-3 rounded-full bg-arena-surface2 overflow-hidden">
      {/* accepted band for KPI2 */}
      {cap && (
        <div className="absolute inset-y-0" style={{ left: `${thrPct}%`, width: `${capPct - thrPct}%`, background: '#F75C0314' }} />
      )}
      {/* fill */}
      <motion.div className="absolute inset-y-0 left-0 rounded-full"
        initial={{ width: 0 }} animate={{ width: `${fillPct}%` }} transition={{ duration: 0.8, ease: EASE }}
        style={{ background: color, opacity: scored ? 1 : 0.5 }} />
      {/* threshold tick */}
      <span className="absolute inset-y-0 w-[2px] bg-arena-ink/70" style={{ left: `calc(${thrPct}% - 1px)` }} title={`Target ${Math.round(thr * 100)}%`} />
      {cap && <span className="absolute inset-y-0 w-[2px] bg-arena-ink/40" style={{ left: `calc(${capPct}% - 1px)` }} title={`Cap ${Math.round(cap * 100)}%`} />}
    </div>
  )
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────
function HeatmapSection({ title, kpis, cols, colKey, colLabel, colScored, score, results, pointsRow }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3">{title}</h2>
      <div className="arena-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: cols.length > 6 ? 680 : 420 }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-arena-surface text-left px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">KPI</th>
                {cols.map((c, i) => (
                  <th key={i} className={['px-1 py-2 text-center text-[10px] uppercase tracking-[0.12em] font-display font-bold',
                    colScored(c) ? 'text-arena-muted' : 'text-arena-muted/40'].join(' ')}>{colLabel(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, ri) => (
                <motion.tr key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ri * 0.05, duration: 0.3, ease: EASE }}>
                  <td className="sticky left-0 z-10 bg-arena-surface px-3 py-1.5 whitespace-nowrap">
                    <span className="text-xs font-display font-bold text-arena-ink">{KPI_META[k].short}</span>
                    <span className="hidden sm:inline text-xs text-arena-muted"> · {KPI_META[k].name}</span>
                  </td>
                  {cols.map((c, ci) => {
                    const r = results[`${colKey(c)}${k}`]
                    const sc = r ? score(k, r, c) : null
                    return <HeatCell key={ci} sc={sc} scored={colScored(c)} kpi={k} label={colLabel(c)} />
                  })}
                </motion.tr>
              ))}
              {/* points + verdict footer */}
              <tr className="border-t border-arena-border">
                <td className="sticky left-0 z-10 bg-arena-surface px-3 py-2 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">Points</td>
                {pointsRow.map((p, i) => (
                  <td key={i} className="px-1 py-2 align-top">
                    {p.has ? (
                      <div className="flex flex-col items-center gap-1">
                        <Pips n={p.pts} dim={!p.scored} />
                        <VerdictTag v={p.verdict} scored={p.scored} />
                      </div>
                    ) : <div className="text-center text-arena-muted/30">·</div>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function HeatCell({ sc, scored, kpi, label }) {
  if (!sc || sc.status === 'empty') {
    return <td className="p-1"><div className="h-9 rounded-md grid place-items-center text-arena-muted/25">·</div></td>
  }
  const s = STATUS[sc.status]
  const tint = scored ? `${s.color}22` : 'transparent'
  const ring = scored ? `inset 0 0 0 1px ${s.color}44` : `inset 0 0 0 1px rgb(var(--arena-border-rgb))`
  return (
    <td className="p-1">
      <motion.div
        className="group relative h-9 rounded-md grid place-items-center cursor-default"
        style={{ background: tint, boxShadow: ring, opacity: scored ? 1 : 0.5 }}
        whileHover={{ scale: 1.06 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <span className="text-[11px] font-display font-bold tabular-nums text-arena-ink">
          {sc.status === 'na' ? 'N/A' : pct(sc.ratio, 0)}
        </span>
        {/* hover tooltip */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 rounded-md text-[10px] font-display font-bold bg-arena-ink text-arena-bg opacity-0 group-hover:opacity-100 transition-opacity">
          {KPI_META[kpi].short} · {label} · {sc.status === 'na' ? 'N/A' : pct(sc.ratio, 1)}{!scored ? ' · not scored' : ''}
        </span>
      </motion.div>
    </td>
  )
}

function Pips({ n, dim }) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-2 w-2 rounded-full"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 500, damping: 18 }}
          style={{ background: i < (n ?? 0) ? '#F75C03' : 'rgb(var(--arena-border-rgb))', opacity: dim ? 0.45 : 1 }} />
      ))}
    </span>
  )
}

const VERDICT_STYLE = {
  meets:        { color: '#F75C03', label: 'Meets',      Icon: Check },
  below:        { color: '#E5484D', label: 'Below',      Icon: XIcon },
  review:       { color: '#E5484D', label: 'Review',     Icon: AlertTriangle },
  'not-scored': { color: '#8A8F9C', label: 'Not scored', Icon: Minus },
  empty:        { color: '#8A8F9C', label: '—',          Icon: Minus },
}
function VerdictTag({ v, scored }) {
  const s = VERDICT_STYLE[v.kind] ?? VERDICT_STYLE.empty
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider font-display font-black whitespace-nowrap" style={{ color: scored ? s.color : '#8A8F9C' }}>
      <s.Icon size={9} strokeWidth={3} />{scored ? s.label : '—'}
    </span>
  )
}

// ─── Trends — small multiples, one line each ─────────────────────────────────
function TrendStrip({ results }) {
  const monthly = [1, 2, 3].map((kpi) => ({
    kpi, points: FISCAL_MONTHS.filter((m) => results[`month:${m.period}:${kpi}`]).map((m) => ({ label: m.label, ratio: results[`month:${m.period}:${kpi}`].ratio })),
  }))
  const quarterly = [4, 5, 6].map((kpi) => ({
    kpi, points: [1, 2, 3, 4].filter((q) => results[`quarter:${q}:${kpi}`]).map((q) => ({ label: `Q${q}`, ratio: results[`quarter:${q}:${kpi}`].ratio })),
  }))
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3">Trends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {[...monthly, ...quarterly].map(({ kpi, points }) => <TrendCard key={kpi} kpi={kpi} points={points} />)}
      </div>
    </section>
  )
}

function TrendCard({ kpi, points }) {
  const meta = KPI_META[kpi]
  const thr = kpiThreshold(kpi)
  const cap = kpi === 2 ? KPI2_CAP : null
  const W = 260, H = 96, padL = 10, padR = 34, padT = 12, padB = 22
  const vals = points.map((p) => p.ratio ?? 0)
  const maxR = Math.max(1.1, cap ?? 1, thr, ...vals) * 1.08
  const x = (i) => padL + (points.length <= 1 ? (W - padL - padR) / 2 : (i / (points.length - 1)) * (W - padL - padR))
  const y = (r) => H - padB - ((r ?? 0) / maxR) * (H - padT - padB)
  const line = points.map((p, i) => `${x(i)},${y(p.ratio)}`).join(' ')
  const last = points[points.length - 1]

  return (
    <motion.div className="arena-card p-3"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }} whileHover={{ y: -2 }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-display font-bold text-arena-ink truncate">{meta.short} · {meta.name}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* baseline (hairline, solid, recessive) */}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke="rgb(var(--arena-border-rgb))" strokeWidth="1" />
        {/* threshold reference (solid hairline + tag, never dashed) */}
        <line x1={padL} x2={W - padR} y1={y(thr)} y2={y(thr)} stroke="#8A8F9C" strokeWidth="1" />
        <text x={W - padR + 3} y={y(thr) + 3} fontSize="8" fontWeight="700" fill="#8A8F9C">{Math.round(thr * 100)}%</text>
        {cap && <line x1={padL} x2={W - padR} y1={y(cap)} y2={y(cap)} stroke="#E5484D" strokeWidth="1" opacity="0.5" />}
        {/* line */}
        {points.length > 1 && (
          <motion.polyline points={line} fill="none" stroke="#F75C03" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }} />
        )}
        {/* markers with 2px surface ring */}
        {points.map((p, i) => (
          <motion.circle key={i} cx={x(i)} cy={y(p.ratio)} r="4" fill="#F75C03" stroke="rgb(var(--arena-surface-rgb))" strokeWidth="2"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 500, damping: 16 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        ))}
        {/* end value label only */}
        {last && (
          <text x={x(points.length - 1)} y={y(last.ratio) - 8} textAnchor="middle" fontSize="9" fontWeight="800" fill="rgb(var(--arena-ink-rgb))">
            {pct(last.ratio, 0)}
          </text>
        )}
        {/* x labels */}
        {points.map((p, i) => (
          <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="8" fontWeight="700" fill="#8A8F9C">{p.label}</text>
        ))}
        {points.length === 0 && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="9" fill="#8A8F9C">No data yet</text>}
      </svg>
    </motion.div>
  )
}
