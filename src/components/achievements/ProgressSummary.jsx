import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { RARITY_STYLES } from '../../data/badges.js'

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800',
}

export default function ProgressSummary({
  totalBadges,
  earnedBadges,
  rarityCounts,        // { common: n, rare: n, epic: n, legendary: n }
  nextClosest,         // { badge, progress } | null
  onOpenNext,
}) {
  const pct = totalBadges === 0 ? 0 : Math.round((earnedBadges.length / totalBadges) * 100)

  return (
    <div className="arena-card p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-3xl text-arena-ink">
              {earnedBadges.length}
            </span>
            <span className="font-display font-bold text-arena-muted">
              / {totalBadges} badges earned
            </span>
            <span className="ml-auto text-xs text-arena-muted">{pct}%</span>
          </div>

          {/* segmented progress */}
          <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalBadges}, minmax(0, 1fr))` }}>
            {Array.from({ length: totalBadges }).map((_, i) => {
              const filled = i < earnedBadges.length
              return (
                <motion.span
                  key={i}
                  initial={{ scaleY: 0.6, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: 0.02 * i, duration: 0.25 }}
                  className={[
                    'h-2.5 rounded-full origin-bottom',
                    filled ? 'bg-accent-green shadow-glow' : 'bg-arena-surface2',
                  ].join(' ')}
                />
              )
            })}
          </div>

          {/* rarity breakdown */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['common', 'rare', 'epic', 'legendary'].map((r) => (
              <span
                key={r}
                className="arena-chip"
                style={{
                  background: `${RARITY_HEX[r]}1a`,
                  color: RARITY_HEX[r],
                  boxShadow: `inset 0 0 0 1px ${RARITY_HEX[r]}55`,
                }}
              >
                {rarityCounts[r] ?? 0} {RARITY_STYLES[r].label}
              </span>
            ))}
          </div>
        </div>

        {/* next closest */}
        {nextClosest && (
          <button
            onClick={onOpenNext}
            className="md:w-72 text-left rounded-2xl p-4 bg-arena-bg/60 border border-arena-border hover:border-accent-amber/50 transition-colors group"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
              <Sparkles size={12} className="text-accent-amber" />
              Closest to unlock
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-3xl">{nextClosest.badge.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-black text-arena-ink truncate">
                  {nextClosest.badge.name}
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-amber"
                    style={{ width: `${Math.round(nextClosest.progress.ratio * 100)}%` }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-arena-muted">
                  {Math.round(nextClosest.progress.ratio * 100)}% there
                </div>
              </div>
              <ChevronRight size={16} className="text-arena-muted group-hover:text-arena-ink" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
