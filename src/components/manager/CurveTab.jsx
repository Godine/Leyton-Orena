import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useArenaStore } from '../../store/useArenaStore.js'
import { managerTrendsForTeam } from '../../utils/coachingInsights.js'
import { formatCurrencyCompact } from '../../utils/formatters.js'

export default function CurveTab({ scope }) {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const sortedMonths = useMemo(() => [...months].sort(), [months])
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)
  const navigate = useNavigate()

  const trends = useMemo(
    () => managerTrendsForTeam(consultants, sortedMonths, scope),
    [consultants, sortedMonths, scope],
  )

  const openProfile = (id) => { setCurrentUserId(id); navigate('/profile') }

  return (
    <div className="space-y-6">
      <DiagnosisCard trends={trends} />

      <CurveChart trends={trends} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BackLoadContributors rows={trends.backLoadContrib} onOpen={openProfile} />
        <OfficeBreakdown rows={trends.officeRows} />
      </div>

      <Footnote />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function DiagnosisCard({ trends }) {
  const avgFront = trends.curve.length
    ? trends.curve.reduce((a, b) => a + b.front, 0) / trends.curve.length
    : 0
  const avgBackLoaded = Math.round(100 - avgFront)
  const qPos = trends.quarterUplift > 0 ? `+${trends.quarterUplift}%` : `${trends.quarterUplift}%`
  return (
    <div className="arena-card p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-arena-amber/15 grid place-items-center text-arena-amber shrink-0">
          <Lightbulb size={24} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-arena-muted font-display font-bold">
            The curve · diagnosis
          </div>
          <h2 className="mt-1 font-display font-black text-arena-ink text-2xl leading-tight">
            ~{avgBackLoaded}% of value ships after day 15. Quarter-end runs {qPos} above other months.
          </h2>
          <p className="mt-2 text-sm text-arena-muted leading-relaxed">
            This is the spike. It's driven by a handful of consultants pushing claims into the second half of the month and a culture that
            accelerates around quarter close. The list below shows who's contributing most to the back-loaded share — start coaching there.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function CurveChart({ trends }) {
  const max = Math.max(...trends.curve.map((c) => c.inv), 1)
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-black text-arena-ink text-lg">Monthly invoice trend</h2>
        <span className="text-xs text-arena-muted">Bars = invoice value · golden = quarter-end · line = early-invoice %</span>
      </div>
      <div className="arena-card p-4 md:p-5">
        <div className="relative h-[260px]">
          <div className="absolute inset-x-0 bottom-7 top-0 flex items-end gap-3">
            {trends.curve.map((c, i) => {
              const h = (c.inv / max) * 100
              return (
                <div key={c.month} className="flex-1 flex flex-col items-center justify-end relative group">
                  {c.quarterEnd && (
                    <span className="absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-display font-black uppercase tracking-wider text-arena-bg bg-accent-amber">
                      Q-end
                    </span>
                  )}
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.06, duration: 0.8, ease: 'easeOut' }}
                    className="w-full rounded-t-md"
                    style={{
                      background: c.quarterEnd
                        ? 'linear-gradient(180deg, #ffc800, #F75C03)'
                        : 'linear-gradient(180deg, #F75C03cc, #F75C03)',
                      boxShadow: c.quarterEnd ? '0 0 20px rgba(255,200,0,0.45)' : 'none',
                      minHeight: 4,
                    }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute top-2 px-2 py-0.5 rounded text-[10px] font-display font-bold whitespace-nowrap bg-arena-ink text-arena-bg">
                    {formatCurrencyCompact(c.inv)} · {Math.round(c.front)}% early
                  </div>
                </div>
              )
            })}
          </div>

          <svg className="absolute inset-x-0 bottom-7 top-0 pointer-events-none w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline
              fill="none" stroke="#2DD4BF" strokeWidth="1.5" vectorEffect="non-scaling-stroke"
              points={trends.curve.map((c, i) => {
                const x = ((i + 0.5) / trends.curve.length) * 100
                const y = 100 - c.front
                return `${x},${y}`
              }).join(' ')}
            />
            {trends.curve.map((c, i) => {
              const x = ((i + 0.5) / trends.curve.length) * 100
              const y = 100 - c.front
              return <circle key={c.month} cx={x} cy={y} r="1.2" fill="#2DD4BF" vectorEffect="non-scaling-stroke" />
            })}
          </svg>
        </div>
        <div className="mt-2 flex gap-3 text-[10px] font-display font-bold uppercase tracking-wider text-arena-muted">
          {trends.curve.map((c) => (
            <div key={c.month} className="flex-1 text-center">{labelMonth(c.month)}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

function labelMonth(iso) {
  const [, m] = iso.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m) - 1]
}

// ─────────────────────────────────────────────────────────────────────────────
function BackLoadContributors({ rows, onOpen }) {
  if (!rows.length) return null
  const max = rows[0].backValue
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-accent-coral" /> Top back-loaded contributors
      </h2>
      <div className="arena-card p-4 space-y-2">
        {rows.map((r, i) => {
          const initials = r.consultant.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
          const w = Math.max(8, (r.backValue / max) * 100)
          return (
            <motion.button
              key={r.consultant.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onOpen(r.consultant.id)}
              className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-arena-surface2/60 transition-colors"
            >
              <span
                className="h-9 w-9 rounded-lg grid place-items-center font-display font-black text-arena-bg text-xs shrink-0"
                style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-display font-black text-arena-ink truncate text-sm">{r.consultant.name}</div>
                  <div className="text-xs font-display font-bold text-arena-muted">{formatCurrencyCompact(r.backValue)} after day 15</div>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-arena-bg/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.9 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#ff4b4b,#F75C03)' }}
                  />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
                  Front-load: {Math.round(r.frontPct)}% · {r.consultant.location}
                </div>
              </div>
              <ArrowRight size={14} className="text-arena-muted shrink-0" />
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function OfficeBreakdown({ rows }) {
  if (!rows.length) return null
  const max = Math.max(...rows.map((r) => r.inv), 1)
  return (
    <section>
      <h2 className="font-display font-black text-arena-ink text-lg mb-3 flex items-center gap-2">
        <MapPin size={18} className="text-accent-green" /> By office
      </h2>
      <div className="arena-card p-4 space-y-3">
        {rows.map((r, i) => {
          const w = (r.inv / max) * 100
          return (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-display font-black text-arena-ink">{r.name}</span>
                <span className="text-xs text-arena-muted">
                  {r.headcount} · {formatCurrencyCompact(r.inv)} · {Math.round(r.avgFront)}% early
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-arena-bg/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 0.9 }}
                  className="h-full rounded-full"
                  style={{
                    background: r.avgFront >= 65
                      ? 'linear-gradient(90deg,#2DD4BF,#1cb0f6)'
                      : r.avgFront >= 50
                        ? 'linear-gradient(90deg,#ffc800,#F75C03)'
                        : 'linear-gradient(90deg,#F75C03,#ff4b4b)',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function Footnote() {
  return (
    <p className="text-xs text-arena-muted">
      Curve diagnosis is heuristic and uses monthly aggregates. Daily granularity will sharpen the
      attribution once it lands.
    </p>
  )
}
