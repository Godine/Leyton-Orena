import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Flame } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { useChallengeStore } from '../store/useChallengeStore.js'
import { useNotificationStore } from '../store/useNotificationStore.js'
import { buildLeaderboard } from '../utils/computeRankings.js'
import { computeRecords, isUnderThreat } from '../utils/computeRecords.js'
import WelcomeHeader from '../components/home/WelcomeHeader.jsx'
import QuickStats from '../components/home/QuickStats.jsx'
import FireStreak from '../components/shared/FireStreak.jsx'
import ChallengesPanel from '../components/home/ChallengesPanel.jsx'
import ActivityFeed from '../components/home/ActivityFeed.jsx'
import LocationPill from '../components/shared/LocationPill.jsx'

const TARGETS = { ops: 7, invoice: 55000 }

export default function Home() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const allBadges = useArenaStore((s) => s.badges)
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const challenges = useChallengeStore((s) => s.challenges)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const toastShown = useNotificationStore((s) => s.toastShownThisSession)
  const markToastShown = useNotificationStore((s) => s.markToastShown)

  const sortedMonths = useMemo(() => [...months].sort(), [months])
  const latestMonth = sortedMonths.at(-1)
  const stats = currentUser.monthlyStats.find((s) => s.month === latestMonth)

  // Rank within role for invoiceValue this month + delta vs previous month
  const rankInfo = useMemo(() => {
    const args = { consultants, months, role: currentUser.role, location: 'All', sortKey: 'invoiceValue' }
    const now = buildLeaderboard({ ...args, periodKey: 'month' })
    const prevMonths = sortedMonths.slice(-2, -1)
    const prev = prevMonths.length
      ? buildLeaderboard({
          consultants: consultants.map((c) => ({
            ...c, monthlyStats: c.monthlyStats.filter((s) => s.month === prevMonths[0]),
          })),
          months: prevMonths,
          role: currentUser.role, location: 'All', sortKey: 'invoiceValue', periodKey: 'month',
        })
      : []
    const meNow = now.find((r) => r.consultant.id === currentUser.id)
    const mePrev = prev.find((r) => r.consultant.id === currentUser.id)
    return {
      rank: meNow?.rank ?? 0,
      total: now.length,
      delta: mePrev && meNow ? mePrev.rank - meNow.rank : 0,
    }
  }, [consultants, months, sortedMonths, currentUser])

  const quickStats = {
    ops:     { value: stats?.opsDelivered ?? 0, target: TARGETS.ops,     ratio: (stats?.opsDelivered ?? 0) / TARGETS.ops },
    invoice: { value: stats?.invoiceValue ?? 0, target: TARGETS.invoice, ratio: (stats?.invoiceValue ?? 0) / TARGETS.invoice },
    rank: rankInfo.rank, rankTotal: rankInfo.total, rankDelta: rankInfo.delta,
    streak: currentUser.streaks?.currentMonthlyStreak ?? 0,
    bestStreak: currentUser.streaks?.bestMonthlyStreak ?? 0,
  }

  const badgesById = useMemo(
    () => Object.fromEntries(allBadges.map((b) => [b.id, b])),
    [allBadges],
  )

  const computedChallenges = useMemo(
    () => challenges.map((c) => ({
      challenge: c,
      progress: c.progressFn(currentUser, consultants, latestMonth, c),
    })),
    [challenges, currentUser, consultants, latestMonth],
  )

  const consultantsById = useMemo(
    () => Object.fromEntries(consultants.map((c) => [c.id, c])),
    [consultants],
  )

  const threatenedRecords = useMemo(
    () => computeRecords(consultants, months).filter(isUnderThreat).slice(0, 3),
    [consultants, months],
  )

  // Fire a single welcome toast on first arrival in this session.
  useEffect(() => {
    if (toastShown) return
    const first = currentUser.name.split(' ')[0]
    const t = setTimeout(() => {
      addNotification({
        kind: 'rank',
        title: `Welcome back, ${first}!`,
        body: `You're #${rankInfo.rank} of ${rankInfo.total} this month. Keep climbing.`,
      })
      markToastShown()
    }, 800)
    return () => clearTimeout(t)
  }, [toastShown, addNotification, markToastShown, currentUser.name, rankInfo.rank, rankInfo.total])

  return (
    <div className="space-y-8 xl:space-y-10">
      <WelcomeHeader name={currentUser.name} />

      <FireStreak
        current={currentUser.fire?.current ?? 0}
        best={currentUser.fire?.best ?? 0}
        log={currentUser.fire?.log ?? []}
        moves={currentUser.fire?.moves ?? []}
        todayIso={currentUser.fire?.todayIso}
        variant="hero"
      />

      <QuickStats stats={quickStats} />

      <ChallengesPanel
        challenges={challenges}
        computed={computedChallenges}
        badgesById={badgesById}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
        <div className="lg:col-span-2 xl:col-span-3">
          <ActivityFeed />
        </div>
        <div>
          <ThreatenedRecordsWidget records={threatenedRecords} consultantsById={consultantsById} />
        </div>
      </div>
    </div>
  )
}

function ThreatenedRecordsWidget({ records, consultantsById }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg flex items-center gap-2">
          <Flame size={18} className="text-accent-coral animate-flame" />
          Under threat
        </h2>
        <Link to="/records" className="text-xs text-accent-amber hover:underline inline-flex items-center gap-0.5 font-display font-bold">
          See all <ChevronRight size={12} />
        </Link>
      </header>

      {records.length === 0 ? (
        <div className="arena-card text-center text-sm text-arena-muted py-8">
          No records under threat. The Hall is safe — for now.
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r, i) => {
            const holder = consultantsById[r.holderId]
            const challenger = consultantsById[r.runnerUp?.consultantId]
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="arena-card p-3 border-accent-coral/40"
                style={{ boxShadow: '0 0 18px rgba(255,75,75,0.18)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-sm text-arena-ink truncate">{r.title}</div>
                    <div className="text-[11px] text-arena-muted truncate">
                      Held by {holder?.name} · {r.format(r.value)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
                  <div className="h-full rounded-full bg-accent-coral" style={{ width: `${Math.round(r.threatRatio * 100)}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-arena-muted inline-flex items-center gap-1.5">
                    {challenger?.name}
                    {challenger && <LocationPill location={challenger.location} />}
                  </span>
                  <span className="text-accent-coral font-display font-bold">
                    {Math.round(r.threatRatio * 100)}%
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
