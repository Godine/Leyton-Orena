import { useMemo } from 'react'
import { useArenaStore } from '../store/useArenaStore.js'

// Shared "View as Technical / Financial" lens. Returns the active role, the
// roster filtered to that role (memoised), and the raw list for lookups.
export function useRoleScope() {
  const role = useArenaStore((s) => s.roleView)
  const consultants = useArenaStore((s) => s.consultants)
  const scoped = useMemo(() => consultants.filter((c) => c.role === role), [consultants, role])
  return { role, scoped, consultants }
}
