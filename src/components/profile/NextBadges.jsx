import { motion } from 'framer-motion'
import { Target, ChevronRight } from 'lucide-react'
import { badgeProgress } from '../../utils/badgeEligibility.js'

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800', mythic: '#2DD4BF',
}

// Top N badges the consultant is closest to unlocking, ranked by ratio.
function topClosest(consultant, allBadges, n = 3) {
  const earned = new Set(consultant.badges)
  return allBadges
    .filter((b) => !earned.has(b.id))
    .map((b) => ({ badge: b, progress: badgeProgress(consultant, b.id) }))
    .filter((c) => c.progress && c.progress.ratio > 0)
    .sort((a, b) => b.progress.ratio - a.progress.ratio)
    .slice(0, n)
}

export default function NextBadges({ consultant, allBadges, onOpenBadge }) {
  const next = topClosest(consultant, allBadges, 3)
  if (!next.length) return null

  return (
    <div className="arena-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={18} className="text-accent-blue" />
        <h3 className="font-display font-black text-arena-ink">Up next</h3>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          closest to unlock
        </span>
      </div>
      <ul className="space-y-2.5">
        {next.map(({ badge, progress }, i) => {
          const hex = RARITY_HEX[badge.rarity]
          const pct = Math.round(progress.ratio * 100)
          return (
            <li key={badge.id}>
              <button
                onClick={() => onOpenBadge?.(badge)}
                className="w-full text-left rounded-xl p-3 bg-arena-bg/40 border border-arena-border hover:border-arena-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-9 w-9 rounded-xl grid place-items-center text-lg shrink-0"
                    style={{ background: `${hex}1f`, boxShadow: `inset 0 0 0 1px ${hex}55` }}
                  >
                    {badge.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm text-arena-ink truncate">{badge.name}</div>
                    <div className="text-[10px] text-arena-muted truncate">
                      {progress.value}{progress.unit ? ` ${progress.unit}` : ''}
                      {' · target '}
                      {progress.target}{progress.unit ? ` ${progress.unit}` : ''}
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-display font-black shrink-0"
                    style={{ color: hex }}
                  >
                    {pct}%
                  </span>
                  <ChevronRight size={14} className="text-arena-muted shrink-0 group-hover:text-arena-ink" />
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.1 + 0.06 * i, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: hex, boxShadow: `0 0 8px ${hex}66` }}
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
