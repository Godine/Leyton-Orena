import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from './navConfig.js'
import RoleSwitcher from './RoleSwitcher.jsx'
import Logo from '../Logo.jsx'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-72 flex-col bg-arena-surface border-r border-arena-border z-20">
      <div className="px-6 pt-7 pb-5">
        <Wordmark />
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 px-4 py-3 rounded-xl font-display font-bold text-sm transition-colors',
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
        ))}
      </nav>

      <div className="p-4 border-t border-arena-border">
        <RoleSwitcher />
      </div>
    </aside>
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
