// Derives an end-of-quarter "Arena Wrapped" summary for a consultant.
// Pure function: takes the consultant + the months window + the full team to
// position them on the leaderboard.
import { BADGES_BY_ID } from '../data/badges.js'

function pickQuarter(months) {
  const sorted = [...months].sort()
  // For this MVP the entire 6-month window is treated as "the past two
  // quarters"; we always recap the most recent 3-month slice.
  return sorted.slice(-3)
}

function quarterLabel(quarterMonths) {
  const last = quarterMonths.at(-1)
  if (!last) return ''
  const [y, m] = last.split('-')
  const q = Math.ceil(Number(m) / 3)
  return `Q${q} ${y}`
}

function rarityRank(rarity) {
  return { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }[rarity] ?? 0
}

export function computeWrapped(consultant, months, consultants) {
  const quarter = pickQuarter(months)
  const stats = (consultant.monthlyStats ?? []).filter((s) => quarter.includes(s.month))
  const prevQuarter = months.slice().sort().slice(-6, -3)
  const prev = (consultant.monthlyStats ?? []).filter((s) => prevQuarter.includes(s.month))

  const sum = (arr, k) => arr.reduce((a, b) => a + (b[k] ?? 0), 0)
  const mean = (arr, k) => (arr.length ? sum(arr, k) / arr.length : 0)

  const totals = {
    invoice: sum(stats, 'invoiceValue'),
    ops: sum(stats, 'opsDelivered'),
    earlyPct: mean(stats, 'invoiceBeforeDay15Pct'),
    daysClose: mean(stats, 'avgDaysToClose'),
  }
  const prevTotals = {
    invoice: sum(prev, 'invoiceValue'),
    ops: sum(prev, 'opsDelivered'),
  }
  const invoiceGrowthPct = prevTotals.invoice
    ? ((totals.invoice - prevTotals.invoice) / prevTotals.invoice) * 100
    : null

  // Biggest single-month invoice in the quarter
  const peak = stats.reduce(
    (best, s) => (s.invoiceValue > (best?.invoiceValue ?? 0) ? s : best),
    null,
  )

  // Rarest badge earned this quarter (uses badgeEarnedAt to filter to the quarter)
  const earnedThisQ = Object.entries(consultant.badgeEarnedAt ?? {})
    .filter(([, m]) => quarter.includes(m))
    .map(([id]) => BADGES_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity))
  const topBadge = earnedThisQ[0] ?? null

  // Standing across peers — invoice for the last month of the quarter
  const latestMonth = quarter.at(-1)
  const peersByInvoice = (consultants ?? [])
    .filter((c) => c.role === consultant.role)
    .map((c) => ({
      id: c.id,
      name: c.name,
      v: c.monthlyStats?.find((s) => s.month === latestMonth)?.invoiceValue ?? 0,
    }))
    .sort((a, b) => b.v - a.v)
  const rank = peersByInvoice.findIndex((p) => p.id === consultant.id) + 1
  const total = peersByInvoice.length

  return {
    label: quarterLabel(quarter),
    quarter,
    totals,
    prevTotals,
    invoiceGrowthPct,
    peak,
    topBadge,
    badgesThisQuarter: earnedThisQ.length,
    fireBest: consultant.fire?.best ?? 0,
    streakBest: consultant.streaks?.bestMonthlyStreak ?? 0,
    rank,
    total,
  }
}
