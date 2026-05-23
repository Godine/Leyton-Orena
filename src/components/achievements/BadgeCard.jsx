import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import UnlockAnimation from './UnlockAnimation.jsx'
import { RARITY_STYLES } from '../../data/badges.js'

const RARITY_GLOW = {
  common:    '0 0 0 1px rgba(142,142,160,0.25)',
  rare:      '0 0 0 1px rgba(28,176,246,0.35), 0 0 24px rgba(28,176,246,0.18)',
  epic:      '0 0 0 1px rgba(206,130,255,0.45), 0 0 28px rgba(206,130,255,0.22)',
  legendary: '0 0 0 1px rgba(255,200,0,0.55), 0 0 36px rgba(255,200,0,0.28)',
}

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800',
}

const RARITY_HOVER_FX = {
  common: '',
  rare: 'group-hover:shadow-[0_0_28px_rgba(28,176,246,0.35)]',
  epic: 'animate-pulseRing',
  legendary: 'group-hover:animate-pulseRing',
}

export default function BadgeCard({
  badge,
  earned,
  earnedAt,
  playUnlock = false,
  onClick,
  onUnlockSeen,
}) {
  const rarity = RARITY_STYLES[badge.rarity]
  const hex = RARITY_HEX[badge.rarity]

  // Locked → unlocked transition state: when `playUnlock` is true we hold a
  // grey/locked look for 0.5s, then "burst" into full colour.
  const [revealed, setRevealed] = useState(!playUnlock)

  useEffect(() => {
    if (!playUnlock) return
    const t = setTimeout(() => {
      setRevealed(true)
      onUnlockSeen?.()
    }, 500)
    return () => clearTimeout(t)
  }, [playUnlock, onUnlockSeen])

  const showAsEarned = earned && revealed
  const showAsLocked = !showAsEarned

  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="group relative text-left w-full"
    >
      <div
        className={[
          'relative h-full flex flex-col items-center text-center gap-2',
          'rounded-2xl p-4 md:p-5 border border-arena-border',
          'bg-gradient-to-b from-arena-card to-arena-surface',
          'transition-all duration-300',
          RARITY_HOVER_FX[badge.rarity],
        ].join(' ')}
        style={{ boxShadow: showAsEarned ? RARITY_GLOW[badge.rarity] : RARITY_GLOW.common }}
      >
        {/* legendary shimmer */}
        {badge.rarity === 'legendary' && showAsEarned && (
          <span className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
            <span className="absolute -inset-x-1/3 top-0 h-full -skew-x-12 bg-gradient-to-r from-transparent via-amber-200/15 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.4s_ease-in-out]" />
          </span>
        )}

        <div
          className={[
            'relative h-16 w-16 rounded-2xl grid place-items-center text-4xl',
            'transition-all duration-300',
            showAsEarned ? 'scale-100' : 'grayscale opacity-40 scale-95',
          ].join(' ')}
          style={{
            background: showAsEarned ? `radial-gradient(circle at 30% 30%, ${hex}33, transparent 70%)` : 'rgba(255,255,255,0.02)',
          }}
        >
          <span>{badge.icon}</span>

          {showAsEarned && (
            <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent-green grid place-items-center border-2 border-arena-card shadow-glow">
              <Check size={12} className="text-arena-bg" strokeWidth={3.5} />
            </span>
          )}
          {showAsLocked && (
            <span className="absolute inset-0 rounded-2xl grid place-items-center bg-arena-bg/40">
              <Lock size={18} className="text-arena-muted" strokeWidth={2.4} />
            </span>
          )}
        </div>

        <div
          className={[
            'font-display font-black text-base leading-tight',
            showAsEarned ? 'text-arena-ink' : 'text-arena-muted',
          ].join(' ')}
        >
          {badge.name}
        </div>

        <div className="text-[11px] text-arena-muted leading-snug min-h-[2.5rem]">
          {badge.description}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span
            className="arena-chip"
            style={{ background: `${hex}22`, color: hex, boxShadow: `inset 0 0 0 1px ${hex}55` }}
          >
            {rarity.label}
          </span>
          {showAsEarned && earnedAt && (
            <span className="text-[10px] text-arena-muted">{formatEarned(earnedAt)}</span>
          )}
        </div>

        {playUnlock && <UnlockAnimation color={hex} />}
      </div>
    </motion.button>
  )
}

function formatEarned(monthIso) {
  // monthIso is "YYYY-MM"
  const [y, m] = monthIso.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
