import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Flame, Check, ChevronDown, FileSpreadsheet, User, ShieldAlert } from 'lucide-react'
import ProgressRing from '../../components/shared/ProgressRing.jsx'
import AnimatedCounter from '../../components/shared/AnimatedCounter.jsx'
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

const EASE = [0.22, 1, 0.36, 1]

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
      <motion.header
        className="relative flex flex-col gap-3 overflow-hidden"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
      >
        {/* soft brand glow behind the title */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #F75C03, transparent 70%)' }} />
        <div className="flex items-center gap-3">
          <motion.div
            className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber"
            initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          >
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
          Six KPIs across the fiscal year. KPIs 1–3 are monthly; 4–6 are quarterly.
          A point is earned when a KPI clears its threshold. Monthly scoring starts in September,
          quarterly from Q2 — earlier periods show greyed as “not scored”.
        </p>
      </motion.header>

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

// ─────────────────────────────────────────────────────────────────────────────
function Roster({ rows, selected, onSelect, query, onQuery, cat, onCat, manager, onManager, managers, ad, onAd, ads, total }) {
  return (
    <aside className="arena-card p-3 lg:sticky lg:top-4 self-start">
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-arena-bg/60 border border-arena-border focus-within:border-arena-amber/60 transition-colors">
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
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((c, i) => {
            const active = c.name === selected
            return (
              <motion.li
                key={c.name}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.012, 0.25), ease: EASE }}
              >
                <button
                  onClick={() => onSelect(c.name)}
                  className="relative w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors hover:bg-arena-surface2/60"
                >
                  {active && (
                    <motion.span
                      layoutId="roster-active"
                      className="absolute inset-0 rounded-xl bg-arena-amber/15 ring-1 ring-inset ring-arena-amber/40"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative h-8 w-8 rounded-lg grid place-items-center text-[11px] font-display font-black text-white shrink-0 shadow-sm"
                    style={{ background: avatarColor(c.name), boxShadow: active ? '0 0 0 2px rgba(255,200,0,0.5)' : undefined }}>
                    {initials(c.name)}
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-sm font-display font-bold text-arena-ink truncate">{c.name}</span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold truncate">
                      {c.category} · {c.manager}
                    </span>
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
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

// ─────────────────────────────────────────────────────────────────────────────
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

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  }
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  }

  const mPts = monthHasData(results, month) ? monthlyPoints(results, month) : null
  const mVerdict = monthlyVerdict(results, month)
  const qPts = quarterHasData(results, quarter) ? quarterPoints(results, quarter) : null
  const qVerdict = quarterlyVerdict(results, quarter)

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Header */}
      <motion.div className="arena-card p-5 flex flex-col md:flex-row md:items-center gap-4"
        variants={item} initial="hidden" animate="show">
        <div className="flex items-center gap-3">
          <motion.span className="h-14 w-14 rounded-2xl grid place-items-center text-base font-display font-black text-white shrink-0"
            style={{ background: avatarColor(name) }}
            initial={{ scale: 0.7, rotate: -6 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
            {initials(name)}
          </motion.span>
          <div>
            <div className="font-display font-black text-arena-ink text-2xl leading-tight">{name}</div>
            <div className="text-xs text-arena-muted font-display font-bold uppercase tracking-[0.16em]">
              {consultant?.category} · Mgr {consultant?.manager} · AD {consultant?.ad}
            </div>
          </div>
        </div>
        <div className="md:ml-auto flex items-center gap-2">
          <motion.span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arena-bg/60 border border-arena-border text-sm font-display font-black text-arena-ink"
            whileHover={{ scale: 1.04 }}
          >
            <motion.span animate={{ scale: streak > 0 ? [1, 1.18, 1] : 1 }} transition={{ duration: 1.4, repeat: streak > 0 ? Infinity : 0 }}>
              <Flame size={15} className="text-accent-coral" strokeWidth={2.6} />
            </motion.span>
            {streak}<span className="text-arena-muted font-bold text-xs">mo streak</span>
          </motion.span>
        </div>
      </motion.div>

      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="arena-card p-4 ring-1 ring-inset ring-arena-amber/30 flex items-start gap-2.5 overflow-hidden">
            <ShieldAlert size={16} className="text-arena-amber mt-0.5 shrink-0" />
            <div className="text-sm text-arena-ink/90"><span className="font-display font-black">Manager note · </span>{note}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month picker + summary hero */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">Period</span>
        {dataMonths.map((m) => {
          const active = m.period === month
          return (
            <button key={m.period} onClick={() => setMonth(m.period)}
              className={['relative px-3 py-1.5 rounded-full text-xs font-display font-bold transition-colors',
                active ? 'text-arena-bg' : 'bg-arena-bg/70 border border-arena-border text-arena-muted hover:text-arena-ink'].join(' ')}>
              {active && <motion.span layoutId="month-pill" className="absolute inset-0 rounded-full bg-arena-amber shadow-glow-amber" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
              <span className="relative">{m.label} 2026</span>
            </button>
          )
        })}
        <Legend />
      </div>

      <SummaryHero month={month} monthMeta={monthMeta} quarter={quarter}
        mPts={mPts} mVerdict={mVerdict} qPts={qPts} qVerdict={qVerdict}
        scoredMonth={monthScored(month)} scoredQuarter={quarterScored(quarter)} />

      {/* 6 KPI rings */}
      <section>
        <h2 className="font-display font-black text-arena-ink text-lg mb-3">
          {monthMeta.label} snapshot · KPIs 1–3 monthly, 4–6 quarter-to-date (Q{quarter})
        </h2>
        <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-3"
          variants={container} initial="hidden" animate="show" key={`${name}-${month}`}>
          {[1, 2, 3].map((kpi) => (
            <KpiRingCard key={kpi} kpi={kpi} periodType="month" period={month} fiscalMonth={month} results={results} scored={monthScored(month)} variants={item} />
          ))}
          {[4, 5, 6].map((kpi) => (
            <KpiRingCard key={kpi} kpi={kpi} periodType="quarter" period={quarter} results={results} scored={quarterScored(quarter)} variants={item} />
          ))}
        </motion.div>
      </section>

      <MonthlyGrid results={results} />
      <QuarterlyGrid results={results} />
      <TrendStrip results={results} />
    </motion.div>
  )
}

function Legend() {
  const items = [['hit', 'Hit'], ['near', 'Near'], ['miss', 'Miss'], ['na', 'N/A']]
  return (
    <div className="ml-auto hidden sm:flex items-center gap-2.5 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">
      {items.map(([k, label]) => (
        <span key={k} className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: STATUS[k].color }} />{label}
        </span>
      ))}
    </div>
  )
}

function SummaryHero({ monthMeta, quarter, mPts, mVerdict, qPts, qVerdict, scoredMonth, scoredQuarter }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
    >
      <SummaryTile label={`${monthMeta.label} · monthly`} pts={mPts} verdict={mVerdict} scored={scoredMonth} max={3} />
      <SummaryTile label={`Q${quarter} · quarter-to-date`} pts={qPts} verdict={qVerdict} scored={scoredQuarter} max={3} />
    </motion.div>
  )
}

function SummaryTile({ label, pts, verdict, scored, max }) {
  const vs = VERDICT_STYLE[verdict.kind] ?? VERDICT_STYLE.empty
  return (
    <div className="arena-card p-4 flex items-center gap-4 overflow-hidden relative">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: scored ? vs.color : '#8e8ea0' }} />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">{label}</div>
        <div className="mt-0.5 font-display font-black text-arena-ink text-3xl leading-none tabular-nums">
          {pts == null ? '—' : <AnimatedCounter value={pts} duration={0.7} format={(v) => Math.round(v)} />}
          <span className="text-arena-muted text-lg font-bold">/{max}</span>
        </div>
      </div>
      <div className="relative ml-auto flex flex-col items-end gap-1.5">
        <BigPips n={pts ?? 0} dim={!scored} max={max} />
        <span className="text-[10px] uppercase tracking-wider font-display font-black" style={{ color: scored ? vs.color : '#8e8ea0' }}>
          {scored ? vs.label : 'Not scored'}
        </span>
      </div>
    </div>
  )
}

function BigPips({ n, dim, max = 3 }) {
  return (
    <span className="inline-flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <motion.span key={i} className="h-2.5 w-6 rounded-full"
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: dim ? 0.4 : 1 }}
          transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease: EASE }}
          style={{ transformOrigin: 'left', background: i < n ? '#F75C03' : 'rgba(255,255,255,0.12)' }} />
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function KpiRingCard({ kpi, periodType, period, fiscalMonth, results, scored, variants }) {
  const r = results[`${periodType}:${period}:${kpi}`]
  const sc = periodType === 'month'
    ? scoreMonthlyKpi(kpi, r, fiscalMonth)
    : scoreQuarterlyKpi(kpi, r)
  const meta = KPI_META[kpi]
  const thr = kpiThreshold(kpi)
  const color = scored ? STATUS[sc.status]?.color ?? STATUS.empty.color : '#8e8ea0'
  const ratio = sc.ratio
  const ringRatio = ratio == null ? 0 : Math.min(1, ratio / (kpi === 2 ? KPI2_CAP : 1))
  const isHit = scored && sc.point === 1

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="arena-card p-4 flex items-center gap-4 relative overflow-hidden"
      style={isHit ? { boxShadow: `0 10px 34px -18px ${color}` } : undefined}
    >
      {isHit && (
        <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full opacity-25 blur-2xl" style={{ background: color }} />
      )}
      <div className="relative">
        <ProgressRing ratio={ringRatio} size={84} stroke={8} color={color} pulse={isHit}>
          <div className="text-center">
            <div className="font-display font-black text-arena-ink text-base leading-none tabular-nums">
              {sc.status === 'na' ? 'N/A'
                : ratio == null ? '—'
                : <AnimatedCounter value={ratio * 100} duration={0.9} format={(v) => `${v.toFixed(1)}%`} />}
            </div>
            {isHit && (
              <motion.span className="mt-1 inline-grid place-items-center"
                initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.5 }}>
                <Check size={14} style={{ color }} strokeWidth={3} />
              </motion.span>
            )}
          </div>
        </ProgressRing>
      </div>
      <div className="min-w-0 relative">
        <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{meta.short}</div>
        <div className="font-display font-bold text-arena-ink text-sm leading-tight">{meta.name}</div>
        <div className="mt-1 text-[11px] text-arena-muted tabular-nums" title={ratio == null ? '' : `ratio ${ratio}`}>
          {r ? <>n {money(r.numerator)} / d {money(r.denominator)}</> : 'no data'}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider font-display font-bold" style={{ color }}>
          {!scored ? 'Not scored' : `${STATUS[sc.status]?.label ?? '—'} · thr ${Math.round(thr * 100)}%${kpi === 2 ? '–120%' : ''}`}
        </div>
      </div>
    </motion.div>
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
      <motion.span
        className="inline-block min-w-[46px] px-1.5 py-1 rounded-md text-[11px] font-display font-bold tabular-nums cursor-default"
        style={{ background: bg, color: scored ? color : '#8e8ea0', opacity: scored ? 1 : 0.55 }}
        whileHover={{ scale: 1.12, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        title={sc.ratio == null ? 'N/A' : `ratio ${sc.ratio}`}
      >
        {sc.status === 'na' ? 'N/A' : pct(sc.ratio)}
      </motion.span>
    </td>
  )
}

const gridRow = {
  hidden: { opacity: 0, x: -10 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3, ease: EASE } }),
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
            {[1, 2, 3].map((kpi, idx) => (
              <motion.tr key={kpi} className="border-t border-arena-border"
                variants={gridRow} custom={idx} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
                <td className="px-2 py-1.5 text-xs font-display font-bold text-arena-ink whitespace-nowrap">{KPI_META[kpi].short} {KPI_META[kpi].name}</td>
                {months.map((m) => {
                  const r = results[`month:${m.period}:${kpi}`]
                  const sc = r ? scoreMonthlyKpi(kpi, r, m.period) : null
                  return <Cell key={m.period} sc={sc} scored={monthScored(m.period)} />
                })}
              </motion.tr>
            ))}
            <tr className="border-t border-arena-border bg-arena-surface2/30">
              <td className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">Points / verdict</td>
              {months.map((m) => {
                const has = monthHasData(results, m.period)
                const scored = monthScored(m.period)
                const pts = has ? monthlyPoints(results, m.period) : null
                const v = monthlyVerdict(results, m.period)
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
            {[4, 5, 6].map((kpi, idx) => (
              <motion.tr key={kpi} className="border-t border-arena-border"
                variants={gridRow} custom={idx} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}>
                <td className="px-2 py-1.5 text-xs font-display font-bold text-arena-ink whitespace-nowrap">{KPI_META[kpi].short} {KPI_META[kpi].name}</td>
                {quarters.map((q) => {
                  const r = results[`quarter:${q}:${kpi}`]
                  const sc = r ? scoreQuarterlyKpi(kpi, r) : null
                  return <Cell key={q} sc={sc} scored={quarterScored(q)} />
                })}
              </motion.tr>
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
        <motion.span key={i} className="h-2 w-2 rounded-full"
          initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 500, damping: 18 }}
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
  const gid = `tg-${kpi}`
  return (
    <motion.div className="arena-card p-3"
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, ease: EASE }} whileHover={{ y: -3 }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-display font-bold text-arena-ink">{meta.short} {meta.name}</div>
        <div className="text-[10px] text-arena-muted font-display font-bold">thr {Math.round(thr * 100)}%</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[70px]">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffc800" />
            <stop offset="100%" stopColor="#F75C03" />
          </linearGradient>
        </defs>
        <line x1={padX} x2={W - padX} y1={y(thr)} y2={y(thr)} stroke="#8e8ea0" strokeWidth="1" strokeDasharray="3 3" />
        {cap && <line x1={padX} x2={W - padX} y1={y(cap)} y2={y(cap)} stroke="#ff4b4b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />}
        {points.length > 1 && (
          <motion.polyline points={line} fill="none" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }} />
        )}
        {points.map((p, i) => (
          <motion.circle key={i} cx={x(i)} cy={y(p.ratio)} r="3.5" fill="#F75C03"
            initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 500, damping: 16 }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        ))}
      </svg>
      <div className="flex justify-between text-[9px] text-arena-muted font-display font-bold">
        {points.length ? points.map((p, i) => <span key={i}>{p.label}</span>) : <span>No data yet</span>}
      </div>
    </motion.div>
  )
}
