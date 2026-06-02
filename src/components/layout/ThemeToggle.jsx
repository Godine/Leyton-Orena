import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useArenaStore } from '../../store/useArenaStore.js'

// Round icon button that flips between dark and light theme. Icon swaps with a
// little rotate-in for a tactile feel.
export default function ThemeToggle() {
  const theme = useArenaStore((s) => s.theme)
  const toggle = useArenaStore((s) => s.toggleTheme)
  const isLight = theme === 'light'
  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      className="relative h-10 w-10 grid place-items-center rounded-full bg-arena-surface border border-arena-border hover:border-accent-amber/60 transition-colors overflow-hidden"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="grid place-items-center"
      >
        {isLight
          ? <Moon size={17} className="text-arena-ink" strokeWidth={2.4} />
          : <Sun  size={18} className="text-arena-amber" strokeWidth={2.4} />}
      </motion.span>
    </button>
  )
}
