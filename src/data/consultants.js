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

export const CONSULTANTS = SEED.map((c, idx) => {
  const monthlyStats = buildMonthlyStats(c.profile, (idx % 4) - 1)
  const tier = deriveEarlyTierBadges(monthlyStats)
  // De-dupe: SEED.badges may already mention some tier ids (legacy front-loader).
  const badges = Array.from(new Set([...c.badges, ...tier.earned]))
  return {
    id: `c-${String(idx + 1).padStart(2, '0')}`,
    name: c.name,
    role: c.role,
    location: c.location,
    badges,
    badgeEarnedAt: buildBadgeEarnedAt(badges, idx, tier.earnedAt),
    streaks: c.streak,
    monthlyStats,
  }
})

export const MONTHS_AVAILABLE = MONTHS
export const CURRENT_USER_ID = 'c-01' // Oumayma, for "My Profile"
