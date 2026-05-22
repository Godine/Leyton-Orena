import { motion } from 'framer-motion'
import { useArenaStore } from '../store/useArenaStore.js'

export default function PagePlaceholder({ title, subtitle, icon: Icon, accent = 'green' }) {
  const role = useArenaStore((s) => s.roleView)

  const accentClass = {
    green: 'text-arena-green',
    amber: 'text-arena-amber',
    coral: 'text-arena-coral',
  }[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <Icon className={accentClass} size={24} strokeWidth={2.4} />
          </div>
        )}
        <span className="arena-chip bg-arena-surface2 text-arena-muted">
          {role} view
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-display font-black mt-2">
        <span className={accentClass}>{title}</span>
      </h1>
      {subtitle && (
        <p className="text-arena-muted mt-2 max-w-2xl">{subtitle}</p>
      )}

      <div className="mt-8 arena-card animate-bounceIn">
        <div className="flex items-center gap-2 text-arena-muted text-sm">
          <span className="h-2 w-2 rounded-full bg-arena-amber animate-pulseRing" />
          Coming soon — content for this page will land in the next milestone.
        </div>
      </div>
    </motion.div>
  )
}
