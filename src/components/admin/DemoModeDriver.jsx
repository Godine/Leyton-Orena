import { useEffect, useRef } from 'react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { useNotificationStore } from '../../store/useNotificationStore.js'

// Mounted once at the app root. When `demoMode` flips on:
//   - cycles `currentUserId` through every consultant every 8s
//   - drops a sample notification (which triggers a toast) every 12s
const SAMPLE_NOTIFS = [
  { kind: 'badge',     title: 'Demo · 🏔️ Peak Month unlocked!', body: 'Personal best invoice month — bagged it.' },
  { kind: 'rank',      title: 'Demo · You moved up to #2',       body: 'Climbing fast. Hold the line.' },
  { kind: 'record',    title: 'Demo · 88% of the all-time record', body: 'One more big invoice and you take it.' },
  { kind: 'challenge', title: 'Demo · Ops Blitz 80%',             body: 'Team is one Op away from clinching it.' },
  { kind: 'streak',    title: 'Demo · Streak extended to 6 months', body: 'New personal best within reach.' },
  { kind: 'streak',    title: 'Demo · Daily fire +1',                body: 'Another claim advanced today — fire keeps building.' },
]

export default function DemoModeDriver() {
  const demoMode = useArenaStore((s) => s.demoMode)
  const consultants = useArenaStore((s) => s.consultants)
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)
  const currentUserId = useArenaStore((s) => s.currentUserId)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const tickRef = useRef(0)

  useEffect(() => {
    if (!demoMode) return
    // Rotate consultant every 8s
    const startIdx = consultants.findIndex((c) => c.id === currentUserId)
    let idx = startIdx >= 0 ? startIdx : 0
    const userInterval = setInterval(() => {
      idx = (idx + 1) % consultants.length
      setCurrentUserId(consultants[idx].id)
    }, 8000)

    // Fire a sample notification every 12s
    const notifInterval = setInterval(() => {
      const n = SAMPLE_NOTIFS[tickRef.current % SAMPLE_NOTIFS.length]
      tickRef.current += 1
      addNotification(n)
    }, 12000)

    return () => {
      clearInterval(userInterval)
      clearInterval(notifInterval)
    }
  }, [demoMode, consultants, currentUserId, setCurrentUserId, addNotification])

  return null
}
