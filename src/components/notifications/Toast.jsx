import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useNotificationStore, NOTIF_KINDS } from '../../store/useNotificationStore.js'

export default function Toast() {
  const toast = useNotificationStore((s) => s.toast)
  const setOpen = useNotificationStore((s) => s.setPanelOpen)
  const dismiss = useNotificationStore((s) => s.dismissToast)

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="fixed bottom-6 right-4 md:right-6 z-50 max-w-[min(360px,calc(100vw-2rem))]"
        >
          <button
            onClick={() => { setOpen(true); dismiss() }}
            className="group w-full text-left bg-arena-surface border border-arena-border rounded-2xl shadow-2xl pl-4 pr-3 py-3 flex items-start gap-3"
            style={{ boxShadow: `0 8px 32px ${(NOTIF_KINDS[toast.kind]?.accent ?? '#F75C03')}33` }}
          >
            <span
              className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
              style={{ background: `${NOTIF_KINDS[toast.kind].accent}22`, boxShadow: `inset 0 0 0 1px ${NOTIF_KINDS[toast.kind].accent}55` }}
            >
              {(() => {
                const Icon = NOTIF_KINDS[toast.kind].icon
                return <Icon size={16} style={{ color: NOTIF_KINDS[toast.kind].accent }} strokeWidth={2.4} />
              })()}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm text-arena-ink leading-tight">{toast.title}</div>
              <div className="text-xs text-arena-muted mt-0.5 line-clamp-2">{toast.body}</div>
            </div>
            <span
              onClick={(e) => { e.stopPropagation(); dismiss() }}
              className="text-arena-muted hover:text-arena-ink p-1"
              aria-label="Dismiss"
              role="button"
            >
              <X size={14} />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
