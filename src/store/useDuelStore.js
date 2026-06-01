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
    status:       'active',
  },
  // Antonio vs Jennifer — heavyweight clash on ops
  {
    id: 'd-002',
    challengerId: 'c-08',
    opponentId:   'c-18',
    metric:       'opsDelivered',
    durationDays: 14,
    startedAt:    Date.now() - 3 * 24 * 3600 * 1000,
    endsAt:       daysFromNow(11),
    stake:        '£20 to the charity of your choice',
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
    status:       'completed',
    winnerId:     'c-01',
    scores:       { 'c-01': 4, 'c-10': 2 },
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
    const next = { id, status: 'active', startedAt, endsAt, ...duel }
    set({ duels: [next, ...get().duels] })
    return next
  },

  conclude: (id, winnerId, scores) =>
    set({
      duels: get().duels.map((d) => (d.id === id ? { ...d, status: 'completed', winnerId, scores } : d)),
    }),

  cancel: (id) =>
    set({ duels: get().duels.filter((d) => d.id !== id) }),
}))

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
