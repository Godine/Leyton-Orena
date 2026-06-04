import { create } from 'zustand'
import { BADGES_BY_ID, RARITY_STYLES } from '../data/badges.js'

// Points-per-rarity exchange rate. Tuned so a single mythic feels significant
// (≈250pt) and stacking commons doesn't trivially out-earn them.
export const POINTS_PER_RARITY = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
  mythic: 250,
}

export function pointsForBadges(badgeIds = []) {
  return badgeIds.reduce((acc, id) => {
    const b = BADGES_BY_ID[id]
    if (!b) return acc
    return acc + (POINTS_PER_RARITY[b.rarity] ?? 0)
  }, 0)
}

// Demo reward catalogue. Tagged with a chunky illustration emoji and a category
// so the rewards page can group them.
export const REWARDS = [
  // ── Treats ──────────────────────────────────────────────────────────────────
  { id: 'breakfast', name: 'Friday breakfast on us',  cost: 80,   icon: '🥐', category: 'Treats',      description: 'Croissants + coffee delivered to your desk.' },
  { id: 'coffee',    name: 'Coffee on us',            cost: 50,   icon: '☕', category: 'Treats',      description: 'A barista coffee on the company.' },
  { id: 'lunch',     name: 'Lunch on the team',       cost: 200,  icon: '🥗', category: 'Treats',      description: 'Up to £25 lunch wherever you fancy.' },
  { id: 'cinema',    name: 'Cinema tickets',          cost: 250,  icon: '🎬', category: 'Treats',      description: 'Two seats at any UK cinema.' },
  { id: 'theatre',   name: 'Theatre tickets',         cost: 600,  icon: '🎭', category: 'Treats',      description: 'Two seats at a West End or local production.' },

  // ── Wellness ────────────────────────────────────────────────────────────────
  { id: 'gym',       name: 'Gym membership · 1 month', cost: 350, icon: '💪', category: 'Wellness',   description: 'A month at a partner gym near you.' },
  { id: 'massage',   name: 'Massage session',          cost: 400, icon: '💆', category: 'Wellness',   description: '60-minute deep-tissue or sports massage.' },
  { id: 'mhd',       name: 'Mental health day',        cost: 700, icon: '🧘', category: 'Wellness',   description: 'A wellbeing day with no questions asked.' },
  { id: 'spa',       name: 'Spa half-day',             cost: 800, icon: '🧖', category: 'Wellness',   description: 'Half-day spa pass at a partner venue.' },

  // ── Cause ───────────────────────────────────────────────────────────────────
  { id: 'tree',      name: '10 trees planted',         cost: 150,  icon: '🌳', category: 'Cause',      description: 'Ten trees planted in your name.' },
  { id: 'donation',  name: '£25 to your charity',      cost: 300,  icon: '🤝', category: 'Cause',      description: 'We donate £25 to a charity of your choice.' },
  { id: 'tree-50',   name: '50 trees planted',         cost: 500,  icon: '🌲', category: 'Cause',      description: 'Fifty trees planted — your forest grows.' },
  { id: 'donation2', name: '£100 to your charity',     cost: 1200, icon: '🎗️', category: 'Cause',      description: 'We donate £100 to a charity of your choice.' },

  // ── Time ────────────────────────────────────────────────────────────────────
  { id: 'latestart', name: 'Two-hour late start',      cost: 200,  icon: '⏰', category: 'Time',       description: 'Skip the morning standup — start at lunch.' },
  { id: 'halfday',   name: 'Half-day off',             cost: 500,  icon: '🛋️', category: 'Time',       description: 'Knock off at lunchtime, no questions.' },
  { id: 'wfh',       name: 'WFH-anywhere week',        cost: 600,  icon: '🌴', category: 'Time',       description: 'Work from anywhere for a full week.' },
  { id: 'dayoff',    name: 'Full day off',             cost: 1200, icon: '🏖️', category: 'Time',       description: 'A free day of leave on the house.' },
  { id: 'longwknd',  name: 'Long weekend (Mon off)',   cost: 1500, icon: '🏝️', category: 'Time',       description: 'Tag a free Monday onto the weekend.' },

  // ── Growth ──────────────────────────────────────────────────────────────────
  { id: 'book',      name: 'Book budget · £100',       cost: 500,  icon: '📖', category: 'Growth',     description: 'Up to £100 of books on us.' },
  { id: 'linkedin',  name: 'LinkedIn Premium · 6 mo',  cost: 600,  icon: '💼', category: 'Growth',     description: 'Six months of LinkedIn Premium on us.' },
  { id: 'mentor',    name: '1:1 with the Director',    cost: 700,  icon: '🧭', category: 'Growth',     description: 'A 45-minute mentoring session with leadership.' },
  { id: 'course',    name: 'Online course · £200',     cost: 800,  icon: '🎓', category: 'Growth',     description: 'Course / certification of your choice up to £200.' },
  { id: 'extmentor', name: 'Industry mentor session',  cost: 1200, icon: '🧑‍🏫', category: 'Growth',  description: '90 minutes with an external industry mentor.' },
  { id: 'training',  name: '£500 training budget',     cost: 1500, icon: '📚', category: 'Growth',     description: 'Larger course / certification of your choice.' },
  { id: 'conference', name: 'Conference ticket',       cost: 2500, icon: '🎟️', category: 'Growth',     description: 'Industry conference, travel + accom included.' },

  // ── Experience ──────────────────────────────────────────────────────────────
  { id: 'f1sim',     name: 'F1 simulator session',     cost: 800,  icon: '🏎️', category: 'Experience', description: 'Hour of pro-grade F1 simulator time.' },
  { id: 'escape',    name: 'Escape room for the team', cost: 1200, icon: '🗝️', category: 'Experience', description: 'Bring your pod — an hour of locked-room puzzles.' },
  { id: 'concert',   name: 'Concert ticket',           cost: 1800, icon: '🎤', category: 'Experience', description: 'Pick a gig — we cover the ticket.' },
  { id: 'football',  name: 'Premier League ticket',    cost: 2200, icon: '⚽', category: 'Experience', description: 'A Saturday at a Premier League match.' },
  { id: 'balloon',   name: 'Hot-air balloon ride',     cost: 3500, icon: '🎈', category: 'Experience', description: 'Sunrise champagne balloon flight for two.' },

  // ── Recognition ─────────────────────────────────────────────────────────────
  { id: 'shoutout',  name: 'LinkedIn shoutout',        cost: 300,  icon: '📣', category: 'Recognition', description: 'A feature post from the official Leyton page.' },
  { id: 'newsletter', name: 'Newsletter profile piece', cost: 400, icon: '📰', category: 'Recognition', description: 'A short profile in the next company newsletter.' },
  { id: 'allhands',  name: 'Spotlight at all-hands',   cost: 500,  icon: '🎙️', category: 'Recognition', description: '60-second spotlight at the next all-hands.' },
  { id: 'plaque',    name: 'Arena Champion plaque',    cost: 800,  icon: '🏆', category: 'Recognition', description: 'Custom engraved plaque for your desk.' },
]

export const REWARD_CATEGORIES = ['Treats', 'Wellness', 'Cause', 'Time', 'Growth', 'Experience', 'Recognition']

const seedRedemptions = [
  // a couple of pre-redeemed items for demo realism
  { id: 'r-001', consultantId: 'c-08', rewardId: 'conference', at: Date.now() - 14 * 24 * 3600 * 1000 },
  { id: 'r-002', consultantId: 'c-01', rewardId: 'coffee',     at: Date.now() - 4 * 24 * 3600 * 1000 },
  { id: 'r-003', consultantId: 'c-01', rewardId: 'tree',       at: Date.now() - 1 * 24 * 3600 * 1000 },
]

export const useRewardStore = create((set, get) => ({
  redemptions: seedRedemptions,

  // Net balance = total points earned from badges − cost of redeemed rewards.
  balanceFor: (consultant) => {
    const earned = pointsForBadges(consultant?.badges)
    const spent = get().redemptions
      .filter((r) => r.consultantId === consultant?.id)
      .reduce((acc, r) => acc + (REWARDS.find((x) => x.id === r.rewardId)?.cost ?? 0), 0)
    return { earned, spent, balance: earned - spent }
  },

  history: (consultantId) =>
    get().redemptions.filter((r) => r.consultantId === consultantId).sort((a, b) => b.at - a.at),

  redeem: (consultantId, rewardId) => {
    const reward = REWARDS.find((r) => r.id === rewardId)
    if (!reward) return { ok: false, reason: 'unknown-reward' }
    const id = `r-${Date.now()}`
    set({
      redemptions: [{ id, consultantId, rewardId, at: Date.now() }, ...get().redemptions],
    })
    return { ok: true, redemption: { id, consultantId, rewardId, at: Date.now() } }
  },
}))

export function rarityBreakdown(badgeIds = []) {
  const counts = { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 }
  for (const id of badgeIds) {
    const b = BADGES_BY_ID[id]
    if (b) counts[b.rarity] += 1
  }
  return Object.entries(counts).map(([rarity, n]) => ({
    rarity,
    label: RARITY_STYLES[rarity].label,
    count: n,
    points: n * (POINTS_PER_RARITY[rarity] ?? 0),
  }))
}
