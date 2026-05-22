import { motion } from 'framer-motion'
import { useArenaStore } from '../../store/useArenaStore.js'

const ROLES = ['Technical', 'Financial']

export default function RoleSwitcher() {
  const role = useArenaStore((s) => s.roleView)
  const setRole = useArenaStore((s) => s.setRoleView)

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted mb-2 px-1">
        View as
      </div>
      <div className="relative grid grid-cols-2 bg-arena-bg/70 border border-arena-border rounded-full p-1">
        {ROLES.map((r) => {
          const active = r === role
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={[
                'relative z-10 py-2 text-xs font-display font-bold rounded-full transition-colors',
                active ? 'text-arena-bg' : 'text-arena-muted hover:text-arena-ink',
              ].join(' ')}
            >
              {active && (
                <motion.span
                  layoutId="role-pill"
                  className="absolute inset-0 rounded-full bg-arena-green shadow-glow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">{r}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
