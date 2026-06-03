import { Home, Trophy, Award, Medal, Gift, Sparkles, Swords, GitCompare, User, Gauge, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/',             label: 'Home',         icon: Home },
  { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/records',      label: 'Records',      icon: Medal },
  { to: '/duels',        label: 'Duels',        icon: Swords },
  { to: '/compare',      label: 'Compare',      icon: GitCompare },
  { to: '/rewards',      label: 'Rewards',      icon: Gift },
  { to: '/wrapped',      label: 'Wrapped',      icon: Sparkles },
  { to: '/profile',      label: 'My Profile',   icon: User },
  { to: '/manager',      label: 'Manager',      icon: Gauge },
  { to: '/admin',        label: 'Admin',        icon: Settings },
]
