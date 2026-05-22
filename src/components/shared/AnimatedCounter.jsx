import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

// Counts from 0 (or previous value) up to `value` once when scrolled into view,
// and every time the value changes thereafter.
export default function AnimatedCounter({
  value = 0,
  duration = 0.9,
  format = (v) => Math.round(v).toLocaleString('en-GB'),
  className = '',
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!inView) return
    const from = startedRef.current ? fromRef.current : 0
    startedRef.current = true
    const to = value
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      const v = from + (to - from) * eased
      setDisplay(v)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, inView])

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  )
}
