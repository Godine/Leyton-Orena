import { motion } from 'framer-motion'

// Tiny inline sparkline. Accepts a numeric series and renders a smooth polyline
// over a sparse axis with a soft area fill.
export default function SparkLine({
  values = [],
  width = 80,
  height = 24,
  stroke = '#58cc02',
  fill = 'rgba(88, 204, 2, 0.18)',
  className = '',
}) {
  if (!values.length) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const stepX = values.length === 1 ? 0 : width / (values.length - 1)
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / span) * height
    return [x, y]
  })

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')
  const area = `${path} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
    >
      <path d={area} fill={fill} />
      <motion.path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <circle cx={points.at(-1)[0]} cy={points.at(-1)[1]} r={2.2} fill={stroke} />
    </svg>
  )
}
