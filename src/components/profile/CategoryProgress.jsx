import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { BADGE_CATEGORIES, BADGES_BY_CATEGORY } from '../../data/badges.js'

// Per-category badge progress. Shows a row per category with the icon, label,
// earned/total count, and a coloured progress bar.
export default function CategoryProgress({ earnedIds = [] }) {
  const earned = new Set(earnedIds)
  const rows = BADGE_CATEGORIES.map((cat) => {
    const all = BADGES_BY_CATEGORY[cat.id] ?? []
    const earnedCount = all.filter((b) => earned.has(b.id)).length
    return { ...cat, earned: earnedCount, total: all.length, ratio: all.length ? earnedCount / all.length : 0 }
  }).sort((a, b) => b.ratio - a.ratio)

  const totalEarned = rows.reduce((a, r) => a + r.earned, 0)
  const totalAvailable = rows.reduce((a, r) => a + r.total, 0)

  return (
    <div className="arena-card p-5">
      <header className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-accent-purple" />
        <h3 className="font-display font-black text-arena-ink">Badge progress by category</h3>
        <span className="ml-auto text-xs text-arena-muted">
          <span className="font-display font-bold text-arena-ink">{totalEarned}</span> / {totalAvailable}
        </span>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {rows.map((cat, i) => (
          <li key={cat.id} className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base shrink-0">{cat.icon}</span>
              <span className="font-display font-bold text-arena-ink truncate flex-1">{cat.label}</span>
              <span className="text-[11px] text-arena-muted shrink-0">
                <span className="font-display font-bold text-arena-ink">{cat.earned}</span>
                <span> / {cat.total}</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.ratio * 100}%` }}
                transition={{ delay: 0.05 * i, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: cat.accent, boxShadow: `0 0 8px ${cat.accent}55` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
