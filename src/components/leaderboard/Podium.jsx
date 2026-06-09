import { motion } from 'framer-motion'
import { Crown, Award, ArrowUp, ArrowDown, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useArenaStore } from '../../store/useArenaStore.js'
import SparkLine from './SparkLine.jsx'
import LocationPill from '../shared/LocationPill.jsx'
import AnimatedCounter from '../shared/AnimatedCounter.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

const MEDALS = {
  1: { emoji: '🥇', ring: 'ring-amber-300/70',  glow: 'shadow-[0_0_30px_rgba(255,200,0,0.35)]', label: 'text-amber-300',  bg: 'bg-gradient-to-b from-amber-300/15 to-transparent' },
  2: { emoji: '🥈', ring: 'ring-slate-300/60',  glow: 'shadow-[0_0_20px_rgba(200,200,220,0.25)]', label: 'text-slate-300', bg: 'bg-gradient-to-b from-slate-300/10 to-transparent' },
  3: { emoji: '🥉', ring: 'ring-orange-400/60', glow: 'shadow-[0_0_20px_rgba(217,119,6,0.28)]',   label: 'text-orange-300', bg: 'bg-gradient-to-b from-orange-400/10 to-transparent' },
}

function formatPrimary(value, key) {
  if (key === 'invoiceValue') return formatCurrencyCompact(value)
  if (key === 'invoiceBeforeDay15Pct') return `${Math.round(value)}%`
  if (key === 'avgDaysToClose') return `${value.toFixed(1)}d`
  return Math.round(value).toLocaleString('en-GB')
}

function PodiumCard({ row, rank, sortKey, height, delay, priorRank, onPick }) {
  const medal = MEDALS[rank]
  const isFirst = rank === 1
  const delta = priorRank ? priorRank - rank : 0
  const fireBest = row.consultant.fire?.best ?? 0
  const badgeCount = row.consultant.badges?.length ?? 0
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 18 }}
      onClick={() => onPick?.(row.consultant.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick?.(row.consultant.id) }
      }}
      className={[
        'relative flex flex-col items-center text-center px-4 pt-8 pb-5 rounded-3xl cursor-pointer',
        'bg-arena-surface border border-arena-border ring-2 transition-transform',
        'hover:-translate-y-0.5',
        medal.ring, medal.glow, medal.bg,
        isFirst ? 'md:scale-[1.06] md:-mt-4 z-10' : '',
      ].join(' ')}
      style={{ minHeight: height }}
    >
      {/* Position delta chip — top-right corner */}
      {delta !== 0 && (
        <span className={[
          'absolute top-3 right-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-display font-black',
          delta > 0 ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-coral/15 text-accent-coral',
        ].join(' ')}>
          {delta > 0
            ? <><ArrowUp size={9} strokeWidth={3} /> {delta}</>
            : <><ArrowDown size={9} strokeWidth={3} /> {Math.abs(delta)}</>}
        </span>
      )}
      {isFirst && (
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="absolute -top-5"
        >
          <Crown className="text-arena-amber animate-pulseRing" size={28} strokeWidth={2.4} />
        </motion.div>
      )}

      <div className="text-3xl md:text-4xl mb-1">{medal.emoji}</div>
      <div className={['text-[10px] uppercase tracking-[0.2em] font-display font-black', medal.label].join(' ')}>
        Rank {rank}
      </div>

      <div className="mt-3 font-display font-black text-arena-ink text-base md:text-lg leading-tight">
        {row.consultant.name}
      </div>

      <div className="mt-1.5">
        <LocationPill location={row.consultant.location} />
      </div>

      <div className={['mt-4 font-display font-black', isFirst ? 'text-3xl' : 'text-2xl', medal.label].join(' ')}>
        <AnimatedCounter
          value={row.metrics[sortKey] ?? 0}
          format={(v) => formatPrimary(v, sortKey)}
        />
      </div>

      <div className="mt-3 opacity-90">
        <SparkLine
          values={row.sparkline}
          width={isFirst ? 110 : 90}
          height={isFirst ? 28 : 24}
          stroke={isFirst ? '#ffc800' : '#F75C03'}
          fill={isFirst ? 'rgba(255,200,0,0.18)' : 'rgba(247, 92, 3,0.15)'}
        />
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-arena-muted">last 6 months</div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-arena-muted">
        <span className="inline-flex items-center gap-1"><Award size={11} className="text-accent-amber" />{badgeCount}</span>
        <span className="inline-flex items-center gap-1"><Flame size={11} className="text-accent-coral" />{fireBest}d best</span>
      </div>
    </motion.div>
  )
}

export default function Podium({ rows, sortKey, priorRanks = {} }) {
  const navigate = useNavigate()
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)
  const onPick = (id) => { setCurrentUserId(id); navigate('/profile') }

  if (rows.length === 0) return null
  const first = rows[0]
  const second = rows[1]
  const third = rows[2]

  // Desktop renders 2nd · 1st · 3rd (1st elevated in the middle).
  // Mobile stacks 1st · 2nd · 3rd (first place on top), driven by `order-*`.
  const slots = [
    { row: second, rank: 2, height: 240, delay: 0.15, order: 'order-2 md:order-1' },
    { row: first,  rank: 1, height: 280, delay: 0.0,  order: 'order-1 md:order-2' },
    { row: third,  rank: 3, height: 230, delay: 0.25, order: 'order-3 md:order-3' },
  ].filter((s) => s.row)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
      {slots.map((s) => (
        <div key={s.row.consultant.id} className={s.order}>
          <PodiumCard
            {...s}
            sortKey={sortKey}
            priorRank={priorRanks[s.row.consultant.id]}
            onPick={onPick}
          />
        </div>
      ))}
    </div>
  )
}
