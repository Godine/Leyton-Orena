import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useNotificationStore, NOTIF_KINDS, timeAgo } from '../../store/useNotificationStore.js'

export default function NotificationPanel() {
  const notifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const setOpen = useNotificationStore((s) => s.setPanelOpen)

  const unread = notifications.filter((n) => !n.read).length

  return (
    <>
      <span
        className="fixed inset-0 z-30"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] max-h-[70vh] z-40 bg-arena-surface border border-arena-border rounded-2xl shadow-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-arena-border">
          <div>
            <h3 className="font-display font-black text-arena-ink">Notifications</h3>
            <p className="text-[11px] text-arena-muted">{unread} unread</p>
          </div>
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="text-[11px] font-display font-bold text-accent-green hover:underline disabled:text-arena-muted disabled:no-underline"
          >
            Mark all as read
          </button>
        </header>

        <ul className="overflow-y-auto max-h-[60vh] divide-y divide-arena-border">
          {notifications.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-arena-muted">
              You're all caught up.
            </li>
          )}
          {notifications.map((n) => {
            const meta = NOTIF_KINDS[n.kind]
            const Icon = meta.icon
            return (
              <li key={n.id}>
                <button
                  onClick={() => markRead(n.id)}
                  className={[
                    'w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-arena-surface2/60',
                    !n.read ? 'bg-accent-green/[0.04]' : '',
                  ].join(' ')}
                >
                  {!n.read && (
                    <span
                      className="absolute left-0 w-[3px] h-full -ml-4"
                      style={{ background: '#58cc02' }}
                    />
                  )}
                  <span
                    className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                    style={{ background: `${meta.accent}22`, boxShadow: `inset 0 0 0 1px ${meta.accent}55` }}
                  >
                    <Icon size={16} style={{ color: meta.accent }} strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={['font-display font-bold text-sm leading-tight', n.read ? 'text-arena-ink/80' : 'text-arena-ink'].join(' ')}>
                        {n.title}
                      </span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent-green shrink-0" />}
                    </div>
                    <p className="text-xs text-arena-muted mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-arena-muted mt-1 uppercase tracking-wider">{timeAgo(n.at)}</p>
                  </div>
                  {n.read && <Check size={14} className="text-arena-muted shrink-0 mt-1" />}
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>
    </>
  )
}
