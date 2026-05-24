// Aggregates monthly stats into a leaderboard row, ranks, and computes trends.

export const SORT_OPTIONS = [
  { key: 'invoiceValue',          label: 'Invoice Value',     direction: 'desc' },
  { key: 'opsDelivered',          label: 'Ops Delivered',     direction: 'desc' },
  { key: 'invoiceBeforeDay15Pct', label: 'Early Invoice %',   direction: 'desc' },
  { key: 'avgDaysToClose',        label: 'Avg Days to Close', direction: 'asc'  },
]

export const PERIODS = [
  { key: 'month',   label: 'This Month',   monthsBack: 1 },
  { key: 'quarter', label: 'This Quarter', monthsBack: 3 },
  { key: 'all',     label: 'All Time',     monthsBack: Infinity },
]

export const LOCATIONS = ['All', 'London', 'Casablanca', 'Dublin', 'Glasgow', 'Bristol']

// Returns the slice of months (sorted ascending) used for a given period.
export function getPeriodMonths(allMonthsSorted, periodKey) {
  if (periodKey === 'all') return allMonthsSorted
  if (periodKey === 'quarter') return allMonthsSorted.slice(-3)
  return allMonthsSorted.slice(-1) // 'month'
}

// Returns the previous comparable slice (same length immediately before).
export function getPrevPeriodMonths(allMonthsSorted, periodKey) {
  if (periodKey === 'all') return []
  const len = periodKey === 'quarter' ? 3 : 1
  const end = allMonthsSorted.length - len
  return allMonthsSorted.slice(Math.max(0, end - len), end)
}

function pickMonths(stats, monthKeys) {
  const set = new Set(monthKeys)
  return stats.filter((m) => set.has(m.month))
}

// Mean (for percentages, days-to-close); ignores empty months.
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const sum = (xs) => xs.reduce((a, b) => a + b, 0)

export function aggregate(consultant, monthKeys) {
  const slice = pickMonths(consultant.monthlyStats, monthKeys)
  return {
    opsDelivered:          sum(slice.map((m) => m.opsDelivered)),
    invoiceValue:          sum(slice.map((m) => m.invoiceValue)),
    invoiceBeforeDay15Pct: avg(slice.map((m) => m.invoiceBeforeDay15Pct)),
    avgDaysToClose:        avg(slice.map((m) => m.avgDaysToClose)),
  }
}

// Trend direction by comparing current vs previous period aggregate for one metric.
// `betterWhenLower` flips sense for days-to-close.
export function trendFor(curr, prev, metricKey) {
  const betterWhenLower = metricKey === 'avgDaysToClose'
  const c = curr[metricKey] ?? 0
  const p = prev[metricKey] ?? 0
  if (p === 0 && c === 0) return 'flat'
  const delta = c - p
  if (Math.abs(delta) < 1e-9) return 'flat'
  const positive = betterWhenLower ? delta < 0 : delta > 0
  return positive ? 'up' : 'down'
}

// Build the full leaderboard for a given role / location / period / sortKey.
export function buildLeaderboard({
  consultants,
  months,
  role,
  location,
  periodKey,
  sortKey,
}) {
  const sorted = [...months].sort()
  const currentMonths = getPeriodMonths(sorted, periodKey)
  const prevMonths = getPrevPeriodMonths(sorted, periodKey)

  const pool = consultants.filter(
    (c) => c.role === role && (location === 'All' || c.location === location),
  )

  const rows = pool.map((c) => {
    const current = aggregate(c, currentMonths)
    const previous = aggregate(c, prevMonths)
    const sparkline = sorted.map((m) => {
      const stat = c.monthlyStats.find((s) => s.month === m)
      return stat ? stat[sortKey] ?? 0 : 0
    })
    return {
      consultant: c,
      metrics: current,
      previous,
      sparkline,
      trend: trendFor(current, previous, sortKey),
    }
  })

  const sortConfig = SORT_OPTIONS.find((s) => s.key === sortKey) ?? SORT_OPTIONS[0]
  const dir = sortConfig.direction === 'asc' ? 1 : -1
  rows.sort((a, b) => dir * ((a.metrics[sortKey] ?? 0) - (b.metrics[sortKey] ?? 0)))

  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

// Team-wide totals/averages for the metric cards.
export function teamTotals(rows) {
  if (!rows.length) {
    return { opsDelivered: 0, invoiceValue: 0, invoiceBeforeDay15Pct: 0, avgDaysToClose: 0 }
  }
  const ops = sum(rows.map((r) => r.metrics.opsDelivered))
  const inv = sum(rows.map((r) => r.metrics.invoiceValue))
  const front = avg(rows.map((r) => r.metrics.invoiceBeforeDay15Pct))
  const close = avg(rows.map((r) => r.metrics.avgDaysToClose))
  return { opsDelivered: ops, invoiceValue: inv, invoiceBeforeDay15Pct: front, avgDaysToClose: close }
}

export function formatMetric(value, metricKey) {
  switch (metricKey) {
    case 'invoiceValue':          return value
    case 'opsDelivered':          return value
    case 'invoiceBeforeDay15Pct': return value
    case 'avgDaysToClose':        return value
    default: return value
  }
}
