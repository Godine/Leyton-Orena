import { useMemo } from 'react'
import { motion } from 'framer-motion'

const LINES = [
  'Every Op delivered is a client better off. Let\'s go.',
  'The Arena doesn\'t sleep. Neither does your pipeline.',
  'Front-load your month. Future you will thank you.',
  'Records exist to be broken. Why not today?',
  'Streaks are built one Op at a time.',
  'Show up. Ship work. Stack badges.',
  'Small wins, compounded daily, equal legendary months.',
  'The leaderboard rewards consistency more than heroics.',
  'Closed Ops > open tabs.',
  'Pace yourself. Then beat that pace.',
  'One clean invoice can change a quarter.',
  'The team that ships together, wins together.',
]

function pickDailyLine() {
  // Stable per UTC date so the line doesn't shuffle on every render.
  const d = new Date()
  const seed = d.getUTCFullYear() * 1000 + d.getUTCMonth() * 32 + d.getUTCDate()
  return LINES[seed % LINES.length]
}

export default function WelcomeHeader({ name }) {
  const line = useMemo(pickDailyLine, [])
  const today = useMemo(
    () => new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
    [],
  )
  const first = name.split(' ')[0]
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-2"
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
        {today}
      </div>
      <h1 className="text-3xl md:text-4xl font-display font-black text-arena-ink">
        Welcome back, <span className="text-accent-green">{first}</span>
      </h1>
      <p className="text-arena-muted max-w-xl italic">"{line}"</p>
    </motion.section>
  )
}
