import { Flame } from 'lucide-react'

// GitHub-style 30-day grid showing which days had a fire (≥1 claim advanced
// a stage). 6 columns × 5 rows = 30 cells; today is bottom-right.

const COLS = 10
const ROWS = 3
const CELL = 18

function dayLabel(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function ActivityHeatmap({ log = [], todayIso }) {
  const today = todayIso ? new Date(todayIso) : new Date()
  const slice = log.slice(-COLS * ROWS)
  const lit = slice.filter(Boolean).length
  const pct = slice.length ? Math.round((lit / slice.length) * 100) : 0

  return (
    <div className="arena-card p-5">
      <header className="flex items-center gap-2 mb-3">
        <Flame size={18} className="text-accent-coral animate-flame" />
        <h3 className="font-display font-black text-arena-ink">Daily fire · last 30 days</h3>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
          <span className="text-arena-muted">{lit}/{slice.length} fire days ·</span>
          <span className="font-display font-bold text-accent-coral">{pct}%</span>
        </span>
      </header>

      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)` }}>
        {slice.map((v, i) => {
          const daysAgo = slice.length - 1 - i
          const date = new Date(today)
          date.setDate(date.getDate() - daysAgo)
          const isToday = daysAgo === 0
          const lit = v === 1
          return (
            <span
              key={i}
              title={`${dayLabel(date)} · ${lit ? 'fire' : 'no advance'}`}
              className={[
                'rounded-md transition-transform',
                isToday ? 'ring-2 ring-accent-coral ring-offset-2 ring-offset-arena-surface scale-105' : '',
              ].join(' ')}
              style={{
                width: CELL, height: CELL,
                background: lit ? '#F75C03' : 'rgb(var(--arena-surface2-rgb))',
                boxShadow: lit ? '0 0 8px rgba(247,92,3,0.55)' : undefined,
              }}
            />
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
        <span>30 days ago</span>
        <span className="text-arena-ink">today →</span>
      </div>
    </div>
  )
}
