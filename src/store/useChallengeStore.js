import { create } from 'zustand'

// Monthly challenges. `progressFn(currentUser, consultants, latestMonth)`
// returns { value, target, ratio, completed, totalLabel }.
// Wrapped in a function because we want live progress from current data.

export const CHALLENGES = [
  {
    id: 'front-load-current',
    title: 'Front-Load the Month',
    description: 'Raise 70%+ of your invoice value before day 15.',
    type: 'individual',
    metric: 'invoiceBeforeDay15Pct',
    target: 70,
    reward: { type: 'badge', badgeId: 'front-loader' },
    daysLeft: 12,
    icon: '⚡',
    progressFn: (user, _peers, latestMonth) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      const value = m?.invoiceBeforeDay15Pct ?? 0
      const target = 70
      return {
        value, target,
        ratio: Math.min(1, value / target),
        completed: value >= target,
        valueLabel: `${Math.round(value)}%`,
        targetLabel: `${target}%`,
      }
    },
  },
  {
    id: 'ops-blitz',
    title: 'Ops Blitz',
    description: 'The team delivers 50 total Ops this month.',
    type: 'team',
    metric: 'opsDelivered',
    target: 50,
    reward: { type: 'team-celebration' },
    daysLeft: 12,
    icon: '🚀',
    progressFn: (user, peers, latestMonth) => {
      const sameRole = peers.filter((p) => p.role === user.role)
      const total = sameRole.reduce((acc, p) => {
        const m = p.monthlyStats.find((s) => s.month === latestMonth)
        return acc + (m?.opsDelivered ?? 0)
      }, 0)
      const target = 50
      return {
        value: total, target,
        ratio: Math.min(1, total / target),
        completed: total >= target,
        valueLabel: `${total} ops`,
        targetLabel: `${target} ops`,
      }
    },
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Close 2 Ops with avg days-to-close under 5.',
    type: 'individual',
    metric: 'avgDaysToClose',
    target: 2,
    reward: { type: 'badge', badgeId: 'sniper' },
    daysLeft: 12,
    icon: '🎯',
    progressFn: (user, _peers, latestMonth) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      // crude: if avg≤5, count it as 2; if ≤6, 1; else 0
      const close = m?.avgDaysToClose ?? Infinity
      const value = close <= 5 ? 2 : close <= 6 ? 1 : 0
      const target = 2
      return {
        value, target,
        ratio: Math.min(1, value / target),
        completed: value >= target,
        valueLabel: `${value}/2 fast closes`,
        targetLabel: '2 fast closes',
      }
    },
  },
  {
    id: 'clean-sheet',
    title: 'Clean Sheet',
    description: 'Zero pushed Ops for the month.',
    type: 'individual',
    metric: 'pushedOps',
    target: 0,
    reward: { type: 'badge', badgeId: 'iron-wall' },
    daysLeft: 12,
    icon: '🛡️',
    progressFn: (user, _peers, latestMonth) => {
      const m = user.monthlyStats.find((s) => s.month === latestMonth)
      const pushed = m?.pushedOps ?? 0
      // ratio peaks at 1 when pushed=0
      const ratio = pushed === 0 ? 1 : Math.max(0, 1 - pushed * 0.3)
      return {
        value: pushed, target: 0,
        ratio,
        completed: pushed === 0,
        valueLabel: `${pushed} pushed`,
        targetLabel: '0 pushed',
      }
    },
  },
]

export const useChallengeStore = create(() => ({
  challenges: CHALLENGES,
}))
