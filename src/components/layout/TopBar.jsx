import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Settings } from 'lucide-react'
import NotificationBell from '../notifications/NotificationBell.jsx'
import ThemeToggle from './ThemeToggle.jsx'

// Quick-access actions that live next to the notification bell rather than in
// the bottom tab bar (keeps the mobile tab bar lean).
const TOP_ACTIONS = [
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/admin',   label: 'Admin',      icon: Settings },
]

export default function TopBar() {
  return (
    <div className="flex items-center justify-end gap-2 mb-2">
      {TOP_ACTIONS.map((action) => (
        <NavLink
          key={action.to}
          to={action.to}
          aria-label={action.label}
          title={action.label}
          className={({ isActive }) =>
            [
              'relative h-10 w-10 grid place-items-center rounded-full border transition-colors',
              isActive
                ? 'bg-accent-green/15 border-accent-green/50 text-accent-green'
                : 'bg-arena-surface border-arena-border text-arena-ink hover:border-accent-green/50',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <motion.span whileTap={{ scale: 0.92 }} className="grid place-items-center">
              <action.icon size={18} strokeWidth={2.4} />
              {isActive && (
                <motion.span
                  layoutId="topbar-active"
                  className="absolute -bottom-1 h-1 w-1 rounded-full bg-accent-green shadow-glow"
                />
              )}
            </motion.span>
          )}
        </NavLink>
      ))}
      <ThemeToggle />
      <NotificationBell />
    </div>
  )
}
