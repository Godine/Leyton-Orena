// Badge registry. Organised into nine categories that map onto specific
// outcomes the leadership wants to drive. Each badge belongs to one category
// and one rarity tier (common → rare → epic → legendary → mythic).
// `tier` is the badge's position within its category ladder (1-based) so the
// UI can render them as a progression.

export const BADGE_CATEGORIES = [
  { id: 'early-invoicing', label: 'Early Invoicing', icon: '⚡', accent: '#ffc800',
    description: 'Cash in the door early — first of the month, day-5 raises, and the % ladder by day 15.' },
  { id: 'streaks',         label: 'Monthly Streaks', icon: '🔥', accent: '#ff4b4b',
    description: 'Months in a row hitting your monthly target.' },
  { id: 'revenue',         label: 'Big Revenue',     icon: '💰', accent: '#F75C03',
    description: 'Heavy-hitter months by invoice value.' },
  { id: 'volume',          label: 'Volume',          icon: '💎', accent: '#ce82ff',
    description: 'Claims invoiced in a single month.' },
  { id: 'reviews',         label: 'Client Voice',    icon: '⭐', accent: '#ffc800',
    description: 'Trustpilot reviews from your clients.' },
  { id: 'speed',           label: 'Speed to Cash',   icon: '🎯', accent: '#1cb0f6',
    description: 'Days from new contract to first invoice (lower is better).' },
  { id: 'championship',    label: 'Championship',    icon: '👑', accent: '#ffc800',
    description: 'Quarters finished #1 on the leaderboard.' },
  { id: 'reliability',     label: 'Reliability',     icon: '🛡️', accent: '#F75C03',
    description: 'Months in a row with zero pushed Ops.' },
  { id: 'fire',            label: 'Daily Fire',      icon: '☄️', accent: '#ff7a00',
    description: 'Consecutive days advancing at least one claim by a stage.' },
]

export const CATEGORY_BY_ID = Object.fromEntries(BADGE_CATEGORIES.map((c) => [c.id, c]))

export const BADGES = [
  // ── Early Invoicing ─────────────────────────────────────────────────────────
  { id: 'first-of-month', category: 'early-invoicing', tier: 1, name: 'Trailblazer',  icon: '🚀', rarity: 'rare',
    description: 'First consultant to invoice a claim this month.',
    criteria: 'You raised the first invoice of the calendar month across the team.' },
  { id: 'day-5',          category: 'early-invoicing', tier: 2, name: 'Early Bird',   icon: '🌅', rarity: 'common',
    description: 'Raised an invoice before day 5 of the month.',
    criteria: 'Earliest invoice raised on day ≤ 5 in any month.' },
  { id: 'early-40',       category: 'early-invoicing', tier: 3, name: 'Foothold',     icon: '🌑', rarity: 'common',
    description: '40%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 40.' },
  { id: 'pacemaker',      category: 'early-invoicing', tier: 4, name: 'Pacemaker',    icon: '🌒', rarity: 'common',
    description: '50%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 50.' },
  { id: 'front-runner',   category: 'early-invoicing', tier: 5, name: 'Front Runner', icon: '🌓', rarity: 'rare',
    description: '60%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 60.' },
  { id: 'cash-closer',    category: 'early-invoicing', tier: 6, name: 'Cash Closer',  icon: '🌔', rarity: 'epic',
    description: '70%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 70.' },
  { id: 'front-loader',   category: 'early-invoicing', tier: 7, name: 'Front-Loader', icon: '⚡', rarity: 'legendary',
    description: '80%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 80.' },
  { id: 'untouchable',    category: 'early-invoicing', tier: 8, name: 'Untouchable',  icon: '💫', rarity: 'mythic',
    description: '90%+ of monthly invoice raised before day 15.', criteria: 'invoiceBeforeDay15Pct ≥ 90.' },

  // ── Monthly Streaks ─────────────────────────────────────────────────────────
  { id: 'kindling',  category: 'streaks', tier: 1, name: 'Kindling',  icon: '🕯️', rarity: 'common',
    description: '2-month streak of hitting target.', criteria: 'bestMonthlyStreak ≥ 2.' },
  { id: 'on-fire',   category: 'streaks', tier: 2, name: 'On Fire',   icon: '🔥', rarity: 'rare',
    description: '3-month streak of hitting target.', criteria: 'bestMonthlyStreak ≥ 3.' },
  { id: 'heatwave',  category: 'streaks', tier: 3, name: 'Heatwave',  icon: '🌋', rarity: 'epic',
    description: '4-month streak of hitting target.', criteria: 'bestMonthlyStreak ≥ 4.' },
  { id: 'inferno',   category: 'streaks', tier: 4, name: 'Inferno',   icon: '💥', rarity: 'legendary',
    description: '5-month streak of hitting target.', criteria: 'bestMonthlyStreak ≥ 5.' },
  { id: 'supernova', category: 'streaks', tier: 5, name: 'Supernova', icon: '☄️', rarity: 'mythic',
    description: '6-month streak of hitting target.', criteria: 'bestMonthlyStreak ≥ 6.' },

  // ── Big Revenue ─────────────────────────────────────────────────────────────
  { id: 'rev-100k', category: 'revenue', tier: 1, name: 'Six-Figure Month', icon: '💰', rarity: 'epic',
    description: '£100k+ invoiced in a single month.', criteria: 'invoiceValue ≥ £100,000 in any month.' },
  { id: 'rev-150k', category: 'revenue', tier: 2, name: 'Heavyweight',      icon: '💎', rarity: 'legendary',
    description: '£150k+ invoiced in a single month.', criteria: 'invoiceValue ≥ £150,000 in any month.' },
  { id: 'rev-200k', category: 'revenue', tier: 3, name: 'Whale',            icon: '🐋', rarity: 'mythic',
    description: '£200k+ invoiced in a single month.', criteria: 'invoiceValue ≥ £200,000 in any month.' },

  // ── Volume ──────────────────────────────────────────────────────────────────
  { id: 'vol-15', category: 'volume', tier: 1, name: 'Steady Stream',   icon: '📦', rarity: 'common',
    description: '15+ claims invoiced in a month.', criteria: 'opsDelivered ≥ 15.' },
  { id: 'vol-20', category: 'volume', tier: 2, name: 'Pipeline Beast',  icon: '🚛', rarity: 'rare',
    description: '20+ claims invoiced in a month.', criteria: 'opsDelivered ≥ 20.' },
  { id: 'vol-25', category: 'volume', tier: 3, name: 'Industrial',      icon: '🏭', rarity: 'epic',
    description: '25+ claims invoiced in a month.', criteria: 'opsDelivered ≥ 25.' },
  { id: 'vol-30', category: 'volume', tier: 4, name: 'Production Line', icon: '⚙️', rarity: 'legendary',
    description: '30+ claims invoiced in a month.', criteria: 'opsDelivered ≥ 30.' },

  // ── Client Voice (Trustpilot reviews, lifetime) ────────────────────────────
  { id: 'reviews-1', category: 'reviews', tier: 1, name: 'First Voice',   icon: '⭐',    rarity: 'common',
    description: 'Received your first Trustpilot review.', criteria: 'trustpilotReviews ≥ 1.' },
  { id: 'reviews-2', category: 'reviews', tier: 2, name: 'Echo Chamber',  icon: '⭐⭐',   rarity: 'common',
    description: 'Two Trustpilot reviews from your clients.', criteria: 'trustpilotReviews ≥ 2.' },
  { id: 'reviews-3', category: 'reviews', tier: 3, name: 'Crowd Pleaser', icon: '🌟',    rarity: 'rare',
    description: 'Three Trustpilot reviews from your clients.', criteria: 'trustpilotReviews ≥ 3.' },
  { id: 'reviews-4', category: 'reviews', tier: 4, name: 'Fan Favourite', icon: '💖',    rarity: 'epic',
    description: 'Four Trustpilot reviews from your clients.', criteria: 'trustpilotReviews ≥ 4.' },
  { id: 'reviews-5', category: 'reviews', tier: 5, name: 'Headliner',     icon: '🏆',    rarity: 'legendary',
    description: 'Five Trustpilot reviews from your clients.', criteria: 'trustpilotReviews ≥ 5.' },
  { id: 'reviews-6', category: 'reviews', tier: 6, name: 'Cult Following', icon: '👑',   rarity: 'mythic',
    description: 'Six Trustpilot reviews from your clients.', criteria: 'trustpilotReviews ≥ 6.' },

  // ── Speed to Cash (new contract → first invoice, days, lower better) ──────
  { id: 'speed-90', category: 'speed', tier: 1, name: 'Quick Pivot',   icon: '🏁', rarity: 'common',
    description: 'Invoiced a new contract within 90 days.', criteria: 'fastestNewContractDays ≤ 90.' },
  { id: 'speed-60', category: 'speed', tier: 2, name: 'Brisk',         icon: '🏃', rarity: 'rare',
    description: 'Invoiced a new contract within 60 days.', criteria: 'fastestNewContractDays ≤ 60.' },
  { id: 'speed-30', category: 'speed', tier: 3, name: 'Sprinter',      icon: '⚡', rarity: 'epic',
    description: 'Invoiced a new contract within 30 days.', criteria: 'fastestNewContractDays ≤ 30.' },
  { id: 'speed-15', category: 'speed', tier: 4, name: 'Bullet Train',  icon: '🚄', rarity: 'legendary',
    description: 'Invoiced a new contract within 15 days.', criteria: 'fastestNewContractDays ≤ 15.' },
  { id: 'speed-7',  category: 'speed', tier: 5, name: 'Light Speed',   icon: '🌠', rarity: 'mythic',
    description: 'Invoiced a new contract within 7 days.', criteria: 'fastestNewContractDays ≤ 7.' },

  // ── Championship (quarterly #1 finishes, lifetime) ─────────────────────────
  { id: 'champ-1q',   category: 'championship', tier: 1, name: 'Arena Champion', icon: '👑', rarity: 'rare',
    description: '#1 on the leaderboard at the end of a quarter.', criteria: 'championshipQuarters ≥ 1.' },
  { id: 'champ-2q',   category: 'championship', tier: 2, name: 'Back-to-Back',   icon: '🥇', rarity: 'epic',
    description: '#1 for two consecutive quarters.', criteria: 'championshipBestRun ≥ 2.' },
  { id: 'champ-3q',   category: 'championship', tier: 3, name: 'Three-peat',     icon: '🏆', rarity: 'legendary',
    description: '#1 for three consecutive quarters.', criteria: 'championshipBestRun ≥ 3.' },
  { id: 'champ-year', category: 'championship', tier: 4, name: 'Dynasty',        icon: '🌟', rarity: 'mythic',
    description: '#1 for a full year (four consecutive quarters).', criteria: 'championshipBestRun ≥ 4.' },

  // ── Reliability (consecutive months with zero pushes) ──────────────────────
  { id: 'noPush-1', category: 'reliability', tier: 1, name: 'Clean Sheet', icon: '✅', rarity: 'common',
    description: 'A full month with zero pushed Ops.', criteria: 'A single month with pushedOps = 0.' },
  { id: 'noPush-2', category: 'reliability', tier: 2, name: 'Iron Wall',   icon: '🛡️', rarity: 'common',
    description: '2-month streak of zero pushed Ops.', criteria: 'noPushStreak ≥ 2.' },
  { id: 'noPush-3', category: 'reliability', tier: 3, name: 'Fortress',    icon: '🏰', rarity: 'rare',
    description: '3-month streak of zero pushed Ops.', criteria: 'noPushStreak ≥ 3.' },
  { id: 'noPush-4', category: 'reliability', tier: 4, name: 'Bulwark',     icon: '⚔️', rarity: 'epic',
    description: '4-month streak of zero pushed Ops.', criteria: 'noPushStreak ≥ 4.' },
  { id: 'noPush-5', category: 'reliability', tier: 5, name: 'Citadel',     icon: '🗿', rarity: 'legendary',
    description: '5-month streak of zero pushed Ops.', criteria: 'noPushStreak ≥ 5.' },
  { id: 'noPush-6', category: 'reliability', tier: 6, name: 'Unbreakable', icon: '💠', rarity: 'mythic',
    description: '6-month streak of zero pushed Ops.', criteria: 'noPushStreak ≥ 6.' },

  // ── Daily Fire (claim-stage advance streak) ────────────────────────────────
  { id: 'fire-7',  category: 'fire', tier: 1, name: 'Hot Week',     icon: '🔥',  rarity: 'common',
    description: '7-day claim-stage advance streak.', criteria: 'fire.best ≥ 7.' },
  { id: 'fire-15', category: 'fire', tier: 2, name: 'Wildfire',     icon: '🌶️', rarity: 'rare',
    description: '15-day claim-stage advance streak.', criteria: 'fire.best ≥ 15.' },
  { id: 'fire-30', category: 'fire', tier: 3, name: 'Eternal Flame', icon: '🕯️', rarity: 'epic',
    description: '30-day claim-stage advance streak.', criteria: 'fire.best ≥ 30.' },
  { id: 'fire-45', category: 'fire', tier: 4, name: 'Phoenix',       icon: '🦅', rarity: 'legendary',
    description: '45-day claim-stage advance streak.', criteria: 'fire.best ≥ 45.' },
  { id: 'fire-60', category: 'fire', tier: 5, name: 'Sun God',       icon: '☀️', rarity: 'mythic',
    description: '60-day claim-stage advance streak.', criteria: 'fire.best ≥ 60.' },
]

export const BADGES_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]))

// Helper: badges within a category sorted by tier.
export const BADGES_BY_CATEGORY = BADGE_CATEGORIES.reduce((acc, c) => {
  acc[c.id] = BADGES.filter((b) => b.category === c.id).sort((a, b) => a.tier - b.tier)
  return acc
}, {})

export const RARITY_STYLES = {
  common: {
    label: 'Common',
    text: 'text-arena-muted',
    ring: 'ring-arena-border',
    bg: 'bg-arena-surface2',
  },
  rare: {
    label: 'Rare',
    text: 'text-sky-300',
    ring: 'ring-sky-400/50',
    bg: 'bg-sky-500/10',
  },
  epic: {
    label: 'Epic',
    text: 'text-arena-amber',
    ring: 'ring-arena-amber/60',
    bg: 'bg-arena-amber/10',
  },
  legendary: {
    label: 'Legendary',
    text: 'text-arena-coral',
    ring: 'ring-arena-coral/70',
    bg: 'bg-arena-coral/10',
  },
  mythic: {
    label: 'Mythic',
    text: 'text-teal-300',
    ring: 'ring-teal-300/80',
    bg: 'bg-teal-400/10',
  },
}
