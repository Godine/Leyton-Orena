import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function ThreatAlert({ count, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-accent-coral/50 bg-accent-coral/5 p-5"
      style={{ boxShadow: '0 0 28px rgba(255,75,75,0.18)' }}
    >
      <header className="flex items-center gap-2 mb-3">
        <Flame className="text-accent-coral animate-flame" size={20} />
        <h2 className="font-display font-black text-lg text-accent-coral">
          Records Under Threat
        </h2>
        <span className="arena-chip bg-accent-coral/20 text-accent-coral">
          {count}
        </span>
      </header>
      <div className="grid gap-3">{children}</div>
    </motion.section>
  )
}
