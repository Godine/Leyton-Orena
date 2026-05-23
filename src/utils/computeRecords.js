// Derives the all-time records ("Hall of Fame") from the consultants dataset.
// Each record returns: { id, title, category, icon, holderId, value, month, unit,
// format, runnerUp, threatRatio } so the UI can render holder + "under threat".

const MONTHLY_INVOICE_TARGET = 55000

const fmt = {
  currency: (v) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
    }).format(v),
  currencyCompact: (v) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP', maximumFractionDigits: 1, notation: 'compact',
    }).format(v),
  pct: (v) => `${(v ?? 0).toFixed(0)}%`,
  days: (v) => `${(v ?? 0).toFixed(1)} days`,
  int: (v) => Math.round(v ?? 0).toLocaleString('en-GB'),
  months: (v) => `${Math.round(v ?? 0)} mo`,
}

function quarters(months) {
  // 6 months → two non-overlapping quarters: [m0..m2], [m3..m5]
  const sorted = [...months].sort()
  return [sorted.slice(0, 3), sorted.slice(3, 6)].filter((q) => q.length === 3)
}

function quarterLabel(qMonths) {
  // produce "Q1 2025" style label from the *last* month of the quarter
  const last = qMonths.at(-1)
  if (!last) return ''
  const [y, m] = last.split('-')
  const q = Math.ceil(Number(m) / 3)
  return `Q${q} ${y}`
}

function statsByMonth(consultant) {
  return new Map(consultant.monthlyStats.map((s) => [s.month, s]))
}

function bestPerConsultantMonth(consultants, picker) {
  // Returns sorted list of { consultantId, month, value } (desc)
  const rows = []
  for (const c of consultants) {
    for (const s of c.monthlyStats) {
      const v = picker(s, c)
      if (v == null || Number.isNaN(v)) continue
      rows.push({ consultantId: c.id, month: s.month, value: v })
    }
  }
  return rows
}

function bestPerConsultantQuarter(consultants, allMonths, fn) {
  // fn takes the 3-month slice of stats and returns a value (or null)
  const qs = quarters(allMonths)
  const rows = []
  for (const c of consultants) {
    const byMonth = statsByMonth(c)
    for (const q of qs) {
      const slice = q.map((m) => byMonth.get(m)).filter(Boolean)
      if (slice.length < q.length) continue
      const v = fn(slice, c)
      if (v == null || Number.isNaN(v)) continue
      rows.push({ consultantId: c.id, month: q.at(-1), label: quarterLabel(q), value: v })
    }
  }
  return rows
}

function longestRun(values, predicate) {
  let best = 0, run = 0
  for (const v of values) {
    if (predicate(v)) { run += 1; best = Math.max(best, run) } else { run = 0 }
  }
  return best
}

function topRecord(rows, { direction = 'desc' } = {}) {
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => direction === 'desc' ? b.value - a.value : a.value - b.value)
  return sorted
}

function makeRecord({ id, title, category, icon, unit, format, sortedRows, betterWhenLower = false }) {
  if (!sortedRows || sortedRows.length === 0) return null
  const holder = sortedRows[0]
  // find the closest *different consultant* runner-up
  const runnerUp = sortedRows.slice(1).find((r) => r.consultantId !== holder.consultantId) ?? null

  // threat ratio = how close runner-up is to the holder (1 == tied / beating).
  let threatRatio = 0
  if (runnerUp) {
    if (betterWhenLower) {
      // smaller is better → ratio = holder.value / runnerUp.value
      threatRatio = holder.value === 0 ? 0 : holder.value / Math.max(runnerUp.value, 1e-9)
    } else {
      threatRatio = holder.value === 0 ? 0 : runnerUp.value / holder.value
    }
  }

  return {
    id,
    title,
    category,
    icon,
    unit,
    format,
    holderId: holder.consultantId,
    value: holder.value,
    month: holder.month,
    monthLabel: holder.label, // present for quarter rows
    runnerUp,
    threatRatio,
    betterWhenLower,
  }
}

export const RECORD_CATEGORIES = [
  { key: 'invoice',    label: 'Invoice'    },
  { key: 'delivery',   label: 'Delivery'   },
  { key: 'efficiency', label: 'Efficiency' },
  { key: 'streaks',    label: 'Streaks'    },
]

export function computeRecords(consultants, allMonths) {
  const records = []

  // 1. Highest single-month invoice
  records.push(makeRecord({
    id: 'highest-monthly-invoice',
    title: 'Highest Single-Month Invoice',
    category: 'invoice', icon: '💰',
    unit: '£', format: fmt.currency,
    sortedRows: topRecord(bestPerConsultantMonth(consultants, (s) => s.invoiceValue)),
  }))

  // 2. Highest quarterly invoice
  records.push(makeRecord({
    id: 'highest-quarterly-invoice',
    title: 'Highest Quarterly Invoice',
    category: 'invoice', icon: '🏆',
    unit: '£', format: fmt.currencyCompact,
    sortedRows: topRecord(bestPerConsultantQuarter(consultants, allMonths,
      (slice) => slice.reduce((a, b) => a + b.invoiceValue, 0))),
  }))

  // 3. Most consecutive months above £target
  {
    const rows = consultants.map((c) => {
      const sorted = [...c.monthlyStats].sort((a, b) => a.month.localeCompare(b.month))
      const run = longestRun(sorted.map((s) => s.invoiceValue), (v) => v >= MONTHLY_INVOICE_TARGET)
      return { consultantId: c.id, month: sorted.at(-1)?.month, value: run }
    })
    records.push(makeRecord({
      id: 'consec-above-target',
      title: `Most Consecutive Months ≥ ${fmt.currencyCompact(MONTHLY_INVOICE_TARGET)}`,
      category: 'invoice', icon: '🎯',
      unit: 'mo', format: fmt.months,
      sortedRows: topRecord(rows),
    }))
  }

  // 4. Most ops in a single month
  records.push(makeRecord({
    id: 'most-ops-month',
    title: 'Most Ops Delivered in a Month',
    category: 'delivery', icon: '💎',
    unit: 'ops', format: fmt.int,
    sortedRows: topRecord(bestPerConsultantMonth(consultants, (s) => s.opsDelivered)),
  }))

  // 5. Fastest avg days to close (in a month)
  records.push(makeRecord({
    id: 'fastest-close',
    title: 'Fastest Average Op Close (Month)',
    category: 'delivery', icon: '⚡',
    unit: 'd', format: fmt.days, betterWhenLower: true,
    sortedRows: topRecord(
      bestPerConsultantMonth(consultants, (s) => s.avgDaysToClose),
      { direction: 'asc' },
    ),
  }))

  // 6. Most consecutive months with zero pushed Ops
  {
    const rows = consultants.map((c) => {
      const sorted = [...c.monthlyStats].sort((a, b) => a.month.localeCompare(b.month))
      const run = longestRun(sorted.map((s) => s.pushedOps ?? 0), (v) => v === 0)
      return { consultantId: c.id, month: sorted.at(-1)?.month, value: run }
    })
    records.push(makeRecord({
      id: 'consec-zero-pushed',
      title: 'Most Consecutive Months · Zero Pushed Ops',
      category: 'delivery', icon: '🛡️',
      unit: 'mo', format: fmt.months,
      sortedRows: topRecord(rows),
    }))
  }

  // 7. Highest early-invoice % in a month
  records.push(makeRecord({
    id: 'highest-early-pct',
    title: 'Highest Early-Invoice % (Month)',
    category: 'efficiency', icon: '🌅',
    unit: '%', format: fmt.pct,
    sortedRows: topRecord(bestPerConsultantMonth(consultants, (s) => s.invoiceBeforeDay15Pct)),
  }))

  // 8. Best avg days-to-close over a quarter
  records.push(makeRecord({
    id: 'best-quarter-close',
    title: 'Best Avg Days-to-Close (Quarter)',
    category: 'efficiency', icon: '🎯',
    unit: 'd', format: fmt.days, betterWhenLower: true,
    sortedRows: topRecord(
      bestPerConsultantQuarter(consultants, allMonths,
        (slice) => slice.reduce((a, b) => a + b.avgDaysToClose, 0) / slice.length),
      { direction: 'asc' },
    ),
  }))

  // 9. Longest monthly target streak (from streaks data)
  {
    const rows = consultants.map((c) => ({
      consultantId: c.id,
      month: allMonths.at(-1),
      value: c.streaks?.bestMonthlyStreak ?? 0,
    }))
    records.push(makeRecord({
      id: 'longest-streak',
      title: 'Longest Monthly Target Streak',
      category: 'streaks', icon: '🔥',
      unit: 'mo', format: fmt.months,
      sortedRows: topRecord(rows),
    }))
  }

  // 10. Most badges earned in a single quarter
  {
    const qs = quarters(allMonths)
    const monthQuarter = new Map()
    qs.forEach((q, i) => q.forEach((m) => monthQuarter.set(m, i)))
    const rows = []
    for (const c of consultants) {
      const earnedAt = c.badgeEarnedAt ?? {}
      const counts = new Array(qs.length).fill(0)
      for (const month of Object.values(earnedAt)) {
        const qi = monthQuarter.get(month)
        if (qi != null) counts[qi] += 1
      }
      counts.forEach((v, qi) => {
        rows.push({
          consultantId: c.id,
          month: qs[qi].at(-1),
          label: quarterLabel(qs[qi]),
          value: v,
        })
      })
    }
    records.push(makeRecord({
      id: 'most-badges-quarter',
      title: 'Most Badges Earned in a Quarter',
      category: 'streaks', icon: '🏅',
      unit: 'badges', format: fmt.int,
      sortedRows: topRecord(rows),
    }))
  }

  return records.filter(Boolean)
}

export const THREAT_THRESHOLD = 0.85
export function isUnderThreat(record) {
  return record.threatRatio >= THREAT_THRESHOLD && record.threatRatio < 1
}
