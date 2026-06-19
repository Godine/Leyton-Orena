import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, Gauge, TrendingUp, TrendingDown, CheckCircle2, Flame, Shield,
  Calendar, Clock, Activity, RotateCw, FlameKindling, Sparkles,
  Award, ArrowUpRight, AlertTriangle, Lightbulb, Target,
  ArrowRightFromLine, ArrowLeftFromLine, AlarmClockOff,
} from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { coachingInsights } from '../../utils/coachingInsights.js'
import { formatCurrencyCompact } from '../../utils/formatters.js'

const ICONS = {
  zap: Zap,
  gauge: Gauge,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'check-circle': CheckCircle2,
  flame: Flame,
  shield: Shield,
  calendar: Calendar,
  clock: Clock,
  wave: Activity,
  redo: RotateCw,
  'flame-off': FlameKindling,
  sparkles: Sparkles,
  target: Target,
  push: ArrowRightFromLine,
  'pull-forward': ArrowLeftFromLine,
  'push-late': AlarmClockOff,
}

const MOMENTUM_STYLES = {
  improving: { label: 'Improving', dot: 'bg-accent-green', text: 'text-accent-green', tint: 'bg-accent-green/10' },
  steady:    { label: 'Steady',    dot: 'bg-accent-amber', text: 'text-accent-amber', tint: 'bg-accent-amber/10' },
  spiky:     { label: 'Spiky',     dot: 'bg-arena-amber',  text: 'text-arena-amber',  tint: 'bg-arena-amber/10' },
  sliding:   { label: 'Sliding',   dot: 'bg-accent-coral', text: 'text-accent-coral', tint: 'bg-accent-coral/10' },
}

const GRADE_TINT = { A: 'text-accent-green', B: 'text-accent-amber', C: 'text-arena-amber', D: 'text-accent-coral' }
const PRIO_STYLE = {
  high:   { label: 'High impact',   text: 'text-accent-coral', tint: 'bg-accent-coral/10', ring: 'ring-accent-coral/30' },
  medium: { label: 'Medium impact', text: 'text-accent-amber', tint: 'bg-accent-amber/10', ring: 'ring-accent-amber/30' },
  low:    { label: 'Nice to have',  text: 'text-arena-muted',  tint: 'bg-arena-surface2',  ring: 'ring-arena-border' },
}

export default function CoachingTab({ consultant }) {
  const consultants = useArenaStore((s) => s.consultants)
  const months      = useArenaStore((s) => s.months)
  const sortedMonths = useMemo(() => [...months].sort(), [months])

  const insight = useMemo(
    () => coachingInsights(consultant, consultants, sortedMonths),
    [consultant, consultants, sortedMonths],
  )

  return (
    <div className="space-y-6 xl:space-y-8">
      <HeadlineCard insight={insight} />
      <RhythmCard insight={insight} />
      <PlanningDisciplineCard insight={insight} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        <StrengthsCard items={insight.strengths} />
        <WeaknessesCard items={insight.weaknesses} />
      </div>

      <RecommendationsCard recs={insight.recs} />

      <ProjectionCard projection={insight.projection} />

      <Footnote count={sortedMonths.length} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function HeadlineCard({ insight }) {
  const m = MOMENTUM_STYLES[insight.momentum]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="arena-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-arena-bg/60 border border-arena-border grid place-items-center">
          <Lightbulb className="text-arena-amber" size={28} strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-arena-muted font-display font-bold">
            Coaching summary · last {insight.rhythm.length} months
          </div>
          <div className="mt-1 font-display font-black text-arena-ink text-2xl md:text-3xl leading-tight">
            <span className={GRADE_TINT[insight.grade]}>{insight.grade}</span>
            {' · '}
            {insight.momentum === 'improving' ? "You're climbing"
              : insight.momentum === 'sliding' ? "Reverse the slide"
              : insight.momentum === 'spiky'   ? "Smooth the line"
              :                                   "Hold the line"}
          </div>
        </div>
      </div>
      <div className="md:ml-auto grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
        <Stat label="Momentum" value={
          <span className={['inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px]', m.tint, m.text].join(' ')}>
            <span className={['h-1.5 w-1.5 rounded-full', m.dot].join(' ')} /> {m.label}
          </span>
        } />
        <Stat label="Fire"      value={`${insight.facts.currentStreak}d`} />
        <Stat label="Avg early" value={`${Math.round(insight.facts.avgFront)}%`} />
        <Stat label="Days/close" value={`${insight.facts.avgClose.toFixed(1)}d`} />
      </div>
    </motion.div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        {label}
      </div>
      <div className="mt-1 font-display font-black text-arena-ink text-sm">{value}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function RhythmCard({ insight }) {
  const maxInv = Math.max(...insight.rhythm.map((r) => r.inv), 1)
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-black text-arena-ink text-lg">Your delivery rhythm</h2>
        <span className="text-xs text-arena-muted">Bar = invoice value · line = early-invoice %</span>
      </div>
      <div className="arena-card p-4 md:p-5">
        <div className="relative h-[200px]">
          {/* Bars */}
          <div className="absolute inset-x-0 bottom-6 top-0 flex items-end gap-3">
            {insight.rhythm.map((r, i) => {
              const h = (r.inv / maxInv) * 100
              return (
                <div key={r.month} className="flex-1 flex flex-col items-center justify-end relative group">
                  {r.quarterEnd && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-display font-black uppercase tracking-wider text-accent-coral">
                      Q-end
                    </span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeOut' }}
                    className="w-full rounded-t-md"
                    style={{
                      background: r.quarterEnd
                        ? 'linear-gradient(180deg, #ffc800, #F75C03)'
                        : 'linear-gradient(180deg, #F75C03cc, #F75C03)',
                      boxShadow: r.quarterEnd ? '0 0 18px rgba(247,92,3,0.4)' : 'none',
                      minHeight: 4,
                    }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-0.5 rounded text-[10px] font-display font-bold whitespace-nowrap bg-arena-ink text-arena-bg">
                    {formatCurrencyCompact(r.inv)} · front {Math.round(r.front)}%
                  </div>
                </div>
              )
            })}
          </div>

          {/* Front-load % polyline overlay */}
          <svg className="absolute inset-x-0 bottom-6 top-0 pointer-events-none w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline
              fill="none" stroke="#2DD4BF" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
              points={insight.rhythm.map((r, i) => {
                const x = ((i + 0.5) / insight.rhythm.length) * 100
                const y = 100 - r.front // front is 0-100
                return `${x},${y}`
              }).join(' ')}
            />
            {insight.rhythm.map((r, i) => {
              const x = ((i + 0.5) / insight.rhythm.length) * 100
              const y = 100 - r.front
              return <circle key={r.month} cx={x} cy={y} r="1.2" fill="#2DD4BF" vectorEffect="non-scaling-stroke" />
            })}
          </svg>
        </div>

        {/* X labels */}
        <div className="mt-2 flex gap-3 text-[10px] font-display font-bold uppercase tracking-wider text-arena-muted">
          {insight.rhythm.map((r) => (
            <div key={r.month} className="flex-1 text-center">{labelMonth(r.month)}</div>
          ))}
        </div>

        {/* Diagnosis */}
        <div className="mt-4 text-sm text-arena-muted leading-relaxed">
          <Lightbulb size={14} className="inline text-arena-amber mr-1.5 -mt-0.5" />
          {diagnosisCopy(insight)}
        </div>
      </div>
    </section>
  )
}

function diagnosisCopy(insight) {
  const f = insight.facts
  const bits = []
  if (f.avgFront < 50) {
    bits.push(`You ship most value after day 15 — that's the spike at month-end. Lifting early-% by 15 points changes the whole shape.`)
  } else if (f.avgFront >= 70) {
    bits.push(`You front-load cleanly. Cadence is healthy.`)
  }
  const qEndRhythm = insight.rhythm.filter((r) => r.quarterEnd)
  const others = insight.rhythm.filter((r) => !r.quarterEnd)
  if (qEndRhythm.length && others.length) {
    const qe = qEndRhythm.reduce((a, b) => a + b.inv, 0) / qEndRhythm.length
    const o = others.reduce((a, b) => a + b.inv, 0) / others.length
    if (qe > o * 1.15) bits.push(`Quarter-end months run ~${Math.round(((qe - o) / o) * 100)}% above the rest — you push to hit the quarter.`)
  }
  if (!bits.length) bits.push(`Cadence looks stable. Pick one tier-up to chase next month.`)
  return bits.join(' ')
}

function labelMonth(iso) {
  const [, m] = iso.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m) - 1]
}

// ─────────────────────────────────────────────────────────────────────────────
const PLANNING_TAGS = {
  reliable:           { label: 'Reliable forecaster', color: 'text-accent-green',  ring: 'ring-accent-green/30',  tint: 'bg-accent-green/10', icon: Target,           sub: 'Plan = reality. Finance trusts your numbers.' },
  puller:             { label: 'Pulls forward',       color: 'text-accent-amber',  ring: 'ring-accent-amber/30',  tint: 'bg-accent-amber/10', icon: ArrowLeftFromLine, sub: 'Plan accurate AND over-delivering by pulling.' },
  pusher:             { label: 'Pushes accounts',     color: 'text-accent-coral',  ring: 'ring-accent-coral/30',  tint: 'bg-accent-coral/10', icon: ArrowRightFromLine, sub: 'Committed work slips into later months too often.' },
  'last-week-pusher': { label: 'Last-week pusher',    color: 'text-arena-amber',   ring: 'ring-arena-amber/30',   tint: 'bg-arena-amber/10',  icon: AlarmClockOff,     sub: 'Pushes cluster in the final week — the worst pattern.' },
}

function PlanningDisciplineCard({ insight }) {
  const tag = PLANNING_TAGS[insight.planningTag] ?? PLANNING_TAGS.reliable
  const Icon = tag.icon
  const f = insight.facts
  const pushed = Math.round(f.avgPushed * insight.rhythm.length)
  const pulled = Math.round(f.avgPulled * insight.rhythm.length)
  const late = Math.round(f.avgLatePushed * insight.rhythm.length)
  const net = pulled - pushed
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-black text-arena-ink text-lg flex items-center gap-2">
          <Target size={18} className="text-arena-amber" /> Planning discipline
        </h2>
        <span className="text-xs text-arena-muted">Last {insight.rhythm.length} months</span>
      </div>
      <div className={['arena-card p-5 md:p-6 ring-1 ring-inset', tag.ring].join(' ')}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={['h-12 w-12 rounded-2xl grid place-items-center', tag.tint, tag.color].join(' ')}>
              <Icon size={22} strokeWidth={2.4} />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-arena-muted font-display font-bold">
                Forecast pattern
              </div>
              <div className={['font-display font-black text-2xl', tag.color].join(' ')}>
                {tag.label}
              </div>
              <div className="text-xs text-arena-muted mt-0.5">{tag.sub}</div>
            </div>
          </div>
          <div className="md:ml-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <PlanStat label="Planning acc." value={`${Math.round(f.planningAccuracy * 100)}%`} tint="text-arena-ink" />
            <PlanStat label="Pushed"        value={`${pushed}`} sub={`${Math.round(f.pushRate * 100)}% of plan`} tint="text-accent-coral" />
            <PlanStat label="Pulled fwd"    value={`${pulled}`} sub={`${Math.round(f.pullRate * 100)}% of plan`} tint="text-accent-amber" />
            <PlanStat label="Late-week"     value={`${late}`} sub={`${Math.round(f.latePushRate * 100)}% of pushes`} tint="text-arena-amber" />
          </div>
        </div>

        {/* Push vs Pull bar */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-2">
            Net movement · {net > 0 ? '+' : ''}{net} claims
          </div>
          <PushPullBar pushed={pushed} pulled={pulled} late={late} />
          <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-accent-amber" /> Pulled forward</span>
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-accent-coral" /> Pushed</span>
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-arena-amber" /> Last-week pushes</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-arena-muted leading-relaxed">
          {planningCopy(insight)}
        </p>
      </div>
    </section>
  )
}

function PlanStat({ label, value, sub, tint }) {
  return (
    <div className="rounded-xl bg-arena-bg/40 border border-arena-border p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">{label}</div>
      <div className={['mt-0.5 font-display font-black text-lg', tint].join(' ')}>{value}</div>
      {sub && <div className="text-[10px] text-arena-muted">{sub}</div>}
    </div>
  )
}

function PushPullBar({ pushed, pulled, late }) {
  const total = Math.max(pushed + pulled, 1)
  const pulledPct = (pulled / total) * 100
  const pushedPct = ((pushed - late) / total) * 100
  const latePct = (late / total) * 100
  return (
    <div className="h-3 rounded-full overflow-hidden flex bg-arena-bg/40 border border-arena-border">
      {pulled > 0 && (
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pulledPct}%` }} transition={{ duration: 0.9 }}
          className="h-full bg-accent-amber"
          title={`Pulled forward: ${pulled}`}
        />
      )}
      {pushed - late > 0 && (
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pushedPct}%` }} transition={{ duration: 0.9 }}
          className="h-full bg-accent-coral"
          title={`Pushed: ${pushed - late}`}
        />
      )}
      {late > 0 && (
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${latePct}%` }} transition={{ duration: 0.9 }}
          className="h-full bg-arena-amber"
          title={`Last-week pushes: ${late}`}
        />
      )}
    </div>
  )
}

function planningCopy(insight) {
  const f = insight.facts
  if (insight.planningTag === 'last-week-pusher') {
    return `Pushes cluster in the final week of the month — that's work you committed to, then quietly slipped. Surface risk on Tuesday, never on the 28th. Even one early flag a week shifts this tag.`
  }
  if (insight.planningTag === 'pusher') {
    return `${Math.round(f.pushRate * 100)}% of committed ops end up in a later month. Manager and finance can't plan around your forecast — and pushes feed the end-of-month spike. Tighten by reviewing the plan weekly.`
  }
  if (insight.planningTag === 'puller') {
    return `You're not just hitting plan — you're pulling forward from future months. That builds team buffer and absorbs crunch elsewhere. Keep going.`
  }
  return `Forecast accuracy is high. Pull one claim forward next month to unlock the over-delivery tier — you've got the runway.`
}

// ─────────────────────────────────────────────────────────────────────────────
function StrengthsCard({ items }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <Award size={18} className="text-accent-green" /> Strengths
      </h2>
      {items.length === 0 ? (
        <div className="arena-card p-5 text-sm text-arena-muted">No standout strengths yet — chase one this month.</div>
      ) : (
        <div className="space-y-3">
          {items.map((s, i) => {
            const Icon = ICONS[s.icon] ?? CheckCircle2
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="arena-card p-4 flex items-start gap-3 ring-1 ring-inset ring-accent-green/30"
              >
                <span className="h-10 w-10 rounded-xl bg-accent-green/15 grid place-items-center text-accent-green shrink-0">
                  <Icon size={18} strokeWidth={2.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-black text-arena-ink">{s.title}</div>
                    <span className="text-[10px] uppercase tracking-wider font-display font-bold px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green">
                      {s.confidence.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-arena-muted leading-relaxed">{s.detail}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function WeaknessesCard({ items }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-accent-coral" /> Levers to pull
      </h2>
      {items.length === 0 ? (
        <div className="arena-card p-5 text-sm text-arena-muted">No weaknesses surfaced — keep at it.</div>
      ) : (
        <div className="space-y-3">
          {items.map((w, i) => {
            const Icon = ICONS[w.icon] ?? AlertTriangle
            return (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="arena-card p-4 flex items-start gap-3 ring-1 ring-inset ring-accent-coral/30"
              >
                <span className="h-10 w-10 rounded-xl bg-accent-coral/15 grid place-items-center text-accent-coral shrink-0">
                  <Icon size={18} strokeWidth={2.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-black text-arena-ink">{w.title}</div>
                    <span className="text-[10px] uppercase tracking-wider font-display font-bold px-2 py-0.5 rounded-full bg-accent-coral/15 text-accent-coral">
                      {w.confidence.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-arena-muted leading-relaxed">{w.detail}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function RecommendationsCard({ recs }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <Target size={18} className="text-accent-amber" /> What to try next month
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recs.map((r, i) => {
          const Icon = ICONS[r.icon] ?? Lightbulb
          const tone = PRIO_STYLE[r.priority]
          return (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={['arena-card p-5 ring-1 ring-inset', tone.ring].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={['h-10 w-10 rounded-xl grid place-items-center', tone.tint, tone.text].join(' ')}>
                    <Icon size={18} strokeWidth={2.6} />
                  </span>
                  <div>
                    <div className="font-display font-black text-arena-ink leading-tight">{r.title}</div>
                    <div className={['text-[10px] uppercase tracking-[0.18em] font-display font-bold mt-0.5', tone.text].join(' ')}>
                      {tone.label}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-arena-muted shrink-0 mt-1" />
              </div>
              <p className="mt-3 text-sm text-arena-muted leading-relaxed">{r.body}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap text-[10px] font-display font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-full bg-arena-bg/60 border border-arena-border text-arena-muted">
                  {r.effort}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-arena-bg/60 border border-arena-border text-arena-muted">
                  {r.impact}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function ProjectionCard({ projection }) {
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-arena-amber" /> What would change
      </h2>
      <div className="arena-card p-5 md:p-6 ring-1 ring-inset ring-arena-amber/30">
        <div className="text-sm text-arena-muted leading-relaxed">
          Modelling the two biggest levers: cutting <b className="text-arena-ink">{projection.closeDelta} day{projection.closeDelta === '1.0' ? '' : 's'}</b> off avg days-to-close
          (from {(Number(projection.closeDelta) + Number(projection.newClose)).toFixed(1)}d → {projection.newClose}d), and lifting front-loading from{' '}
          <b className="text-arena-ink">{projection.currentFront}% → {projection.frontTarget}%</b>.
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ProjStat label="Extra ops / month"  value={`+${projection.liftOps}`}  tint="text-accent-green" />
          <ProjStat label="Extra invoiced"     value={`+£${projection.liftInvK}k`} tint="text-accent-green" />
          <ProjStat label="Cadence smoothness" value="↑ much smoother"          tint="text-arena-amber" />
        </div>
        <div className="mt-4 text-xs text-arena-muted">
          Estimate based on the last six months at your current pace. Treat as direction, not a forecast.
        </div>
      </div>
    </section>
  )
}

function ProjStat({ label, value, tint }) {
  return (
    <div className="rounded-2xl bg-arena-bg/40 border border-arena-border p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">{label}</div>
      <div className={['mt-1 font-display font-black text-xl', tint].join(' ')}>{value}</div>
    </div>
  )
}

function Footnote({ count }) {
  return (
    <p className="text-xs text-arena-muted">
      Insights are heuristic, computed over {count} months of mock data. As real history accumulates we'll
      promote the strongest rules into a learned model.
    </p>
  )
}
