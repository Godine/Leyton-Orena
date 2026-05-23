import { motion } from 'framer-motion'
import { Briefcase, Banknote, Trophy, Flame, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import ProgressRing, { pickRingColor } from '../shared/ProgressRing.jsx'
import AnimatedCounter from '../shared/AnimatedCounter.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

export default function QuickStats({ stats }) {
  const cards = [
    {
      label: 'Ops Delivered',
      icon: Briefcase,
      value: stats.ops.value,
      ratio: stats.ops.ratio,
      format: (v) => Math.round(v).toLocaleString('en-GB'),
      sub: `target ${stats.ops.target}`,
    },
    {
      label: 'Invoice Value',
      icon: Banknote,
      value: stats.invoice.value,
      ratio: stats.invoice.ratio,
      format: formatCurrencyCompact,
      sub: `target ${formatCurrencyCompact(stats.invoice.target)}`,
    },
    {
      label: 'Leaderboard',
      icon: Trophy,
      rank: stats.rank,
      rankTotal: stats.rankTotal,
      delta: stats.rankDelta,
    },
    {
      label: 'Active Streak',
      icon: Flame,
      streak: stats.streak,
      best: stats.bestStreak,
    },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, type: 'spring', stiffness: 240, damping: 22 }}
          className="arena-card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-w-0"
        >
          {card.value != null && (
            <div className="shrink-0">
              <ProgressRing ratio={card.ratio} size={64} stroke={6} color={pickRingColor(card.ratio)}>
                <card.icon size={16} className="text-arena-ink" strokeWidth={2.4} />
              </ProgressRing>
            </div>
          )}
          {card.rank != null && (
            <div className="h-16 w-16 shrink-0 grid place-items-center rounded-2xl bg-arena-bg/60 border border-arena-border">
              <Trophy className="text-accent-amber" size={24} strokeWidth={2.4} />
            </div>
          )}
          {card.streak != null && (
            <div className="h-16 w-16 shrink-0 grid place-items-center rounded-2xl bg-arena-bg/60 border border-arena-border">
              <Flame
                className="text-accent-coral animate-flame"
                size={28}
                fill="currentColor"
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,75,75,0.55))' }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold truncate">
              {card.label}
            </div>
            {card.value != null && (
              <>
                <div className="font-display font-black text-arena-ink text-lg sm:text-xl truncate">
                  <AnimatedCounter value={card.value} format={card.format} />
                </div>
                <div className="text-[11px] text-arena-muted truncate">{card.sub}</div>
              </>
            )}
            {card.rank != null && (
              <>
                <div className="font-display font-black text-arena-ink text-lg sm:text-xl truncate">
                  #{card.rank}{' '}
                  <span className="text-arena-muted text-sm">/ {card.rankTotal}</span>
                </div>
                <RankDelta delta={card.delta} />
              </>
            )}
            {card.streak != null && (
              <>
                <div className="font-display font-black text-arena-ink text-lg sm:text-xl truncate">
                  {card.streak} mo
                </div>
                <div className="text-[11px] text-arena-muted truncate">best ever {card.best}</div>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function RankDelta({ delta }) {
  const Trend = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus
  const color = delta > 0 ? 'text-accent-green' : delta < 0 ? 'text-accent-coral' : 'text-arena-muted'
  const label = delta > 0
    ? `+${delta} since last month`
    : delta < 0
      ? `${delta} since last month`
      : 'unchanged'
  return (
    <div className={['inline-flex items-center gap-1 text-[11px] font-display font-bold', color].join(' ')}>
      <Trend size={12} strokeWidth={2.8} />
      {label}
    </div>
  )
}
