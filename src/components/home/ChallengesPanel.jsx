import { motion, AnimatePresence } from 'framer-motion'
import { Users, User, Check, Clock } from 'lucide-react'

const TYPE_META = {
  individual: { Icon: User,  accent: '#F75C03', label: 'Individual' },
  team:       { Icon: Users, accent: '#1cb0f6', label: 'Team' },
}

// 8 confetti pieces bursting upward when a challenge completes.
const CONFETTI = Array.from({ length: 8 }, (_, i) => ({
  x: (i - 4) * 14 + (i % 2 ? 6 : -6),
  rot: (i - 4) * 30,
  color: ['#F75C03', '#ffc800', '#ff4b4b', '#1cb0f6', '#ce82ff'][i % 5],
}))

function rewardLabel(reward, badgesById) {
  if (!reward) return ''
  if (reward.type === 'badge') {
    const b = badgesById[reward.badgeId]
    return b ? `${b.icon} ${b.name}` : 'Badge reward'
  }
  if (reward.type === 'team-celebration') return '🎉 Team celebration'
  return ''
}

export default function ChallengesPanel({ challenges, computed, badgesById }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg">Active challenges</h2>
        <span className="text-xs text-arena-muted">
          {computed.filter((c) => c.progress.completed).length} of {challenges.length} complete
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {computed.map(({ challenge, progress }, i) => {
          const meta = TYPE_META[challenge.type]
          const ratio = Math.max(0, Math.min(1, progress.ratio))
          const ringColor = progress.completed
            ? '#F75C03'
            : ratio >= 0.66 ? '#F75C03' : ratio >= 0.33 ? '#ffc800' : '#ff4b4b'
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 220, damping: 22 }}
              className={[
                'relative arena-card p-4 md:p-5 overflow-hidden',
                progress.completed ? 'ring-2 ring-accent-green/50 shadow-glow' : '',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-12 w-12 rounded-2xl grid place-items-center text-2xl shrink-0"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${meta.accent}33, transparent 70%)` }}
                >
                  {challenge.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-arena-ink leading-tight truncate">
                      {challenge.title}
                    </h3>
                    <span
                      className="arena-chip text-[9px]"
                      style={{ background: `${meta.accent}22`, color: meta.accent, boxShadow: `inset 0 0 0 1px ${meta.accent}55` }}
                    >
                      <meta.Icon size={10} strokeWidth={3} />
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-arena-muted mt-1">{challenge.description}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-arena-muted">{progress.valueLabel}</span>
                  <span className="text-arena-muted">{progress.targetLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-arena-surface2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio * 100}%` }}
                    transition={{ delay: 0.1 + 0.05 * i, duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: ringColor, boxShadow: `0 0 12px ${ringColor}88` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-arena-muted inline-flex items-center gap-1">
                  <Clock size={11} />
                  {challenge.daysLeft} days left
                </span>
                <span className="text-[11px] text-arena-ink font-display font-bold truncate">
                  reward · {rewardLabel(challenge.reward, badgesById)}
                </span>
              </div>

              <AnimatePresence>
                {progress.completed && (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green text-arena-bg text-[10px] font-display font-black"
                    >
                      <Check size={12} strokeWidth={3.5} /> Complete!
                    </motion.div>
                    <div className="pointer-events-none absolute top-3 right-3">
                      {CONFETTI.map((c, ci) => (
                        <motion.span
                          key={ci}
                          initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
                          animate={{ x: c.x, y: 40, opacity: [0, 1, 0], rotate: c.rot * 2 }}
                          transition={{ duration: 1.1, ease: 'easeOut' }}
                          className="absolute h-1.5 w-2.5 rounded-sm"
                          style={{ background: c.color }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
