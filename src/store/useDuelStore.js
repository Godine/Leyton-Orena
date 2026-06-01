import { create } from 'zustand'

// Head-to-head duels between two consultants over a fixed window.
// `metric` is one of the keys we already aggregate over monthlyStats.
// `endsAt` is a ms epoch; computed progress comes from the consultants' stats
// at lookup time so live edits in /admin reflect in real-time.

export const DUEL_METRICS = [
  { key: 'invoiceValue',          label: 'Invoice value (£)',  betterWhenLower: false },
  { key: 'opsDelivered',          label: 'Ops delivered',      betterWhenLower: false },
  { key: 'invoiceBeforeDay15Pct', label: 'Early invoice %',    betterWhenLower: false },
  { key: 'avgDaysToClose',        label: 'Avg days to close',  betterWhenLower: true },
]

export const DURATION_DAYS = [
  { key: 7,  label: 'A week' },
  { key: 14, label: 'A fortnight' },
  { key: 30, label: 'A month' },
]

function daysFromNow(days) { return Date.now() + days * 24 * 3600 * 1000 }

const seedDuels = [
  // Demo: current user (c-01 Oumayma) vs Lucas — invoice race over the month
  {
    id: 'd-001',
    challengerId: 'c-01',
    opponentId:   'c-05',
    metric:       'invoiceValue',
    durationDays: 30,
    startedAt:    Date.now() - 9 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(21),
    stake:        'Loser buys lunch',
    message:      'Bring it, Lucas. Front-load month — let\'s see who blinks first.',
    cheers:       { 'c-08': 1, 'c-11': 1, 'c-17': 1 },
    status:       'active',
  },
  // Oumayma vs David Buckley — week-long ops blitz
  {
    id: 'd-005',
    challengerId: 'c-01',
    opponentId:   'c-02',
    metric:       'opsDelivered',
    durationDays: 7,
    startedAt:    Date.now() - 2 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(5),
    stake:        'Coffee for a week',
    message:      'First to 10 closes — go.',
    cheers:       { 'c-05': 1, 'c-06': 1 },
    status:       'active',
  },
  // Oumayma vs Ramin — early-invoice % over a fortnight
  {
    id: 'd-006',
    challengerId: 'c-01',
    opponentId:   'c-03',
    metric:       'invoiceBeforeDay15Pct',
    durationDays: 14,
    startedAt:    Date.now() - 5 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(9),
    stake:        '£20 to a charity of your choice',
    message:      'Two weeks. Whoever raises more by day 15 takes it.',
    cheers:       { 'c-11': 1 },
    status:       'active',
  },
  // Antonio vs Jennifer — heavyweight clash on ops (spectator duel)
  {
    id: 'd-002',
    challengerId: 'c-08',
    opponentId:   'c-18',
    metric:       'opsDelivered',
    durationDays: 14,
    startedAt:    Date.now() - 3 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(11),
    stake:        '£20 to the charity of your choice',
    message:      'Round 3. Last quarter you took it by one — not happening again.',
    cheers:       { 'c-01': 1, 'c-05': 1, 'c-11': 1, 'c-16': 1 },
    status:       'active',
  },
  // Israe vs Scott — early-invoice % showdown
  {
    id: 'd-007',
    challengerId: 'c-11',
    opponentId:   'c-16',
    metric:       'invoiceBeforeDay15Pct',
    durationDays: 30,
    startedAt:    Date.now() - 6 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(24),
    stake:        'Bragging rights at the next all-hands',
    message:      'Casa vs Glasgow. May the front-loader win.',
    cheers:       { 'c-08': 1, 'c-17': 1 },
    status:       'active',
  },
  // A completed past duel (current user won) for the history block
  {
    id: 'd-003',
    challengerId: 'c-01',
    opponentId:   'c-10',
    metric:       'opsDelivered',
    durationDays: 7,
    startedAt:    Date.now() - 21 * 24 * 3600 * 1000,
    endsAt:       Date.now() - 14 * 24 * 3600 * 1000,
    stake:        'Coffee on you',
    message:      'Quick one — first to 5.',
    cheers:       { 'c-05': 1 },
    status:       'completed',
    winnerId:     'c-01',
    scores:       { 'c-01': 4, 'c-10': 2 },
  },
  // Past duel — current user lost narrowly
  {
    id: 'd-004',
    challengerId: 'c-11',
    opponentId:   'c-01',
    metric:       'invoiceValue',
    durationDays: 30,
    startedAt:    Date.now() - 55 * 24 * 3600 * 1000,
    endsAt:       Date.now() - 25 * 24 * 3600 * 1000,
    stake:        'Dinner on the loser',
    message:      'Casablanca derby. Big-month showdown.',
    cheers:       { 'c-14': 1, 'c-15': 1 },
    status:       'completed',
    winnerId:     'c-11',
    scores:       { 'c-11': 88000, 'c-01': 84000 },
  },
]

export const useDuelStore = create((set, get) => ({
  duels: seedDuels,

  active: () => get().duels.filter((d) => d.status === 'active'),
  completed: () => get().duels.filter((d) => d.status === 'completed'),

  forConsultant: (id) =>
    get().duels.filter((d) => d.challengerId === id || d.opponentId === id),

  create: (duel) => {
    const id = `d-${Date.now()}`
    const startedAt = Date.now()
    const endsAt = daysFromNow(duel.durationDays)
    const next = { id, status: 'active', startedAt, endsAt, cheers: {}, ...duel }
    set({ duels: [next, ...get().duels] })
    return next
  },

  conclude: (id, winnerId, scores) =>
    set({
      duels: get().duels.map((d) => (d.id === id ? { ...d, status: 'completed', winnerId, scores } : d)),
    }),

  cancel: (id) =>
    set({ duels: get().duels.filter((d) => d.id !== id) }),

  // Add a cheer from a spectator for a side of the duel. Idempotent per
  // spectator — they can swap sides but only one cheer counted at a time.
  cheer: (duelId, spectatorId, sideConsultantId) =>
    set({
      duels: get().duels.map((d) => {
        if (d.id !== duelId) return d
        const cheers = { ...(d.cheers ?? {}) }
        cheers[spectatorId] = sideConsultantId
        return { ...d, cheers }
      }),
    }),
}))

// Counts cheers grouped by side. `cheers` maps spectatorId → sideConsultantId.
export function tallyCheers(duel) {
  const out = {}
  for (const side of Object.values(duel?.cheers ?? {})) {
    out[side] = (out[side] ?? 0) + 1
  }
  return out
}

// A synthetic 10-point lead-margin history for the duel. Real backend would
// store daily snapshots — for the MVP we ease from 0 toward the current
// margin with a wobble seeded off the duel id so the curve is stable.
export function leadHistory(duel, scoreA, scoreB, points = 10) {
  const final = scoreA - scoreB
  const seed = duel.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const out = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    const wobble = Math.sin((i + seed) * 1.7) * Math.abs(final) * 0.25
    out.push(final * t + wobble)
  }
  // Force the final point to exactly match current margin.
  out[points - 1] = final
  return out
}

// Compute the current score of a duel from each consultant's stats. We score
// against the *latest* tracked month for simplicity — when a real backend
// lands this would slice by startedAt..now.
export function scoreDuel(duel, consultants, months) {
  const sorted = [...months].sort()
  const latest = sorted.at(-1)
  const lookup = (id) => {
    const c = consultants.find((x) => x.id === id)
    if (!c) return 0
    const m = c.monthlyStats?.find((s) => s.month === latest)
    return m?.[duel.metric] ?? 0
  }
  const a = lookup(duel.challengerId)
  const b = lookup(duel.opponentId)
  const meta = DUEL_METRICS.find((m) => m.key === duel.metric)
  const aWins = meta?.betterWhenLower ? a < b : a > b
  return {
    a, b,
    leaderId: a === b ? null : (aWins ? duel.challengerId : duel.opponentId),
    timeLeftMs: Math.max(0, duel.endsAt - Date.now()),
  }
}
