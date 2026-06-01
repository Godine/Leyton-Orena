import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Swords, Crown, X, Plus, Quote, Eye, Heart, History, Clock, Trophy, Flame, Award,
} from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import {
  useDuelStore, scoreDuel, leadHistory, tallyCheers,
  DUEL_METRICS, DURATION_DAYS,
} from '../store/useDuelStore.js'
import { formatCurrencyCompact } from '../utils/formatters.js'
import LocationPill from '../components/shared/LocationPill.jsx'

function formatValue(metric, v) {
  if (metric === 'invoiceValue')          return formatCurrencyCompact(v)
  if (metric === 'invoiceBeforeDay15Pct') return `${Math.round(v)}%`
  if (metric === 'avgDaysToClose')        return `${(v ?? 0).toFixed(1)}d`
  return `${Math.round(v)}`
}

function formatMargin(metric, diff) {
  if (diff === 0) return 'dead even'
  const abs = Math.abs(diff)
  if (metric === 'invoiceValue')          return formatCurrencyCompact(abs)
  if (metric === 'invoiceBeforeDay15Pct') return `${Math.round(abs)} pp`
  if (metric === 'avgDaysToClose')        return `${abs.toFixed(1)}d`
  return `${Math.round(abs)} ops`
}

function timeLeft(ms) {
  if (ms <= 0) return 'ended'
  const days = Math.floor(ms / (24 * 3600 * 1000))
  const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000))
  if (days > 1) return `${days}d ${hours}h left`
  if (days === 1) return `1d ${hours}h left`
  if (hours > 0) return `${hours}h left`
  return 'ending soon'
}

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function Duels() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const allDuels = useDuelStore((s) => s.duels)
  const create = useDuelStore((s) => s.create)
  const conclude = useDuelStore((s) => s.conclude)
  const cancel = useDuelStore((s) => s.cancel)
  const cheer = useDuelStore((s) => s.cheer)

  const byId = useMemo(() => Object.fromEntries(consultants.map((c) => [c.id, c])), [consultants])
  const mine = allDuels.filter((d) =>
    d.challengerId === currentUser.id || d.opponentId === currentUser.id,
  )
  const myActive = mine.filter((d) => d.status === 'active')
  const myCompleted = mine.filter((d) => d.status === 'completed')
  const spectate = allDuels.filter((d) =>
    d.status === 'active' && d.challengerId !== currentUser.id && d.opponentId !== currentUser.id,
  )

  const [selectedId, setSelectedId] = useState(myActive[0]?.id ?? spectate[0]?.id ?? null)
  const [creating, setCreating] = useState(false)

  const selected = allDuels.find((d) => d.id === selectedId) ?? myActive[0] ?? spectate[0] ?? null

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
              <Swords className="text-accent-coral" size={24} strokeWidth={2.4} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
            <span className="text-accent-coral">Duels</span>
          </h1>
          <p className="text-arena-muted max-w-2xl">
            Pick a peer, pick a metric, pick a stake. The Arena keeps score —
            spectators pick a side.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-accent-coral text-arena-bg text-sm font-display font-bold shadow-glow"
        >
          <Plus size={14} strokeWidth={3} /> Challenge a peer
        </button>
      </header>

      {/* Selector row */}
      <DuelSelector
        myActive={myActive}
        spectate={spectate}
        byId={byId}
        consultants={consultants}
        months={months}
        selectedId={selected?.id}
        onSelect={setSelectedId}
        currentUserId={currentUser.id}
      />

      {/* Detail */}
      {selected ? (
        <DuelDetail
          duel={selected}
          byId={byId}
          consultants={consultants}
          months={months}
          currentUser={currentUser}
          onConclude={(d, winnerId, scores) => conclude(d.id, winnerId, scores)}
          onCancel={(d) => { cancel(d.id); setSelectedId(null) }}
          onCheer={(d, side) => cheer(d.id, currentUser.id, side)}
        />
      ) : (
        <div className="arena-card text-center text-sm text-arena-muted py-12">
          No duels yet. Throw down a gauntlet.
        </div>
      )}

      {/* History */}
      <section>
        <header className="flex items-center gap-3 mb-3 px-1">
          <h2 className="font-display font-black text-arena-ink text-lg flex items-center gap-2">
            <History size={18} className="text-arena-muted" /> Your past duels
          </h2>
          <span className="h-px flex-1 bg-arena-border" />
          <span className="text-xs text-arena-muted">{myCompleted.length}</span>
        </header>
        {myCompleted.length === 0 ? (
          <div className="arena-card p-6 text-center text-sm text-arena-muted">
            No completed duels yet.
          </div>
        ) : (
          <ul className="arena-card p-0 divide-y divide-arena-border">
            {myCompleted.map((d) => {
              const a = byId[d.challengerId]
              const b = byId[d.opponentId]
              const youWon = d.winnerId === currentUser.id
              const metric = DUEL_METRICS.find((m) => m.key === d.metric)
              return (
                <li key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-arena-surface2/40 cursor-pointer"
                >
                  <span className={[
                    'h-9 w-9 rounded-xl grid place-items-center shrink-0',
                    youWon ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-coral/20 text-accent-coral',
                  ].join(' ')}>
                    {youWon ? <Trophy size={15} /> : <X size={15} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display font-bold text-arena-ink truncate">
                      {a.name} <span className="text-arena-muted font-normal">vs</span> {b.name}
                    </div>
                    <div className="text-[11px] text-arena-muted">
                      {metric?.label} · {youWon ? 'You won' : 'You lost'} ·
                      {' '}{formatValue(d.metric, d.scores?.[d.challengerId] ?? 0)} – {formatValue(d.metric, d.scores?.[d.opponentId] ?? 0)}
                    </div>
                  </div>
                  <span className="text-[11px] text-arena-muted">{d.stake}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <AnimatePresence>
        {creating && (
          <NewDuelModal
            consultants={consultants}
            currentUser={currentUser}
            onClose={() => setCreating(false)}
            onCreate={(payload) => {
              const next = create({ challengerId: currentUser.id, ...payload })
              setSelectedId(next.id)
              setCreating(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Selector row ─────────────────────────────────────────────────────────────

function DuelSelector({ myActive, spectate, byId, consultants, months, selectedId, onSelect, currentUserId }) {
  const renderCard = (d, mine) => {
    const a = byId[d.challengerId]
    const b = byId[d.opponentId]
    const score = scoreDuel(d, consultants, months)
    const active = selectedId === d.id
    return (
      <button
        key={d.id}
        onClick={() => onSelect(d.id)}
        className={[
          'shrink-0 w-[240px] text-left rounded-2xl p-3 transition-colors border',
          active
            ? 'bg-accent-coral/10 border-accent-coral/50 shadow-[0_0_18px_rgba(255,75,75,0.25)]'
            : 'bg-arena-surface border-arena-border hover:border-arena-muted/40',
        ].join(' ')}
      >
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-display font-bold">
          <span className={mine ? 'text-accent-coral' : 'text-arena-muted'}>
            {mine ? 'Yours' : 'Spectate'}
          </span>
          <span className={score.leaderId === currentUserId ? 'text-accent-green' : 'text-arena-muted'}>
            {timeLeft(score.timeLeftMs)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-1">
          <CardAvatar consultant={a} winning={score.leaderId === a.id} />
          <span className="text-arena-muted font-display font-black text-xs">vs</span>
          <CardAvatar consultant={b} winning={score.leaderId === b.id} flip />
        </div>
        <div className="mt-2 text-xs text-arena-muted truncate">
          {DUEL_METRICS.find((m) => m.key === d.metric)?.label}
        </div>
      </button>
    )
  }
  return (
    <section className="space-y-3">
      {myActive.length > 0 && (
        <>
          <h2 className="font-display font-black text-arena-ink text-lg px-1">Your active duels</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {myActive.map((d) => renderCard(d, true))}
          </div>
        </>
      )}
      {spectate.length > 0 && (
        <>
          <h2 className="font-display font-black text-arena-ink text-lg px-1 mt-4 flex items-center gap-2">
            <Eye size={16} className="text-arena-muted" /> Spectator board
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {spectate.map((d) => renderCard(d, false))}
          </div>
        </>
      )}
    </section>
  )
}

function CardAvatar({ consultant, winning, flip }) {
  return (
    <div className={['flex items-center gap-2 min-w-0', flip ? 'flex-row-reverse text-right' : ''].join(' ')}>
      <span
        className="h-9 w-9 rounded-xl grid place-items-center font-display font-black text-xs text-arena-bg shrink-0"
        style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
      >
        {initials(consultant?.name)}
      </span>
      <span className={[
        'text-xs font-display font-bold truncate',
        winning ? 'text-accent-green' : 'text-arena-ink',
      ].join(' ')}>
        {consultant?.name?.split(' ')[0]}
      </span>
    </div>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DuelDetail({ duel, byId, consultants, months, currentUser, onConclude, onCancel, onCheer }) {
  const a = byId[duel.challengerId]
  const b = byId[duel.opponentId]
  const score = scoreDuel(duel, consultants, months)
  const metric = DUEL_METRICS.find((m) => m.key === duel.metric)
  const isMine = duel.challengerId === currentUser.id || duel.opponentId === currentUser.id
  const isCompleted = duel.status === 'completed'
  const finalA = isCompleted ? (duel.scores?.[a.id] ?? score.a) : score.a
  const finalB = isCompleted ? (duel.scores?.[b.id] ?? score.b) : score.b
  const leaderId = isCompleted ? duel.winnerId : score.leaderId
  const history = useMemo(() => leadHistory(duel, finalA, finalB), [duel, finalA, finalB])

  const totalDuration = duel.endsAt - duel.startedAt
  const elapsedFrac = Math.max(0, Math.min(1,
    (Date.now() - duel.startedAt) / Math.max(totalDuration, 1),
  ))

  const cheerTally = tallyCheers(duel)
  const myCheer = duel.cheers?.[currentUser.id]

  return (
    <section className="space-y-4 xl:space-y-6">
      {/* Top bar */}
      <div className="arena-card p-4 md:p-5 flex flex-wrap items-center gap-3">
        <span className={[
          'arena-chip',
          isCompleted ? 'bg-arena-surface2 text-arena-muted' : 'bg-accent-coral/15 text-accent-coral',
        ].join(' ')} style={!isCompleted ? { boxShadow: 'inset 0 0 0 1px rgba(255,75,75,0.4)' } : undefined}>
          {isCompleted ? 'COMPLETED' : 'ACTIVE'}
        </span>
        <span className="arena-chip bg-arena-surface2 text-arena-muted">{metric?.label}</span>
        {!isCompleted && (
          <span className="inline-flex items-center gap-1.5 text-xs text-arena-muted">
            <Clock size={12} /> {timeLeft(score.timeLeftMs)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-arena-muted">
          🎁 {duel.stake}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {isMine && !isCompleted && (
            <>
              <button
                onClick={() => onConclude(duel, leaderId, { [a.id]: finalA, [b.id]: finalB })}
                className="px-3 py-1.5 rounded-full bg-accent-green/15 text-accent-green text-xs font-display font-bold ring-1 ring-inset ring-accent-green/40"
              >
                Call it now
              </button>
              <button
                onClick={() => onCancel(duel)}
                className="px-3 py-1.5 rounded-full bg-arena-surface2 text-arena-muted text-xs font-display font-bold"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Combatant cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 lg:gap-5 items-stretch">
        <CombatantCard
          consultant={a}
          value={formatValue(duel.metric, finalA)}
          winning={leaderId === a.id}
          isCompleted={isCompleted}
          mine={a.id === currentUser.id}
          cheers={cheerTally[a.id] ?? 0}
          metric={duel.metric}
        />
        <div className="lg:flex hidden flex-col items-center justify-center">
          <div className="text-5xl font-display font-black text-arena-muted">vs</div>
        </div>
        <CombatantCard
          consultant={b}
          value={formatValue(duel.metric, finalB)}
          winning={leaderId === b.id}
          isCompleted={isCompleted}
          mine={b.id === currentUser.id}
          cheers={cheerTally[b.id] ?? 0}
          metric={duel.metric}
        />
      </div>

      {/* Margin + progress */}
      <div className="arena-card p-5 space-y-4">
        <MarginBar a={a} b={b} finalA={finalA} finalB={finalB} leaderId={leaderId} metric={duel.metric} />
        <Timeline elapsedFrac={elapsedFrac} startedAt={duel.startedAt} endsAt={duel.endsAt} isCompleted={isCompleted} />
        <LeadSparkline points={history} leaderId={leaderId} aId={a.id} />
      </div>

      {/* Trash talk + cheers */}
      {duel.message && (
        <div className="arena-card p-5 flex gap-3">
          <Quote size={18} className="text-accent-amber shrink-0 mt-0.5" />
          <p className="text-sm text-arena-ink/90 italic">"{duel.message}"</p>
        </div>
      )}

      <CheerPanel
        duel={duel}
        a={a}
        b={b}
        cheerTally={cheerTally}
        myCheer={myCheer}
        canCheer={!isMine && !isCompleted}
        onCheer={onCheer}
      />
    </section>
  )
}

function CombatantCard({ consultant, value, winning, isCompleted, mine, cheers, metric }) {
  const accent = winning ? '#58cc02' : '#a0a0c0'
  const c = consultant
  const lastMonth = c.monthlyStats?.[c.monthlyStats.length - 1]
  const stats = [
    { label: 'Invoice (mo)',  value: formatCurrencyCompact(lastMonth?.invoiceValue ?? 0) },
    { label: 'Ops (mo)',      value: lastMonth?.opsDelivered ?? 0 },
    { label: 'Early %',       value: `${Math.round(lastMonth?.invoiceBeforeDay15Pct ?? 0)}%` },
    { label: 'Avg close',     value: `${(lastMonth?.avgDaysToClose ?? 0).toFixed(1)}d` },
    { label: 'Best streak',   value: `${c.streaks?.bestMonthlyStreak ?? 0} mo` },
    { label: 'Fire (best)',   value: `${c.fire?.best ?? 0}d` },
  ]
  return (
    <motion.div
      layout
      className={[
        'arena-card p-5 md:p-6 relative overflow-hidden',
        winning ? 'border-accent-green/40' : '',
      ].join(' ')}
      style={winning ? { boxShadow: '0 0 28px rgba(88,204,2,0.18)' } : undefined}
    >
      {winning && (
        <span className="absolute top-3 right-3">
          <Crown size={20} className="text-accent-amber animate-pulseRing" />
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className="h-14 w-14 rounded-2xl grid place-items-center font-display font-black text-arena-bg text-lg"
          style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)', boxShadow: '0 0 20px rgba(247,92,3,0.35)' }}
        >
          {initials(c.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display font-black text-arena-ink text-lg leading-tight truncate">
            {mine ? `${c.name.split(' ')[0]} (you)` : c.name}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-arena-muted">{c.role}</span>
            <LocationPill location={c.location} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          {DUEL_METRICS.find((m) => m.key === metric)?.label}
        </div>
        <div
          className="font-display font-black text-4xl md:text-5xl leading-none mt-1"
          style={{ color: accent, textShadow: winning ? `0 0 14px ${accent}55` : undefined }}
        >
          {value}
        </div>
        {isCompleted && winning && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-display font-bold text-accent-amber">
            <Trophy size={12} /> Winner
          </div>
        )}
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <li key={s.label} className="rounded-xl bg-arena-bg/40 border border-arena-border px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">
              {s.label}
            </div>
            <div className="font-display font-bold text-arena-ink text-sm">{s.value}</div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between text-[11px] text-arena-muted">
        <span className="inline-flex items-center gap-1"><Award size={12} className="text-accent-amber" /> {c.badges?.length ?? 0} badges</span>
        <span className="inline-flex items-center gap-1"><Flame size={12} className="text-accent-coral" /> {c.fire?.current ?? 0}-day fire</span>
        <span className="inline-flex items-center gap-1"><Heart size={12} className="text-accent-coral" /> {cheers} cheers</span>
      </div>
    </motion.div>
  )
}

function MarginBar({ a, b, finalA, finalB, leaderId, metric }) {
  const total = (finalA + finalB) || 1
  const aShare = Math.max(0.05, Math.min(0.95, finalA / total))
  const bShare = 1 - aShare
  const leaderName = leaderId
    ? (leaderId === a.id ? a.name.split(' ')[0] : b.name.split(' ')[0])
    : null
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="font-display font-bold text-arena-ink">{a.name.split(' ')[0]}</span>
        <span className="text-arena-muted">
          {leaderName ? `${leaderName} leads by ${formatMargin(metric, finalA - finalB)}` : 'Dead even'}
        </span>
        <span className="font-display font-bold text-arena-ink">{b.name.split(' ')[0]}</span>
      </div>
      <div className="h-3 rounded-full bg-arena-surface2 overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${aShare * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full"
          style={{ background: leaderId === a.id ? '#F75C03' : '#a0a0c0', boxShadow: leaderId === a.id ? '0 0 12px rgba(247,92,3,0.5)' : undefined }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bShare * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full"
          style={{ background: leaderId === b.id ? '#ff4b4b' : '#a0a0c0', boxShadow: leaderId === b.id ? '0 0 12px rgba(255,75,75,0.5)' : undefined }}
        />
      </div>
    </div>
  )
}

function Timeline({ elapsedFrac, startedAt, endsAt, isCompleted }) {
  const fmt = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold mb-1.5">
        <span>{fmt(startedAt)}</span>
        <span>Duel timeline</span>
        <span>{fmt(endsAt)}</span>
      </div>
      <div className="h-2 rounded-full bg-arena-surface2 relative overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(elapsedFrac * 100)}%`,
            background: isCompleted ? '#a0a0c0' : 'linear-gradient(90deg,#F75C03,#ffc800)',
          }}
        />
      </div>
    </div>
  )
}

function LeadSparkline({ points, leaderId, aId }) {
  if (!points?.length) return null
  const W = 600, H = 60, padY = 6
  const max = Math.max(0.001, ...points.map((p) => Math.abs(p)))
  const stepX = W / (points.length - 1)
  // Map points so positive (A leads) goes up, negative (B leads) goes down.
  const yFor = (v) => (H / 2) - (v / max) * (H / 2 - padY)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${yFor(p)}`).join(' ')
  const lastY = yFor(points.at(-1))
  const lastX = (points.length - 1) * stepX
  const leaderColor = leaderId ? (leaderId === aId ? '#F75C03' : '#ff4b4b') : '#a0a0c0'
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold mb-1.5">
        Lead margin · synthetic history
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
        <motion.path
          d={path}
          fill="none"
          stroke={leaderColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <circle cx={lastX} cy={lastY} r={4} fill={leaderColor} stroke="#1a1a2e" strokeWidth={2} />
      </svg>
    </div>
  )
}

function CheerPanel({ duel, a, b, cheerTally, myCheer, canCheer, onCheer }) {
  const totalCheers = (cheerTally[a.id] ?? 0) + (cheerTally[b.id] ?? 0)
  const aShare = totalCheers ? (cheerTally[a.id] ?? 0) / totalCheers : 0.5
  return (
    <div className="arena-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={16} className="text-accent-coral" />
        <h3 className="font-display font-black text-arena-ink">Spectator board</h3>
        <span className="ml-auto text-xs text-arena-muted">{totalCheers} cheers</span>
      </div>
      <div className="h-2 rounded-full bg-arena-surface2 overflow-hidden flex">
        <div className="h-full" style={{ width: `${aShare * 100}%`, background: '#F75C03' }} />
        <div className="h-full" style={{ width: `${(1 - aShare) * 100}%`, background: '#ff4b4b' }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <CheerButton
          name={a.name.split(' ')[0]}
          count={cheerTally[a.id] ?? 0}
          accent="#F75C03"
          active={myCheer === a.id}
          disabled={!canCheer}
          onClick={() => canCheer && onCheer(duel, a.id)}
        />
        <CheerButton
          name={b.name.split(' ')[0]}
          count={cheerTally[b.id] ?? 0}
          accent="#ff4b4b"
          active={myCheer === b.id}
          disabled={!canCheer}
          onClick={() => canCheer && onCheer(duel, b.id)}
        />
      </div>
      {!canCheer && (
        <p className="mt-3 text-[11px] text-arena-muted">
          {duel.status === 'completed'
            ? 'Duel is over — cheering is closed.'
            : 'You\'re in this duel; the crowd picks sides, not the combatants.'}
        </p>
      )}
    </div>
  )
}

function CheerButton({ name, count, accent, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition-colors',
        disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-arena-muted/50',
        active ? 'border-transparent text-arena-bg' : 'border-arena-border bg-arena-bg/40 text-arena-ink',
      ].join(' ')}
      style={active ? { background: accent, boxShadow: `0 0 18px ${accent}66` } : undefined}
    >
      <span className="inline-flex items-center gap-1.5 font-display font-bold">
        <Heart size={13} fill={active ? 'currentColor' : 'none'} strokeWidth={2.4} />
        Cheer for {name}
      </span>
      <span className="font-display font-black">{count}</span>
    </button>
  )
}

// ─── New duel modal ───────────────────────────────────────────────────────────

function NewDuelModal({ consultants, currentUser, onClose, onCreate }) {
  const peers = consultants.filter((c) => c.id !== currentUser.id && c.role === currentUser.role)
  const [opponentId, setOpponentId] = useState(peers[0]?.id ?? '')
  const [metric, setMetric] = useState(DUEL_METRICS[0].key)
  const [duration, setDuration] = useState(DURATION_DAYS[2].key)
  const [stake, setStake] = useState('Loser buys lunch')
  const [message, setMessage] = useState('Bring it.')

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
              value={opponentId} onChange={(e) => setOpponentId(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {peers.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.location}</option>)}
            </select>
          </Field>
          <Field label="Metric">
            <select
              value={metric} onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            >
              {DUEL_METRICS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Duration">
            <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold w-full">
              {DURATION_DAYS.map((d) => (
                <button
                  key={d.key} onClick={() => setDuration(d.key)}
                  className={[
                    'flex-1 px-3 py-1.5 rounded-full transition-colors',
                    duration === d.key ? 'bg-accent-coral text-arena-bg' : 'text-arena-muted hover:text-arena-ink',
                  ].join(' ')}
                >{d.label}</button>
              ))}
            </div>
          </Field>
          <Field label="Stake">
            <input
              value={stake} onChange={(e) => setStake(e.target.value)}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
            />
          </Field>
          <Field label="Trash talk (optional)">
            <textarea
              value={message} onChange={(e) => setMessage(e.target.value)} rows={2}
              className="w-full bg-arena-bg/60 border border-arena-border rounded-xl px-3 py-2 text-sm text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50 resize-none"
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-display font-bold text-arena-muted hover:text-arena-ink">
            Cancel
          </button>
          <button
            onClick={() => onCreate({ opponentId, metric, durationDays: duration, stake, message })}
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
