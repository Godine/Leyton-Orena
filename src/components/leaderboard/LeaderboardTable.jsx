import { motion, AnimatePresence } from 'framer-motion'
import { Award, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useArenaStore } from '../../store/useArenaStore.js'
import LocationPill from '../shared/LocationPill.jsx'
import TrendArrow from '../shared/TrendArrow.jsx'
import SparkLine from './SparkLine.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

function formatPrimary(value, key) {
  if (key === 'invoiceValue')          return formatCurrencyCompact(value)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(value)}%`
  if (key === 'avgDaysToClose')        return `${value.toFixed(1)}d`
  return Math.round(value).toLocaleString('en-GB')
}

function secondaryFor(sortKey) {
  if (sortKey === 'invoiceValue') return { key: 'opsDelivered', label: 'Ops' }
  return { key: 'invoiceValue', label: 'Invoice' }
}

function MovementPill({ delta }) {
  if (delta == null || delta === 0) {
    return <span className="inline-flex items-center gap-0.5 text-[11px] text-arena-muted"><Minus size={11} /></span>
  }
  if (delta > 0) {
    return <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-green font-display font-bold"><ArrowUp size={11} strokeWidth={3} />{delta}</span>
  }
  return <span className="inline-flex items-center gap-0.5 text-[11px] text-accent-coral font-display font-bold"><ArrowDown size={11} strokeWidth={3} />{Math.abs(delta)}</span>
}

export default function LeaderboardTable({ rows, sortKey, currentUserId, priorRanks = {} }) {
  const navigate = useNavigate()
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)
  const openProfile = (id) => { setCurrentUserId(id); navigate('/profile') }

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
      <div className="hidden md:grid grid-cols-[50px_1.4fr_80px_1fr_1fr_90px_50px_50px] gap-3 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold border-b border-arena-border bg-arena-surface2/40">
        <span>Rank</span>
        <span>Consultant</span>
        <span>Loc.</span>
        <span className="text-right">Primary</span>
        <span className="text-right">{secondary.label}</span>
        <span className="text-center">6-mo trend</span>
        <span className="text-center">Move</span>
        <span className="text-right">Badges</span>
      </div>

      <ul className="divide-y divide-arena-border">
        <AnimatePresence initial={false}>
          {rows.map((row) => {
            const isMe = row.consultant.id === currentUserId
            const priorRank = priorRanks[row.consultant.id]
            const delta = priorRank ? priorRank - row.rank : null
            return (
              <motion.li
                key={row.consultant.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                whileHover={{ scale: 1.005 }}
                onClick={() => openProfile(row.consultant.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openProfile(row.consultant.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Open ${row.consultant.name}'s profile`}
                className={[
                  'grid grid-cols-[40px_1fr_auto] md:grid-cols-[50px_1.4fr_80px_1fr_1fr_90px_50px_50px]',
                  'gap-3 items-center px-5 py-3 cursor-pointer',
                  'transition-colors',
                  isMe
                    ? 'bg-accent-green/10 ring-1 ring-inset ring-accent-green/40 shadow-[inset_0_0_24px_rgba(247,92,3,0.18)]'
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
                    <MovementPill delta={delta} />
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

                <div className="hidden md:flex justify-center">
                  <SparkLine
                    values={row.sparkline}
                    width={80}
                    height={22}
                    stroke={row.trend === 'down' ? '#ff4b4b' : '#F75C03'}
                    fill={row.trend === 'down' ? 'rgba(255,75,75,0.18)' : 'rgba(247,92,3,0.18)'}
                  />
                </div>

                <div className="hidden md:flex justify-center">
                  <MovementPill delta={delta} />
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
