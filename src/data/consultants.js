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
  // Technical
  { name: 'Amélie Laurent',   role: 'Technical', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 5, bestMonthlyStreak: 6 }, badges: ['lab-rat','front-loader','peak-month','on-fire','growth-engine','diamond-hands'] },
  { name: 'Yusuf El-Amrani',  role: 'Technical', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['ice-breaker','growth-engine','on-fire'] },
  { name: 'Niamh Doyle',      role: 'Technical', location: 'Dublin',     profile: 'steady',       streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 4 }, badges: ['lab-rat','iron-wall','sniper'] },
  { name: 'Rajiv Khanna',     role: 'Technical', location: 'London',     profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick'] },
  { name: 'Sara Benkirane',   role: 'Technical', location: 'Casablanca', profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 5 }, badges: ['front-loader','diamond-hands','on-fire','sniper'] },
  { name: 'Oisín Murphy',     role: 'Technical', location: 'Dublin',     profile: 'improving',    streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 2 }, badges: ['ice-breaker','early-bird'] },
  { name: 'Chloe Hartwell',   role: 'Technical', location: 'London',     profile: 'steady',       streak: { currentMonthlyStreak: 1, bestMonthlyStreak: 3 }, badges: ['lab-rat','retention-shield'] },
  { name: 'Karim Tazi',       role: 'Technical', location: 'Casablanca', profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat'] },
  // Financial
  { name: 'Helena Voss',      role: 'Financial', location: 'London',     profile: 'strong',       streak: { currentMonthlyStreak: 6, bestMonthlyStreak: 6 }, badges: ['front-loader','peak-month','arena-champion','on-fire','client-whisperer','diamond-hands'] },
  { name: 'Marc Dufresne',    role: 'Financial', location: 'Dublin',     profile: 'steady',       streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 4 }, badges: ['early-bird','iron-wall','sniper'] },
  { name: 'Ines Cherkaoui',   role: 'Financial', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 3, bestMonthlyStreak: 3 }, badges: ['ice-breaker','growth-engine','retention-shield'] },
  { name: 'Tom Whitaker',     role: 'Financial', location: 'London',     profile: 'inconsistent', streak: { currentMonthlyStreak: 0, bestMonthlyStreak: 2 }, badges: ['lab-rat','hat-trick'] },
  { name: 'Saoirse Kelly',    role: 'Financial', location: 'Dublin',     profile: 'strong',       streak: { currentMonthlyStreak: 4, bestMonthlyStreak: 5 }, badges: ['front-loader','peak-month','on-fire','sniper'] },
  { name: 'Mehdi Bouzid',     role: 'Financial', location: 'Casablanca', profile: 'improving',    streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 2 }, badges: ['ice-breaker','early-bird'] },
  { name: 'Priya Anand',      role: 'Financial', location: 'London',     profile: 'steady',       streak: { currentMonthlyStreak: 2, bestMonthlyStreak: 3 }, badges: ['lab-rat','client-whisperer'] },
  { name: 'Lucas Moreau',     role: 'Financial', location: 'Dublin',     profile: 'inconsistent', streak: { currentMonthlyStreak: 1, bestMonthlyStreak: 2 }, badges: ['lab-rat','retention-shield'] },
]

// Deterministically spreads a consultant's earned badges across the 6 months.
// Current user (idx 0) always has their final badge land in the latest month so
// the unlock animation has something to play on first visit.
function buildBadgeEarnedAt(badges, idx) {
  const map = {}
  badges.forEach((badgeId, bi) => {
    const slot = idx === 0 && bi === badges.length - 1
      ? MONTHS.length - 1
      : (bi + idx) % MONTHS.length
    map[badgeId] = MONTHS[slot]
  })
  return map
}

export const CONSULTANTS = SEED.map((c, idx) => ({
  id: `c-${String(idx + 1).padStart(2, '0')}`,
  name: c.name,
  role: c.role,
  location: c.location,
  badges: c.badges,
  badgeEarnedAt: buildBadgeEarnedAt(c.badges, idx),
  streaks: c.streak,
  monthlyStats: buildMonthlyStats(c.profile, (idx % 4) - 1),
}))

export const MONTHS_AVAILABLE = MONTHS
export const CURRENT_USER_ID = 'c-01' // Amélie, for "My Profile"
