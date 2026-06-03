import { useEffect, useRef, useState } from 'react'

// Returns true for `ms` milliseconds after `value` changes, then flips false.
// Lets components show a loading placeholder during the transition without
// blocking the actual render — useful when switching between heavy data sets
// (Profile consultant swap, filter changes, etc.) so the UI signals work
// is happening even though the underlying computation is synchronous.
export default function useStaleWhileChanging(value, ms = 200) {
  const [isStale, setIsStale] = useState(false)
  const prev = useRef(value)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      prev.current = value
      return
    }
    if (prev.current === value) return
    prev.current = value
    setIsStale(true)
    const t = setTimeout(() => setIsStale(false), ms)
    return () => clearTimeout(t)
  }, [value, ms])

  return isStale
}
