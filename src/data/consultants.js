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
    pushed:     [0, 0, 1, 0, 0, 0], // claims slipped from this month into a later one
    pulled:     [2, 1, 3, 2, 2, 1], // claims pulled forward from a future month
    latePushed: [0, 0, 0, 0, 0, 0], // pushes that happened in the final week — worst pattern
  },
  improving: {
    ops: [4, 5, 6, 7, 8, 10],
    inv: [38, 44, 52, 61, 70, 82],
    front: [42, 48, 55, 62, 70, 78],
    flags: [0, 1, 0, 1, 2, 1],
    close: [6.2, 5.8, 5.1, 4.6, 4.0, 3.4],
    pushed:     [2, 2, 1, 1, 0, 0],
    pulled:     [0, 0, 1, 1, 2, 2],
    latePushed: [1, 1, 0, 0, 0, 0],
  },
  inconsistent: {
    ops: [7, 3, 9, 4, 8, 5],
    inv: [60, 28, 78, 34, 71, 41],
    front: [70, 35, 82, 40, 75, 48],
    flags: [2, 0, 1, 3, 0, 1],
    close: [4.5, 7.2, 3.6, 6.8, 4.1, 6.0],
    pushed:     [1, 3, 0, 2, 1, 2],
    pulled:     [0, 1, 1, 0, 1, 0],
    latePushed: [1, 2, 0, 1, 0, 1],
  },
  steady: {
    ops: [6, 7, 6, 7, 6, 7],
    inv: [55, 58, 56, 60, 59, 62],
    front: [62, 65, 60, 66, 64, 68],
    flags: [1, 1, 0, 1, 1, 0],
    close: [4.0, 3.8, 4.1, 3.9, 3.7, 3.8],
    pushed:     [0, 1, 0, 0, 1, 0],
    pulled:     [1, 1, 1, 1, 1, 1],
    latePushed: [0, 0, 0, 0, 0, 0],
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
    pushedOps:      p.pushed[i],
    pulledOps:      p.pulled[i],
    latePushedOps:  p.latePushed[i],
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
  // Solo addition — appended at the end so all other indices stay stable.
  { name: 'Issam El Ahmadi',     role: 'Technical', location: 'Casablanca', profile: 'steady',       seniority: 'Senior Consultant', streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 3 }, badges: [] },
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
  strong:       { current: 3, best: 5, density: 55 },
  improving:    { current: 2, best: 4, density: 45 },
  steady:       { current: 2, best: 4, density: 50 },
  inconsistent: { current: 0, best: 3, density: 30 },
}

// Only a handful of consultants have actually impressive fire streaks. Default
// fire stays modest so the daily-fire badges remain hard to earn.
const FIRE_OVERRIDES = {
  0:  { current: 11, best: 14, density: 78 }, // Oumayma — current user, must look impressive
  7:  { current: 18, best: 32, density: 88 }, // Antonio — dynasty, deep fire
  11: { current: 7,  best: 9,  density: 70 }, // Israe
  16: { current: 9,  best: 11, density: 72 }, // Scott
  17: { current: 12, best: 16, density: 78 }, // Jennifer
  4:  { current: 5,  best: 7,  density: 60 }, // Lucas — solid mid
  9:  { current: 4,  best: 6,  density: 58 }, // Louie
  23: { current: 4,  best: 8,  density: 60 }, // Charlie
  24: { current: 3,  best: 5,  density: 55 }, // Issam — modest, below the 7-day Hot Week threshold
}

function fireConfigFor(profile, idx) {
  return FIRE_OVERRIDES[idx] ?? (FIRE_BY_PROFILE[profile] ?? FIRE_BY_PROFILE.steady)
}

const FIRE_LOG_LEN = 30

function isoDate(d) { return d.toISOString().slice(0, 10) }

function buildFireData(profile, idx) {
  const cfg = fireConfigFor(profile, idx)
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

// Lifetime ladders (Trustpilot reviews, fastest new-contract → invoice,
// championship runs, earliest day, first-of-month count) are gated by
// hand-assigned data so only a few stars earn the Client Voice, Speed to
// Cash, Championship, Trailblazer and Early Bird badges. Everyone else
// starts empty.
const EMPTY_LIFETIME = {
  trustpilot: 0,
  contractDays: 999,
  champBest: 0,
  champTotal: 0,
  earliestDay: 99,
  firstOfMonthCount: 0,
}

const STAR_LIFETIME = {
  0:  { trustpilot: 5, contractDays: 8,  champBest: 1, champTotal: 2, earliestDay: 3, firstOfMonthCount: 2 }, // Oumayma
  7:  { trustpilot: 6, contractDays: 6,  champBest: 4, champTotal: 4, earliestDay: 2, firstOfMonthCount: 5 }, // Antonio – Dynasty
  11: { trustpilot: 3, contractDays: 28, champBest: 1, champTotal: 1, earliestDay: 4, firstOfMonthCount: 1 }, // Israe
  16: { trustpilot: 2, contractDays: 18, champBest: 2, champTotal: 2, earliestDay: 3, firstOfMonthCount: 1 }, // Scott – Back-to-Back
  17: { trustpilot: 4, contractDays: 14, champBest: 1, champTotal: 2, earliestDay: 3, firstOfMonthCount: 2 }, // Jennifer
  // A couple of solid mids get a sliver of lifetime so they're not bare:
  4:  { trustpilot: 1, contractDays: 60, champBest: 0, champTotal: 0, earliestDay: 5, firstOfMonthCount: 0 }, // Lucas
  9:  { trustpilot: 1, contractDays: 75, champBest: 0, champTotal: 0, earliestDay: 6, firstOfMonthCount: 0 }, // Louie
}

function lifetimeFor(_profile, idx) {
  return STAR_LIFETIME[idx] ?? EMPTY_LIFETIME
}

// Per-consultant ladder rung caps for the data-driven categories. Anyone not
// listed gets DEFAULT_CAPS (all zeros) — no derived badges at all. This is the
// knob that controls how many badges each person ends up with.
//   early   max tier of Early Invoicing ladder (out of 6)
//   streak  max tier of Monthly Streak ladder (out of 5)
//   rev     max tier of Big Revenue (out of 3)
//   vol     max tier of Volume (out of 4)
//   rel     max tier of Reliability (out of 6)
//   fire    max tier of Daily Fire (out of 5)
const DEFAULT_CAPS = { early: 0, streak: 0, rev: 0, vol: 0, rel: 0, fire: 0 }

const BADGE_CAPS = {
  // ── Stars (heavy, 10+ badges) ─────────────────────────────────────────────
  0:  { early: 6, streak: 5, rev: 2, vol: 2, rel: 4, fire: 2 }, // Oumayma
  7:  { early: 6, streak: 5, rev: 3, vol: 4, rel: 6, fire: 3 }, // Antonio
  11: { early: 5, streak: 4, rev: 2, vol: 2, rel: 3, fire: 1 }, // Israe
  16: { early: 5, streak: 4, rev: 2, vol: 2, rel: 3, fire: 1 }, // Scott
  17: { early: 5, streak: 4, rev: 2, vol: 3, rel: 4, fire: 2 }, // Jennifer
  // ── Solid mid (3-4 badges) ────────────────────────────────────────────────
  4:  { early: 2, streak: 2, rev: 0, vol: 0, rel: 0, fire: 1 }, // Lucas
  5:  { early: 2, streak: 1, rev: 0, vol: 0, rel: 1, fire: 0 }, // Mohammed
  9:  { early: 2, streak: 2, rev: 0, vol: 0, rel: 1, fire: 0 }, // Louie
  13: { early: 2, streak: 1, rev: 0, vol: 0, rel: 1, fire: 0 }, // Ibtissam
  20: { early: 2, streak: 1, rev: 0, vol: 0, rel: 0, fire: 0 }, // Rebecca
  23: { early: 2, streak: 2, rev: 0, vol: 0, rel: 0, fire: 1 }, // Charlie
  // ── Light (1-2 badges) ────────────────────────────────────────────────────
  1:  { early: 1, streak: 1, rev: 0, vol: 0, rel: 0, fire: 0 }, // David B
  8:  { early: 1, streak: 1, rev: 0, vol: 0, rel: 0, fire: 0 }, // Asad
  19: { early: 0, streak: 0, rev: 0, vol: 0, rel: 1, fire: 0 }, // Marco
  21: { early: 1, streak: 0, rev: 0, vol: 0, rel: 0, fire: 0 }, // David Kerr
  24: { early: 2, streak: 1, rev: 0, vol: 0, rel: 1, fire: 0 }, // Issam — mid of the pack
  // others (2, 3, 6, 10, 12, 14, 15, 18, 22) → no derived badges
}

function capsFor(idx) { return BADGE_CAPS[idx] ?? DEFAULT_CAPS }

function capLadder(ladder, cap) {
  if (!ladder?.earned?.length) return { earned: [], earnedAt: {} }
  const earned = ladder.earned.slice(0, cap)
  const keep = new Set(earned)
  const earnedAt = Object.fromEntries(
    Object.entries(ladder.earnedAt ?? {}).filter(([k]) => keep.has(k)),
  )
  return { earned, earnedAt }
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
  const cap = capsFor(idx)

  // Data-driven ladders, then capped per consultant so badge distribution is
  // controlled. Lifetime ladders aren't capped — they self-gate because
  // non-star consultants have empty lifetime data and never clear thresholds.
  const ladders = [
    capLadder(deriveEarlyTierBadges(monthlyStats),                                     cap.early),
    capLadder(deriveStreakTierBadges(c.streak),                                        cap.streak),
    capLadder(deriveMonthlyLadder(REVENUE_TIERS, monthlyStats, 'invoiceValue'),        cap.rev),
    capLadder(deriveMonthlyLadder(VOLUME_TIERS,  monthlyStats, 'opsDelivered'),        cap.vol),
    capLadder(deriveLadder(RELIABILITY_TIERS, longestNoPushRun(monthlyStats), latest), cap.rel),
    capLadder(deriveLadder(FIRE_BADGE_TIERS,  fire.best, latest),                      cap.fire),
    deriveLadder(REVIEW_TIERS, lifetime.trustpilot, latest),                           // 1..6 reviews
    deriveLadder(SPEED_TIERS,  lifetime.contractDays, latest, true),                   // ≤90..7 days
    deriveLadder(CHAMP_TIERS,  lifetime.champBest, latest),                            // 1..4 quarters
  ]

  // Singletons: first-of-the-month and day-5 — gated by lifetime data too,
  // so only stars with non-empty lifetime can pick them up.
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
    seniority: c.seniority ?? null,
    location: c.location,
    // Per-consultant monthly targets. Defaults match the old global ones; the
    // Admin page lets managers override on a per-person basis.
    targets: {
      ops: c.targets?.ops ?? 7,
      invoice: c.targets?.invoice ?? 55000,
      earlyPct: c.targets?.earlyPct ?? 70,
      daysClose: c.targets?.daysClose ?? 4,
    },
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
