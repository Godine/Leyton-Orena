import { motion } from 'framer-motion'
import { Briefcase, Banknote, Zap, Clock } from 'lucide-react'
import AnimatedCounter from '../shared/AnimatedCounter.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

export default function MetricCards({ totals, periodLabel }) {
  const cards = [
    {
      label: 'Ops Delivered',
      icon: Briefcase,
      accent: 'text-accent-green',
      value: totals.opsDelivered,
      format: (v) => Math.round(v).toLocaleString('en-GB'),
    },
    {
      label: 'Invoice Value',
      icon: Banknote,
      accent: 'text-accent-amber',
      value: totals.invoiceValue,
      format: (v) => formatCurrencyCompact(v),
    },
    {
      label: 'Avg Early Invoice',
      icon: Zap,
      accent: 'text-accent-blue',
      value: totals.invoiceBeforeDay15Pct,
      format: (v) => `${v.toFixed(0)}%`,
    },
    {
      label: 'Avg Days to Close',
      icon: Clock,
      accent: 'text-accent-purple',
      value: totals.avgDaysToClose,
      format: (v) => `${v.toFixed(1)}d`,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.3 }}
          className="arena-card p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
              {card.label}
            </span>
            <card.icon size={16} className={card.accent} strokeWidth={2.4} />
          </div>
          <div className="mt-2 text-2xl md:text-3xl font-display font-black text-arena-ink">
            <AnimatedCounter value={card.value} format={card.format} />
          </div>
          <div className="text-[11px] text-arena-muted mt-0.5">{periodLabel} · team</div>
        </motion.div>
      ))}
    </div>
  )
}
