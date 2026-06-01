import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, X, Plus } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { useDuelStore, scoreDuel, DUEL_METRICS, DURATION_DAYS } from '../../store/useDuelStore.js'
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

export default function DuelsPanel() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const allDuels = useDuelStore((s) => s.duels)
  const create = useDuelStore((s) => s.create)
  const conclude = useDuelStore((s) => s.conclude)

  const byId = useMemo(() => Object.fromEntries(consultants.map((c) => [c.id, c])), [consultants])
  const duels = useMemo(
    () => allDuels.filter((d) =>
      d.status === 'active' && (d.challengerId === currentUser.id || d.opponentId === currentUser.id),
    ),
    [allDuels, currentUser.id],
  )

  const [creating, setCreating] = useState(false)

  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg flex items-center gap-2">
          <Swords size={18} className="text-accent-coral" />
          1:1 duels
        </h2>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-coral/15 text-accent-coral text-xs font-display font-bold ring-1 ring-inset ring-accent-coral/40 hover:bg-accent-coral/25"
        >
          <Plus size={12} strokeWidth={3} /> Challenge a peer
        </button>
      </header>

      {duels.length === 0 ? (
        <div className="arena-card p-6 text-center text-sm text-arena-muted">
          No active duels. Want to throw down a gauntlet?
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {duels.map((d) => {
            const a = byId[d.challengerId]
            const b = byId[d.opponentId]
            const score = scoreDuel(d, consultants, months)
            const metric = DUEL_METRICS.find((m) => m.key === d.metric)
            const myId = currentUser.id
            const meFirst = d.challengerId === myId
            const my   = meFirst ? score.a : score.b
            const them = meFirst ? score.b : score.a
            const total = my + them || 1
            const myShare = my / total
            const winning = score.leaderId === myId
            return (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="arena-card p-4 md:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="arena-chip bg-accent-coral/15 text-accent-coral">
                    {metric?.label}
                  </span>
                  <span className="text-[11px] text-arena-muted">{timeLeft(score.timeLeftMs)}</span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Combatant consultant={a} value={formatValue(d.metric, score.a)} highlight={score.leaderId === a.id} mine={a.id === myId} />
                  <span className="font-display font-black text-arena-muted text-xs">vs</span>
                  <Combatant consultant={b} value={formatValue(d.metric, score.b)} highlight={score.leaderId === b.id} mine={b.id === myId} flip />
                </div>

                <div className="mt-3 h-2 rounded-full bg-arena-surface2 overflow-hidden flex">
                  <div className="h-full" style={{ width: `${myShare * 100}%`, background: winning ? '#F75C03' : '#a0a0c0' }} />
                  <div className="h-full" style={{ width: `${(1 - myShare) * 100}%`, background: winning ? '#a0a0c0' : '#ff4b4b' }} />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-arena-muted">Stake · {d.stake}</span>
                  <button
                    onClick={() => conclude(d.id, score.leaderId, { [a.id]: score.a, [b.id]: score.b })}
                    className="text-arena-muted hover:text-arena-ink font-display font-bold"
                  >
                    Call it
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <NewDuelModal
            consultants={consultants}
            currentUser={currentUser}
            onClose={() => setCreating(false)}
            onCreate={(payload) => {
              create({ challengerId: currentUser.id, ...payload })
              setCreating(false)
            }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function Combatant({ consultant, value, highlight, mine, flip }) {
  return (
    <div className={['flex items-center gap-2', flip ? 'flex-row-reverse text-right' : ''].join(' ')}>
      <span
        className="h-9 w-9 rounded-xl grid place-items-center font-display font-black text-xs text-arena-bg shrink-0"
        style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
      >
        {initials(consultant?.name)}
      </span>
      <div className="min-w-0">
        <div className={['text-xs font-display font-bold truncate', highlight ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
          {mine ? 'You' : consultant?.name?.split(' ')[0]}
          {mine && ' · '}
          {!mine && ''}
          {mine ? <span className="text-arena-muted font-normal">({consultant?.name?.split(' ')[1] ?? ''})</span> : null}
        </div>
        <div className={['font-display font-black', highlight ? 'text-accent-green' : 'text-arena-ink'].join(' ')}>
          {value}
        </div>
      </div>
    </div>
  )
}

function NewDuelModal({ consultants, currentUser, onClose, onCreate }) {
  const peers = consultants.filter((c) => c.id !== currentUser.id && c.role === currentUser.role)
  const [opponentId, setOpponentId] = useState(peers[0]?.id ?? '')
  const [metric, setMetric] = useState(DUEL_METRICS[0].key)
  const [duration, setDuration] = useState(DURATION_DAYS[2].key)
  const [stake, setStake] = useState('Loser buys lunch')

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-end md:place-items-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full md:max-w-md bg-arena-surface border border-arena-border rounded-t-3xl md:rounded-3xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
        >
          <X size={18} />
        </button>
        <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
          New duel
        </div>
        <h2 className="font-display font-black text-arena-ink text-xl mt-1">Challenge a peer</h2>

        <div className="mt-4 space-y-3">
          <Field label="Opponent">
            <select
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {peers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.location}</option>
              ))}
            </select>
          </Field>
          <Field label="Metric">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {DUEL_METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Duration">
            <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold w-full">
              {DURATION_DAYS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDuration(d.key)}
                  className={[
                    'flex-1 px-3 py-1.5 rounded-full transition-colors',
                    duration === d.key ? 'bg-accent-coral text-arena-bg' : 'text-arena-muted hover:text-arena-ink',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Stake">
            <input
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-display font-bold text-arena-muted hover:text-arena-ink">
            Cancel
          </button>
          <button
            onClick={() => onCreate({ opponentId, metric, durationDays: duration, stake })}
            disabled={!opponentId}
            className="px-4 py-2 rounded-full bg-accent-coral text-arena-bg text-sm font-display font-bold shadow-glow disabled:opacity-50"
          >
            Throw down 🥊
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-1">
        {label}
      </span>
      {children}
    </label>
  )
}
