import { Home, Trophy, Award, Medal, User, Gauge, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/',             label: 'Home',         icon: Home },
  { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/records',      label: 'Records',      icon: Medal },
  { to: '/profile',      label: 'My Profile',   icon: User },
  { to: '/manager',      label: 'Manager',      icon: Gauge },
  { to: '/admin',        label: 'Admin',        icon: Settings },
]
