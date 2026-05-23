import { create } from 'zustand'
import { Award, TrendingUp, Trophy, Target, Flame, PartyPopper } from 'lucide-react'

// Notification types map to icon + accent colour. Kept here so any component
// can render a notification consistently.
export const NOTIF_KINDS = {
  badge:     { icon: Award,        accent: '#ce82ff' }, // epic-ish purple
  rank:      { icon: TrendingUp,   accent: '#F75C03' },
  record:    { icon: Trophy,       accent: '#ffc800' },
  challenge: { icon: Target,       accent: '#1cb0f6' },
  streak:    { icon: Flame,        accent: '#ff4b4b' },
  team:      { icon: PartyPopper,  accent: '#ffc800' },
}

const seed = [
  {
    id: 'n-001',
    kind: 'badge',
    title: 'You earned ⚡ Front-Loader!',
    body: 'Raised 80%+ of your monthly invoice value before day 15.',
    at: minutesAgo(12),
    read: false,
  },
  {
    id: 'n-002',
    kind: 'rank',
    title: 'You moved up to #2 on the leaderboard',
    body: 'Within striking distance of #1 — keep pushing.',
    at: minutesAgo(45),
    read: false,
  },
  {
    id: 'n-003',
    kind: 'record',
    title: "You're £2k from the monthly invoice record",
    body: 'Helena Voss holds it at £102k. You can take it.',
    at: hoursAgo(3),
    read: false,
  },
  {
    id: 'n-004',
    kind: 'challenge',
    title: 'March Sprint · 2/3 milestones complete',
    body: 'One more delivered Op to lock in this month\'s reward.',
    at: hoursAgo(8),
    read: true,
  },
  {
    id: 'n-005',
    kind: 'streak',
    title: 'Your streak is at risk',
    body: 'Deliver one more Op by month end to keep it alive.',
    at: hoursAgo(22),
    read: true,
  },
  {
    id: 'n-006',
    kind: 'team',
    title: 'Team passed £500k invoiced this quarter 🎉',
    body: 'Biggest quarter on record. Drinks on the team.',
    at: daysAgo(2),
    read: true,
  },
]

function minutesAgo(m) { return Date.now() - m * 60 * 1000 }
function hoursAgo(h)   { return Date.now() - h * 60 * 60 * 1000 }
function daysAgo(d)    { return Date.now() - d * 24 * 60 * 60 * 1000 }

export const useNotificationStore = create((set, get) => ({
  notifications: seed,
  panelOpen: false,
  toast: null,
  toastShownThisSession: false,

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  setPanelOpen: (open) => set({ panelOpen: open }),
  togglePanel:  ()     => set({ panelOpen: !get().panelOpen }),

  markRead: (id) =>
    set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }),
  markAllRead: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),
  markAllUnread: () =>
    set({ notifications: get().notifications.map((n) => ({ ...n, read: false })) }),

  addNotification: (n) => {
    const next = { id: `n-${Date.now()}`, at: Date.now(), read: false, ...n }
    set({ notifications: [next, ...get().notifications] })
    get().showToast(next)
    return next
  },

  showToast: (notif) => {
    set({ toast: notif })
    setTimeout(() => {
      if (get().toast?.id === notif.id) set({ toast: null })
    }, 4000)
  },
  dismissToast: () => set({ toast: null }),
  markToastShown: () => set({ toastShownThisSession: true }),
}))

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}
