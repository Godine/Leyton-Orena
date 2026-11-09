import { useMemo, useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Flame, Check, Minus, X as XIcon, AlertTriangle, ChevronDown,
  FileSpreadsheet, User, ShieldAlert, Target, RotateCw, RotateCcw,
  UploadCloud, Download, ArrowUpDown, Users, Sparkles,
} from 'lucide-react'
import { useKpiStore } from '../../store/useKpiStore.js'
import { useArenaStore } from '../../store/useArenaStore.js'
import {
  getConsultants, getResultsFor, getManagerNote,
  getManagers, getADs, FISCAL_MONTHS, resolveKpiName,
} from '../../kpi/data/kpiData.js'
import {
  scoreMonthlyKpi, scoreQuarterlyKpi, kpiThreshold, KPI2_CAP,
  monthlyPoints, quarterPoints, monthlyVerdict, quarterlyVerdict,
  meetsStreak, monthScored, quarterScored, monthHasData, quarterHasData,
} from '../../kpi/scoring.js'

// Per-consultant summary used for roster signals, sorting, team stats, export.
function summarize(name, overrides) {
  const results = getResultsFor(name, overrides)
  const months = FISCAL_MONTHS.filter((m) => monthHasData(results, m.period))
  const quarters = [1, 2, 3, 4].filter((q) => quarterHasData(results, q))
  let total = 0, max = 0
  for (const m of months) { total += monthlyPoints(results, m.period); max += 3 }
  for (const q of quarters) { total += quarterPoints(results, q); max += 3 }
  const scoredMonths = months.filter((m) => monthScored(m.period))
  const lastScored = scoredMonths[scoredMonths.length - 1]
  const verdict = lastScored ? monthlyVerdict(results, lastScored.period) : null
  let review = false
  for (let i = 1; i < scoredMonths.length; i++) {
    if (monthlyPoints(results, scoredMonths[i].period) < 2 && monthlyPoints(results, scoredMonths[i - 1].period) < 2) review = true
  }
  return { name, results, months, quarters, total, max, verdict, review, hasData: months.length + quarters.length > 0 }
}

function downloadCsv(rows, overrides) {
  const monthCols = FISCAL_MONTHS.filter((m) => rows.some((r) => monthHasData(getResultsFor(r.name, overrides), m.period)))
  const qCols = [1, 2, 3, 4].filter((q) => rows.some((r) => quarterHasData(getResultsFor(r.name, overrides), q)))
  const header = ['Consultant', 'Category', 'Manager', 'AD',
    ...monthCols.map((m) => `${m.label} pts`), ...qCols.map((q) => `Q${q} pts`), 'Total', 'Max']
  const lines = [header.join(',')]
  for (const r of rows) {
    const res = getResultsFor(r.name, overrides)
    const s = summarize(r.name, overrides)
    const cells = [
      `"${r.name}"`, r.category, `"${r.manager ?? ''}"`, `"${r.ad ?? ''}"`,
      ...monthCols.map((m) => (monthHasData(res, m.period) ? monthlyPoints(res, m.period) : '')),
      ...qCols.map((q) => (quarterHasData(res, q) ? quarterPoints(res, q) : '')),
      s.total, s.max,
    ]
    lines.push(cells.join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'leyton-arena-kpi-scorecards.csv'
  a.click()
  URL.revokeObjectURL(url)
}

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
  const overrides = useKpiStore((s) => s.overrides)
  const extra = useKpiStore((s) => s.extraConsultants)
  const hasOverrides = Object.keys(overrides).length > 0

  const consultants = useMemo(() => getConsultants(extra), [extra])
  const managers = useMemo(() => getManagers(extra), [extra])
  const ads = useMemo(() => getADs(extra), [extra])

  // The consultant you were viewing on your profile (Arena "view as"), linked to
  // their KPI record — so clicking "Performance" opens the same person.
  const arenaUserName = useArenaStore((s) => s.getCurrentUser()?.name)

  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [manager, setManager] = useState('All')
  const [ad, setAd] = useState('All')
  const [sort, setSort] = useState('name')          // name | points-desc | points-asc | attention
  const [statusFilter, setStatusFilter] = useState('all') // all | review | below | meets
  const [view, setView] = useState('consultant')    // consultant | team
  const [selected, setSelected] = useState(() => {
    const q = params.get('consultant')
    if (q && consultants.some((c) => c.name === q)) return q
    const linked = arenaUserName ? resolveKpiName(arenaUserName, extra) : null
    return linked || consultants[0]?.name || null
  })

  // Deep-link: ?consultant=Name preselects (used by the profile link).
  useEffect(() => {
    const q = params.get('consultant')
    if (q && q !== selected && consultants.some((c) => c.name === q)) setSelected(q)
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (name) => {
    setSelected(name)
    setView('consultant')
    const next = new URLSearchParams(params); next.set('consultant', name); setParams(next, { replace: true })
  }

  // Summaries for the whole roster (cheap at this size), used for signals/sort/stats.
  const summaries = useMemo(() => {
    const map = new Map()
    for (const c of consultants) map.set(c.name, summarize(c.name, overrides))
    return map
  }, [consultants, overrides])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = consultants
      .filter((c) => cat === 'All' || c.category === cat)
      .filter((c) => manager === 'All' || c.manager === manager)
      .filter((c) => ad === 'All' || c.ad === ad)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
    if (statusFilter !== 'all') {
      rows = rows.filter((c) => {
        const s = summaries.get(c.name)
        if (statusFilter === 'review') return s?.review
        if (statusFilter === 'below') return s?.verdict?.kind === 'below' || s?.verdict?.kind === 'review'
        if (statusFilter === 'meets') return s?.verdict?.kind === 'meets'
        return true
      })
    }
    const by = {
      name: (a, b) => a.name.localeCompare(b.name),
      'points-desc': (a, b) => (summaries.get(b.name)?.total ?? 0) - (summaries.get(a.name)?.total ?? 0) || a.name.localeCompare(b.name),
      'points-asc': (a, b) => (summaries.get(a.name)?.total ?? 0) - (summaries.get(b.name)?.total ?? 0) || a.name.localeCompare(b.name),
      attention: (a, b) => (scoreAttention(summaries.get(b.name)) - scoreAttention(summaries.get(a.name))) || a.name.localeCompare(b.name),
    }
    return [...rows].sort(by[sort] ?? by.name)
  }, [consultants, query, cat, manager, ad, statusFilter, sort, summaries])

  return (
    <div className="space-y-6 xl:space-y-8">
      <motion.header className="relative flex flex-col gap-3"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <motion.div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber"
              initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              <User className="text-arena-amber" size={24} strokeWidth={2.4} />
            </motion.div>
            {hasOverrides && (
              <span className="arena-chip bg-arena-surface2 text-arena-muted inline-flex items-center gap-1.5">
                <FileSpreadsheet size={12} /> Custom data active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadCsv(filtered, overrides)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-arena-surface border border-arena-border text-xs font-display font-bold text-arena-ink hover:border-arena-amber/50">
              <Download size={13} /> Export CSV
            </button>
            <Link to="/performance/upload"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-arena-amber text-arena-bg text-xs font-display font-black shadow-glow-amber hover:brightness-110">
              <UploadCloud size={14} strokeWidth={2.6} /> Update data
            </Link>
          </div>
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
          rows={filtered} selected={view === 'team' ? null : selected} onSelect={pick}
          query={query} onQuery={setQuery} cat={cat} onCat={setCat}
          manager={manager} onManager={setManager} managers={managers}
          ad={ad} onAd={setAd} ads={ads} total={consultants.length}
          sort={sort} onSort={setSort} statusFilter={statusFilter} onStatusFilter={setStatusFilter}
          summaries={summaries}
          onTeam={() => setView('team')} teamActive={view === 'team'}
        />
        <AnimatePresence mode="wait">
          {view === 'team' ? (
            <TeamOverview key="team" rows={filtered} summaries={summaries} overrides={overrides} onPick={pick} />
          ) : selected ? (
            <Detail key={selected} name={selected} overrides={overrides} summary={summaries.get(selected)} />
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="arena-card p-12 text-center text-arena-muted">Pick a consultant to see their performance.</motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Higher = more urgent. Review flags first, then below-expectation, then low points.
function scoreAttention(s) {
  if (!s || !s.hasData) return -1
  let v = 0
  if (s.review) v += 100
  if (s.verdict?.kind === 'below') v += 40
  v += (s.max - s.total) // more missing points = more attention
  return v
}

const RAG = (s) => {
  if (!s || !s.hasData) return { color: '#8A8F9C' }
  if (s.review) return { color: '#E5484D' }
  if (s.verdict?.kind === 'below') return { color: '#E0A400' }
  if (s.verdict?.kind === 'meets') return { color: '#F75C03' }
  const frac = s.max ? s.total / s.max : 0
  return { color: frac >= 0.66 ? '#F75C03' : frac >= 0.33 ? '#E0A400' : '#E5484D' }
}

// ─── Roster — now carries per-consultant signal + sort + status filter ───────
const SORTS = [
  { key: 'name', label: 'A–Z' },
  { key: 'points-desc', label: 'Top points' },
  { key: 'points-asc', label: 'Low points' },
  { key: 'attention', label: 'Needs attention' },
]
const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'meets', label: 'Meets' },
  { key: 'below', label: 'Below' },
  { key: 'review', label: 'Review' },
]

function Roster({ rows, selected, onSelect, query, onQuery, cat, onCat, manager, onManager, managers, ad, onAd, ads, total,
  sort, onSort, statusFilter, onStatusFilter, summaries, onTeam, teamActive }) {
  return (
    <aside className="arena-card p-3 lg:sticky lg:top-4 self-start">
      {/* Team overview toggle */}
      <button onClick={onTeam}
        className={['w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-black transition-colors mb-2',
          teamActive ? 'bg-arena-amber text-arena-bg shadow-glow-amber' : 'bg-arena-surface2 text-arena-ink hover:bg-arena-surface2/70'].join(' ')}>
        <Users size={13} strokeWidth={2.6} /> Team overview
      </button>

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
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <LabeledPicker icon={ArrowUpDown} value={sort} onChange={onSort} options={SORTS} />
        <LabeledPicker icon={AlertTriangle} value={statusFilter} onChange={onStatusFilter} options={STATUS_FILTERS} />
      </div>

      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold px-1">{rows.length} of {total}</div>
      <ul className="mt-1 max-h-[60vh] overflow-y-auto pr-1 space-y-1">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((c, i) => {
            const active = c.name === selected
            const s = summaries.get(c.name)
            const rag = RAG(s)
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
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: rag.color }} title="status" />
                      <span className="text-sm font-display font-bold text-arena-ink truncate">{c.name}</span>
                      {s?.review && <ShieldAlert size={11} className="text-accent-coral shrink-0" title="Performance review" />}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold truncate">{c.category} · {c.manager}</span>
                  </span>
                  {s?.hasData && (
                    <span className="relative text-[10px] font-display font-black text-arena-ink tabular-nums shrink-0">
                      {s.total}<span className="text-arena-muted font-bold">/{s.max}</span>
                    </span>
                  )}
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

// Picker whose options are {key,label} with a leading icon.
function LabeledPicker({ icon: Icon, value, onChange, options }) {
  return (
    <span className="relative">
      <Icon size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-arena-bg/70 border border-arena-border rounded-full pl-7 pr-6 py-1.5 text-[11px] font-display font-bold text-arena-ink focus:outline-none focus:border-arena-amber/60 cursor-pointer transition-colors">
        {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
    </span>
  )
}

// ─── Team overview ───────────────────────────────────────────────────────────
function TeamOverview({ rows, summaries, overrides, onPick }) {
  const withData = rows.filter((c) => summaries.get(c.name)?.hasData)
  const totalPts = withData.reduce((a, c) => a + (summaries.get(c.name)?.total ?? 0), 0)
  const maxPts = withData.reduce((a, c) => a + (summaries.get(c.name)?.max ?? 0), 0)
  const meets = withData.filter((c) => summaries.get(c.name)?.verdict?.kind === 'meets').length
  const below = withData.filter((c) => ['below', 'review'].includes(summaries.get(c.name)?.verdict?.kind)).length
  const review = withData.filter((c) => summaries.get(c.name)?.review).length

  // Per-KPI hit rate across the team's latest available period for each KPI.
  const kpiHit = [1, 2, 3, 4, 5, 6].map((kpi) => {
    const monthly = kpi <= 3
    let hit = 0, assessable = 0
    for (const c of withData) {
      const res = getResultsFor(c.name, overrides)
      if (monthly) {
        const last = FISCAL_MONTHS.filter((m) => monthHasData(res, m.period)).pop()
        if (!last) continue
        const sc = scoreMonthlyKpi(kpi, res[`month:${last.period}:${kpi}`], last.period)
        if (sc.status === 'na' || sc.status === 'empty') continue
        assessable += 1; if (sc.status === 'hit') hit += 1
      } else {
        const lastQ = [1, 2, 3, 4].filter((q) => quarterHasData(res, q)).pop()
        if (!lastQ) continue
        const sc = scoreQuarterlyKpi(kpi, res[`quarter:${lastQ}:${kpi}`])
        if (sc.status === 'na' || sc.status === 'empty') continue
        assessable += 1; if (sc.status === 'hit') hit += 1
      }
    }
    return { kpi, pct: assessable ? hit / assessable : null, hit, assessable }
  })

  // Rank table — top & bottom by total points.
  const ranked = [...withData].sort((a, b) => (summaries.get(b.name)?.total ?? 0) - (summaries.get(a.name)?.total ?? 0))

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }} className="space-y-5">
      <div className="arena-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-arena-amber" />
          <h2 className="font-display font-black text-arena-ink text-xl">Team overview</h2>
          <span className="text-xs text-arena-muted">· {withData.length} with data</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BigStat label="Avg points" value={withData.length ? (totalPts / withData.length).toFixed(1) : '—'} sub={`of ${maxPts && withData.length ? (maxPts / withData.length).toFixed(0) : '—'}`} />
          <BigStat label="Meets expectation" value={meets} tone="#F75C03" />
          <BigStat label="Below" value={below} tone="#E0A400" />
          <BigStat label="Performance review" value={review} tone="#E5484D" />
        </div>

        {/* Per-KPI hit rate */}
        <div className="mt-5 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">% of team hitting each KPI · latest period</div>
          {kpiHit.map((k) => (
            <div key={k.kpi} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-display font-bold text-arena-ink">{KPI_META[k.kpi].short} · {KPI_META[k.kpi].name}</span>
              <div className="flex-1 h-2.5 rounded-full bg-arena-surface2 overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: '#F75C03' }}
                  initial={{ width: 0 }} animate={{ width: `${(k.pct ?? 0) * 100}%` }} transition={{ duration: 0.7, ease: EASE }} />
              </div>
              <span className="w-16 text-right text-xs font-display font-black text-arena-ink tabular-nums">
                {k.pct == null ? 'N/A' : `${Math.round(k.pct * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked list */}
      <div className="arena-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-arena-border flex items-center justify-between">
          <h3 className="font-display font-black text-arena-ink">Points ranking</h3>
          <span className="text-xs text-arena-muted">click a row to open</span>
        </div>
        <ul className="divide-y divide-arena-border max-h-[420px] overflow-y-auto">
          {ranked.map((c, i) => {
            const s = summaries.get(c.name)
            const rag = RAG(s)
            return (
              <li key={c.name}>
                <button onClick={() => onPick(c.name)} className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-arena-surface2/50 transition-colors">
                  <span className="w-6 text-xs font-display font-black text-arena-muted tabular-nums">{i + 1}</span>
                  <span className="h-7 w-7 rounded-lg grid place-items-center text-[10px] font-display font-black text-white shrink-0" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: rag.color }} />
                      <span className="text-sm font-display font-bold text-arena-ink truncate">{c.name}</span>
                      {s?.review && <ShieldAlert size={11} className="text-accent-coral" />}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold truncate">{c.category} · {c.manager}</span>
                  </span>
                  <span className="text-sm font-display font-black text-arena-ink tabular-nums">{s.total}<span className="text-arena-muted text-xs font-bold">/{s.max}</span></span>
                </button>
              </li>
            )
          })}
          {ranked.length === 0 && <li className="px-4 py-8 text-center text-sm text-arena-muted">No consultants with data in this filter.</li>}
        </ul>
      </div>
    </motion.div>
  )
}

function BigStat({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{label}</div>
      <div className="mt-0.5 font-display font-black text-2xl" style={{ color: tone || 'rgb(var(--arena-ink-rgb))' }}>{value}</div>
      {sub && <div className="text-[10px] text-arena-muted">{sub}</div>}
    </div>
  )
}

// ─── Detail ──────────────────────────────────────────────────────────────────
function Detail({ name, overrides, summary }) {
  const consultant = useMemo(() => getConsultants(useKpiStore.getState().extraConsultants).find((c) => c.name === name), [name])
  const results = useMemo(() => getResultsFor(name, overrides), [name, overrides])
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

        {summary?.review && (
          <div className="mt-4 rounded-xl bg-accent-coral/10 ring-1 ring-inset ring-accent-coral/40 p-3 flex items-start gap-2.5">
            <ShieldAlert size={15} className="text-accent-coral mt-0.5 shrink-0" />
            <div className="text-sm text-arena-ink/90"><span className="font-display font-black text-accent-coral">Performance review flag · </span>
              two consecutive scored months below expectation (&lt; 2 points).</div>
          </div>
        )}

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
          aria-hidden={flipped} tabIndex={flipped ? -1 : 0}
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
          aria-hidden={!flipped} tabIndex={flipped ? 0 : -1}
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
