import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import LocationPill from '../shared/LocationPill.jsx'

function formatMonth(monthIso) {
  if (!monthIso) return ''
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export default function RecordCard({ record, holder, runnerUpConsultant, underThreat }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={[
        'relative rounded-2xl border bg-gradient-to-br from-arena-card to-arena-surface p-5 md:p-6',
        underThreat
          ? 'border-accent-coral/60 shadow-[0_0_28px_rgba(255,75,75,0.25)] animate-pulseRing'
          : 'border-amber-400/40 shadow-[0_0_24px_rgba(255,200,0,0.18)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div
          className="h-14 w-14 rounded-2xl grid place-items-center text-3xl shrink-0"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,200,0,0.25), transparent 70%)' }}
        >
          {record.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-display font-bold">
            All-time record
          </div>
          <h3 className="mt-0.5 font-display font-black text-arena-ink text-lg md:text-xl leading-tight">
            {record.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display font-black text-2xl md:text-3xl text-amber-300">
              {record.format(record.value)}
            </span>
            {holder && (
              <span className="text-arena-ink font-display font-bold truncate">
                {holder.name}
              </span>
            )}
            {holder && <LocationPill location={holder.location} />}
            <span className="text-xs text-arena-muted">
              · set {record.monthLabel ?? formatMonth(record.month)}
            </span>
          </div>

          {underThreat && runnerUpConsultant && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-coral/10 ring-1 ring-inset ring-accent-coral/40">
              <Flame size={16} className="text-accent-coral animate-flame" />
              <span className="text-xs font-display font-bold text-accent-coral">Under threat</span>
              <span className="text-xs text-arena-ink/90">
                {runnerUpConsultant.name} is at {record.format(record.runnerUp.value)}
                {' · '}
                {Math.round(record.threatRatio * 100)}% of the record
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
