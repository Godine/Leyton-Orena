import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus, Trophy, Target } from 'lucide-react'
import { formatCurrencyCompact } from '../../utils/formatters.js'

function formatPrimary(key, v) {
  if (key === 'invoiceValue')          return formatCurrencyCompact(v)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(v)}%`
  if (key === 'avgDaysToClose')        return `${(v ?? 0).toFixed(1)}d`
  return Math.round(v).toLocaleString('en-GB')
}

function formatGap(key, diff) {
  if (diff === 0) return 'tied'
  const abs = Math.abs(diff)
  if (key === 'invoiceValue')          return formatCurrencyCompact(abs)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(abs)} pp`
  if (key === 'avgDaysToClose')        return `${abs.toFixed(1)} days`
  return `${Math.round(abs)}`
}

// Always-visible card pinned to the top of the leaderboard. Reads the current
// user's row out of the filtered rows array and shows position, value, gap to
// #1, gap to the next person to overtake, and the position delta vs the
// previous comparable period.
export default function YourPositionCard({ rows, currentUserId, sortKey, positionChange = 0, totalInRole }) {
  const me = rows.find((r) => r.consultant.id === currentUserId)
  if (!me) {
    return (
      <div className="arena-card p-4 md:p-5 flex items-center gap-3">
        <Target size={20} className="text-arena-muted" />
        <div className="text-sm text-arena-muted">
          You're outside the current filter. Switch the role view or location to see your rank.
        </div>
      </div>
    )
  }

  const leader = rows[0]
  const next = rows[me.rank - 2] // rank is 1-based; the person directly above
  const below = rows[me.rank]    // the person directly below
  const myVal = me.metrics[sortKey] ?? 0
  const leaderVal = leader.metrics[sortKey] ?? 0
  const nextVal = next?.metrics[sortKey] ?? null
  const belowVal = below?.metrics[sortKey] ?? null

  const isFirst = me.rank === 1
  const TrendIcon = positionChange > 0 ? ArrowUp : positionChange < 0 ? ArrowDown : Minus
  const trendColor = positionChange > 0 ? 'text-accent-green' : positionChange < 0 ? 'text-accent-coral' : 'text-arena-muted'
  const trendLabel = positionChange > 0
    ? `+${positionChange} since last period`
    : positionChange < 0
      ? `${positionChange} since last period`
      : 'no change vs last period'

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="arena-card p-5 md:p-6 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 0% 0%, rgba(247,92,3,0.18), transparent 55%), linear-gradient(180deg, rgb(var(--arena-surface-rgb)), rgb(var(--arena-bg-rgb)))',
        boxShadow: '0 0 28px rgba(247,92,3,0.15)',
      }}
    >
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        {/* Rank tile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-16 w-16 rounded-2xl grid place-items-center"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(247,92,3,0.4), transparent 70%)', boxShadow: 'inset 0 0 0 1px rgba(247,92,3,0.4)' }}
          >
            <span className="font-display font-black text-arena-ink text-3xl leading-none">
              #{me.rank}
            </span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
              Your position
            </div>
            <div className="font-display font-black text-arena-ink text-lg leading-tight">
              {me.consultant.name.split(' ')[0]} · {formatPrimary(sortKey, myVal)}
            </div>
            <div className="text-[11px] text-arena-muted">
              of {totalInRole} {me.consultant.role.toLowerCase()} consultants
            </div>
          </div>
        </div>

        {/* Trend chip */}
        <div className={['inline-flex items-center gap-2 px-3 py-2 rounded-full bg-arena-bg/60 border border-arena-border shrink-0', trendColor].join(' ')}>
          <TrendIcon size={14} strokeWidth={2.8} />
          <span className="text-xs font-display font-bold">{trendLabel}</span>
        </div>

        {/* Gap context */}
        <div className="flex-1 min-w-[220px] grid grid-cols-2 gap-3">
          {isFirst ? (
            <Cell
              label="Cushion to #2"
              value={formatGap(sortKey, leaderVal - (below?.metrics[sortKey] ?? leaderVal))}
              accent="#58cc02"
              icon={Trophy}
              tagline={below ? `${below.consultant.name.split(' ')[0]} is chasing` : 'You\'re alone at the top'}
            />
          ) : (
            <Cell
              label={`Gap to #1`}
              value={formatGap(sortKey, leaderVal - myVal)}
              accent="#ffc800"
              tagline={`${leader.consultant.name.split(' ')[0]} leads`}
            />
          )}
          {next && (
            <Cell
              label={`To overtake #${me.rank - 1}`}
              value={formatGap(sortKey, nextVal - myVal)}
              accent="#F75C03"
              tagline={`${next.consultant.name.split(' ')[0]} is one ahead`}
            />
          )}
          {!next && !isFirst && belowVal != null && (
            <Cell
              label={`Buffer to #${me.rank + 1}`}
              value={formatGap(sortKey, myVal - belowVal)}
              accent="#58cc02"
              tagline={`${below.consultant.name.split(' ')[0]} is chasing`}
            />
          )}
        </div>
      </div>
    </motion.section>
  )
}

function Cell({ label, value, accent, tagline, icon: Icon }) {
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
        {Icon && <Icon size={11} style={{ color: accent }} />}
        {label}
      </div>
      <div className="mt-1 font-display font-black text-xl" style={{ color: accent }}>
        {value}
      </div>
      {tagline && <div className="text-[11px] text-arena-muted mt-0.5 truncate">{tagline}</div>}
    </div>
  )
}
