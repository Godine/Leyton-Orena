// Heuristic progress (0..1) toward each badge for a single consultant.
// Used on the locked-badge state in the detail modal and to pick the
// "closest to unlock" badge in the Progress summary.
//
// Where a badge depends on info we don't track yet (e.g. true tax-year
// boundaries, weekly slices), we either approximate with the closest
// monthly proxy or return `null` to mean "progress unknowable from data."

function bestMonth(stats, key, betterWhenLower = false) {
  if (!stats.length) return 0
  const vals = stats.map((s) => s[key] ?? 0)
  return betterWhenLower ? Math.min(...vals) : Math.max(...vals)
}

function consecutiveImproving(stats, key) {
  let best = 0, run = 0
  for (let i = 1; i < stats.length; i++) {
    if ((stats[i][key] ?? 0) > (stats[i - 1][key] ?? 0)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  // 3 strictly-increasing months in a row = a 3-improvement run starting from idx 1.
  return best
}

function bestQuarterSum(stats, key) {
  if (stats.length < 3) return stats.reduce((a, b) => a + (b[key] ?? 0), 0)
  let best = 0
  for (let i = 0; i <= stats.length - 3; i++) {
    const sum = (stats[i][key] ?? 0) + (stats[i + 1][key] ?? 0) + (stats[i + 2][key] ?? 0)
    best = Math.max(best, sum)
  }
  return best
}

// Mapping for the early-invoice progression ladder.
const EARLY_TIER_TARGETS = {
  pacemaker:    50,
  'front-runner': 60,
  'cash-closer':  70,
  'front-loader': 80,
  untouchable:  90,
}

// Mapping for the consecutive-target-hit ladder (in months of best streak).
const STREAK_TIER_TARGETS = {
  kindling:  2,
  'on-fire': 3,
  heatwave:  4,
  inferno:   5,
  supernova: 6,
}

export function badgeProgress(consultant, badgeId) {
  const stats = consultant.monthlyStats ?? []
  if (EARLY_TIER_TARGETS[badgeId] != null) {
    const target = EARLY_TIER_TARGETS[badgeId]
    const best = bestMonth(stats, 'invoiceBeforeDay15Pct')
    return { value: best, target, ratio: Math.min(1, best / target), unit: '%' }
  }
  if (STREAK_TIER_TARGETS[badgeId] != null) {
    const target = STREAK_TIER_TARGETS[badgeId]
    // Progress reflects the *current* live streak so consultants can see how
    // close they are to the next tier right now.
    const current = consultant.streaks?.currentMonthlyStreak ?? 0
    const best = consultant.streaks?.bestMonthlyStreak ?? 0
    const value = Math.max(current, best)
    return { value, target, ratio: Math.min(1, value / target), unit: 'mo streak' }
  }
  switch (badgeId) {
    case 'diamond-hands': {
      const v = bestMonth(stats, 'opsDelivered')
      return { value: v, target: 10, ratio: Math.min(1, v / 10), unit: 'ops/mo' }
    }
    case 'client-whisperer': {
      const v = bestQuarterSum(stats, 'clientRetentionFlags')
      return { value: v, target: 5, ratio: Math.min(1, v / 5), unit: 'flags/qtr' }
    }
    case 'growth-engine': {
      const runs = consecutiveImproving(stats, 'invoiceValue')
      // need 3 strictly-increasing months (run length of 3 in our counter)
      return { value: runs, target: 3, ratio: Math.min(1, runs / 3), unit: 'months' }
    }
    case 'sniper': {
      const fastest = bestMonth(stats, 'avgDaysToClose', true)
      // closer to 2 days is better; clamp
      const ratio = fastest === 0 ? 0 : Math.min(1, 2 / fastest)
      return { value: fastest, target: 2, ratio, unit: 'd avg close', betterWhenLower: true }
    }
    case 'iron-wall':
    case 'early-bird':
    case 'retention-shield':
    case 'hat-trick':
    case 'peak-month':
    case 'lab-rat':
    case 'ice-breaker':
    case 'arena-champion':
    default:
      return null
  }
}

// Best locked badge for a consultant — the one they're closest to unlocking.
// `allBadges` is the full registry (id + meta).
export function closestToUnlock(consultant, allBadges) {
  const earned = new Set(consultant.badges)
  let best = null
  for (const badge of allBadges) {
    if (earned.has(badge.id)) continue
    const p = badgeProgress(consultant, badge.id)
    if (!p) continue
    if (!best || p.ratio > best.progress.ratio) {
      best = { badge, progress: p }
    }
  }
  return best
}
