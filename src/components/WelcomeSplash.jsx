import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo.jsx'

// First-impression splash that takes over the screen for ~2.2s on the first
// visit of a session, then fades out as the app fades in. SessionStorage-gated
// so it only appears once per browsing session (no annoying re-show on
// navigation).
const SPLASH_KEY = 'arena-splash-shown'

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(SPLASH_KEY) !== '1'
  })

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem(SPLASH_KEY, '1')
    const t = setTimeout(() => setVisible(false), 2200)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] grid place-items-center"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(247,92,3,0.22), transparent 60%), rgb(var(--arena-bg-rgb))',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
          aria-hidden
        >
          {/* Pulsing glow ring behind the mark */}
          <motion.span
            className="absolute h-64 w-64 rounded-full"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.15, 1], opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 120px 40px rgba(247,92,3,0.4)' }}
          />

          <motion.div
            className="flex flex-col items-center gap-5"
            initial={{ y: 12, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.05 }}
          >
            <Logo size={96} className="drop-shadow-[0_10px_30px_rgba(247,92,3,0.55)]" />
            <div className="text-center">
              <div className="font-display font-black text-arena-ink text-3xl md:text-4xl tracking-tight">
                Leyton<span className="text-arena-green"> Arena</span>
              </div>
              <motion.div
                className="text-[10px] uppercase tracking-[0.32em] text-arena-muted font-display font-bold mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                R&amp;D delivery · gamified
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
