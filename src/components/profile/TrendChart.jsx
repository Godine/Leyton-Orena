import { motion } from 'framer-motion'
import { formatCurrencyCompact } from '../../utils/formatters.js'

// Hand-rolled SVG: invoice value as gradient-filled bars + ops as smooth line overlay.

function monthShort(monthIso) {
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short' })
}

export default function TrendChart({ stats }) {
  const W = 640
  const H = 240
  const padX = 36
  const padTop = 16
  const padBottom = 36
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom

  if (!stats?.length) return null

  const invoiceMax = Math.max(...stats.map((s) => s.invoiceValue)) || 1
  const opsMax = Math.max(...stats.map((s) => s.opsDelivered)) || 1
  const barW = innerW / stats.length * 0.6
  const slot = innerW / stats.length

  const opsPoints = stats.map((s, i) => {
    const x = padX + slot * i + slot / 2
    const y = padTop + innerH - (s.opsDelivered / opsMax) * innerH
    return [x, y]
  })
  const opsPath = opsPoints
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ')

  return (
    <div className="arena-card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-black text-arena-ink">6-month trend</h3>
          <p className="text-xs text-arena-muted">Invoice value (bars) · Ops delivered (line)</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-display font-bold">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent-amber" />
            <span className="text-arena-muted">Invoice</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent-green" />
            <span className="text-arena-muted">Ops</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="barFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffc800" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffc800" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#F75C03" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F75C03" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal guidelines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX} x2={W - padX}
            y1={padTop + innerH * (1 - t)} y2={padTop + innerH * (1 - t)}
            stroke="rgba(255,255,255,0.05)"
          />
        ))}

        {/* bars */}
        {stats.map((s, i) => {
          const h = (s.invoiceValue / invoiceMax) * innerH
          const x = padX + slot * i + (slot - barW) / 2
          const y = padTop + innerH - h
          return (
            <g key={s.month}>
              <motion.rect
                initial={{ height: 0, y: padTop + innerH }}
                animate={{ height: h, y }}
                transition={{ delay: 0.04 * i, duration: 0.6, ease: 'easeOut' }}
                x={x}
                width={barW}
                rx={6}
                fill="url(#barFill)"
              />
            </g>
          )
        })}

        {/* ops area + line */}
        <motion.path
          d={`${opsPath} L ${opsPoints.at(-1)[0]} ${padTop + innerH} L ${opsPoints[0][0]} ${padTop + innerH} Z`}
          fill="url(#lineFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        />
        <motion.path
          d={opsPath}
          fill="none"
          stroke="#F75C03"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        />
        {opsPoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="#F75C03" stroke="#1a1a2e" strokeWidth={2} />
        ))}

        {/* month labels */}
        {stats.map((s, i) => {
          const x = padX + slot * i + slot / 2
          return (
            <text
              key={`lbl-${s.month}`}
              x={x}
              y={H - 14}
              textAnchor="middle"
              fontSize="11"
              fontFamily="Nunito"
              fontWeight="700"
              fill="rgba(160,160,192,0.9)"
            >
              {monthShort(s.month)}
            </text>
          )
        })}

        {/* peak callouts */}
        {(() => {
          const peakIdx = stats.reduce((best, s, i) => (s.invoiceValue > stats[best].invoiceValue ? i : best), 0)
          const s = stats[peakIdx]
          const x = padX + slot * peakIdx + slot / 2
          const y = padTop + innerH - (s.invoiceValue / invoiceMax) * innerH - 8
          return (
            <text x={x} y={y} textAnchor="middle" fontSize="10" fontFamily="Nunito" fontWeight="800" fill="#ffc800">
              {formatCurrencyCompact(s.invoiceValue)}
            </text>
          )
        })()}
      </svg>
    </div>
  )
}
