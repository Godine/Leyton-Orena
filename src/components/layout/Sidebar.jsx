import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { NAV_GROUPS } from './navConfig.js'
import RoleSwitcher from './RoleSwitcher.jsx'
import Logo from '../Logo.jsx'

const STORAGE_KEY = 'arena-nav-open-groups'

// Read persisted group state. Defaults to all collapsed except the group
// containing the current path (set by the auto-open effect).
function readPersisted() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function persist(state) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

export default function Sidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(readPersisted)

  // Auto-expand whichever labelled group contains the active route.
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(
      (g) => g.id && g.items.some((it) => it.to === location.pathname),
    )
    if (activeGroup && !open[activeGroup.id]) {
      const next = { ...open, [activeGroup.id]: true }
      setOpen(next)
      persist(next)
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => {
    const next = { ...open, [id]: !open[id] }
    setOpen(next)
    persist(next)
  }

  return (
    <aside data-tour="sidebar" className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col bg-arena-surface border-r border-arena-border z-20">
      <div className="px-6 pt-7 pb-5">
        <Wordmark />
      </div>

      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => {
          if (!group.label) {
            return (
              <div key={`g-${gi}`} className="space-y-1 mb-1">
                {group.items.map((item) => <NavItem key={item.to} item={item} />)}
              </div>
            )
          }
          const isOpen = !!open[group.id]
          const groupActive = group.items.some((it) => it.to === location.pathname)
          return (
            <div key={group.id} className="mt-2">
              <button
                onClick={() => toggle(group.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold hover:text-arena-ink"
              >
                <span>{group.label}</span>
                {groupActive && !isOpen && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-green shadow-glow" />
                )}
                <ChevronDown
                  size={12}
                  strokeWidth={3}
                  className={['ml-auto transition-transform', isOpen ? 'rotate-0' : '-rotate-90'].join(' ')}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pt-1 pb-2">
                      {group.items.map((item) => <NavItem key={item.to} item={item} />)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-arena-border">
        <RoleSwitcher />
      </div>
    </aside>
  )
}

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 px-4 py-2.5 rounded-xl font-display font-bold text-sm transition-colors',
          isActive
            ? 'bg-arena-green/15 text-arena-green'
            : 'text-arena-ink/80 hover:text-arena-ink hover:bg-arena-surface2',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <motion.span
            whileHover={{ scale: 1.15, rotate: -4 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className={isActive ? 'text-arena-green' : 'text-arena-muted group-hover:text-arena-ink'}
          >
            <item.icon size={20} strokeWidth={2.4} />
          </motion.span>
          <span>{item.label}</span>
          {isActive && (
            <motion.span
              layoutId="nav-active-dot"
              className="ml-auto h-2 w-2 rounded-full bg-arena-green shadow-glow"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Logo size={40} className="shrink-0 drop-shadow-[0_4px_18px_rgba(247,92,3,0.45)]" />
      <div className="leading-none">
        <div className="font-display font-black text-xl tracking-tight text-arena-ink">
          Leyton<span className="text-arena-green"> Arena</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted mt-1">R&amp;D delivery · gamified</div>
      </div>
    </div>
  )
}
