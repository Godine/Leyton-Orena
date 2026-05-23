import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Lock, Sparkles } from 'lucide-react'
import { RARITY_STYLES } from '../../data/badges.js'
import { badgeProgress } from '../../utils/badgeEligibility.js'
import LocationPill from '../shared/LocationPill.jsx'

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800',
}

export default function BadgeDetailModal({
  badge,
  open,
  onClose,
  currentUser,
  holders, // array of consultants who have this badge
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && badge && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end md:place-items-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-full md:max-w-lg bg-arena-surface border border-arena-border rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
          >
            <Body badge={badge} currentUser={currentUser} holders={holders} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Body({ badge, currentUser, holders, onClose }) {
  const hex = RARITY_HEX[badge.rarity]
  const rarity = RARITY_STYLES[badge.rarity]
  const earnedAt = currentUser?.badgeEarnedAt?.[badge.id]
  const earned = Boolean(earnedAt)
  const progress = !earned ? badgeProgress(currentUser, badge.id) : null

  return (
    <>
      <div
        className="relative px-6 pt-8 pb-6 text-center"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${hex}33, transparent 70%)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div
          className="mx-auto h-24 w-24 rounded-3xl grid place-items-center text-6xl"
          style={{ background: `radial-gradient(circle at 30% 30%, ${hex}33, transparent 70%)`, boxShadow: `0 0 36px ${hex}44` }}
        >
          {badge.icon}
        </div>

        <div className="mt-4">
          <span
            className="arena-chip"
            style={{ background: `${hex}22`, color: hex, boxShadow: `inset 0 0 0 1px ${hex}55` }}
          >
            {rarity.label}
          </span>
        </div>

        <h2 className="mt-3 text-2xl font-display font-black text-arena-ink">{badge.name}</h2>
        <p className="mt-1 text-arena-muted">{badge.description}</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-2">
            How to earn it
          </h3>
          <p className="text-sm text-arena-ink/90">{badge.criteria}</p>
        </section>

        {earned && (
          <section
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: `${hex}15`, boxShadow: `inset 0 0 0 1px ${hex}55` }}
          >
            <span className="h-9 w-9 rounded-full grid place-items-center" style={{ background: hex }}>
              <Check size={18} className="text-arena-bg" strokeWidth={3.5} />
            </span>
            <div>
              <div className="font-display font-black text-arena-ink">You earned this badge!</div>
              <div className="text-xs text-arena-muted">Unlocked {formatMonth(earnedAt)}</div>
            </div>
          </section>
        )}

        {!earned && progress && (
          <section className="rounded-2xl p-4 bg-arena-bg/50 border border-arena-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-accent-amber" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
                Your progress
              </span>
            </div>
            <div className="h-2 rounded-full bg-arena-surface2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(progress.ratio * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: hex, boxShadow: `0 0 10px ${hex}88` }}
              />
            </div>
            <div className="mt-2 text-xs text-arena-muted">
              {progress.value}{progress.unit ? ` ${progress.unit}` : ''}
              {' · '}
              target {progress.target}{progress.unit ? ` ${progress.unit}` : ''}
            </div>
          </section>
        )}

        {!earned && !progress && (
          <section className="rounded-2xl p-4 bg-arena-bg/50 border border-arena-border flex items-center gap-3">
            <Lock size={16} className="text-arena-muted" />
            <span className="text-sm text-arena-muted">
              Progress isn't tracked for this badge yet — keep at it.
            </span>
          </section>
        )}

        <section>
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-3">
            Earned by {holders.length} consultant{holders.length === 1 ? '' : 's'}
          </h3>
          {holders.length === 0 ? (
            <p className="text-sm text-arena-muted italic">No one's claimed this one yet — be the first.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {holders.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 bg-arena-surface2/70 border border-arena-border rounded-full pl-1 pr-3 py-1"
                >
                  <Avatar name={c.name} hex={hex} />
                  <span className="text-xs font-display font-bold text-arena-ink">{c.name}</span>
                  <LocationPill location={c.location} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}

function Avatar({ name, hex }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <span
      className="h-7 w-7 rounded-full grid place-items-center text-[10px] font-display font-black text-arena-bg"
      style={{ background: hex }}
    >
      {initials}
    </span>
  )
}

function formatMonth(monthIso) {
  if (!monthIso) return ''
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  })
}
