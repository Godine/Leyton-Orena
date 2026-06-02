import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Flame, Quote } from 'lucide-react'

// Build a newest-first array of `days` entries covering the last N days of
// the fire log, with each consultant claim move grouped under its date.
function buildBreakdown(log = [], moves = [], todayIso, days = 14) {
  const today = todayIso ? new Date(todayIso) : new Date()
  // Group moves by ISO date for quick lookup.
  const byDate = moves.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = []
    acc[m.date].push(m)
    return acc
  }, {})
  const out = []
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const iso = date.toISOString().slice(0, 10)
    const logIdx = log.length - 1 - i
    const lit = logIdx >= 0 ? log[logIdx] === 1 : false
    out.push({ iso, date, lit, moves: byDate[iso] ?? [], isToday: i === 0 })
  }
  return out
}

function dayLabel(date, isToday) {
  if (isToday) return 'Today'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function FireStreakDetailModal({
  open,
  onClose,
  log = [],
  moves = [],
  todayIso,
  current = 0,
  best = 0,
}) {
  const days = useMemo(
    () => buildBreakdown(log, moves, todayIso, 14),
    [log, moves, todayIso],
  )
  const litCount = days.filter((d) => d.lit).length
  const totalMoves = days.reduce((a, d) => a + d.moves.length, 0)

  return (
    <AnimatePresence>
      {open && (
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
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-full md:max-w-xl bg-arena-surface border border-arena-border rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div
              className="relative px-6 pt-7 pb-5"
              style={{
                background:
                  'radial-gradient(circle at 0% 0%, rgba(247,92,3,0.22), transparent 55%), linear-gradient(180deg, rgb(var(--arena-surface-rgb)), rgb(var(--arena-bg-rgb)))',
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-2xl grid place-items-center bg-arena-bg/60 border border-arena-border">
                  <Flame
                    size={26}
                    fill="currentColor"
                    strokeWidth={1.5}
                    className="text-accent-coral animate-flame"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255,75,75,0.55))' }}
                  />
                </span>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
                    Daily fire · last 14 days
                  </div>
                  <h2 className="font-display font-black text-arena-ink text-xl mt-0.5">
                    {current}-day streak · best {best}
                  </h2>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="arena-chip bg-accent-coral/15 text-accent-coral" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,75,75,0.4)' }}>
                  {litCount} / 14 fire days
                </span>
                <span className="arena-chip bg-arena-surface2 text-arena-muted">
                  {totalMoves} stage moves
                </span>
              </div>
            </div>

            {/* Day list */}
            <ol className="max-h-[55vh] overflow-y-auto divide-y divide-arena-border">
              {days.map((d) => (
                <li key={d.iso} className={d.isToday ? 'bg-accent-coral/[0.06]' : ''}>
                  <div className="px-5 py-3 flex items-start gap-3">
                    {/* Date pill */}
                    <div className="w-20 shrink-0">
                      <div className={[
                        'text-xs font-display font-bold',
                        d.isToday ? 'text-accent-coral' : 'text-arena-ink',
                      ].join(' ')}>
                        {dayLabel(d.date, d.isToday)}
                      </div>
                      <div className="text-[10px] text-arena-muted">
                        {d.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>

                    {/* Fire indicator */}
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      {d.lit ? (
                        <Flame
                          size={18}
                          className="text-accent-coral"
                          fill="currentColor"
                          strokeWidth={1.5}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(255,75,75,0.5))' }}
                        />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-arena-border bg-arena-surface2" />
                      )}
                    </div>

                    {/* Moves */}
                    <div className="flex-1 min-w-0">
                      {d.moves.length === 0 ? (
                        <p className={[
                          'text-xs italic',
                          d.lit ? 'text-arena-muted' : 'text-arena-muted/70',
                        ].join(' ')}>
                          {d.lit
                            ? 'Fire was lit but no specific moves recorded.'
                            : 'No claims advanced.'}
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {d.moves.map((m, mi) => (
                            <li
                              key={mi}
                              className="flex items-center gap-2 text-xs rounded-lg bg-arena-bg/40 border border-arena-border px-2.5 py-1.5"
                            >
                              <span className="font-display font-bold text-arena-ink truncate flex-1 min-w-0">
                                {m.client}
                              </span>
                              <span className="text-arena-muted text-[11px] truncate hidden sm:inline">
                                {m.fromStage}
                              </span>
                              <span className="text-accent-coral font-display font-black text-[11px]">→</span>
                              <span className="text-accent-coral font-display font-bold text-[11px] truncate">
                                {m.toStage}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {/* Footer coaching */}
            <div className="px-6 py-4 border-t border-arena-border flex items-start gap-2 bg-arena-bg/40">
              <Quote size={14} className="text-accent-amber shrink-0 mt-0.5" />
              <p className="text-[11px] text-arena-muted leading-snug">
                Each day's fire is lit by advancing at least one claim by one
                workflow stage. Miss a day and the streak resets — keep moving.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
