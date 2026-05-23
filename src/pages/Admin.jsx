import { useMemo, useState } from 'react'
import { Settings, RotateCcw, Sparkles, PlayCircle, Compass } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { useNotificationStore } from '../store/useNotificationStore.js'
import { useChallengeStore } from '../store/useChallengeStore.js'

export default function Admin() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const setConsultantMonth = useArenaStore((s) => s.setConsultantMonth)
  const demoMode = useArenaStore((s) => s.demoMode)
  const setDemoMode = useArenaStore((s) => s.setDemoMode)
  const setWalkthroughOpen = useArenaStore((s) => s.setWalkthroughOpen)

  const markAllUnread = useNotificationStore((s) => s.markAllUnread)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const challenges = useChallengeStore((s) => s.challenges)
  const updateChallenge = useChallengeStore((s) => s.updateChallenge)

  const latestMonth = useMemo(() => [...months].sort().at(-1), [months])
  const [editMonth, setEditMonth] = useState(latestMonth)

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <Settings className="text-accent-coral" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black">
          <span className="text-accent-coral">Admin</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Edit the demo dataset, trigger animations, and turn on Presentation Mode for showing leadership.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <ActionTile
          icon={PlayCircle}
          title="Demo Mode"
          body={demoMode ? 'Rotating consultants + sample toasts.' : 'Off — toggle to start the show.'}
          accent={demoMode ? '#58cc02' : '#a0a0c0'}
        >
          <Toggle value={demoMode} onChange={setDemoMode} label={demoMode ? 'On' : 'Off'} />
        </ActionTile>

        <ActionTile
          icon={Compass}
          title="Guided walkthrough"
          body="Open the step-by-step tour overlay."
          accent="#1cb0f6"
        >
          <button
            onClick={() => setWalkthroughOpen(true)}
            className="text-xs font-display font-bold px-3 py-1.5 rounded-full bg-accent-blue/15 text-accent-blue ring-1 ring-inset ring-accent-blue/40"
          >
            Launch tour
          </button>
        </ActionTile>

        <ActionTile
          icon={Sparkles}
          title="Trigger badge unlock"
          body="Fires a sample badge unlock notification + toast."
          accent="#ce82ff"
        >
          <button
            onClick={() =>
              addNotification({
                kind: 'badge',
                title: 'You earned 🎯 Sniper!',
                body: 'Closed an Op in under 48 hours.',
              })
            }
            className="text-xs font-display font-bold px-3 py-1.5 rounded-full bg-accent-purple/15 text-accent-purple ring-1 ring-inset ring-accent-purple/40"
          >
            Fire unlock
          </button>
        </ActionTile>

        <ActionTile
          icon={RotateCcw}
          title="Reset notifications"
          body="Mark every notification as unread for the next demo loop."
          accent="#ffc800"
        >
          <button
            onClick={() => markAllUnread()}
            className="text-xs font-display font-bold px-3 py-1.5 rounded-full bg-accent-amber/15 text-accent-amber ring-1 ring-inset ring-accent-amber/40"
          >
            Reset
          </button>
        </ActionTile>
      </section>

      <section>
        <header className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display font-black text-arena-ink text-lg">Consultant stats</h2>
          <MonthPicker months={months} value={editMonth} onChange={setEditMonth} />
        </header>
        <StatsTable
          consultants={consultants}
          month={editMonth}
          onEdit={(id, patch) => setConsultantMonth(id, editMonth, patch)}
        />
      </section>

      <section>
        <header className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display font-black text-arena-ink text-lg">Monthly challenges</h2>
          <span className="text-xs text-arena-muted">Edits go live immediately</span>
        </header>
        <ChallengeEditor challenges={challenges} updateChallenge={updateChallenge} />
      </section>
    </div>
  )
}

function ActionTile({ icon: Icon, title, body, accent, children }) {
  return (
    <div className="arena-card p-4 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2">
        <span
          className="h-8 w-8 rounded-xl grid place-items-center"
          style={{ background: `${accent}22`, boxShadow: `inset 0 0 0 1px ${accent}55` }}
        >
          <Icon size={15} style={{ color: accent }} strokeWidth={2.4} />
        </span>
        <span className="font-display font-black text-arena-ink text-sm">{title}</span>
      </div>
      <p className="text-xs text-arena-muted flex-1">{body}</p>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arena-bg/70 border border-arena-border"
    >
      <span
        className={[
          'relative inline-block h-5 w-9 rounded-full transition-colors',
          value ? 'bg-accent-green shadow-glow' : 'bg-arena-surface2',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-arena-ink transition-all',
            value ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </span>
      <span className="text-xs font-display font-bold text-arena-ink">{label}</span>
    </button>
  )
}

function MonthPicker({ months, value, onChange }) {
  const sorted = [...months].sort()
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-arena-surface border border-arena-border rounded-full pl-4 pr-4 py-1.5 text-xs font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
    >
      {sorted.map((m) => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  )
}

const COLS = [
  { key: 'opsDelivered',          label: 'Ops',       step: 1,   min: 0 },
  { key: 'invoiceValue',          label: 'Invoice £', step: 1000, min: 0 },
  { key: 'invoiceBeforeDay15Pct', label: 'Early %',   step: 1,   min: 0, max: 100 },
  { key: 'avgDaysToClose',        label: 'Days',      step: 0.1, min: 0 },
  { key: 'clientRetentionFlags',  label: 'Flags',     step: 1,   min: 0 },
  { key: 'pushedOps',             label: 'Pushed',    step: 1,   min: 0 },
]

function StatsTable({ consultants, month, onEdit }) {
  return (
    <div className="arena-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold bg-arena-surface2/40 border-b border-arena-border">
              <th className="text-left px-4 py-3 sticky left-0 bg-arena-surface2/80 backdrop-blur">Consultant</th>
              {COLS.map((c) => (
                <th key={c.key} className="text-right px-3 py-3 whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-arena-border">
            {consultants.map((c) => {
              const stat = c.monthlyStats.find((s) => s.month === month)
              return (
                <tr key={c.id} className="hover:bg-arena-surface2/40">
                  <td className="px-4 py-2 sticky left-0 bg-arena-surface/95 backdrop-blur">
                    <div className="font-display font-bold text-arena-ink leading-tight">{c.name}</div>
                    <div className="text-[11px] text-arena-muted">{c.role} · {c.location}</div>
                  </td>
                  {COLS.map((col) => (
                    <td key={col.key} className="px-2 py-2 text-right">
                      <input
                        type="number"
                        step={col.step}
                        min={col.min}
                        max={col.max}
                        value={stat?.[col.key] ?? 0}
                        onChange={(e) => onEdit(c.id, { [col.key]: Number(e.target.value) })}
                        className="w-24 bg-arena-bg/60 border border-arena-border rounded-lg px-2 py-1 text-right text-arena-ink text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-green/50"
                      />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ChallengeEditor({ challenges, updateChallenge }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {challenges.map((ch) => (
        <div key={ch.id} className="arena-card p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{ch.icon}</div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-1">
                Title
              </label>
              <input
                value={ch.title}
                onChange={(e) => updateChallenge(ch.id, { title: e.target.value })}
                className="w-full bg-arena-bg/60 border border-arena-border rounded-lg px-3 py-1.5 text-sm font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-arena-muted">{ch.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-1">
                Target
              </label>
              <input
                type="number"
                value={ch.target}
                onChange={(e) => updateChallenge(ch.id, { target: Number(e.target.value) })}
                className="w-full bg-arena-bg/60 border border-arena-border rounded-lg px-3 py-1.5 text-sm font-mono text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-1">
                Days left
              </label>
              <input
                type="number"
                value={ch.daysLeft}
                onChange={(e) => updateChallenge(ch.id, { daysLeft: Number(e.target.value) })}
                className="w-full bg-arena-bg/60 border border-arena-border rounded-lg px-3 py-1.5 text-sm font-mono text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
