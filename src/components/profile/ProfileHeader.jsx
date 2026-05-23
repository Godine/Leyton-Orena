import { motion } from 'framer-motion'
import { Award, Briefcase, Banknote } from 'lucide-react'
import AnimatedCounter from '../shared/AnimatedCounter.jsx'
import LocationPill from '../shared/LocationPill.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function ProfileHeader({ consultant, totals, joinDate = 'Mar 2022' }) {
  return (
    <motion.section
      layout
      className="arena-card p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-6"
    >
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 md:h-20 md:w-20 rounded-2xl grid place-items-center font-display font-black text-arena-bg text-xl md:text-2xl"
          style={{ background: 'linear-gradient(135deg, #58cc02, #ffc800)', boxShadow: '0 0 28px rgba(88,204,2,0.35)' }}
        >
          {initials(consultant.name)}
        </div>

        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-arena-ink leading-tight">
            {consultant.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="arena-chip bg-arena-surface2 text-arena-muted">{consultant.role}</span>
            <LocationPill location={consultant.location} />
            <span className="text-xs text-arena-muted">Member since {joinDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:ml-auto md:min-w-[360px]">
        <Stat icon={Briefcase} label="Lifetime Ops" value={totals.opsDelivered} format={(v) => Math.round(v).toLocaleString('en-GB')} accent="text-accent-green" />
        <Stat icon={Banknote}  label="Lifetime £"   value={totals.invoiceValue}  format={formatCurrencyCompact} accent="text-accent-amber" />
        <Stat icon={Award}     label="Badges"       value={consultant.badges?.length ?? 0} format={(v) => Math.round(v).toLocaleString('en-GB')} accent="text-accent-purple" />
      </div>
    </motion.section>
  )
}

function Stat({ icon: Icon, label, value, format, accent }) {
  return (
    <div className="rounded-xl bg-arena-bg/50 border border-arena-border p-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
          {label}
        </span>
        <Icon size={14} className={accent} strokeWidth={2.4} />
      </div>
      <div className="mt-1 font-display font-black text-xl text-arena-ink">
        <AnimatedCounter value={value} format={format} />
      </div>
    </div>
  )
}
