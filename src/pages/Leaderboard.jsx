import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronDown, Table2, Flag } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import {
  buildLeaderboard,
  buildPriorRanks,
  teamTotals,
  SORT_OPTIONS,
  PERIODS,
  LOCATIONS,
} from '../utils/computeRankings.js'
import Podium from '../components/leaderboard/Podium.jsx'
import MetricCards from '../components/leaderboard/MetricCards.jsx'
import LeaderboardTable from '../components/leaderboard/LeaderboardTable.jsx'
import RaceTrack from '../components/leaderboard/RaceTrack.jsx'
import YourPositionCard from '../components/leaderboard/YourPositionCard.jsx'

export default function Leaderboard() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const role = useArenaStore((s) => s.roleView)
  const currentUserId = useArenaStore((s) => s.currentUserId)

  const [periodKey, setPeriodKey] = useState('month')
  const [sortKey, setSortKey] = useState('invoiceValue')
  const [location, setLocation] = useState('All')
  const [view, setView] = useState('table') // 'table' | 'race'

  const rows = useMemo(
    () => buildLeaderboard({ consultants, months, role, location, periodKey, sortKey }),
    [consultants, months, role, location, periodKey, sortKey],
  )

  const priorRanks = useMemo(
    () => buildPriorRanks({ consultants, months, role, location, periodKey, sortKey }),
    [consultants, months, role, location, periodKey, sortKey],
  )

  const totals = useMemo(() => teamTotals(rows), [rows])
  const periodLabel = PERIODS.find((p) => p.key === periodKey)?.label ?? ''

  // Position delta of the current user, used by YourPositionCard.
  const myRow = rows.find((r) => r.consultant.id === currentUserId)
  const myDelta = myRow && priorRanks[currentUserId] ? priorRanks[currentUserId] - myRow.rank : 0

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow-amber">
            <Trophy className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
          <span className="arena-chip bg-arena-surface2 text-arena-muted">{role} view</span>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-arena-amber">Leaderboard</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Who's hot, who's climbing, who's slipping. Filter by period, location, or metric. Click any row to jump to their profile.
        </p>
      </header>

      {/* Always-visible "Your position" card */}
      <YourPositionCard
        rows={rows}
        currentUserId={currentUserId}
        sortKey={sortKey}
        positionChange={myDelta}
        totalInRole={rows.length}
      />

      {/* Compact filter bar with view toggle */}
      <FilterBar
        periodKey={periodKey}
        onPeriod={setPeriodKey}
        sortKey={sortKey}
        onSort={setSortKey}
        location={location}
        onLocation={setLocation}
        view={view}
        onView={setView}
      />

      <motion.section
        key={`${role}-${periodKey}-${sortKey}-${location}-podium`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Podium rows={rows.slice(0, 3)} sortKey={sortKey} priorRanks={priorRanks} />
      </motion.section>

      <MetricCards totals={totals} periodLabel={periodLabel} />

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display font-black text-arena-ink text-lg">
            {view === 'race' ? 'Race track' : 'Rankings'}
          </h2>
          <span className="text-xs text-arena-muted">
            {rows.length} {role.toLowerCase()} consultant{rows.length === 1 ? '' : 's'}
          </span>
        </div>
        <AnimatePresence mode="wait">
          {view === 'race' ? (
            <motion.div
              key="race"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <RaceTrack
                rows={rows}
                sortKey={sortKey}
                currentUserId={currentUserId}
                priorRanks={priorRanks}
                topN={12}
              />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardTable
                rows={rows.slice(3)}
                sortKey={sortKey}
                currentUserId={currentUserId}
                priorRanks={priorRanks}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

function FilterBar({ periodKey, onPeriod, sortKey, onSort, location, onLocation, view, onView }) {
  return (
    <div className="arena-card p-3 md:p-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
      <SegmentedControl
        label="Period"
        options={PERIODS.map((p) => ({ value: p.key, label: p.label }))}
        value={periodKey}
        onChange={onPeriod}
      />
      <ViewToggle value={view} onChange={onView} />
      <div className="flex-1" />
      <SortDropdown value={sortKey} onChange={onSort} />
      <LocationPills value={location} onChange={onLocation} />
    </div>
  )
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
      <button
        onClick={() => onChange('table')}
        title="Table view"
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
          value === 'table' ? 'bg-accent-amber text-arena-bg shadow-glow-amber' : 'text-arena-muted hover:text-arena-ink',
        ].join(' ')}
      >
        <Table2 size={12} strokeWidth={2.6} />
        Table
      </button>
      <button
        onClick={() => onChange('race')}
        title="Race view"
        className={[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors',
          value === 'race' ? 'bg-accent-amber text-arena-bg shadow-glow-amber' : 'text-arena-muted hover:text-arena-ink',
        ].join(' ')}
      >
        <Flag size={12} strokeWidth={2.6} />
        Race
      </button>
    </div>
  )
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        {label}
      </span>
      <div className="inline-flex bg-arena-bg/70 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={[
                'px-3 py-1.5 rounded-full transition-colors',
                active ? 'bg-accent-green text-arena-bg shadow-glow' : 'text-arena-muted hover:text-arena-ink',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SortDropdown({ value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="hidden md:inline text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        Sort by
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-arena-bg/70 border border-arena-border rounded-full pl-4 pr-9 py-1.5 text-xs font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key} className="bg-arena-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
      </span>
    </label>
  )
}

function LocationPills({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {LOCATIONS.map((loc) => {
        const active = loc === value
        return (
          <button
            key={loc}
            onClick={() => onChange(loc)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-display font-bold transition-colors',
              active
                ? 'bg-arena-amber text-arena-bg shadow-glow-amber'
                : 'bg-arena-bg/70 border border-arena-border text-arena-muted hover:text-arena-ink',
            ].join(' ')}
          >
            {loc}
          </button>
        )
      })}
    </div>
  )
}
