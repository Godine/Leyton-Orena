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
  getCurrentUser: () => get().consultants.find((c) => c.id === get().currentUserId),

  // selectors
  getByRole: (role) => get().consultants.filter((c) => c.role === role),
  getById: (id) => get().consultants.find((c) => c.id === id),
}))
