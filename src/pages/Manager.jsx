import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Gauge, Briefcase, Banknote, Zap, Clock, Flame, AlertTriangle, TrendingUp, ChevronRight,
} from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { computeManagerInsights } from '../utils/computeManagerInsights.js'
import { formatCurrencyCompact } from '../utils/formatters.js'
import AnimatedCounter from '../components/shared/AnimatedCounter.jsx'
import LocationPill from '../components/shared/LocationPill.jsx'
import TrendArrow from '../components/shared/TrendArrow.jsx'

const SCOPES = ['All', 'Technical', 'Financial']

const STATUS_STYLE = {
  healthy: { dot: 'bg-accent-green', label: 'Healthy', text: 'text-accent-green' },
  watch:   { dot: 'bg-accent-amber', label: 'Watch',   text: 'text-accent-amber' },
  risk:    { dot: 'bg-accent-coral', label: 'At risk', text: 'text-accent-coral' },
}

function monthLabel(iso) {
  if (!iso) return ''
  const [y, m] = iso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function Manager() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const roleView = useArenaStore((s) => s.roleView)
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  const [scope, setScope] = useState('All')

  const insights = useMemo(
    () => computeManagerInsights(consultants, months, scope),
    [consultants, months, scope],
  )

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
              <Gauge className="text-accent-green" size={24} strokeWidth={2.4} />
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
              <span className="text-accent-green">Manager</span>
            </h1>
          </div>
          <ScopeToggle value={scope} onChange={setScope} />
        </div>
        <p className="text-arena-muted max-w-2xl">
          Team rollup for {monthLabel(insights.latest)} · {insights.totals.headcount} consultant
          {insights.totals.headcount === 1 ? '' : 's'}{scope !== 'All' ? ` · ${scope}` : ''}.
          Defaulting view is whole team; sidebar role is {roleView}.
        </p>
      </header>

      <KpiRow totals={insights.totals} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
        <MoversCard
          title="On fire"
          icon={Flame}
          accent="#F75C03"
          rows={insights.onFire}
          kind="momentum"
          onPick={setCurrentUserId}
          empty="No standout momentum this month."
        />
        <MoversCard
          title="Needs attention"
          icon={AlertTriangle}
          accent="#ff4b4b"
          rows={insights.needsAttention}
          kind="attention"
          onPick={setCurrentUserId}
          empty="Everyone's tracking well — no flags."
        />
      </div>

      <OfficeBreakdown byLocation={insights.byLocation} maxInvoice={insights.maxLocInvoice} />

      <RosterTable roster={insights.roster} onPick={setCurrentUserId} />
    </div>
  )
}

function ScopeToggle({ value, onChange }) {
  return (
    <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
      {SCOPES.map((s) => {
        const active = s === value
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={[
              'px-3 py-1.5 rounded-full transition-colors',
              active ? 'bg-accent-green text-arena-bg shadow-glow' : 'text-arena-muted hover:text-arena-ink',
            ].join(' ')}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

function KpiRow({ totals }) {
  const cards = [
    { label: 'Ops (month)',    icon: Briefcase, accent: 'text-accent-green',  value: totals.ops,         format: (v) => Math.round(v).toLocaleString('en-GB') },
    { label: 'Invoice (month)', icon: Banknote, accent: 'text-accent-amber',  value: totals.invoice,     format: formatCurrencyCompact },
    { label: 'Avg early %',    icon: Zap,       accent: 'text-accent-blue',   value: totals.earlyPct,    format: (v) => `${v.toFixed(0)}%` },
    { label: 'Avg days close', icon: Clock,     accent: 'text-accent-purple', value: totals.daysToClose, format: (v) => `${v.toFixed(1)}d` },
    { label: 'Active fires',   icon: Flame,     accent: 'text-accent-coral',  value: totals.activeFires, format: (v) => `${Math.round(v)}/${totals.headcount}` },
    { label: 'At risk',        icon: AlertTriangle, accent: 'text-accent-coral', value: totals.atRisk,    format: (v) => Math.round(v).toLocaleString('en-GB') },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.3 }}
          className="arena-card p-3 sm:p-4 min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold truncate">
              {card.label}
            </span>
            <card.icon size={15} className={`${card.accent} shrink-0`} strokeWidth={2.4} />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-display font-black text-arena-ink truncate">
            <AnimatedCounter value={card.value} format={card.format} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function MoversCard({ title, icon: Icon, accent, rows, kind, onPick, empty }) {
  return (
    <section className="arena-card p-4 md:p-5">
      <header className="flex items-center gap-2 mb-3">
        <Icon size={18} style={{ color: accent }} className={kind === 'momentum' ? 'animate-flame' : ''} />
        <h2 className="font-display font-black text-arena-ink text-lg">{title}</h2>
        <span className="ml-auto text-xs text-arena-muted">{rows.length}</span>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-arena-muted py-6 text-center">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const tags = kind === 'momentum' ? r.momentum : r.attention
            return (
              <li key={r.consultant.id}>
                <Link
                  to="/profile"
                  onClick={() => onPick(r.consultant.id)}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 bg-arena-bg/40 border border-arena-border hover:border-arena-muted/40 transition-colors group"
                >
                  <span
                    className="h-9 w-9 shrink-0 rounded-xl grid place-items-center font-display font-black text-arena-bg text-xs"
                    style={{ background: kind === 'momentum' ? 'linear-gradient(135deg,#F75C03,#ffc800)' : 'linear-gradient(135deg,#ff4b4b,#ffc800)' }}
                  >
                    {r.consultant.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-arena-ink text-sm truncate">{r.consultant.name}</span>
                      <LocationPill location={r.consultant.location} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-display font-bold rounded-full px-2 py-0.5"
                          style={{ background: `${accent}1a`, color: accent, boxShadow: `inset 0 0 0 1px ${accent}44` }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-display font-black text-arena-ink">
                      {formatCurrencyCompact(r.cur?.invoiceValue ?? 0)}
                    </div>
                    <div className="text-[11px] text-arena-muted inline-flex items-center gap-1 justify-end">
                      <TrendArrow direction={r.invoiceTrend} size={12} /> vs last mo
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-arena-muted self-center group-hover:text-arena-ink" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function OfficeBreakdown({ byLocation, maxInvoice }) {
  return (
    <section>
      <header className="flex items-center gap-3 mb-3">
        <h2 className="font-display font-black text-arena-ink text-lg">By office</h2>
        <span className="h-px flex-1 bg-arena-border" />
        <span className="text-xs text-arena-muted">{byLocation.length} offices</span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {byLocation.map((o, i) => (
          <motion.div
            key={o.location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className="arena-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LocationPill location={o.location} />
                <span className="font-display font-bold text-arena-ink">{o.location}</span>
              </div>
              <span className="text-xs text-arena-muted">{o.count} people</span>
            </div>
            <div className="mt-3 font-display font-black text-2xl text-arena-ink">
              <AnimatedCounter value={o.invoice} format={formatCurrencyCompact} />
            </div>
            <div className="mt-2 h-2 rounded-full bg-arena-surface2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((o.invoice / maxInvoice) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-accent-amber"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-arena-muted">
              <span>{o.ops} ops</span>
              <span>{o.earlyPct.toFixed(0)}% early</span>
              <span className="inline-flex items-center gap-1 text-accent-coral">
                <Flame size={11} /> {o.fires} lit
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function RosterTable({ roster, onPick }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg">Full roster</h2>
        <span className="text-xs text-arena-muted">{roster.length} consultants</span>
      </header>
      <div className="arena-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold bg-arena-surface2/40 border-b border-arena-border">
                <th className="text-left px-4 py-3">Consultant</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-right px-3 py-3">Invoice</th>
                <th className="text-right px-3 py-3">Ops</th>
                <th className="text-right px-3 py-3">Early %</th>
                <th className="text-right px-3 py-3">Close</th>
                <th className="text-right px-3 py-3 whitespace-nowrap">🔥 Fire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-border">
              {roster.map((r) => {
                const st = STATUS_STYLE[r.status]
                return (
                  <tr
                    key={r.consultant.id}
                    onClick={() => onPick(r.consultant.id)}
                    className="hover:bg-arena-surface2/40 cursor-pointer"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-arena-ink">{r.consultant.name}</span>
                        <LocationPill location={r.consultant.location} />
                      </div>
                      <div className="text-[11px] text-arena-muted">{r.consultant.role}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={['inline-flex items-center gap-1.5 text-xs font-display font-bold', st.text].join(' ')}>
                        <span className={['h-2 w-2 rounded-full', st.dot].join(' ')} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1.5 justify-end font-display font-bold text-arena-ink">
                        {formatCurrencyCompact(r.cur?.invoiceValue ?? 0)}
                        <TrendArrow direction={r.invoiceTrend} size={13} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-arena-ink">{r.cur?.opsDelivered ?? 0}</td>
                    <td className="px-3 py-2.5 text-right text-arena-muted">{Math.round(r.cur?.invoiceBeforeDay15Pct ?? 0)}%</td>
                    <td className="px-3 py-2.5 text-right text-arena-muted">{(r.cur?.avgDaysToClose ?? 0).toFixed(1)}d</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={r.fire.current > 0 ? 'text-accent-coral font-display font-bold' : 'text-arena-muted'}>
                        {r.fire.current}d
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
