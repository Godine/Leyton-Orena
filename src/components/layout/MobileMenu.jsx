import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from './navConfig.js'
import RoleSwitcher from './RoleSwitcher.jsx'
import Logo from '../Logo.jsx'

// Mobile-only nav: a hamburger button + slide-out drawer from the left
// listing every NAV_ITEMS destination plus the role switcher at the bottom.
// Replaces the cramped 5-tab bottom bar so all 10 destinations are reachable
// with one tap on small screens.
export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Auto-close on route change so the drawer doesn't linger after a tap.
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Esc to close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden h-10 w-10 grid place-items-center rounded-full bg-arena-surface border border-arena-border hover:border-accent-green/50 transition-colors"
      >
        <Menu size={18} className="text-arena-ink" strokeWidth={2.4} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <span
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Drawer */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 bottom-0 w-[86vw] max-w-[320px] bg-arena-surface border-r border-arena-border flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-arena-border">
                <div className="flex items-center gap-2.5">
                  <Logo size={36} className="shrink-0 drop-shadow-[0_3px_14px_rgba(247,92,3,0.45)]" />
                  <div className="leading-none">
                    <div className="font-display font-black text-lg tracking-tight text-arena-ink">
                      Leyton<span className="text-arena-green"> Arena</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-arena-muted mt-1">
                      R&amp;D delivery · gamified
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav list */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ x: -16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.03 * i, type: 'spring', stiffness: 320, damping: 26 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 px-4 py-3 rounded-xl font-display font-bold text-sm transition-colors',
                          isActive
                            ? 'bg-accent-green/15 text-accent-green'
                            : 'text-arena-ink/80 hover:text-arena-ink hover:bg-arena-surface2',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            size={20}
                            strokeWidth={2.4}
                            className={isActive ? 'text-accent-green' : 'text-arena-muted'}
                          />
                          <span>{item.label}</span>
                          {isActive && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-accent-green shadow-glow" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Role switcher pinned to the bottom */}
              <div className="p-4 border-t border-arena-border">
                <RoleSwitcher />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
