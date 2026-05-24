import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'

const STEPS = [
  {
    title: 'Welcome to Leyton Arena',
    body: 'A gamified leaderboard for R&D tax consultants. Six pages, one shared store, zero backend.',
  },
  {
    title: 'Home — your morning coffee',
    body: 'Quick stats with progress rings, live monthly challenges, team activity, and records under threat.',
  },
  {
    title: 'Leaderboard',
    body: 'Top-3 podium with sparklines, filterable table that smoothly reorders as you change period, metric, or location.',
  },
  {
    title: 'Achievements',
    body: '14 badges with rarity tiers. Locked badges show progress; new unlocks burst with a particle animation.',
  },
  {
    title: 'Records & Profile',
    body: 'A Hall of Fame for all-time bests with threat alerts, and a per-consultant profile with rings, trend chart, and streak flame.',
  },
  {
    title: 'Daily fire',
    body: 'Every consultant has a daily fire that grows when they advance at least one claim by one stage in the Leyton workflow (Handover → Overview → Scoping → Tech Report → Costs → Assessment → Invoiced).',
  },
  {
    title: 'You\'re ready',
    body: 'Use the role switcher in the sidebar and the "view as" selector on Profile to demo different perspectives.',
  },
]

export default function WalkthroughOverlay() {
  const open = useArenaStore((s) => s.walkthroughOpen)
  const setOpen = useArenaStore((s) => s.setWalkthroughOpen)
  const [step, setStep] = useState(0)

  const close = () => { setOpen(false); setStep(0) }
  const next = () => (step + 1 >= STEPS.length ? close() : setStep(step + 1))
  const current = STEPS[step]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-full max-w-md bg-arena-surface border border-arena-border rounded-3xl p-6 relative"
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
              aria-label="Close walkthrough"
            >
              <X size={18} />
            </button>

            <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="mt-1 font-display font-black text-arena-ink text-2xl">
              {current.title}
            </h2>
            <p className="mt-2 text-arena-muted">{current.body}</p>

            <div className="mt-5 grid grid-cols-6 gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={[
                    'h-1.5 rounded-full transition-colors',
                    i <= step ? 'bg-accent-green shadow-glow' : 'bg-arena-surface2',
                  ].join(' ')}
                />
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={close}
                className="text-xs text-arena-muted hover:text-arena-ink font-display font-bold"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-green text-arena-bg font-display font-bold text-sm shadow-glow"
              >
                {step + 1 >= STEPS.length ? 'Finish' : 'Next'}
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
