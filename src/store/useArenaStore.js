import { create } from 'zustand'
import { CONSULTANTS, MONTHS_AVAILABLE, CURRENT_USER_ID } from '../data/consultants.js'
import { BADGES, BADGES_BY_ID } from '../data/badges.js'

export const useArenaStore = create((set, get) => ({
  // role view toggle for dashboards
  roleView: 'Technical', // 'Technical' | 'Financial'
  setRoleView: (roleView) => set({ roleView }),

  // data
  consultants: CONSULTANTS,
  months: MONTHS_AVAILABLE,
  badges: BADGES,
  badgesById: BADGES_BY_ID,

  // current user (used by /profile)
  currentUserId: CURRENT_USER_ID,
  setCurrentUserId: (id) => set({ currentUserId: id }),
  getCurrentUser: () => get().consultants.find((c) => c.id === get().currentUserId),

  // mutate a single month's stats for a consultant (used by Admin editing)
  setConsultantMonth: (consultantId, month, patch) =>
    set((state) => ({
      consultants: state.consultants.map((c) =>
        c.id !== consultantId
          ? c
          : {
              ...c,
              monthlyStats: c.monthlyStats.map((s) =>
                s.month === month ? { ...s, ...patch } : s,
              ),
            },
      ),
    })),

  // mutate a consultant's monthly targets (used by Admin targets editor)
  setConsultantTargets: (consultantId, patch) =>
    set((state) => ({
      consultants: state.consultants.map((c) =>
        c.id !== consultantId ? c : { ...c, targets: { ...c.targets, ...patch } },
      ),
    })),

  // theme — light by default, persisted to localStorage
  theme: (typeof window !== 'undefined' && localStorage.getItem('arena-theme')) || 'light',
  setTheme: (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('arena-theme', t)
    set({ theme: t })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') localStorage.setItem('arena-theme', next)
    set({ theme: next })
  },

  // demo / presentation mode
  demoMode: false,
  setDemoMode: (v) => set({ demoMode: v }),

  walkthroughOpen: false,
  setWalkthroughOpen: (v) => set({ walkthroughOpen: v }),

  // Mock auth — purely client-side. The landing page sends users to /login,
  // which flips this flag and stashes it in localStorage. AuthGuard reads it
  // to gate /app/*.
  isAuthed:
    typeof window !== 'undefined' && localStorage.getItem('arena-authed') === '1',
  login: (consultantId) => {
    if (typeof window !== 'undefined') localStorage.setItem('arena-authed', '1')
    set((s) => ({ isAuthed: true, currentUserId: consultantId || s.currentUserId }))
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arena-authed')
      localStorage.removeItem('arena-seen-onboarding')
    }
    set({ isAuthed: false, seenOnboarding: false })
  },

  // First-run onboarding: tracks whether the user has seen the walkthrough,
  // persisted in localStorage so we never auto-launch it twice.
  seenOnboarding:
    typeof window !== 'undefined' && localStorage.getItem('arena-seen-onboarding') === '1',
  markOnboardingSeen: () => {
    if (typeof window !== 'undefined') localStorage.setItem('arena-seen-onboarding', '1')
    set({ seenOnboarding: true })
  },

  // Teams webhook integration — purely client-side for MVP. When enabled we
  // POST a minimal payload to the configured URL; CORS-friendly mode is used
  // so the request goes out even from the browser.
  teamsWebhook: { url: '', enabled: false, lastSentAt: null },
  setTeamsWebhook: (patch) =>
    set((state) => ({ teamsWebhook: { ...state.teamsWebhook, ...patch } })),
  broadcastToTeams: async (event) => {
    const wh = get().teamsWebhook
    if (!wh.enabled || !wh.url) return { ok: false, reason: 'not-configured' }
    const payload = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: 'F75C03',
      summary: event.title ?? 'Leyton Arena',
      title: event.title ?? 'Leyton Arena',
      text: event.body ?? '',
    }
    try {
      await fetch(wh.url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      set({ teamsWebhook: { ...wh, lastSentAt: Date.now() } })
      return { ok: true }
    } catch (err) {
      return { ok: false, reason: err?.message ?? 'fetch-failed' }
    }
  },

  // unlock animations seen this session (keyed by `${userId}:${badgeId}`)
  seenUnlocks: {},
  markUnlockSeen: (userId, badgeId) =>
    set((state) => ({
      seenUnlocks: { ...state.seenUnlocks, [`${userId}:${badgeId}`]: true },
    })),
  hasSeenUnlock: (userId, badgeId) =>
    Boolean(get().seenUnlocks[`${userId}:${badgeId}`]),

  // selectors
  getByRole: (role) => get().consultants.filter((c) => c.role === role),
  getById: (id) => get().consultants.find((c) => c.id === id),
}))
