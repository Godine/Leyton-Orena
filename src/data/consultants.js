// Deterministic mock dataset for 16 consultants across Oct 2024 – Mar 2025.
// Profiles are hand-tuned (strong / improving / inconsistent) so leaderboards feel real.

const MONTHS = ['2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03']

// profile templates control the shape of each consultant's monthly numbers
const PROFILES = {
  strong: {
    ops: [9, 10, 11, 10, 12, 11],
    inv: [82, 88, 95, 90, 102, 98], // in £k
    front: [78, 84, 81, 86, 89, 83],
    flags: [1, 0, 2, 1, 1, 0],
    close: [3.1, 2.8, 2.6, 2.9, 2.4, 2.7],
    pushed: [0, 0, 1, 0, 0, 0],
  },
  improving: {
    ops: [4, 5, 6, 7, 8, 10],
    inv: [38, 44, 52, 61, 70, 82],
    front: [42, 48, 55, 62, 70, 78],
    flags: [0, 1, 0, 1, 2, 1],
    close: [6.2, 5.8, 5.1, 4.6, 4.0, 3.4],
    pushed: [2, 2, 1, 1, 0, 0],
  },
  inconsistent: {
    ops: [7, 3, 9, 4, 8, 5],
    inv: [60, 28, 78, 34, 71, 41],
    front: [70, 35, 82, 40, 75, 48],
    flags: [2, 0, 1, 3, 0, 1],
    close: [4.5, 7.2, 3.6, 6.8, 4.1, 6.0],
    pushed: [1, 3, 0, 2, 1, 2],
  },
  steady: {
    ops: [6, 7, 6, 7, 6, 7],
    inv: [55, 58, 56, 60, 59, 62],
    front: [62, 65, 60, 66, 64, 68],
    flags: [1, 1, 0, 1, 1, 0],
    close: [4.0, 3.8, 4.1, 3.9, 3.7, 3.8],
    pushed: [0, 1, 0, 0, 1, 0],
  },
}

function buildMonthlyStats(profileKey, jitter = 0) {
  const p = PROFILES[profileKey]
  return MONTHS.map((month, i) => ({
    month,
    opsDelivered: Math.max(0, p.ops[i] + (jitter % 2 === 0 ? 0 : -1)),
    invoiceValue: Math.round((p.inv[i] + jitter) * 1000),
    invoiceBeforeDay15Pct: Math.min(100, Math.max(0, p.front[i] + jitter)),
    clientRetentionFlags: p.flags[i],
    avgDaysToClose: Number((p.close[i] + jitter * 0.05).toFixed(1)),
    pushedOps: p.pushed[i],
  }))
}

const SEED = [
  // Technical (7)
  { name: 'Oumayma El Mahjoubi', role: 'Technical', location: 'Casablanca', profile: 'strong',       streak: { currentMonthlyStreak: 5, bestMonthlyStreak: 6 }, badges: ['lab-rat','front-loader','peak-month','on-fire','growth-engine','diamond-hands'] },
  { name: 'David Buckley',       role: 'Technical', location: 'London',     profile: 'improving',    streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['ice-breaker','growth-engine','on-fire'] },
  { name: 'Ramin Yasseri',       role: 'Technical', location: 'London',     profile: 'steady',       streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 4 }, badges: ['lab-rat','iron-wall','sniper'] },
  { name: 'Henry Shipley',       role: 'Technical', location: 'Dublin',     profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick'] },
  { name: 'Lucas Rothwell',      role: 'Technical', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 5 }, badges: ['front-loader','diamond-hands','on-fire','sniper'] },
  { name: 'Mohammed Brija',      role: 'Technical', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 2 }, badges: ['ice-breaker','early-bird'] },
  { name: 'Mouad Ghazi',         role: 'Technical', location: 'Casablanca', profile: 'steady',       streak: { currentMonthlyStreak: 1, bestMonthlyStreak: 3 }, badges: ['lab-rat','retention-shield'] },
  // Financial (6)
  { name: 'Antonio De Grazia',   role: 'Financial', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 6, bestMonthlyStreak: 6 }, badges: ['front-loader','peak-month','arena-champion','on-fire','client-whisperer','diamond-hands'] },
  { name: 'Asad Shahid',         role: 'Financial', location: 'London',     profile: 'steady',       streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 4 }, badges: ['early-bird','iron-wall','sniper'] },
  { name: 'Louie Heron',         role: 'Financial', location: 'Dublin',     profile: 'improving',    streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['ice-breaker','growth-engine','retention-shield'] },
  { name: 'Safae El Kalai',      role: 'Financial', location: 'Casablanca', profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick'] },
  { name: 'Israe Rouri',         role: 'Financial', location: 'Casablanca', profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 5 }, badges: ['front-loader','peak-month','on-fire','sniper'] },
  { name: 'Douae El Boukili',    role: 'Financial', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 2 }, badges: ['ice-breaker','early-bird'] },
  // Financial — extended roster
  { name: 'Ibtissam Boutrasseyt',role: 'Financial', location: 'Casablanca', profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 5 }, badges: ['front-loader','on-fire','diamond-hands','peak-month'] },
  { name: 'Aveen Farag',         role: 'Financial', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 2 }, badges: ['ice-breaker','growth-engine'] },
  { name: 'Basma Rabeh',         role: 'Financial', location: 'Casablanca', profile: 'steady',       streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['lab-rat','iron-wall','early-bird'] },
  { name: 'Scott Toner',         role: 'Financial', location: 'Glasgow',    profile: 'strong',       streak: { currentMonthlyStreak: 5, bestMonthlyStreak: 5 }, badges: ['front-loader','on-fire','sniper','arena-champion'] },
  { name: 'Jennifer Woo',        role: 'Financial', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 6 }, badges: ['peak-month','diamond-hands','on-fire','client-whisperer'] },
  { name: 'Robert Strutt',       role: 'Financial', location: 'London',     profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick'] },
  { name: 'Marco Spiro',         role: 'Financial', location: 'London',     profile: 'steady',       streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 4 }, badges: ['lab-rat','retention-shield','early-bird'] },
  { name: 'Rebecca Black',       role: 'Financial', location: 'Bristol',    profile: 'improving',    streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['ice-breaker','growth-engine','sniper'] },
  { name: 'David Kerr',          role: 'Financial', location: 'Glasgow',    profile: 'steady',       streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 4 }, badges: ['iron-wall','sniper','early-bird'] },
  { name: 'Soufiane Mlah',       role: 'Financial', location: 'Casablanca', profile: 'inconsistent', streak: { currentMonthlyStreak: 1, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick','retention-shield'] },
  { name: 'Charlie Monger',      role: 'Financial', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 4 }, badges: ['front-loader','on-fire','diamond-hands'] },
]

// Deterministically spreads a consultant's earned badges across the 6 months.
// Current user (idx 0) always has their final badge land in the latest month so
// the unlock animation has something to play on first visit.
function buildBadgeEarnedAt(badges, idx, derivedAt = {}) {
  const map = {}
  badges.forEach((badgeId, bi) => {
    if (derivedAt[badgeId]) {
      map[badgeId] = derivedAt[badgeId]
      return
    }
    const slot = idx === 0 && bi === badges.length - 1
      ? MONTHS.length - 1
      : (bi + idx) % MONTHS.length
    map[badgeId] = MONTHS[slot]
  })
  return map
}

// Progressive early-invoice ladder: badge id + threshold for invoiceBeforeDay15Pct.
// Each consultant unlocks every tier they cleared in any month.
const EARLY_TIERS = [
  { id: 'early-40',     threshold: 40 },
  { id: 'pacemaker',    threshold: 50 },
  { id: 'front-runner', threshold: 60 },
  { id: 'cash-closer',  threshold: 70 },
  { id: 'front-loader', threshold: 80 },
  { id: 'untouchable',  threshold: 90 },
]

function deriveEarlyTierBadges(monthlyStats) {
  const earned = []
  const earnedAt = {}
  for (const tier of EARLY_TIERS) {
    const hit = monthlyStats.find((s) => (s.invoiceBeforeDay15Pct ?? 0) >= tier.threshold)
    if (hit) {
      earned.push(tier.id)
      earnedAt[tier.id] = hit.month
    }
  }
  return { earned, earnedAt }
}

// Daily fire streak — fed by the question "did this consultant advance at least
// one claim by one workflow stage today?". 30-day window ending today.
// Current and best are designed per profile so streaks look believable; older
// days are filled in deterministically by a tiny hash for stable demos.
import { STAGES, clientsForConsultant } from './workflow.js'

const FIRE_BY_PROFILE = {
  strong:       { current: 11, best: 18, density: 80 },
  improving:    { current: 7,  best: 9,  density: 65 },
  steady:       { current: 4,  best: 8,  density: 72 },
  inconsistent: { current: 1,  best: 5,  density: 45 },
}

const FIRE_LOG_LEN = 30

function isoDate(d) { return d.toISOString().slice(0, 10) }

function buildFireData(profile, idx) {
  const cfg = FIRE_BY_PROFILE[profile] ?? FIRE_BY_PROFILE.steady
  const log = new Array(FIRE_LOG_LEN).fill(0)
  // last `current` days fire
  for (let i = 0; i < cfg.current && i < FIRE_LOG_LEN; i++) {
    log[FIRE_LOG_LEN - 1 - i] = 1
  }
  // the day before the current streak is the break
  const breakAt = FIRE_LOG_LEN - 1 - cfg.current
  if (breakAt >= 0) log[breakAt] = 0
  // older days: deterministic density fill
  for (let i = 0; i < breakAt; i++) {
    const h = ((idx + 1) * 37 + i * 13 + 7) % 100
    log[i] = h < cfg.density ? 1 : 0
  }

  // Replay each lit day as a real stage advance on one of the consultant's
  // active claims. Round-robin picks the claim that's furthest behind so the
  // pipeline progresses evenly; once a claim hits Invoiced it's swapped out.
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const clients = clientsForConsultant(idx, 4)
  const claimStages = clients.map(() => 0)
  const moves = []

  for (let i = 0; i < log.length; i++) {
    if (log[i] !== 1) continue
    // find claim furthest behind
    let pick = 0
    for (let c = 1; c < claimStages.length; c++) {
      if (claimStages[c] < claimStages[pick]) pick = c
    }
    if (claimStages[pick] >= STAGES.length - 1) {
      // all claims invoiced — shouldn't happen with 4 claims and 30 days,
      // but stay safe by skipping rather than mutating the log.
      continue
    }
    const date = new Date(today)
    date.setDate(date.getDate() - (log.length - 1 - i))
    const fromStage = STAGES[claimStages[pick]]
    claimStages[pick] += 1
    const toStage = STAGES[claimStages[pick]]
    moves.push({
      date: isoDate(date),
      client: clients[pick],
      fromStage,
      toStage,
    })
  }

  return {
    current: cfg.current,
    best: cfg.best,
    log,
    moves,
    todayIso: isoDate(today),
  }
}

// Progressive monthly-target-streak ladder. Best (lifetime) streak unlocks tiers.
const STREAK_TIERS = [
  { id: 'kindling',  threshold: 2 },
  { id: 'on-fire',   threshold: 3 },
  { id: 'heatwave',  threshold: 4 },
  { id: 'inferno',   threshold: 5 },
  { id: 'supernova', threshold: 6 },
]

function deriveStreakTierBadges(streaks) {
  const best = streaks?.bestMonthlyStreak ?? 0
  const latest = MONTHS.at(-1)
  const earned = []
  const earnedAt = {}
  for (const tier of STREAK_TIERS) {
    if (best >= tier.threshold) {
      earned.push(tier.id)
      // We don't know which calendar month each tier was first hit; attribute
      // them to the latest tracked month so they show up as recent unlocks.
      earnedAt[tier.id] = latest
    }
  }
  return { earned, earnedAt }
}

// ── Per-profile lifetime stats used by category ladders we don't yet track
// elsewhere (Trustpilot reviews, contract speed, championship runs, earliest
// invoice day in any month). Hand-tuned so each profile has a believable spread.
const LIFETIME_BY_PROFILE = {
  strong:       { trustpilot: 5, contractDays: 12, champBest: 2, champTotal: 3, earliestDay: 3, firstOfMonthCount: 2 },
  improving:    { trustpilot: 2, contractDays: 35, champBest: 0, champTotal: 0, earliestDay: 7, firstOfMonthCount: 0 },
  steady:       { trustpilot: 3, contractDays: 22, champBest: 1, champTotal: 1, earliestDay: 4, firstOfMonthCount: 1 },
  inconsistent: { trustpilot: 1, contractDays: 75, champBest: 0, champTotal: 0, earliestDay: 12, firstOfMonthCount: 0 },
}

// Antonio De Grazia (idx 7) is the reigning Arena Champion — bump his run so
// the Dynasty mythic badge has a holder.
const LIFETIME_OVERRIDES = {
  7:  { trustpilot: 6, contractDays: 9,  champBest: 4, champTotal: 4, earliestDay: 2, firstOfMonthCount: 4 },
  16: { trustpilot: 4, contractDays: 18, champBest: 2, champTotal: 2, earliestDay: 3, firstOfMonthCount: 1 }, // Scott Toner
  17: { trustpilot: 5, contractDays: 14, champBest: 1, champTotal: 2, earliestDay: 3, firstOfMonthCount: 2 }, // Jennifer Woo
  11: { trustpilot: 4, contractDays: 16, champBest: 1, champTotal: 1, earliestDay: 4, firstOfMonthCount: 1 }, // Israe Rouri
}

function lifetimeFor(profile, idx) {
  const base = LIFETIME_BY_PROFILE[profile] ?? LIFETIME_BY_PROFILE.steady
  return { ...base, ...(LIFETIME_OVERRIDES[idx] ?? {}) }
}

// Longest run of consecutive months with zero pushed Ops.
function longestNoPushRun(monthlyStats) {
  let best = 0, run = 0
  const sorted = [...monthlyStats].sort((a, b) => a.month.localeCompare(b.month))
  for (const m of sorted) {
    if ((m.pushedOps ?? 0) === 0) { run += 1; best = Math.max(best, run) }
    else { run = 0 }
  }
  return best
}

// Revenue tier ladder (£ per month).
const REVENUE_TIERS = [
  { id: 'rev-100k', threshold: 100000 },
  { id: 'rev-150k', threshold: 150000 },
  { id: 'rev-200k', threshold: 200000 },
]
// Volume tier ladder (ops per month).
const VOLUME_TIERS = [
  { id: 'vol-15', threshold: 15 },
  { id: 'vol-20', threshold: 20 },
  { id: 'vol-25', threshold: 25 },
  { id: 'vol-30', threshold: 30 },
]
// Reliability — months in a row with zero pushed Ops.
const RELIABILITY_TIERS = [
  { id: 'noPush-1', threshold: 1 },
  { id: 'noPush-2', threshold: 2 },
  { id: 'noPush-3', threshold: 3 },
  { id: 'noPush-4', threshold: 4 },
  { id: 'noPush-5', threshold: 5 },
  { id: 'noPush-6', threshold: 6 },
]
// Fire — daily-fire best streak in days.
const FIRE_BADGE_TIERS = [
  { id: 'fire-7',  threshold: 7 },
  { id: 'fire-15', threshold: 15 },
  { id: 'fire-30', threshold: 30 },
  { id: 'fire-45', threshold: 45 },
  { id: 'fire-60', threshold: 60 },
]
// Trustpilot reviews (lifetime count).
const REVIEW_TIERS = [
  { id: 'reviews-1', threshold: 1 },
  { id: 'reviews-2', threshold: 2 },
  { id: 'reviews-3', threshold: 3 },
  { id: 'reviews-4', threshold: 4 },
  { id: 'reviews-5', threshold: 5 },
  { id: 'reviews-6', threshold: 6 },
]
// Speed to cash — fastest new-contract → first invoice in days (lower better).
const SPEED_TIERS = [
  { id: 'speed-90', threshold: 90 },
  { id: 'speed-60', threshold: 60 },
  { id: 'speed-30', threshold: 30 },
  { id: 'speed-15', threshold: 15 },
  { id: 'speed-7',  threshold: 7 },
]
// Championship — quarterly #1 finishes (best consecutive run).
const CHAMP_TIERS = [
  { id: 'champ-1q',   threshold: 1 },
  { id: 'champ-2q',   threshold: 2 },
  { id: 'champ-3q',   threshold: 3 },
  { id: 'champ-year', threshold: 4 },
]

function deriveLadder(tiers, value, latest, betterWhenLower = false) {
  const earned = []
  const earnedAt = {}
  for (const t of tiers) {
    const ok = betterWhenLower ? value <= t.threshold : value >= t.threshold
    if (ok) {
      earned.push(t.id)
      earnedAt[t.id] = latest
    }
  }
  return { earned, earnedAt }
}

function deriveMonthlyLadder(tiers, monthlyStats, key, betterWhenLower = false) {
  // For monthly tiers, attribute to the first month each threshold was hit.
  const earned = []
  const earnedAt = {}
  for (const t of tiers) {
    const hit = monthlyStats.find((s) => {
      const v = s[key] ?? 0
      return betterWhenLower ? v <= t.threshold : v >= t.threshold
    })
    if (hit) {
      earned.push(t.id)
      earnedAt[t.id] = hit.month
    }
  }
  return { earned, earnedAt }
}

export const CONSULTANTS = SEED.map((c, idx) => {
  const monthlyStats = buildMonthlyStats(c.profile, (idx % 4) - 1)
  const fire = buildFireData(c.profile, idx)
  const lifetime = lifetimeFor(c.profile, idx)
  const latest = MONTHS.at(-1)

  // Each ladder is fully data-driven from monthly stats or lifetime counters.
  const ladders = [
    deriveEarlyTierBadges(monthlyStats),                                          // 40 → 90 %
    deriveStreakTierBadges(c.streak),                                             // monthly streaks
    deriveMonthlyLadder(REVENUE_TIERS, monthlyStats, 'invoiceValue'),             // 100/150/200k
    deriveMonthlyLadder(VOLUME_TIERS,  monthlyStats, 'opsDelivered'),             // 15/20/25/30
    deriveLadder(RELIABILITY_TIERS, longestNoPushRun(monthlyStats), latest),      // 1..6 mo
    deriveLadder(FIRE_BADGE_TIERS,  fire.best, latest),                           // 7..60 days
    deriveLadder(REVIEW_TIERS, lifetime.trustpilot, latest),                      // 1..6 reviews
    deriveLadder(SPEED_TIERS,  lifetime.contractDays, latest, true),              // ≤90..7 days
    deriveLadder(CHAMP_TIERS,  lifetime.champBest, latest),                       // 1..4 quarters
  ]

  // Singletons: first-of-the-month and earliest-day badges.
  const earned = ladders.flatMap((l) => l.earned)
  const earnedAt = Object.assign({}, ...ladders.map((l) => l.earnedAt))
  if (lifetime.firstOfMonthCount >= 1) {
    earned.push('first-of-month')
    earnedAt['first-of-month'] = latest
  }
  if (lifetime.earliestDay <= 5) {
    earned.push('day-5')
    earnedAt['day-5'] = latest
  }

  const badges = Array.from(new Set(earned))

  return {
    id: `c-${String(idx + 1).padStart(2, '0')}`,
    name: c.name,
    role: c.role,
    location: c.location,
    badges,
    badgeEarnedAt: buildBadgeEarnedAt(badges, idx, earnedAt),
    streaks: c.streak,
    lifetime,
    monthlyStats,
    fire,
  }
})

export const MONTHS_AVAILABLE = MONTHS
export const CURRENT_USER_ID = 'c-01' // Oumayma, for "My Profile"
