import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, ArrowUp, ArrowDown, ShieldHalf, Clock } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { computeLeagues, currentSeason } from '../utils/computeLeagues.js'
import { formatCurrencyCompact } from '../utils/formatters.js'
import LocationPill from '../components/shared/LocationPill.jsx'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function Seasons() {
  const consultants = useArenaStore((s) => s.consultants)
  const currentUserId = useArenaStore((s) => s.currentUserId)
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  const season = useMemo(currentSeason, [])
  const { leagues, byConsultant } = useMemo(() => computeLeagues(consultants), [consultants])
  const myStanding = byConsultant[currentUserId]

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <ShieldHalf className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-arena-amber">Seasons</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Five leagues. One season per calendar year. Top of each league promotes, bottom relegates. Newcomers start in Bronze and climb.
        </p>
      </header>

      {/* Season banner */}
      <section className="arena-card p-5 md:p-6 relative overflow-hidden"
        style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255,200,0,0.18), transparent 60%), linear-gradient(180deg, rgb(var(--arena-surface-rgb)), rgb(var(--arena-bg-rgb)))' }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
              Current season
            </div>
            <h2 className="font-display font-black text-arena-ink text-3xl md:text-4xl mt-1">
              {season.name}
            </h2>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 text-xs text-arena-muted">
              <Clock size={13} /> {season.daysLeft} day{season.daysLeft === 1 ? '' : 's'} left
            </div>
            {myStanding && (
              <div className="mt-2 text-xs">
                You're in{' '}
                <span className="font-display font-black"
                  style={{ color: leagues.find((l) => l.id === myStanding.league)?.color }}
                >
                  {leagues.find((l) => l.id === myStanding.league)?.name}
                </span>
                {' '}· #{myStanding.rank}
                {myStanding.zone === 'promotion' && <span className="ml-2 text-accent-green font-display font-bold">↑ promotion zone</span>}
                {myStanding.zone === 'relegation' && <span className="ml-2 text-accent-coral font-display font-bold">↓ relegation zone</span>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-arena-muted font-display font-bold mb-1.5">
            <span>{season.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            <span>Season progress</span>
            <span>{season.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="h-2 rounded-full bg-arena-surface2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${season.elapsedFrac * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #F75C03, #ffc800)' }}
            />
          </div>
        </div>
      </section>

      {/* League cards */}
      <section className="space-y-4">
        {leagues.map((league, i) => (
          <motion.div
            key={league.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="arena-card p-5 md:p-6 relative overflow-hidden"
            style={{ boxShadow: `0 0 24px ${league.color}22` }}
          >
            <header className="flex items-center gap-3 mb-4">
              <div
                className="h-12 w-12 rounded-2xl grid place-items-center text-2xl"
                style={{ background: `${league.color}22`, boxShadow: `inset 0 0 0 1px ${league.color}55` }}
              >
                {league.icon}
              </div>
              <div>
                <div className={['font-display font-black text-2xl', league.accent].join(' ')}>{league.name}</div>
                <div className="text-[11px] text-arena-muted">
                  {league.members.length} consultant{league.members.length === 1 ? '' : 's'}
                </div>
              </div>
              {i === 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 arena-chip bg-teal-400/15 text-teal-300" style={{ boxShadow: 'inset 0 0 0 1px rgba(45,212,191,0.4)' }}>
                  <Crown size={11} /> Top league
                </span>
              )}
            </header>

            <ul className="divide-y divide-arena-border">
              {league.members.map((m) => {
                const c = m.consultant
                const isMe = c.id === currentUserId
                const zoneBg =
                  m.zone === 'promotion' ? 'bg-accent-green/[0.07]' :
                  m.zone === 'relegation' ? 'bg-accent-coral/[0.07]' : ''
                return (
                  <li key={c.id}>
                    <Link
                      to="/profile"
                      onClick={() => setCurrentUserId(c.id)}
                      className={[
                        'flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-xl transition-colors',
                        zoneBg,
                        isMe ? 'ring-1 ring-inset ring-accent-green/40' : 'hover:bg-arena-surface2/40',
                      ].join(' ')}
                    >
                      <span className="font-display font-black text-arena-muted text-sm w-7 text-right shrink-0">
                        #{m.rank}
                      </span>
                      <span
                        className="h-9 w-9 rounded-xl grid place-items-center font-display font-black text-arena-bg text-[11px] shrink-0"
                        style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
                      >
                        {initials(c.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-arena-ink text-sm truncate">
                          {c.name}
                          {isMe && (
                            <span className="ml-2 arena-chip bg-accent-green/20 text-accent-green text-[9px] py-0.5 px-2">
                              you
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-arena-muted flex items-center gap-2 mt-0.5">
                          <span>{c.role}</span>
                          <LocationPill location={c.location} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-black text-arena-ink text-sm">
                          {m.score.toLocaleString('en-GB')}
                          <span className="text-arena-muted font-bold text-[10px] ml-0.5">pt</span>
                        </div>
                        {m.zone === 'promotion' && (
                          <div className="text-[10px] text-accent-green font-display font-bold inline-flex items-center gap-0.5">
                            <ArrowUp size={10} strokeWidth={3} /> Promotes
                          </div>
                        )}
                        {m.zone === 'relegation' && (
                          <div className="text-[10px] text-accent-coral font-display font-bold inline-flex items-center gap-0.5">
                            <ArrowDown size={10} strokeWidth={3} /> Relegates
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        ))}
      </section>

      {/* How it works footer */}
      <section className="arena-card p-5">
        <h3 className="font-display font-black text-arena-ink text-lg">How seasons work</h3>
        <ul className="mt-3 space-y-2 text-sm text-arena-muted">
          <li className="flex gap-2"><span className="text-accent-amber">•</span> Each calendar year is a fresh season. New consultants start in <span className="text-arena-ink">Bronze</span>.</li>
          <li className="flex gap-2"><span className="text-accent-green">↑</span> The top of each league promotes one tier when the season ends.</li>
          <li className="flex gap-2"><span className="text-accent-coral">↓</span> The bottom of each league relegates one tier.</li>
          <li className="flex gap-2"><span className="text-accent-amber">•</span> Season points = invoice (£k) + badges×50 + best target streak×60 + best championship run×200 + best fire×5.</li>
        </ul>
      </section>
    </div>
  )
}
