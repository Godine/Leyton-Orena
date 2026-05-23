import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Trophy } from 'lucide-react'

export default function StreakDisplay({ current, best }) {
  const isPersonalBest = current >= best && current > 0

  return (
    <div className="arena-card p-5 relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 grid place-items-center rounded-2xl bg-arena-bg/60 border border-arena-border">
          <Flame
            size={44}
            className="text-accent-coral animate-flame"
            style={{ filter: 'drop-shadow(0 0 14px rgba(255,75,75,0.55))' }}
            fill="currentColor"
            strokeWidth={1.5}
          />
          <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-accent-coral text-arena-bg grid place-items-center font-display font-black text-sm shadow-glow">
            {current}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
            Current streak
          </div>
          <div className="font-display font-black text-2xl text-arena-ink">
            {current} month{current === 1 ? '' : 's'}
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-arena-muted">
            <Trophy size={12} className="text-accent-amber" />
            Best ever: <span className="text-arena-ink font-display font-bold">{best}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPersonalBest && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            className="mt-4 rounded-xl p-3 bg-accent-amber/15 ring-1 ring-inset ring-accent-amber/40 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="font-display font-black text-accent-amber tracking-wider"
            >
              ⭐ NEW PERSONAL BEST ⭐
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
