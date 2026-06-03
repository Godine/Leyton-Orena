import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrencyCompact } from '../../utils/formatters.js'

// Hand-rolled SVG: invoice value as gradient-filled bars + ops as smooth line
// overlay. Hovering any month surfaces a tooltip with the exact figures.

function monthShort(monthIso) {
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short' })
}
function monthLong(monthIso) {
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function TrendChart({ stats }) {
  const W = 640
  const H = 240
  const padX = 36
  const padTop = 16
  const padBottom = 36
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom

  const [hoverIdx, setHoverIdx] = useState(null)

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

  const hover = hoverIdx != null ? stats[hoverIdx] : null
  const hoverX = hoverIdx != null ? padX + slot * hoverIdx + slot / 2 : 0

  return (
    <div className="arena-card p-4 md:p-5 relative">
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

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseLeave={() => setHoverIdx(null)}
        >
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
            const isHovered = hoverIdx === i
            return (
              <motion.rect
                key={s.month}
                initial={{ height: 0, y: padTop + innerH }}
                animate={{ height: h, y }}
                transition={{ delay: 0.04 * i, duration: 0.6, ease: 'easeOut' }}
                x={x}
                width={barW}
                rx={6}
                fill="url(#barFill)"
                style={{
                  filter: isHovered ? 'brightness(1.18) drop-shadow(0 0 10px rgba(255,200,0,0.5))' : undefined,
                  transition: 'filter 0.15s',
                }}
              />
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
          {opsPoints.map(([x, y], i) => {
            const isHovered = hoverIdx === i
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={isHovered ? 5 : 3.5}
                fill="#F75C03"
                stroke="rgb(var(--arena-bg-rgb))"
                strokeWidth={2}
                style={{ transition: 'r 0.15s' }}
              />
            )
          })}

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
                fill={hoverIdx === i ? '#f5f5fb' : 'rgba(160,160,192,0.9)'}
              >
                {monthShort(s.month)}
              </text>
            )
          })}

          {/* hover vertical guideline */}
          {hoverIdx != null && (
            <line
              x1={hoverX} x2={hoverX}
              y1={padTop} y2={padTop + innerH}
              stroke="rgba(247,92,3,0.4)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* invisible hit zones — one column per month, full chart height */}
          {stats.map((s, i) => (
            <rect
              key={`hit-${s.month}`}
              x={padX + slot * i}
              y={padTop}
              width={slot}
              height={innerH + padBottom - 6}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onFocus={() => setHoverIdx(i)}
              tabIndex={0}
              style={{ outline: 'none' }}
            />
          ))}
        </svg>

        {/* Tooltip overlay */}
        {hover && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${(hoverX / W) * 100}%`,
              top: '6px',
              transform: hoverIdx === 0 ? 'translateX(8px)' : hoverIdx === stats.length - 1 ? 'translateX(calc(-100% - 8px))' : 'translateX(-50%)',
            }}
          >
            <div className="rounded-xl bg-arena-surface border border-arena-border shadow-2xl px-3 py-2.5 min-w-[180px]">
              <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
                {monthLong(hover.month)}
              </div>
              <div className="mt-1.5 space-y-1 text-xs">
                <Row label="Invoice"   value={formatCurrencyCompact(hover.invoiceValue)} dot="#ffc800" />
                <Row label="Ops"       value={hover.opsDelivered}                       dot="#F75C03" />
                <Row label="Early %"   value={`${Math.round(hover.invoiceBeforeDay15Pct)}%`} dot="#1cb0f6" />
                <Row label="Avg close" value={`${hover.avgDaysToClose.toFixed(1)}d`}     dot="#ce82ff" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, dot }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-arena-muted">
        <span className="h-2 w-2 rounded-sm" style={{ background: dot }} />
        {label}
      </span>
      <span className="font-display font-bold text-arena-ink">{value}</span>
    </div>
  )
}
