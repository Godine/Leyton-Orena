import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, ChevronDown, ArrowUp, ArrowDown, Minus, Sparkles, Swords, GitCompare, ArrowRight, Lightbulb, LayoutDashboard } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { buildLeaderboard, aggregate } from '../utils/computeRankings.js'
import { closestToUnlock } from '../utils/badgeEligibility.js'
import ProfileHeader from '../components/profile/ProfileHeader.jsx'
import PerformanceRings from '../components/profile/PerformanceRings.jsx'
import TrendChart from '../components/profile/TrendChart.jsx'
import BadgeShowcase from '../components/profile/BadgeShowcase.jsx'
import StreakDisplay from '../components/profile/StreakDisplay.jsx'
import PersonalRecords from '../components/profile/PersonalRecords.jsx'
import NextBadges from '../components/profile/NextBadges.jsx'
import ActivityHeatmap from '../components/profile/ActivityHeatmap.jsx'
import CategoryProgress from '../components/profile/CategoryProgress.jsx'
import InsightsCard from '../components/profile/InsightsCard.jsx'
import FireStreak from '../components/shared/FireStreak.jsx'
import LoadingBar from '../components/shared/LoadingBar.jsx'
import useStaleWhileChanging from '../components/shared/useStaleWhileChanging.js'
import BadgeDetailModal from '../components/achievements/BadgeDetailModal.jsx'
import CoachingTab from '../components/profile/CoachingTab.jsx'

const JOIN_DATES = {
  'c-01': 'Mar 2022', 'c-02': 'Jun 2023', 'c-03': 'Sep 2021', 'c-04': 'Jan 2024',
  'c-05': 'Apr 2022', 'c-06': 'Nov 2023', 'c-07': 'Feb 2022',
  'c-08': 'May 2020', 'c-09': 'Sep 2022', 'c-10': 'Jul 2023', 'c-11': 'Oct 2024',
  'c-12': 'Mar 2021', 'c-13': 'Dec 2023',
  'c-14': 'Aug 2021', 'c-15': 'Feb 2024', 'c-16': 'Jun 2022', 'c-17': 'Nov 2020',
  'c-18': 'Apr 2021', 'c-19': 'Sep 2023', 'c-20': 'Jan 2022', 'c-21': 'May 2024',
  'c-22': 'Oct 2019', 'c-23': 'Mar 2024', 'c-24': 'Jul 2020',
  'c-25': 'Sep 2019',
}

export default function Profile() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const allBadges = useArenaStore((s) => s.badges)
  const currentUserId = useArenaStore((s) => s.currentUserId)
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  const consultant = useArenaStore((s) => s.getById(currentUserId)) ?? consultants[0]
  const [openBadge, setOpenBadge] = useState(null)
  const [tab, setTab] = useState('overview')

  const sortedMonths = useMemo(() => [...months].sort(), [months])
  const currentMonth = sortedMonths.at(-1)
  const currentStats = consultant.monthlyStats.find((s) => s.month === currentMonth)

  const lifetime = useMemo(() => aggregate(consultant, sortedMonths), [consultant, sortedMonths])

  // Team averages for current month, within the same role
  const teamAverages = useMemo(() => {
    const peers = consultants.filter((c) => c.role === consultant.role)
    const slice = peers
      .map((c) => c.monthlyStats.find((s) => s.month === currentMonth))
      .filter(Boolean)
    if (!slice.length) return { opsDelivered: 0, invoiceValue: 0, invoiceBeforeDay15Pct: 0, avgDaysToClose: 0 }
    const mean = (k) => slice.reduce((a, b) => a + (b[k] ?? 0), 0) / slice.length
    return {
      opsDelivered: mean('opsDelivered'),
      invoiceValue: mean('invoiceValue'),
      invoiceBeforeDay15Pct: mean('invoiceBeforeDay15Pct'),
      avgDaysToClose: mean('avgDaysToClose'),
    }
  }, [consultants, consultant.role, currentMonth])

  // Rank summary — sort by invoiceValue this month, role-scoped
  const { rank, total, deltaPositions } = useMemo(() => {
    const args = { consultants, months, role: consultant.role, location: 'All', sortKey: 'invoiceValue' }
    const thisMonth = buildLeaderboard({ ...args, periodKey: 'month' })
    const meNow = thisMonth.find((r) => r.consultant.id === consultant.id)
    const prevMonths = sortedMonths.slice(-2, -1)
    const lastMonthRows = prevMonths.length
      ? buildLeaderboard({
          consultants: consultants.map((c) => ({
            ...c,
            monthlyStats: c.monthlyStats.filter((s) => s.month === prevMonths[0]),
          })),
          months: prevMonths,
          role: consultant.role, location: 'All', sortKey: 'invoiceValue', periodKey: 'month',
        })
      : []
    const mePrev = lastMonthRows.find((r) => r.consultant.id === consultant.id)
    return {
      rank: meNow?.rank ?? 0,
      total: thisMonth.length,
      deltaPositions: mePrev ? mePrev.rank - (meNow?.rank ?? mePrev.rank) : 0,
    }
  }, [consultants, months, consultant.id, consultant.role, sortedMonths])

  const earnedBadgeObjs = useMemo(
    () => (consultant.badges ?? []).map((id) => allBadges.find((b) => b.id === id)).filter(Boolean),
    [consultant.badges, allBadges],
  )
  const nextBadge = useMemo(() => closestToUnlock(consultant, allBadges), [consultant, allBadges])

  const todayStr = useMemo(
    () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  )

  // Brief stale window when the active consultant changes — lets the loading
  // bar flash so the user feels the page reflowing to new data.
  const refreshing = useStaleWhileChanging(consultant.id, 240)

  return (
    <div className="relative space-y-6 xl:space-y-8">
      <LoadingBar active={refreshing} />
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
              <User className="text-accent-green" size={24} strokeWidth={2.4} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
                {todayStr}
              </span>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-display font-black leading-none">
                <span className="text-accent-green">My Profile</span>
              </h1>
            </div>
          </div>
          <ConsultantSelector
            consultants={consultants}
            value={consultant.id}
            onChange={setCurrentUserId}
          />
        </div>
      </header>

      <ProfileHeader
        consultant={consultant}
        totals={lifetime}
        joinDate={JOIN_DATES[consultant.id] ?? '—'}
      />

      <QuickActions consultantId={consultant.id} consultantName={consultant.name} />

      <ProfileTabs tab={tab} onChange={setTab} />

      {tab === 'coaching' ? (
        <CoachingTab consultant={consultant} />
      ) : (
        <>
      <section>
        <h2 className="font-display font-black text-arena-ink text-lg mb-3">This month</h2>
        <PerformanceRings currentMonth={currentStats} teamAverages={teamAverages} targets={consultant.targets} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
        <div className="lg:col-span-2 xl:col-span-3 space-y-4 xl:space-y-6">
          <TrendChart stats={[...consultant.monthlyStats].sort((a, b) => a.month.localeCompare(b.month))} />
          <ActivityHeatmap
            log={consultant.fire?.log ?? []}
            todayIso={consultant.fire?.todayIso}
          />
          <RankSummary rank={rank} total={total} delta={deltaPositions} role={consultant.role} />
          <InsightsCard consultant={consultant} allConsultants={consultants} months={months} />
          <CategoryProgress earnedIds={consultant.badges ?? []} />
        </div>
        <div className="space-y-4">
          <FireStreak
            current={consultant.fire?.current ?? 0}
            best={consultant.fire?.best ?? 0}
            log={consultant.fire?.log ?? []}
            moves={consultant.fire?.moves ?? []}
            todayIso={consultant.fire?.todayIso}
            variant="mini"
          />
          <StreakDisplay
            current={consultant.streaks?.currentMonthlyStreak ?? 0}
            best={consultant.streaks?.bestMonthlyStreak ?? 0}
          />
          <NextBadges
            consultant={consultant}
            allBadges={allBadges}
            onOpenBadge={(b) => setOpenBadge(b)}
          />
          <PersonalRecords consultant={consultant} />
          <BadgeShowcase
            earnedBadges={earnedBadgeObjs}
            nextBadge={nextBadge}
            onOpenBadge={(b) => setOpenBadge(b)}
          />
        </div>
      </div>

        </>
      )}

      <BadgeDetailModal
        badge={openBadge}
        open={Boolean(openBadge)}
        onClose={() => setOpenBadge(null)}
        currentUser={consultant}
        holders={openBadge ? consultants.filter((c) => c.badges?.includes(openBadge.id)) : []}
      />
    </div>
  )
}

function ProfileTabs({ tab, onChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview',  icon: LayoutDashboard },
    { id: 'coaching', label: 'Coaching',  icon: Lightbulb },
  ]
  return (
    <div className="inline-flex bg-arena-bg/60 border border-arena-border rounded-full p-1 text-xs font-display font-bold">
      {tabs.map((t) => {
        const active = t.id === tab
        const Icon = t.icon
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={[
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors',
              active ? 'bg-accent-green text-arena-bg shadow-glow' : 'text-arena-muted hover:text-arena-ink',
            ].join(' ')}
          >
            <Icon size={13} strokeWidth={2.6} />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// Profile is the discovery hub for the three features that no longer live in
// the sidebar: Wrapped (your end-of-quarter recap), Duels (challenge a peer
// 1:1), and Compare (side-by-side stats).
function QuickActions({ consultantId, consultantName }) {
  const actions = [
    {
      to: '/wrapped',
      icon: Sparkles,
      title: 'Your Wrapped',
      body: `${consultantName.split(' ')[0]}'s end-of-quarter recap — top stats, biggest wins, sharable cards.`,
      accent: 'text-accent-amber', ring: 'ring-accent-amber/40', glow: 'shadow-[0_18px_42px_-20px_rgba(255,200,0,0.6)]',
    },
    {
      to: '/duels',
      icon: Swords,
      title: 'Throw down a duel',
      body: 'Challenge a teammate head-to-head. Pick a metric, a duration, a stake. Winner takes the pot.',
      accent: 'text-accent-green', ring: 'ring-accent-green/40', glow: 'shadow-[0_18px_42px_-20px_rgba(45,212,191,0.55)]',
    },
    {
      to: '/compare',
      icon: GitCompare,
      title: 'Compare with a peer',
      body: 'Stack your numbers against any consultant — month, quarter, lifetime. See gaps at a glance.',
      accent: 'text-arena-amber', ring: 'ring-arena-amber/40', glow: 'shadow-[0_18px_42px_-20px_rgba(247,92,3,0.55)]',
    },
  ]
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-black text-arena-ink text-lg">Quick actions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <Link
              key={a.to}
              to={a.to}
              className={[
                'group arena-card p-4 flex items-start gap-3 ring-1 ring-inset',
                a.ring, a.glow, 'hover:-translate-y-0.5 transition-transform',
              ].join(' ')}
            >
              <span className={['h-10 w-10 rounded-xl bg-arena-bg/50 border border-arena-border grid place-items-center shrink-0', a.accent].join(' ')}>
                <Icon size={18} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="font-display font-black text-arena-ink truncate">{a.title}</div>
                  <ArrowRight size={14} className="text-arena-muted group-hover:translate-x-0.5 transition-transform" strokeWidth={2.6} />
                </div>
                <p className="mt-1 text-xs text-arena-muted leading-relaxed">{a.body}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function ConsultantSelector({ consultants, value, onChange }) {
  return (
    <label className="inline-flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
        View as
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-arena-surface border border-arena-border rounded-full pl-4 pr-9 py-2 text-xs font-display font-bold text-arena-ink focus:outline-none focus:ring-2 focus:ring-accent-green/50 cursor-pointer"
        >
          {consultants.map((c) => (
            <option key={c.id} value={c.id} className="bg-arena-surface">
              {c.name} · {c.role}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-muted pointer-events-none" />
      </span>
    </label>
  )
}

function RankSummary({ rank, total, delta, role }) {
  const Trend = delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus
  const trendColor = delta > 0 ? 'text-accent-green' : delta < 0 ? 'text-accent-coral' : 'text-arena-muted'
  const trendLabel = delta > 0
    ? `↑ ${delta} position${delta === 1 ? '' : 's'}`
    : delta < 0
      ? `↓ ${Math.abs(delta)} position${Math.abs(delta) === 1 ? '' : 's'}`
      : 'no change'
  return (
    <div className="arena-card p-5 flex items-center gap-5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          Leaderboard · invoice value · this month
        </div>
        <div className="mt-1 font-display font-black text-arena-ink text-3xl">
          #{rank}{' '}
          <span className="text-arena-muted font-bold text-lg">/ {total}</span>
        </div>
        <div className="text-xs text-arena-muted">among {role} consultants</div>
      </div>
      <div className={['ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-arena-bg/60 border border-arena-border', trendColor].join(' ')}>
        <Trend size={16} strokeWidth={2.6} />
        <span className="text-xs font-display font-bold">{trendLabel}</span>
      </div>
    </div>
  )
}
