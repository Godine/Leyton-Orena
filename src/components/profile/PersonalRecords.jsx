import { Trophy, Briefcase, Banknote, Zap, Clock, Flame, Award } from 'lucide-react'
import { formatCurrencyCompact } from '../../utils/formatters.js'

// Personal bests across the consultant's tracked history.
function computePersonalRecords(consultant) {
  const stats = consultant.monthlyStats ?? []
  if (!stats.length) return []
  const max = (sel) => stats.reduce((b, s) => (sel(s) > sel(b) ? s : b), stats[0])
  const min = (sel) => stats.reduce((b, s) => (sel(s) < sel(b) ? s : b), stats[0])
  const fmtMonth = (iso) => {
    if (!iso) return ''
    const [y, m] = iso.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  }
  const bestInvoice = max((s) => s.invoiceValue ?? 0)
  const bestOps = max((s) => s.opsDelivered ?? 0)
  const bestEarly = max((s) => s.invoiceBeforeDay15Pct ?? 0)
  const fastest = min((s) => s.avgDaysToClose ?? Infinity)
  return [
    { Icon: Banknote,  label: 'Biggest month',  value: formatCurrencyCompact(bestInvoice.invoiceValue), when: fmtMonth(bestInvoice.month), accent: 'text-accent-amber' },
    { Icon: Briefcase, label: 'Most ops',       value: `${bestOps.opsDelivered ?? 0}`,                 when: fmtMonth(bestOps.month),     accent: 'text-accent-green' },
    { Icon: Zap,       label: 'Best early %',   value: `${Math.round(bestEarly.invoiceBeforeDay15Pct ?? 0)}%`, when: fmtMonth(bestEarly.month), accent: 'text-accent-blue' },
    { Icon: Clock,     label: 'Fastest close',  value: `${(fastest.avgDaysToClose ?? 0).toFixed(1)}d`, when: fmtMonth(fastest.month),     accent: 'text-accent-purple' },
    { Icon: Flame,     label: 'Longest fire',   value: `${consultant.fire?.best ?? 0}d`,              when: 'all time',                  accent: 'text-accent-coral' },
    { Icon: Award,     label: 'Target streak',  value: `${consultant.streaks?.bestMonthlyStreak ?? 0}mo`, when: 'all time',              accent: 'text-accent-amber' },
  ]
}

export default function PersonalRecords({ consultant }) {
  const records = computePersonalRecords(consultant)
  if (!records.length) return null
  return (
    <div className="arena-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-accent-amber" />
        <h3 className="font-display font-black text-arena-ink">Personal bests</h3>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          beat your past self
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2.5">
        {records.map((r) => (
          <li key={r.label} className="rounded-xl bg-arena-bg/40 border border-arena-border p-2.5">
            <div className="flex items-center gap-1.5">
              <r.Icon size={13} className={`${r.accent} shrink-0`} strokeWidth={2.4} />
              <span className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold truncate">
                {r.label}
              </span>
            </div>
            <div className="mt-1 font-display font-black text-arena-ink text-base leading-tight">{r.value}</div>
            <div className="text-[10px] text-arena-muted">{r.when}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
