import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ChevronDown, ArrowUp, ArrowDown, Share2 } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { computeWrapped } from '../utils/computeWrapped.js'
import { formatCurrencyCompact } from '../utils/formatters.js'
import AnimatedCounter from '../components/shared/AnimatedCounter.jsx'

function monthShort(monthIso) {
  if (!monthIso) return ''
  const [y, m] = monthIso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function Wrapped() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  const data = useMemo(
    () => computeWrapped(currentUser, months, consultants),
    [currentUser, months, consultants],
  )

  const [copied, setCopied] = useState(false)
  const handleShare = async () => {
    const text =
`${currentUser.name} · Arena Wrapped ${data.label}
Invoice: ${formatCurrencyCompact(data.totals.invoice)}${data.invoiceGrowthPct != null ? ` (${data.invoiceGrowthPct >= 0 ? '+' : ''}${data.invoiceGrowthPct.toFixed(0)}% vs last quarter)` : ''}
Ops: ${data.totals.ops}
Rank: #${data.rank} of ${data.total} in ${currentUser.role}
Top badge: ${data.topBadge ? `${data.topBadge.icon} ${data.topBadge.name}` : 'none yet'}
Longest streak: ${data.streakBest}mo · Fire best: ${data.fireBest}d`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked — fall through silently */ }
  }

  return (
    <div className="space-y-6 xl:space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <Sparkles className="text-accent-amber animate-pulseRing" size={24} strokeWidth={2.4} />
          </div>
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-display font-black">
            <span className="text-accent-amber">Arena Wrapped</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ConsultantPicker consultants={consultants} value={currentUser.id} onChange={setCurrentUserId} />
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-accent-amber text-arena-bg text-xs font-display font-bold shadow-glow-amber"
          >
            <Share2 size={14} strokeWidth={2.6} />
            {copied ? 'Copied!' : 'Share recap'}
          </button>
        </div>
      </header>

      {/* Title slide */}
      <Slide accent="#ffc800">
        <div className="text-[10px] uppercase tracking-[0.3em] text-arena-muted font-display font-bold">
          {data.label} · {currentUser.role}
        </div>
        <h2 className="mt-3 font-display font-black text-arena-ink text-4xl md:text-6xl leading-none">
          Your <span className="text-accent-amber">{data.label}</span>, {currentUser.name.split(' ')[0]}.
        </h2>
        <p className="mt-3 text-arena-muted max-w-lg">
          A quarter in the Arena, condensed into a few bragging-rights cards.
        </p>
      </Slide>

      {/* Headline numbers */}
      <Slide accent="#F75C03">
        <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
          You invoiced
        </div>
        <div className="mt-2 font-display font-black text-arena-ink text-6xl md:text-7xl leading-none">
          <AnimatedCounter value={data.totals.invoice} format={formatCurrencyCompact} />
        </div>
        {data.invoiceGrowthPct != null && (
          <div className="mt-3 inline-flex items-center gap-2 text-base">
            {data.invoiceGrowthPct >= 0
              ? <ArrowUp size={18} className="text-accent-green" />
              : <ArrowDown size={18} className="text-accent-coral" />}
            <span className={['font-display font-black', data.invoiceGrowthPct >= 0 ? 'text-accent-green' : 'text-accent-coral'].join(' ')}>
              {data.invoiceGrowthPct >= 0 ? '+' : ''}{data.invoiceGrowthPct.toFixed(0)}%
            </span>
            <span className="text-arena-muted">vs the previous quarter</span>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Ops delivered"  value={data.totals.ops}        format={(v) => Math.round(v)} />
          <Stat label="Avg early %"    value={data.totals.earlyPct}   format={(v) => `${Math.round(v)}%`} />
          <Stat label="Avg days close" value={data.totals.daysClose}  format={(v) => `${v.toFixed(1)}d`} />
          <Stat label="Badges earned"  value={data.badgesThisQuarter} format={(v) => Math.round(v)} />
        </div>
      </Slide>

      {/* Peak month */}
      {data.peak && (
        <Slide accent="#ff4b4b">
          <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
            Your biggest month
          </div>
          <div className="mt-2 font-display font-black text-arena-coral text-5xl md:text-6xl leading-none">
            {formatCurrencyCompact(data.peak.invoiceValue)}
          </div>
          <div className="mt-2 text-arena-ink/90 text-lg">
            in <span className="font-display font-bold">{monthShort(data.peak.month)}</span> · {data.peak.opsDelivered} ops · {Math.round(data.peak.invoiceBeforeDay15Pct ?? 0)}% early
          </div>
        </Slide>
      )}

      {/* Top badge */}
      {data.topBadge && (
        <Slide accent="#ce82ff">
          <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
            Rarest badge of the quarter
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="text-7xl">{data.topBadge.icon}</div>
            <div>
              <div className="font-display font-black text-arena-ink text-3xl md:text-4xl">{data.topBadge.name}</div>
              <div className="text-arena-muted">{data.topBadge.description}</div>
            </div>
          </div>
        </Slide>
      )}

      {/* Streaks */}
      <Slide accent="#1cb0f6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
          When you got hot
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <BigStat label="Best fire" value={`${data.fireBest}d`} accent="#F75C03" />
          <BigStat label="Best monthly streak" value={`${data.streakBest}mo`} accent="#ffc800" />
        </div>
      </Slide>

      {/* Standing */}
      <Slide accent="#58cc02">
        <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
          Where you finished
        </div>
        <div className="mt-2 font-display font-black text-arena-ink text-7xl md:text-8xl leading-none">
          #{data.rank}
        </div>
        <div className="mt-2 text-arena-muted text-lg">
          of {data.total} {currentUser.role.toLowerCase()} consultants
        </div>
      </Slide>

      {/* Outro */}
      <Slide accent="#ffc800">
        <h3 className="font-display font-black text-arena-ink text-3xl md:text-4xl">
          On to the next quarter.
        </h3>
        <p className="mt-2 text-arena-muted max-w-lg">
          Share your recap with the team, brag a little, then go break a record.
        </p>
        <button
          onClick={handleShare}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-amber text-arena-bg text-sm font-display font-bold shadow-glow-amber"
        >
          <Share2 size={14} strokeWidth={2.6} />
          {copied ? 'Copied to clipboard ✓' : 'Share my Wrapped'}
        </button>
      </Slide>
    </div>
  )
}

function Slide({ children, accent }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="arena-card relative overflow-hidden p-6 md:p-10 min-h-[280px]"
      style={{
        background: `radial-gradient(circle at 0% 0%, ${accent}1f, transparent 55%), linear-gradient(180deg, var(--arena-surface), var(--arena-bg))`,
        boxShadow: `0 0 36px ${accent}22`,
      }}
    >
      {children}
    </motion.section>
  )
}

function Stat({ label, value, format }) {
  return (
    <div className="rounded-xl bg-arena-bg/40 border border-arena-border p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
        {label}
      </div>
      <div className="mt-1 font-display font-black text-arena-ink text-2xl">
        <AnimatedCounter value={value} format={format} />
      </div>
    </div>
  )
}

function BigStat({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-arena-bg/40 border border-arena-border p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold">
        {label}
      </div>
      <div
        className="mt-2 font-display font-black text-4xl md:text-5xl"
        style={{ color: accent, textShadow: `0 0 14px ${accent}66` }}
      >
        {value}
      </div>
    </div>
  )
}

function ConsultantPicker({ consultants, value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        Recap for
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-arena-surface border border-arena-border rounded-full pl-4 pr-9 py-2 text-xs font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-amber/50"
        >
          {consultants.map((c) => (
            <option key={c.id} value={c.id} className="bg-arena-surface">
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
      </span>
    </label>
  )
}
