import { motion, AnimatePresence } from 'framer-motion'
import { Award } from 'lucide-react'
import LocationPill from '../shared/LocationPill.jsx'
import TrendArrow from '../shared/TrendArrow.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

function formatPrimary(value, key) {
  if (key === 'invoiceValue')          return formatCurrencyCompact(value)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(value)}%`
  if (key === 'avgDaysToClose')        return `${value.toFixed(1)}d`
  return Math.round(value).toLocaleString('en-GB')
}

// Pick a sensible secondary metric so the row carries two data points.
function secondaryFor(sortKey) {
  if (sortKey === 'invoiceValue') return { key: 'opsDelivered', label: 'Ops' }
  return { key: 'invoiceValue', label: 'Invoice' }
}

export default function LeaderboardTable({ rows, sortKey, currentUserId }) {
  if (rows.length === 0) {
    return (
      <div className="arena-card text-center text-arena-muted py-12">
        No consultants match the current filters.
      </div>
    )
  }

  const secondary = secondaryFor(sortKey)

  return (
    <div className="arena-card p-0 overflow-hidden">
      <div className="hidden md:grid grid-cols-[60px_1.4fr_80px_1fr_1fr_70px_60px] gap-3 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold border-b border-arena-border bg-arena-surface2/40">
        <span>Rank</span>
        <span>Consultant</span>
        <span>Loc.</span>
        <span className="text-right">Primary</span>
        <span className="text-right">{secondary.label}</span>
        <span className="text-right">Trend</span>
        <span className="text-right">Badges</span>
      </div>

      <ul className="divide-y divide-arena-border">
        <AnimatePresence initial={false}>
          {rows.map((row) => {
            const isMe = row.consultant.id === currentUserId
            return (
              <motion.li
                key={row.consultant.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                whileHover={{ scale: 1.005 }}
                className={[
                  'grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1.4fr_80px_1fr_1fr_70px_60px]',
                  'gap-3 items-center px-5 py-3 cursor-default',
                  'transition-colors',
                  isMe
                    ? 'bg-accent-green/10 ring-1 ring-inset ring-accent-green/40 shadow-[inset_0_0_24px_rgba(247, 92, 3,0.18)]'
                    : 'hover:bg-arena-surface2/60',
                ].join(' ')}
              >
                <span className="font-display font-black text-arena-muted text-sm md:text-base">
                  #{row.rank}
                </span>

                <div className="min-w-0">
                  <div className="font-display font-bold text-arena-ink truncate">
                    {row.consultant.name}
                    {isMe && (
                      <span className="ml-2 arena-chip bg-accent-green/20 text-accent-green text-[9px] py-0.5 px-2">
                        you
                      </span>
                    )}
                  </div>
                  <div className="md:hidden mt-0.5 flex items-center gap-2 text-[11px] text-arena-muted">
                    <LocationPill location={row.consultant.location} />
                    <span>{formatPrimary(row.metrics[sortKey] ?? 0, sortKey)}</span>
                    <TrendArrow direction={row.trend} />
                  </div>
                </div>

                <div className="hidden md:block">
                  <LocationPill location={row.consultant.location} />
                </div>

                <div className="hidden md:block text-right font-display font-black text-arena-ink">
                  {formatPrimary(row.metrics[sortKey] ?? 0, sortKey)}
                </div>

                <div className="hidden md:block text-right text-arena-muted">
                  {formatPrimary(row.metrics[secondary.key] ?? 0, secondary.key)}
                </div>

                <div className="hidden md:flex justify-end">
                  <TrendArrow direction={row.trend} size={16} />
                </div>

                <div className="hidden md:flex justify-end items-center gap-1 text-arena-muted">
                  <Award size={14} className="text-accent-amber" strokeWidth={2.4} />
                  <span className="font-display font-bold text-arena-ink">
                    {row.consultant.badges?.length ?? 0}
                  </span>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
