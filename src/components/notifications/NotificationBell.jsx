import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '../../store/useNotificationStore.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function NotificationBell() {
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length)
  const open = useNotificationStore((s) => s.panelOpen)
  const toggle = useNotificationStore((s) => s.togglePanel)

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative h-10 w-10 grid place-items-center rounded-full bg-arena-surface border border-arena-border hover:border-accent-green/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-arena-ink" strokeWidth={2.4} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-coral grid place-items-center text-[10px] font-display font-black text-arena-bg shadow-glow"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>{open && <NotificationPanel />}</AnimatePresence>
    </div>
  )
}
