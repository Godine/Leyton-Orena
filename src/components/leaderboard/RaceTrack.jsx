import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, ArrowDown, Award } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { formatCurrencyCompact } from '../../utils/formatters.js'
import LocationPill from '../shared/LocationPill.jsx'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatPrimary(key, v) {
  if (key === 'invoiceValue')          return formatCurrencyCompact(v)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(v)}%`
  if (key === 'avgDaysToClose')        return `${(v ?? 0).toFixed(1)}d`
  return Math.round(v).toLocaleString('en-GB')
}

// Race-track view of the leaderboard: stacked horizontal bars, one per
// consultant, length proportional to score / leaderScore. Reads like a Strava
// finish board. Top N only.
export default function RaceTrack({ rows, sortKey, currentUserId, priorRanks = {}, topN = 12 }) {
  const navigate = useNavigate()
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  if (!rows.length) return null
  const slice = rows.slice(0, topN)
  const leaderVal = Math.max(...slice.map((r) => r.metrics[sortKey] ?? 0)) || 1
  const betterWhenLower = sortKey === 'avgDaysToClose'

  return (
    <div className="arena-card p-2 md:p-4">
      <div className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold flex items-center justify-between">
        <span>Race · top {slice.length}</span>
        <span>Track filled by relative score</span>
      </div>
      <ol className="space-y-2">
        {slice.map((row, i) => {
          const v = row.metrics[sortKey] ?? 0
          const ratio = betterWhenLower
            ? (v === 0 ? 0 : Math.min(1, leaderVal / Math.max(v, 1e-9)))
            : Math.min(1, v / leaderVal)
          const isMe = row.consultant.id === currentUserId
          const prior = priorRanks[row.consultant.id]
          const delta = prior ? prior - row.rank : 0
          const trackColor =
            row.rank === 1 ? '#ffc800' :
            row.rank === 2 ? '#c0c7d6' :
            row.rank === 3 ? '#cd7f32' :
            '#F75C03'
          return (
            <motion.li
              key={row.consultant.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 280, damping: 24 }}
              onClick={() => { setCurrentUserId(row.consultant.id); navigate('/profile') }}
              className={[
                'cursor-pointer rounded-xl px-3 py-2.5 transition-colors',
                isMe ? 'bg-accent-green/10 ring-1 ring-inset ring-accent-green/40' : 'hover:bg-arena-surface2/40',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {/* Rank tile */}
                <div
                  className="h-9 w-9 rounded-xl grid place-items-center font-display font-black text-sm shrink-0"
                  style={{
                    background: row.rank <= 3 ? `${trackColor}26` : 'rgba(255,255,255,0.04)',
                    color: row.rank <= 3 ? trackColor : 'rgb(var(--arena-muted-rgb))',
                    boxShadow: row.rank <= 3 ? `inset 0 0 0 1px ${trackColor}55` : undefined,
                  }}
                >
                  {row.rank}
                </div>

                {/* Avatar + name */}
                <div className="flex items-center gap-2 min-w-0 w-36 md:w-44 shrink-0">
                  <span
                    className="h-7 w-7 rounded-lg grid place-items-center font-display font-black text-arena-bg text-[10px] shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
                  >
                    {initials(row.consultant.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-display font-bold text-arena-ink truncate">
                      {row.consultant.name}
                      {isMe && (
                        <span className="ml-1 text-[9px] text-accent-green">(you)</span>
                      )}
                    </div>
                    <div className="text-[10px] text-arena-muted truncate">
                      {row.consultant.role}
                    </div>
                  </div>
                </div>

                {/* Track bar */}
                <div className="flex-1 min-w-0 relative">
                  <div className="h-3.5 rounded-full bg-arena-surface2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, ratio * 100)}%` }}
                      transition={{ delay: 0.06 * i + 0.1, duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: row.rank === 1
                          ? 'linear-gradient(90deg, #F75C03, #ffc800)'
                          : trackColor,
                        boxShadow: `0 0 8px ${trackColor}66`,
                      }}
                    />
                  </div>
                </div>

                {/* Value + delta */}
                <div className="text-right shrink-0 w-24">
                  <div className="font-display font-black text-arena-ink text-sm">
                    {formatPrimary(sortKey, v)}
                  </div>
                  <div className="text-[10px] flex items-center gap-1 justify-end">
                    <span className="inline-flex items-center gap-0.5 text-arena-muted">
                      <Award size={9} className="text-accent-amber" strokeWidth={2.6} />
                      {row.consultant.badges?.length ?? 0}
                    </span>
                    {delta !== 0 && (
                      <span className={[
                        'inline-flex items-center gap-0.5 font-display font-bold',
                        delta > 0 ? 'text-accent-green' : 'text-accent-coral',
                      ].join(' ')}>
                        {delta > 0
                          ? <><ArrowUp size={9} strokeWidth={3} /> {delta}</>
                          : <><ArrowDown size={9} strokeWidth={3} /> {Math.abs(delta)}</>}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location pill on its own line for mobile */}
              <div className="md:hidden mt-1.5 pl-[3rem]">
                <LocationPill location={row.consultant.location} />
              </div>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
