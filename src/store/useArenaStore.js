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

  // demo / presentation mode
  demoMode: false,
  setDemoMode: (v) => set({ demoMode: v }),

  walkthroughOpen: false,
  setWalkthroughOpen: (v) => set({ walkthroughOpen: v }),

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
