import { useMemo, useState } from 'react'
import { Award } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { RARITY_STYLES, BADGE_CATEGORIES, BADGES_BY_CATEGORY } from '../data/badges.js'
import { closestToUnlock } from '../utils/badgeEligibility.js'
import BadgeGrid from '../components/achievements/BadgeGrid.jsx'
import BadgeDetailModal from '../components/achievements/BadgeDetailModal.jsx'
import ProgressSummary from '../components/achievements/ProgressSummary.jsx'

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800', mythic: '#2DD4BF',
}
const RARITIES = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic']

export default function Achievements() {
  const allBadges = useArenaStore((s) => s.badges)
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const hasSeenUnlock = useArenaStore((s) => s.hasSeenUnlock)
  const markUnlockSeen = useArenaStore((s) => s.markUnlockSeen)

  const [rarityFilter, setRarityFilter] = useState('all')
  const [earnedOnly, setEarnedOnly] = useState(false)
  const [openBadge, setOpenBadge] = useState(null)

  const latestMonth = useMemo(() => [...months].sort().at(-1), [months])
  const earnedMap = currentUser.badgeEarnedAt ?? {}
  const earnedBadgeIds = useMemo(() => currentUser.badges ?? [], [currentUser])

  const filteredCategories = useMemo(() => {
    const matches = (b) => {
      if (rarityFilter !== 'all' && b.rarity !== rarityFilter) return false
      if (earnedOnly && !earnedMap[b.id]) return false
      return true
    }
    return BADGE_CATEGORIES
      .map((cat) => ({
        ...cat,
        badges: (BADGES_BY_CATEGORY[cat.id] ?? []).filter(matches),
        earnedCount: (BADGES_BY_CATEGORY[cat.id] ?? []).filter((b) => earnedMap[b.id]).length,
        totalCount: (BADGES_BY_CATEGORY[cat.id] ?? []).length,
      }))
      .filter((cat) => cat.badges.length > 0)
  }, [rarityFilter, earnedOnly, earnedMap])

  const rarityCounts = useMemo(() => {
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 }
    for (const id of earnedBadgeIds) {
      const b = allBadges.find((x) => x.id === id)
      if (b) counts[b.rarity] += 1
    }
    return counts
  }, [earnedBadgeIds, allBadges])

  const nextClosest = useMemo(
    () => closestToUnlock(currentUser, allBadges),
    [currentUser, allBadges],
  )

  const holdersOf = (badgeId) =>
    consultants.filter((c) => c.badges?.includes(badgeId))

  return (
    <div className="space-y-6 xl:space-y-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber">
            <Award className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-arena-amber">Achievements</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Your trophy case. Earn badges by hitting milestones across delivery, efficiency, and retention.
        </p>
      </header>

      <ProgressSummary
        totalBadges={allBadges.length}
        earnedBadges={earnedBadgeIds}
        rarityCounts={rarityCounts}
        nextClosest={nextClosest}
        onOpenNext={() => nextClosest && setOpenBadge(nextClosest.badge)}
      />

      <FilterBar
        rarityFilter={rarityFilter}
        setRarityFilter={setRarityFilter}
        earnedOnly={earnedOnly}
        setEarnedOnly={setEarnedOnly}
      />

      {filteredCategories.length === 0 ? (
        <div className="arena-card text-center text-arena-muted py-12">
          No badges match the current filters.
        </div>
      ) : (
        <div className="space-y-8 xl:space-y-10">
          {filteredCategories.map((cat) => (
            <section key={cat.id} className="space-y-3">
              <header className="flex items-center gap-3 flex-wrap">
                <span
                  className="h-9 w-9 rounded-2xl grid place-items-center text-lg"
                  style={{ background: `${cat.accent}1f`, boxShadow: `inset 0 0 0 1px ${cat.accent}55` }}
                >
                  {cat.icon}
                </span>
                <h2 className="font-display font-black text-arena-ink text-lg">
                  {cat.label}
                </h2>
                <span
                  className="arena-chip text-[10px]"
                  style={{ background: `${cat.accent}22`, color: cat.accent, boxShadow: `inset 0 0 0 1px ${cat.accent}55` }}
                >
                  {cat.earnedCount} / {cat.totalCount}
                </span>
                <span className="h-px flex-1 bg-arena-border" />
                <span className="text-xs text-arena-muted hidden md:inline">{cat.description}</span>
              </header>
              <BadgeGrid
                badges={cat.badges}
                earnedMap={earnedMap}
                unlockMonth={latestMonth}
                hasSeenUnlock={(badgeId) => hasSeenUnlock(currentUser.id, badgeId)}
                onUnlockSeen={(badgeId) => markUnlockSeen(currentUser.id, badgeId)}
                onOpen={(b) => setOpenBadge(b)}
              />
            </section>
          ))}
        </div>
      )}

      <BadgeDetailModal
        badge={openBadge}
        open={Boolean(openBadge)}
        onClose={() => setOpenBadge(null)}
        currentUser={currentUser}
        holders={openBadge ? holdersOf(openBadge.id) : []}
      />
    </div>
  )
}

function FilterBar({ rarityFilter, setRarityFilter, earnedOnly, setEarnedOnly }) {
  return (
    <div className="arena-card p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {RARITIES.map((r) => {
          const active = rarityFilter === r
          const hex = RARITY_HEX[r]
          const label = r === 'all' ? 'All' : RARITY_STYLES[r].label
          return (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-display font-bold transition-colors border',
                active
                  ? 'text-arena-bg border-transparent'
                  : 'bg-arena-bg/70 border-arena-border text-arena-muted hover:text-arena-ink',
              ].join(' ')}
              style={
                active
                  ? r === 'all'
                    ? { background: '#F75C03', boxShadow: '0 0 18px rgba(247, 92, 3,0.4)' }
                    : { background: hex, boxShadow: `0 0 18px ${hex}66` }
                  : undefined
              }
            >
              {label}
            </button>
          )
        })}
      </div>

      <div className="md:ml-auto">
        <Toggle value={earnedOnly} onChange={setEarnedOnly} label="Show earned only" />
      </div>
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-bg/70 border border-arena-border hover:text-arena-ink"
    >
      <span
        className={[
          'relative inline-block h-5 w-9 rounded-full transition-colors',
          value ? 'bg-accent-green shadow-glow' : 'bg-arena-surface2',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-arena-ink transition-all',
            value ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </span>
      <span className="text-xs font-display font-bold text-arena-muted">{label}</span>
    </button>
  )
}
