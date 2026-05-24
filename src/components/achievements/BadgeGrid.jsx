import { AnimatePresence, motion } from 'framer-motion'
import BadgeCard from './BadgeCard.jsx'

export default function BadgeGrid({
  badges,
  earnedMap,         // { badgeId: monthIso }
  unlockMonth,       // latest month, used to trigger unlock animation
  hasSeenUnlock,     // (badgeId) => bool
  onUnlockSeen,      // (badgeId) => void
  onOpen,            // (badge) => void
}) {
  if (!badges.length) {
    return (
      <div className="arena-card text-center text-arena-muted py-12">
        No badges match the current filters.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
      <AnimatePresence initial={false}>
        {badges.map((badge) => {
          const earnedAt = earnedMap[badge.id]
          const earned = Boolean(earnedAt)
          const isFreshUnlock =
            earned && earnedAt === unlockMonth && !hasSeenUnlock(badge.id)
          return (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <BadgeCard
                badge={badge}
                earned={earned}
                earnedAt={earnedAt}
                playUnlock={isFreshUnlock}
                onUnlockSeen={() => onUnlockSeen(badge.id)}
                onClick={() => onOpen(badge)}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
