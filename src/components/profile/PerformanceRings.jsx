import ProgressRing, { pickRingColor } from '../shared/ProgressRing.jsx'
import { formatCurrencyCompact } from '../../utils/formatters.js'

const DEFAULT_TARGETS = {
  opsDelivered: 7,
  invoiceValue: 55000,
  invoiceBeforeDay15Pct: 70,
  avgDaysToClose: 4, // lower is better
}

const TARGET_KEY = {
  opsDelivered: 'ops',
  invoiceValue: 'invoice',
  invoiceBeforeDay15Pct: 'earlyPct',
  avgDaysToClose: 'daysClose',
}

function ringFor(metric, current, comparison, perConsultant) {
  const customKey = TARGET_KEY[metric]
  const target = perConsultant?.[customKey] ?? DEFAULT_TARGETS[metric]
  let ratio = 0
  let comparisonLabel = ''
  if (metric === 'avgDaysToClose') {
    ratio = current === 0 ? 0 : Math.min(1.2, target / current)
    comparisonLabel = `team avg ${comparison.toFixed(1)}d`
  } else if (metric === 'invoiceBeforeDay15Pct') {
    ratio = Math.min(1.2, current / target)
    comparisonLabel = `team avg ${Math.round(comparison)}%`
  } else if (metric === 'invoiceValue') {
    ratio = Math.min(1.2, current / target)
    comparisonLabel = `target ${formatCurrencyCompact(target)}`
  } else {
    ratio = Math.min(1.2, current / target)
    comparisonLabel = `target ${target}`
  }
  return { ratio, color: pickRingColor(ratio), comparisonLabel }
}

const CARDS = [
  { key: 'opsDelivered',          label: 'Ops Delivered',     format: (v) => Math.round(v).toLocaleString('en-GB') },
  { key: 'invoiceValue',          label: 'Invoice Value',     format: (v) => formatCurrencyCompact(v) },
  { key: 'invoiceBeforeDay15Pct', label: 'Early Invoice %',   format: (v) => `${Math.round(v)}%` },
  { key: 'avgDaysToClose',        label: 'Avg Days to Close', format: (v) => `${v.toFixed(1)}d` },
]

export default function PerformanceRings({ currentMonth, teamAverages, targets }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CARDS.map((card) => {
        const value = currentMonth?.[card.key] ?? 0
        const compare = teamAverages?.[card.key] ?? 0
        const { ratio, color, comparisonLabel } = ringFor(card.key, value, compare, targets)
        return (
          <div key={card.key} className="arena-card p-3 sm:p-4 flex flex-col items-center text-center min-w-0">
            <ProgressRing
              ratio={ratio}
              size={88}
              stroke={8}
              color={color}
              className="md:hidden"
            >
              <div className="text-center px-1">
                <div className="font-display font-black text-arena-ink text-sm leading-none truncate max-w-[64px] mx-auto">
                  {card.format(value)}
                </div>
                <div className="text-[9px] uppercase tracking-[0.14em] text-arena-muted mt-1">
                  {Math.round(ratio * 100)}%
                </div>
              </div>
            </ProgressRing>
            <ProgressRing
              ratio={ratio}
              size={108}
              stroke={9}
              color={color}
              className="hidden md:grid"
            >
              <div className="text-center px-1">
                <div className="font-display font-black text-arena-ink text-base md:text-lg leading-none">
                  {card.format(value)}
                </div>
                <div className="text-[9px] uppercase tracking-[0.16em] text-arena-muted mt-1">
                  {Math.round(ratio * 100)}%
                </div>
              </div>
            </ProgressRing>
            <div className="mt-3 font-display font-bold text-arena-ink text-xs sm:text-sm truncate w-full">{card.label}</div>
            <div className="text-[11px] text-arena-muted mt-0.5 truncate w-full">{comparisonLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
