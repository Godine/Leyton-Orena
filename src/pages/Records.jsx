import { useMemo } from 'react'
import { Medal } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import {
  computeRecords,
  isUnderThreat,
  RECORD_CATEGORIES,
} from '../utils/computeRecords.js'
import RecordCard from '../components/records/RecordCard.jsx'
import ThreatAlert from '../components/records/ThreatAlert.jsx'

export default function Records() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)

  const records = useMemo(() => computeRecords(consultants, months), [consultants, months])
  const byId = useMemo(
    () => Object.fromEntries(consultants.map((c) => [c.id, c])),
    [consultants],
  )

  const threatened = records.filter(isUnderThreat)
  const grouped = RECORD_CATEGORIES.map((cat) => ({
    ...cat,
    records: records.filter((r) => r.category === cat.key),
  }))

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber">
            <Medal className="text-accent-coral" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-accent-coral">Hall of Records</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          All-time bests. Hold a record, get your name etched. Get close, and the holder feels it.
        </p>
      </header>

      {threatened.length > 0 && (
        <ThreatAlert count={threatened.length}>
          {threatened.map((r) => (
            <RecordCard
              key={`threat-${r.id}`}
              record={r}
              holder={byId[r.holderId]}
              runnerUpConsultant={byId[r.runnerUp?.consultantId]}
              underThreat
            />
          ))}
        </ThreatAlert>
      )}

      {grouped.map((group) => (
        <section key={group.key} className="space-y-3">
          <header className="flex items-center gap-3">
            <h2 className="font-display font-black text-arena-ink text-lg">{group.label}</h2>
            <span className="h-px flex-1 bg-arena-border" />
            <span className="text-xs text-arena-muted">{group.records.length} records</span>
          </header>
          <div className="grid xl:grid-cols-2 gap-3 md:gap-4">
            {group.records.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                holder={byId[r.holderId]}
                runnerUpConsultant={byId[r.runnerUp?.consultantId]}
                underThreat={isUnderThreat(r)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
