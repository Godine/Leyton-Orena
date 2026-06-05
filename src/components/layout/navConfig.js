import { Home, Trophy, Award, Medal, Gift, Sparkles, Swords, GitCompare, ShieldHalf, User, Gauge, Settings } from 'lucide-react'

// Grouped navigation. Groups without a `label` render their items flat (no
// header, no collapse) — used for the always-visible Home and Profile items.
// Groups with a label render as a collapsible section.
export const NAV_GROUPS = [
  {
    items: [
      { to: '/', label: 'Home', icon: Home },
    ],
  },
  {
    id: 'compete',
    label: 'Compete',
    items: [
      { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
      { to: '/seasons',      label: 'Seasons',      icon: ShieldHalf },
      { to: '/duels',        label: 'Duels',        icon: Swords },
      { to: '/compare',      label: 'Compare',      icon: GitCompare },
    ],
  },
  {
    id: 'achieve',
    label: 'Achieve',
    items: [
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/records',      label: 'Records',      icon: Medal },
      { to: '/rewards',      label: 'Rewards',      icon: Gift },
      { to: '/wrapped',      label: 'Wrapped',      icon: Sparkles },
    ],
  },
  {
    items: [
      { to: '/profile',      label: 'My Profile',   icon: User },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    items: [
      { to: '/manager',      label: 'Manager',      icon: Gauge },
      { to: '/admin',        label: 'Admin',        icon: Settings },
    ],
  },
]

// Flat list — used by command palette, mobile drawer fallback, etc.
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

