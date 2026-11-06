import { Users } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'

// Compact indicator of the active "View as" lens. Clicking it flips the role,
// so the filter is reachable from any page header, not just the sidebar.
export default function RoleScopePill({ className = '' }) {
  const role = useArenaStore((s) => s.roleView)
  const setRole = useArenaStore((s) => s.setRoleView)
  const next = role === 'Technical' ? 'Financial' : 'Technical'
  return (
    <button
      onClick={() => setRole(next)}
      title={`Viewing ${role} consultants · click to switch to ${next}`}
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold',
        'bg-arena-surface2 border border-arena-border text-arena-muted hover:text-arena-ink hover:border-accent-green/50 transition-colors',
        className,
      ].join(' ')}
    >
      <Users size={12} strokeWidth={2.6} className="text-accent-green" />
      Viewing <span className="text-arena-ink">{role}</span>
    </button>
  )
}
