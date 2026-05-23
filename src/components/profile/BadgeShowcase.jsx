import { ChevronRight, Lock } from 'lucide-react'

const RARITY_HEX = { common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800' }

export default function BadgeShowcase({ earnedBadges, nextBadge, onOpenBadge }) {
  return (
    <div className="arena-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-black text-arena-ink">Badges</h3>
        <span className="text-xs text-arena-muted">{earnedBadges.length} earned</span>
      </div>

      {earnedBadges.length === 0 ? (
        <p className="text-sm text-arena-muted">No badges yet — your first one is waiting.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {earnedBadges.map((b) => {
            const hex = RARITY_HEX[b.rarity]
            return (
              <li key={b.id}>
                <button
                  onClick={() => onOpenBadge?.(b)}
                  title={b.name}
                  className="h-12 w-12 rounded-2xl grid place-items-center text-2xl border transition-transform hover:scale-110"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${hex}33, transparent 70%)`,
                    borderColor: `${hex}66`,
                    boxShadow: `0 0 14px ${hex}33`,
                  }}
                >
                  {b.icon}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {nextBadge && (
        <button
          onClick={() => onOpenBadge?.(nextBadge.badge)}
          className="mt-5 w-full text-left rounded-xl p-3 bg-arena-bg/60 border border-arena-border hover:border-accent-amber/50 transition-colors group"
        >
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
            <Lock size={12} /> Next badge to unlock
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-2xl">{nextBadge.badge.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-display font-black text-arena-ink truncate">{nextBadge.badge.name}</div>
              <div className="mt-1 h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
                <div className="h-full rounded-full bg-accent-amber" style={{ width: `${Math.round(nextBadge.progress.ratio * 100)}%` }} />
              </div>
            </div>
            <ChevronRight size={16} className="text-arena-muted group-hover:text-arena-ink" />
          </div>
        </button>
      )}
    </div>
  )
}
