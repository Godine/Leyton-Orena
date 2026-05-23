import { create } from 'zustand'

// Monthly challenges. `progressFn(user, peers, latestMonth, challenge)` returns
// { value, target, ratio, completed, valueLabel, targetLabel } — challenge is
// passed in so live target edits from the Admin page take effect.

export const CHALLENGES = [
  {
    id: 'front-load-current',
    title: 'Front-Load the Month',
    description: 'Raise this share of your invoice value before day 15.',
    type: 'individual',
    metric: 'invoiceBeforeDay15Pct',
    target: 70,
    reward: { type: 'badge', badgeId: 'front-loader' },
    daysLeft: 12,
    icon: '⚡',
    progressFn: (user, _peers, latestMonth, challenge) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      const value = m?.invoiceBeforeDay15Pct ?? 0
      const target = challenge.target
      return {
        value, target,
        ratio: target === 0 ? 1 : Math.min(1, value / target),
        completed: value >= target,
        valueLabel: `${Math.round(value)}%`,
        targetLabel: `${target}%`,
      }
    },
  },
  {
    id: 'ops-blitz',
    title: 'Ops Blitz',
    description: 'The team delivers this many total Ops this month.',
    type: 'team',
    metric: 'opsDelivered',
    target: 50,
    reward: { type: 'team-celebration' },
    daysLeft: 12,
    icon: '🚀',
    progressFn: (user, peers, latestMonth, challenge) => {
      const sameRole = peers.filter((p) => p.role === user.role)
      const total = sameRole.reduce((acc, p) => {
        const m = p.monthlyStats.find((s) => s.month === latestMonth)
        return acc + (m?.opsDelivered ?? 0)
      }, 0)
      const target = challenge.target
      return {
        value: total, target,
        ratio: target === 0 ? 1 : Math.min(1, total / target),
        completed: total >= target,
        valueLabel: `${total} ops`,
        targetLabel: `${target} ops`,
      }
    },
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Hit this many sub-5-day average closes.',
    type: 'individual',
    metric: 'avgDaysToClose',
    target: 2,
    reward: { type: 'badge', badgeId: 'sniper' },
    daysLeft: 12,
    icon: '🎯',
    progressFn: (user, _peers, latestMonth, challenge) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      const close = m?.avgDaysToClose ?? Infinity
      const value = close <= 5 ? 2 : close <= 6 ? 1 : 0
      const target = challenge.target
      return {
        value, target,
        ratio: target === 0 ? 1 : Math.min(1, value / target),
        completed: value >= target,
        valueLabel: `${value}/${target} fast closes`,
        targetLabel: `${target} fast closes`,
      }
    },
  },
  {
    id: 'clean-sheet',
    title: 'Clean Sheet',
    description: 'Keep pushed Ops at or below this number.',
    type: 'individual',
    metric: 'pushedOps',
    target: 0,
    reward: { type: 'badge', badgeId: 'iron-wall' },
    daysLeft: 12,
    icon: '🛡️',
    progressFn: (user, _peers, latestMonth, challenge) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      const pushed = m?.pushedOps ?? 0
      const target = challenge.target
      const ratio = pushed <= target ? 1 : Math.max(0, 1 - (pushed - target) * 0.3)
      return {
        value: pushed, target,
        ratio,
        completed: pushed <= target,
        valueLabel: `${pushed} pushed`,
        targetLabel: `≤ ${target} pushed`,
      }
    },
  },
]

export const useChallengeStore = create((set, get) => ({
  challenges: CHALLENGES,
  updateChallenge: (id, patch) =>
    set({
      challenges: get().challenges.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }),
}))
