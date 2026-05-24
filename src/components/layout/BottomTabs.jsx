import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig.js'

// Profile + Admin live in the TopBar (next to the bell), so the bottom bar
// stays lean with the primary browsing destinations only.
const BOTTOM_EXCLUDE = new Set(['/profile', '/admin'])

export default function BottomTabs() {
  const items = NAV_ITEMS.filter((item) => !BOTTOM_EXCLUDE.has(item.to))
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-arena-surface/95 backdrop-blur border-t border-arena-border">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-display font-bold transition-colors',
                  isActive ? 'text-arena-green' : 'text-arena-muted',
                ].join(' ')
              }
            >
              <item.icon size={20} strokeWidth={2.4} />
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

