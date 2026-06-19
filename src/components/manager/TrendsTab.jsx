import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Activity, CheckCircle2, ArrowRight, Send,
  Lightbulb, ChevronDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useArenaStore } from '../../store/useArenaStore.js'
import { managerTrendsForTeam, coachingInsights } from '../../utils/coachingInsights.js'

const SEGMENT_META = {
  improving: { icon: TrendingUp,   color: 'text-accent-green',  tint: 'bg-accent-green/10', ring: 'ring-accent-green/30',  label: 'Improving' },
  steady:    { icon: CheckCircle2, color: 'text-accent-amber',  tint: 'bg-accent-amber/10', ring: 'ring-accent-amber/30',  label: 'Steady'    },
  spiky:     { icon: Activity,     color: 'text-arena-amber',   tint: 'bg-arena-amber/10',  ring: 'ring-arena-amber/30',   label: 'Spiky'     },
  sliding:   { icon: TrendingDown, color: 'text-accent-coral',  tint: 'bg-accent-coral/10', ring: 'ring-accent-coral/30',  label: 'Sliding'   },
}

export default function TrendsTab({ scope }) {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const sortedMonths = useMemo(() => [...months].sort(), [months])
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)
  const navigate = useNavigate()
  const broadcast = useArenaStore((s) => s.broadcastToTeams)

  const trends = useMemo(
    () => managerTrendsForTeam(consultants, sortedMonths, scope),
    [consultants, sortedMonths, scope],
  )

  const [filter, setFilter] = useState('all') // all | improving | spiky | sliding | steady

  const rowsByFilter = {
    all:       trends.rows,
    improving: trends.improving,
    spiky:     trends.spiky,
    sliding:   trends.sliding,
    steady:    trends.steady,
  }
  const rows = (rowsByFilter[filter] ?? trends.rows).slice().sort((a, b) => a.consultant.name.localeCompare(b.consultant.name))

  const openProfile = (id) => { setCurrentUserId(id); navigate('/profile') }

  return (
    <div className="space-y-6">
      {/* Headline rollup */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SegmentCard
          k="improving"
          count={trends.improving.length}
          onClick={() => setFilter(filter === 'improving' ? 'all' : 'improving')}
          active={filter === 'improving'}
        />
        <SegmentCard
          k="steady"
          count={trends.steady.length}
          onClick={() => setFilter(filter === 'steady' ? 'all' : 'steady')}
          active={filter === 'steady'}
        />
        <SegmentCard
          k="spiky"
          count={trends.spiky.length}
          onClick={() => setFilter(filter === 'spiky' ? 'all' : 'spiky')}
          active={filter === 'spiky'}
        />
        <SegmentCard
          k="sliding"
          count={trends.sliding.length}
          onClick={() => setFilter(filter === 'sliding' ? 'all' : 'sliding')}
          active={filter === 'sliding'}
        />
      </div>

      {/* Filter chip header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-arena-ink text-lg">
          {filter === 'all' ? `All ${rows.length} consultants` : `${rows.length} ${SEGMENT_META[filter].label.toLowerCase()}`}
        </h2>
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} className="text-xs text-arena-muted hover:text-arena-ink font-display font-bold">
            Clear filter
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rows.map((r, i) => (
          <TrendRow key={r.consultant.id} row={r} i={i} onOpen={openProfile} onNudge={broadcast} />
        ))}
      </div>
    </div>
  )
}

function SegmentCard({ k, count, onClick, active }) {
  const meta = SEGMENT_META[k]
  const Icon = meta.icon
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={[
        'text-left arena-card p-4 ring-1 ring-inset transition-all',
        active ? meta.ring : 'ring-arena-border',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span className={['h-9 w-9 rounded-xl grid place-items-center', meta.tint, meta.color].join(' ')}>
          <Icon size={16} strokeWidth={2.6} />
        </span>
        <ChevronDown size={14} className={['text-arena-muted transition-transform', active ? 'rotate-180' : ''].join(' ')} />
      </div>
      <div className="mt-3 font-display font-black text-arena-ink text-3xl">{count}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-display font-bold text-arena-muted mt-0.5">
        {meta.label}
      </div>
    </motion.button>
  )
}

function TrendRow({ row, i, onOpen, onNudge }) {
  const meta = SEGMENT_META[row.momentum]
  const Icon = meta.icon
  const c = row.consultant
  const initials = c.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const nudgeCopy = nudgeFor(row)
  const handleNudge = (e) => {
    e.stopPropagation()
    onNudge?.({
      type: 'manager_nudge',
      title: `Coaching nudge for ${c.name}`,
      text: nudgeCopy,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      onClick={() => onOpen(c.id)}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c.id) } }}
      className={['arena-card p-4 ring-1 ring-inset cursor-pointer hover:-translate-y-0.5 transition-transform', meta.ring].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className="h-11 w-11 rounded-xl grid place-items-center font-display font-black text-arena-bg text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display font-black text-arena-ink truncate">{c.name}</div>
            <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-bold', meta.tint, meta.color].join(' ')}>
              <Icon size={10} strokeWidth={3} /> {meta.label}
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold mt-0.5">
            {c.role} · {c.location}
          </div>
        </div>
        <ArrowRight size={16} className="text-arena-muted shrink-0 mt-1" />
      </div>

      {/* Metrics strip */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <Mini label="Ops/mo"   value={`${row.facts.avgOps.toFixed(1)}`} delta={row.slopeOps} />
        <Mini label="Front %"  value={`${Math.round(row.avgFront)}%`}   delta={row.facts.slopeFront} />
        <Mini label="Days"     value={`${row.avgClose.toFixed(1)}d`}    delta={-row.facts.slopeClose} />
        <Mini label="Fire"     value={`${row.currentStreak}d`} />
      </div>

      {/* Top strength + top risk */}
      <div className="mt-3 space-y-1.5 text-xs">
        {row.topStrength && (
          <div className="flex items-start gap-1.5">
            <span className="text-accent-green mt-0.5">✓</span>
            <span className="text-arena-muted"><b className="text-arena-ink">{row.topStrength.title}.</b> {row.topStrength.detail}</span>
          </div>
        )}
        {row.topRisk && (
          <div className="flex items-start gap-1.5">
            <span className="text-accent-coral mt-0.5">!</span>
            <span className="text-arena-muted"><b className="text-arena-ink">{row.topRisk.title}.</b> {row.topRisk.detail}</span>
          </div>
        )}
      </div>

      {/* Coaching nudge */}
      <div className="mt-3 rounded-xl bg-arena-bg/40 border border-arena-border p-3 flex items-start gap-2">
        <Lightbulb size={14} className="text-arena-amber mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 text-xs text-arena-muted leading-relaxed">{nudgeCopy}</div>
        <button
          onClick={handleNudge}
          title="Send this nudge to the consultant via Teams"
          className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-green/15 text-accent-green text-[10px] font-display font-bold hover:bg-accent-green/25"
        >
          <Send size={10} strokeWidth={3} /> Nudge
        </button>
      </div>
    </motion.div>
  )
}

function Mini({ label, value, delta }) {
  const arrow = delta == null
    ? null
    : delta > 0.04
      ? <TrendingUp size={9} className="text-accent-green" strokeWidth={3} />
      : delta < -0.04
        ? <TrendingDown size={9} className="text-accent-coral" strokeWidth={3} />
        : null
  return (
    <div className="rounded-lg bg-arena-bg/40 border border-arena-border py-2">
      <div className="text-[9px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{label}</div>
      <div className="mt-0.5 inline-flex items-center gap-1 font-display font-black text-arena-ink text-sm">
        {value} {arrow}
      </div>
    </div>
  )
}

function nudgeFor(row) {
  if (row.momentum === 'improving') {
    return `Send a "keep it up" — ${row.consultant.name.split(' ')[0]}'s ops are climbing ${Math.round(row.slopeOps * 100)}% per month. ` +
      `A public shout-out compounds the streak.`
  }
  if (row.momentum === 'sliding') {
    return `Schedule a 15-minute check-in. Ops sliding ${Math.round(Math.abs(row.slopeOps) * 100)}% per month — ` +
      `usually a pipeline or workload signal worth a chat before next cycle.`
  }
  if (row.momentum === 'spiky') {
    return `Cadence is volatile (CV ${row.cvOps.toFixed(2)}). Suggest a weekly Friday close-out — ` +
      `smooths the month and unlocks the Consistent Cadence ladder.`
  }
  return `Steady performer. Pick the next badge ladder together — Mythic tiers are within reach if pace holds.`
}
