import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig.js'

export default function BottomTabs() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-arena-surface/95 backdrop-blur border-t border-arena-border">
      <ul className="grid grid-cols-7">
        {NAV_ITEMS.map((item) => (
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
