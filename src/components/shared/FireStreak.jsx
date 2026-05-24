import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

// Visual representation of a consultant's daily fire streak. The flame size,
// color, and glow intensity all scale with the current streak so a 1-day fire
// reads completely differently from a 14-day inferno.
//
// `current` — days in a row with ≥1 claim advanced by a stage
// `best`    — lifetime best streak (in days)
// `log`     — array of 0/1 for the last N days (oldest → today)
// `variant` — 'hero' for the Home dashboard, 'mini' for the Profile sidebar

const TIERS = [
  { min: 0,  size: 44, glow: 0,    color: '#a0a0c0', label: 'Dormant',   helper: 'Light it up — advance one claim today.' },
  { min: 1,  size: 52, glow: 0.25, color: '#ff8a3d', label: 'Spark',     helper: 'Keep moving claims to keep it alive.' },
  { min: 3,  size: 64, glow: 0.45, color: '#ff4b4b', label: 'Warming up', helper: 'You\'re on it. One stage a day.' },
  { min: 7,  size: 76, glow: 0.65, color: '#ff7a00', label: 'Hot streak', helper: 'A full week — don\'t blink.' },
  { min: 14, size: 92, glow: 0.85, color: '#ffc800', label: 'Inferno',    helper: 'Two weeks running. Legend status.' },
  { min: 21, size: 104, glow: 1.0, color: '#ffe06b', label: 'Supernova',  helper: 'Untouchable.' },
]

function tierFor(current) {
  let t = TIERS[0]
  for (const tier of TIERS) if (current >= tier.min) t = tier
  return t
}

export default function FireStreak({
  current = 0,
  best = 0,
  log = [],
  variant = 'hero',
}) {
  const tier = tierFor(current)
  const dotsCount = variant === 'hero' ? 14 : 10
  const dots = log.slice(-dotsCount)
  const isPersonalBest = current > 0 && current >= best
  const hero = variant === 'hero'

  return (
    <section
      className={[
        'relative arena-card overflow-hidden',
        hero ? 'p-5 md:p-6' : 'p-4',
      ].join(' ')}
      style={{
        background:
          current > 0
            ? `radial-gradient(circle at 0% 0%, ${tier.color}26, transparent 60%), linear-gradient(180deg, var(--arena-surface), var(--arena-bg))`
            : undefined,
      }}
    >
      <div className="flex items-center gap-4 md:gap-5">
        {/* Flame */}
        <div
          className="relative shrink-0 grid place-items-center"
          style={{ width: tier.size, height: tier.size }}
        >
          {current > 0 && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ boxShadow: `0 0 ${20 + tier.glow * 50}px ${tier.color}` }}
            />
          )}
          <Flame
            size={tier.size}
            fill="currentColor"
            strokeWidth={1.4}
            className={current > 0 ? 'animate-flame' : ''}
            style={{
              color: tier.color,
              filter:
                current > 0
                  ? `drop-shadow(0 0 ${10 + tier.glow * 18}px ${tier.color})`
                  : undefined,
              opacity: current > 0 ? 1 : 0.5,
            }}
          />
        </div>

        {/* Numbers */}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
            Daily fire · {tier.label}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={[
                'font-display font-black leading-none',
                hero ? 'text-4xl md:text-5xl' : 'text-3xl',
              ].join(' ')}
              style={{ color: current > 0 ? tier.color : 'var(--arena-muted)', textShadow: current > 7 ? `0 0 14px ${tier.color}88` : undefined }}
            >
              {current}
            </span>
            <span className="text-arena-muted font-display font-bold text-sm">
              day{current === 1 ? '' : 's'}
            </span>
            {isPersonalBest && (
              <span
                className="ml-auto arena-chip text-[9px]"
                style={{ background: `${tier.color}22`, color: tier.color, boxShadow: `inset 0 0 0 1px ${tier.color}55` }}
              >
                ★ Personal best
              </span>
            )}
          </div>
          <div className="mt-1.5 text-xs text-arena-muted truncate">
            {tier.helper} <span className="opacity-70">· best {best} days</span>
          </div>
        </div>
      </div>

      {/* Last-N-day dots */}
      {dots.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold mb-1.5">
            <span>Last {dots.length} days</span>
            <span>today →</span>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${dots.length}, minmax(0, 1fr))` }}>
            {dots.map((v, i) => {
              const isToday = i === dots.length - 1
              const lit = v === 1
              return (
                <span
                  key={i}
                  title={lit ? 'Stage advanced' : 'No advance'}
                  className={[
                    'h-2.5 rounded-full transition-all',
                    isToday && lit ? 'ring-2 ring-offset-2 ring-offset-arena-surface' : '',
                  ].join(' ')}
                  style={{
                    background: lit ? tier.color : 'var(--arena-surface-2)',
                    boxShadow: lit ? `0 0 6px ${tier.color}88` : undefined,
                    ...(isToday && lit ? { boxShadow: `0 0 10px ${tier.color}` } : {}),
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
