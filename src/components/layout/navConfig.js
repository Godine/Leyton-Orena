import { Home, Trophy, Award, Medal, Gift, Gauge, BarChart3 } from 'lucide-react'

// Grouped navigation. Groups without a `label` render flat (no header, no
// collapse). Labelled groups render as collapsible sections.
//
// Profile, Admin, Duels, Compare and Wrapped are intentionally NOT in the
// sidebar — Profile & Admin live in the top-right of the TopBar; Wrapped,
// Duels and Compare are reached from inside Profile (Quick actions) or via
// the ⌘K command palette.
export const NAV_GROUPS = [
  {
    items: [
      { to: '/', label: 'Home', icon: Home },
    ],
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    items: [
      { to: '/seasons',      label: 'Leaderboard',  icon: Trophy },
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/records',      label: 'Records',      icon: Medal },
    ],
  },
  {
    items: [
      { to: '/rewards',      label: 'Rewards',      icon: Gift },
    ],
  },
  {
    id: 'manager',
    label: 'Manager',
    items: [
      { to: '/manager',      label: 'Manager',      icon: Gauge },
      { to: '/leaderboard',  label: 'Rankings',     icon: BarChart3 },
    ],
  },
]

// Flat list — used by command palette, mobile drawer fallback, etc. We also
// expose the routes that are reachable but hidden from the sidebar (Profile,
// Admin, Duels, Compare, Wrapped) so ⌘K can still jump to them.
import { User, Settings, Swords, GitCompare, Sparkles } from 'lucide-react'

export const HIDDEN_NAV_ITEMS = [
  { to: '/profile',  label: 'My Profile', icon: User },
  { to: '/admin',    label: 'Admin',      icon: Settings },
  { to: '/duels',    label: 'Duels',      icon: Swords },
  { to: '/compare',  label: 'Compare',    icon: GitCompare },
  { to: '/wrapped',  label: 'Wrapped',    icon: Sparkles },
]

export const NAV_ITEMS = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...HIDDEN_NAV_ITEMS,
]
