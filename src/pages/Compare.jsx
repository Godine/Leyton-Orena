import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitCompare, ChevronDown, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { aggregate } from '../utils/computeRankings.js'
import { formatCurrencyCompact } from '../utils/formatters.js'
import LocationPill from '../components/shared/LocationPill.jsx'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function fmt(metric, v) {
  if (metric === 'invoice')   return formatCurrencyCompact(v)
  if (metric === 'earlyPct')  return `${Math.round(v)}%`
  if (metric === 'daysClose') return `${(v ?? 0).toFixed(1)}d`
  if (metric === 'fire')      return `${v}d`
  if (metric === 'streak')    return `${v}mo`
  return Math.round(v).toLocaleString('en-GB')
}

const METRICS = [
  { key: 'invoice',    label: 'Lifetime invoice',  betterWhenLower: false, source: 'lifetime' },
  { key: 'ops',        label: 'Lifetime ops',      betterWhenLower: false, source: 'lifetime' },
  { key: 'earlyPct',   label: 'Avg early %',       betterWhenLower: false, source: 'lifetime' },
  { key: 'daysClose',  label: 'Avg days to close', betterWhenLower: true,  source: 'lifetime' },
  { key: 'streak',     label: 'Best target streak', betterWhenLower: false, source: 'streak' },
  { key: 'fire',       label: 'Best fire streak',  betterWhenLower: false, source: 'fire' },
  { key: 'badges',     label: 'Badges earned',     betterWhenLower: false, source: 'badges' },
]

function metricValue(consultant, metric, lifetime) {
  switch (metric.source) {
    case 'lifetime':
      if (metric.key === 'invoice')   return lifetime.invoiceValue
      if (metric.key === 'ops')       return lifetime.opsDelivered
      if (metric.key === 'earlyPct')  return lifetime.invoiceBeforeDay15Pct
      if (metric.key === 'daysClose') return lifetime.avgDaysToClose
      return 0
    case 'streak': return consultant.streaks?.bestMonthlyStreak ?? 0
    case 'fire':   return consultant.fire?.best ?? 0
    case 'badges': return consultant.badges?.length ?? 0
    default: return 0
  }
}

export default function Compare() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const [params, setParams] = useSearchParams()

  const aId = params.get('a') || consultants[0]?.id
  const bId = params.get('b') || consultants[1]?.id

  const a = useMemo(() => consultants.find((c) => c.id === aId), [consultants, aId])
  const b = useMemo(() => consultants.find((c) => c.id === bId), [consultants, bId])

  const sortedMonths = useMemo(() => [...months].sort(), [months])
  const lifetimeA = useMemo(() => (a ? aggregate(a, sortedMonths) : null), [a, sortedMonths])
  const lifetimeB = useMemo(() => (b ? aggregate(b, sortedMonths) : null), [b, sortedMonths])

  const setSide = (side, id) => {
    const next = new URLSearchParams(params)
    next.set(side, id)
    setParams(next, { replace: true })
  }
  const swap = () => {
    if (!a || !b) return
    const next = new URLSearchParams(params)
    next.set('a', b.id); next.set('b', a.id)
    setParams(next, { replace: true })
  }

  if (!a || !b) {
    return (
      <div className="arena-card p-6 text-center text-arena-muted">
        Pick two consultants from the dropdowns to compare.
      </div>
    )
  }

  const rows = METRICS.map((m) => {
    const va = metricValue(a, m, lifetimeA)
    const vb = metricValue(b, m, lifetimeB)
    const aWins = m.betterWhenLower ? va < vb : va > vb
    const bWins = m.betterWhenLower ? vb < va : vb > va
    return { metric: m, va, vb, aWins, bWins, draw: !aWins && !bWins }
  })

  const aWinsCount = rows.filter((r) => r.aWins).length
  const bWinsCount = rows.filter((r) => r.bWins).length

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <GitCompare className="text-accent-blue" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-accent-blue">Compare</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Two consultants, side by side. Useful for 1:1s, calibration calls, and quick benchmarking.
        </p>
      </header>

      {/* Pickers + headline cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 items-stretch">
        <SidePicker consultants={consultants} value={a.id} onChange={(id) => setSide('a', id)} side="a" />
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={swap}
            title="Swap"
            className="h-10 w-10 grid place-items-center rounded-full bg-arena-surface border border-arena-border text-arena-muted hover:text-arena-ink hover:border-accent-blue/50"
          >
            ⇄
          </button>
          <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
            vs
          </div>
        </div>
        <SidePicker consultants={consultants} value={b.id} onChange={(id) => setSide('b', id)} side="b" flip />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-4 items-start">
        <CombatantCard consultant={a} wins={aWinsCount} total={rows.length} accent="#F75C03" />
        <div className="lg:flex hidden flex-col items-center pt-12">
          <div className="text-3xl font-display font-black text-arena-muted">vs</div>
        </div>
        <CombatantCard consultant={b} wins={bWinsCount} total={rows.length} accent="#1cb0f6" flip />
      </div>

      {/* Metric grid */}
      <section className="arena-card p-5">
        <header className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-black text-arena-ink">Side-by-side metrics</h2>
          <span className="ml-auto text-[11px] text-arena-muted">
            <span className="font-display font-bold text-arena-ink">{aWinsCount}</span>
            <span> – </span>
            <span className="font-display font-bold text-arena-ink">{bWinsCount}</span>
            <span> · {rows.length - aWinsCount - bWinsCount} draws</span>
          </span>
        </header>
        <ul className="divide-y divide-arena-border">
          {rows.map(({ metric, va, vb, aWins, bWins }, i) => {
            const total = (va + vb) || 1
            const aShare = metric.betterWhenLower
              // For "lower is better", flip the visual share so the leader fills more.
              ? Math.max(0.05, Math.min(0.95, vb / total))
              : Math.max(0.05, Math.min(0.95, va / total))
            return (
              <motion.li
                key={metric.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className="py-3 grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
              >
                <div className={['text-right font-display font-black', aWins ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
                  {fmt(metric.key, va)}
                </div>
                <div className="min-w-[180px] md:min-w-[260px]">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold text-center mb-1">
                    {metric.label}
                  </div>
                  <div className="h-2 rounded-full bg-arena-surface2 overflow-hidden flex">
                    <div className="h-full" style={{ width: `${aShare * 100}%`, background: aWins ? '#F75C03' : '#7c7c92' }} />
                    <div className="h-full" style={{ width: `${(1 - aShare) * 100}%`, background: bWins ? '#1cb0f6' : '#7c7c92' }} />
                  </div>
                  {(aWins || bWins) && (
                    <div className="mt-1 text-[10px] text-arena-muted text-center">
                      {aWins ? a.name.split(' ')[0] : b.name.split(' ')[0]} ahead
                    </div>
                  )}
                </div>
                <div className={['font-display font-black', bWins ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
                  {fmt(metric.key, vb)}
                </div>
              </motion.li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function SidePicker({ consultants, value, onChange, flip = false }) {
  return (
    <label className={['inline-flex items-center gap-2', flip ? 'lg:justify-end' : ''].join(' ')}>
      <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        {flip ? 'B' : 'A'}
      </span>
      <span className="relative flex-1 lg:flex-none">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-arena-surface border border-arena-border rounded-full pl-4 pr-9 py-2 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
        >
          {consultants.map((c) => (
            <option key={c.id} value={c.id} className="bg-arena-surface">{c.name} · {c.role}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
      </span>
    </label>
  )
}

function CombatantCard({ consultant, wins, total, accent, flip = false }) {
  const dominating = wins > total / 2
  return (
    <motion.div layout className={['arena-card p-5', dominating ? 'ring-2' : ''].join(' ')} style={dominating ? { boxShadow: `0 0 28px ${accent}33`, borderColor: `${accent}66` } : {}}>
      <div className={['flex items-center gap-3', flip ? 'flex-row-reverse text-right' : ''].join(' ')}>
        <span
          className="h-14 w-14 rounded-2xl grid place-items-center font-display font-black text-arena-bg text-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, #ffc800)`, boxShadow: `0 0 20px ${accent}33` }}
        >
          {initials(consultant.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-black text-arena-ink text-lg leading-tight truncate">{consultant.name}</div>
          <div className={['mt-1 flex items-center gap-2', flip ? 'justify-end' : ''].join(' ')}>
            <span className="text-xs text-arena-muted">{consultant.role}</span>
            <LocationPill location={consultant.location} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2 justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          Wins
        </span>
        <span className="font-display font-black text-3xl" style={{ color: accent }}>
          {wins}<span className="text-arena-muted text-lg"> / {total}</span>
        </span>
      </div>
    </motion.div>
  )
}

// Re-export for type-checking referenced lucide icons that aren't used elsewhere.
export { ArrowUp, ArrowDown, Minus }
