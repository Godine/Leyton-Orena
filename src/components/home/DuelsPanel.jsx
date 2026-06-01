import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swords, ChevronRight } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { useDuelStore, scoreDuel, DUEL_METRICS } from '../../store/useDuelStore.js'
import { formatCurrencyCompact } from '../../utils/formatters.js'

function formatValue(metric, v) {
  if (metric === 'invoiceValue') return formatCurrencyCompact(v)
  if (metric === 'invoiceBeforeDay15Pct') return `${Math.round(v)}%`
  if (metric === 'avgDaysToClose') return `${(v ?? 0).toFixed(1)}d`
  return `${Math.round(v)}`
}

function timeLeft(ms) {
  const days = Math.floor(ms / (24 * 3600 * 1000))
  const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000))
  if (days > 1) return `${days}d left`
  if (days === 1) return `1d ${hours}h left`
  if (hours > 0) return `${hours}h left`
  return 'ending soon'
}

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

// Home preview — top 2 active duels with a "see all" link to /duels.
export default function DuelsPanel() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const allDuels = useDuelStore((s) => s.duels)

  const byId = useMemo(() => Object.fromEntries(consultants.map((c) => [c.id, c])), [consultants])
  const duels = useMemo(
    () => allDuels
      .filter((d) => d.status === 'active' && (d.challengerId === currentUser.id || d.opponentId === currentUser.id))
      .slice(0, 2),
    [allDuels, currentUser.id],
  )

  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg flex items-center gap-2">
          <Swords size={18} className="text-accent-coral" />
          1:1 duels
        </h2>
        <Link
          to="/duels"
          className="inline-flex items-center gap-0.5 text-xs text-accent-coral hover:underline font-display font-bold"
        >
          See all <ChevronRight size={12} />
        </Link>
      </header>

      {duels.length === 0 ? (
        <Link
          to="/duels"
          className="block arena-card p-6 text-center text-sm text-arena-muted hover:border-accent-coral/40"
        >
          No active duels. Throw down a gauntlet →
        </Link>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {duels.map((d) => {
            const a = byId[d.challengerId]
            const b = byId[d.opponentId]
            const score = scoreDuel(d, consultants, months)
            const metric = DUEL_METRICS.find((m) => m.key === d.metric)
            const total = (score.a + score.b) || 1
            const aShare = score.a / total
            const winningId = score.leaderId
            return (
              <Link
                key={d.id}
                to="/duels"
                className="block arena-card p-4 hover:border-accent-coral/40 transition-colors"
              >
                <motion.div layout>
                  <div className="flex items-center justify-between gap-2">
                    <span className="arena-chip bg-accent-coral/15 text-accent-coral">
                      {metric?.label}
                    </span>
                    <span className="text-[11px] text-arena-muted">{timeLeft(score.timeLeftMs)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <Combatant consultant={a} value={formatValue(d.metric, score.a)} highlight={winningId === a.id} />
                    <span className="text-arena-muted font-display font-black text-xs">vs</span>
                    <Combatant consultant={b} value={formatValue(d.metric, score.b)} highlight={winningId === b.id} flip />
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-arena-surface2 overflow-hidden flex">
                    <div className="h-full" style={{ width: `${aShare * 100}%`, background: winningId === a.id ? '#F75C03' : '#a0a0c0' }} />
                    <div className="h-full" style={{ width: `${(1 - aShare) * 100}%`, background: winningId === b.id ? '#ff4b4b' : '#a0a0c0' }} />
                  </div>
                  <div className="mt-3 text-[11px] text-arena-muted truncate">Stake · {d.stake}</div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Combatant({ consultant, value, highlight, flip }) {
  return (
    <div className={['flex items-center gap-2 min-w-0', flip ? 'flex-row-reverse text-right' : ''].join(' ')}>
      <span
        className="h-9 w-9 rounded-xl grid place-items-center font-display font-black text-xs text-arena-bg shrink-0"
        style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
      >
        {initials(consultant?.name)}
      </span>
      <div className="min-w-0">
        <div className={['text-xs font-display font-bold truncate', highlight ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
          {consultant?.name?.split(' ')[0]}
        </div>
        <div className={['font-display font-black', highlight ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
          {value}
        </div>
      </div>
    </div>
  )
}
