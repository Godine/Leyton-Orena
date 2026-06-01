// Progress helpers for badges. Used by the locked-badge state in the detail
// modal and to pick the "closest to unlock" badge.

function bestMonth(stats, key, betterWhenLower = false) {
  if (!stats.length) return betterWhenLower ? Infinity : 0
  const vals = stats.map((s) => s[key] ?? 0)
  return betterWhenLower ? Math.min(...vals) : Math.max(...vals)
}

function longestNoPushRun(stats) {
  let best = 0, run = 0
  const sorted = [...stats].sort((a, b) => a.month.localeCompare(b.month))
  for (const m of sorted) {
    if ((m.pushedOps ?? 0) === 0) { run += 1; best = Math.max(best, run) }
    else { run = 0 }
  }
  return best
}

// Tier tables ------------------------------------------------------------
const EARLY_TARGETS = {
  'early-40': 40, pacemaker: 50, 'front-runner': 60,
  'cash-closer': 70, 'front-loader': 80, untouchable: 90,
}
const STREAK_TARGETS = {
  kindling: 2, 'on-fire': 3, heatwave: 4, inferno: 5, supernova: 6,
}
const REVENUE_TARGETS = { 'rev-100k': 100000, 'rev-150k': 150000, 'rev-200k': 200000 }
const VOLUME_TARGETS  = { 'vol-15': 15, 'vol-20': 20, 'vol-25': 25, 'vol-30': 30 }
const RELIABILITY_TARGETS = {
  'noPush-1': 1, 'noPush-2': 2, 'noPush-3': 3, 'noPush-4': 4, 'noPush-5': 5, 'noPush-6': 6,
}
const FIRE_TARGETS = { 'fire-7': 7, 'fire-15': 15, 'fire-30': 30, 'fire-45': 45, 'fire-60': 60 }
const REVIEW_TARGETS = {
  'reviews-1': 1, 'reviews-2': 2, 'reviews-3': 3, 'reviews-4': 4, 'reviews-5': 5, 'reviews-6': 6,
}
const SPEED_TARGETS = {
  'speed-90': 90, 'speed-60': 60, 'speed-30': 30, 'speed-15': 15, 'speed-7': 7,
}
const CHAMP_TARGETS = { 'champ-1q': 1, 'champ-2q': 2, 'champ-3q': 3, 'champ-year': 4 }

function ladder(value, target, unit, betterWhenLower = false) {
  const ratio = betterWhenLower
    ? (value === 0 ? 1 : Math.min(1, target / Math.max(value, 1e-9)))
    : Math.min(1, value / target)
  return { value, target, ratio, unit, betterWhenLower }
}

export function badgeProgress(consultant, badgeId) {
  const stats = consultant.monthlyStats ?? []
  const fire = consultant.fire ?? { best: 0 }
  const streaks = consultant.streaks ?? {}
  const life = consultant.lifetime ?? {}

  if (EARLY_TARGETS[badgeId] != null) {
    return ladder(bestMonth(stats, 'invoiceBeforeDay15Pct'), EARLY_TARGETS[badgeId], '%')
  }
  if (STREAK_TARGETS[badgeId] != null) {
    const value = Math.max(streaks.currentMonthlyStreak ?? 0, streaks.bestMonthlyStreak ?? 0)
    return ladder(value, STREAK_TARGETS[badgeId], 'mo streak')
  }
  if (REVENUE_TARGETS[badgeId] != null) {
    return ladder(bestMonth(stats, 'invoiceValue'), REVENUE_TARGETS[badgeId], '£/mo')
  }
  if (VOLUME_TARGETS[badgeId] != null) {
    return ladder(bestMonth(stats, 'opsDelivered'), VOLUME_TARGETS[badgeId], 'ops/mo')
  }
  if (RELIABILITY_TARGETS[badgeId] != null) {
    return ladder(longestNoPushRun(stats), RELIABILITY_TARGETS[badgeId], 'mo')
  }
  if (FIRE_TARGETS[badgeId] != null) {
    return ladder(fire.best ?? 0, FIRE_TARGETS[badgeId], 'days')
  }
  if (REVIEW_TARGETS[badgeId] != null) {
    return ladder(life.trustpilot ?? 0, REVIEW_TARGETS[badgeId], 'reviews')
  }
  if (SPEED_TARGETS[badgeId] != null) {
    return ladder(life.contractDays ?? Infinity, SPEED_TARGETS[badgeId], 'd', true)
  }
  if (CHAMP_TARGETS[badgeId] != null) {
    return ladder(life.champBest ?? 0, CHAMP_TARGETS[badgeId], 'qtrs')
  }
  // Singletons
  if (badgeId === 'first-of-month') {
    const v = life.firstOfMonthCount ?? 0
    return { value: v, target: 1, ratio: Math.min(1, v), unit: 'months' }
  }
  if (badgeId === 'day-5') {
    const v = life.earliestDay ?? 99
    return ladder(v, 5, 'day', true)
  }
  return null
}

// Best locked badge for a consultant — the one they're closest to unlocking.
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
