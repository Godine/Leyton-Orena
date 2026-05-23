import { motion } from 'framer-motion'

// SVG circular progress with an animated pulse on the ring.
// `ratio` is 0..1+, anything ≥ 1 fills the ring.
export default function ProgressRing({
  ratio = 0,
  size = 96,
  stroke = 8,
  color = '#F75C03',
  trackColor = 'rgba(255,255,255,0.06)',
  children,
  pulse = false,
  className = '',
}) {
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, ratio))
  const offset = circumference * (1 - clamped)

  return (
    <div className={['relative grid place-items-center', className].join(' ')} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={pulse ? 'animate-pulseRing' : ''}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

// Pick a ring colour based on how close to (or past) the target the value is.
export function pickRingColor(ratio, betterWhenLower = false) {
  // Normalise: for "better when lower", higher ratio is still better in our calc.
  const r = Math.max(0, Math.min(1.2, ratio))
  if (r >= 0.85) return '#F75C03' // green
  if (r >= 0.55) return '#ffc800' // amber
  return '#ff4b4b'                // coral
  // betterWhenLower is reserved for future asymmetric logic
  // eslint-disable-next-line no-unused-expressions
  betterWhenLower
}
