import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swords, Trophy, Waves, Target, Crown, Coins, ArrowRight, Flame, ChevronRight } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { buildFaceOff, COLORS, CUPS } from '../utils/teamCup.js'

const EASE = [0.22, 1, 0.36, 1]
const monthLabel = (iso) => {
  const [y, m] = iso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'short' })
}
const initials = (n = '') => n.split(/[\s-]+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360} 52% 45%)`
}

export default function Cup() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const fo = useMemo(() => buildFaceOff(consultants, months), [consultants, months])

  const O = COLORS.orange, B = COLORS.blue
  const leader = fo.leader

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
              <Swords className="text-arena-amber" size={24} strokeWidth={2.4} />
            </div>
            <span className="arena-chip bg-arena-surface2 text-arena-muted">H1 · live · round {fo.throughRound} of {fo.rounds.length}</span>
          </div>
          <Link to="/cup/draft" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-arena-amber text-arena-bg text-xs font-display font-black shadow-glow-amber hover:brightness-110">
            <Trophy size={14} strokeWidth={2.6} /> Draft room
          </Link>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          The <span style={{ color: O.hex }}>Face</span>-<span style={{ color: B.hex }}>Off</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Every half, the teams split into <b style={{ color: O.hex }}>Orange</b> and <b style={{ color: B.hex }}>Blue</b> — TC vs TC, FC vs FC.
          Two cups decide it: flattest weekly cadence, and closest landing to forecast. Smoothest half wins.
        </p>
      </header>

      {/* Scoreboard hero */}
      <div className="arena-card p-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr]">
          <ColourSide colour={O} wins={fo.wins.orange} pool={fo.rewardPool.orange} leading={leader === 'orange'} align="left" />
          <div className="grid place-items-center px-4 py-6 bg-arena-bg/40">
            <div className="text-[10px] uppercase tracking-[0.22em] text-arena-muted font-display font-bold">contests</div>
            <div className="font-display font-black text-arena-ink text-3xl md:text-4xl tabular-nums leading-none mt-1">
              {fo.wins.orange}<span className="text-arena-muted text-xl mx-1">–</span>{fo.wins.blue}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold mt-1">of 4</div>
          </div>
          <ColourSide colour={B} wins={fo.wins.blue} pool={fo.rewardPool.blue} leading={leader === 'blue'} align="right" />
        </div>
        {/* half progress */}
        <div className="px-5 py-3 border-t border-arena-border">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-1.5">
            <span>H1 progress · monthly rounds</span>
            <span>{fo.throughRound}/{fo.rounds.length}</span>
          </div>
          <div className="flex gap-1.5">
            {fo.rounds.map((m, i) => (
              <div key={m} className="flex-1">
                <div className="h-2 rounded-full" style={{ background: i < fo.throughRound ? '#F75C03' : 'rgb(var(--arena-border-rgb))' }} />
                <div className="text-[9px] text-center text-arena-muted font-display font-bold mt-1">{monthLabel(m)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The two cups */}
      {['cadence', 'forecast'].map((cupId) => (
        <CupSection key={cupId} cup={CUPS[cupId]} cupId={cupId}
          brackets={fo.brackets.filter((b) => b.cup === cupId)} />
      ))}

      {/* Rosters */}
      <section>
        <h2 className="font-display font-black text-arena-ink text-lg mb-3">Rosters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {fo.teams.map((t) => <RosterCard key={t.id} team={t} fo={fo} />)}
        </div>
      </section>
    </div>
  )
}

function ColourSide({ colour, wins, pool, leading, align }) {
  return (
    <div className="relative px-5 py-6 overflow-hidden" style={{ background: `linear-gradient(${align === 'left' ? '90deg' : '270deg'}, ${colour.hex}1f, transparent)` }}>
      <div className={['flex items-center gap-3', align === 'right' ? 'flex-row-reverse text-right' : ''].join(' ')}>
        <div className="h-14 w-14 rounded-2xl grid place-items-center shrink-0" style={{ background: colour.hex, boxShadow: `0 8px 24px ${colour.hex}66` }}>
          <Swords size={24} className="text-white" strokeWidth={2.4} />
        </div>
        <div>
          <div className="flex items-center gap-1.5" style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
            <span className="font-display font-black text-2xl" style={{ color: colour.hex }}>{colour.name}</span>
            {leading && <Crown size={16} className="text-arena-amber" />}
          </div>
          <div className="text-xs text-arena-muted font-display font-bold">{wins} cup{wins === 1 ? '' : 's'} led</div>
          <div className={['mt-1 inline-flex items-center gap-1 text-xs font-display font-black text-arena-ink', align === 'right' ? 'flex-row-reverse' : ''].join(' ')}>
            <Coins size={12} className="text-accent-amber" /> {pool.toLocaleString('en-GB')} team pts
          </div>
        </div>
      </div>
    </div>
  )
}

function CupSection({ cup, cupId, brackets }) {
  const Icon = cup.icon === 'waves' ? Waves : Target
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="h-8 w-8 rounded-xl bg-arena-surface2 grid place-items-center text-arena-amber"><Icon size={16} strokeWidth={2.4} /></span>
        <h2 className="font-display font-black text-arena-ink text-lg">{cup.name}</h2>
        <span className="text-xs text-arena-muted">· {cup.blurb}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {brackets.map((br) => <BracketCard key={br.roleKey} br={br} cupId={cupId} />)}
      </div>
    </section>
  )
}

function BracketCard({ br, cupId }) {
  const o = br.orange, b = br.blue
  const ov = br.orangeVal, bv = br.blueVal
  const total = ov + bv || 1
  const oShare = (ov / total) * 100
  const fmt = (v) => `${v.toFixed(1)}%`
  return (
    <div className="arena-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">{br.roleKey} bracket</span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-display font-black"
          style={{ color: COLORS[br.leader].hex }}>
          <Crown size={11} /> {COLORS[br.leader].name} leads
        </span>
      </div>

      {/* versus */}
      <div className="flex items-center justify-between gap-2">
        <TeamMini team={o} value={ov} fmt={fmt} leading={br.leader === 'orange'} />
        <span className="text-[10px] uppercase tracking-wider text-arena-muted font-display font-black">vs</span>
        <TeamMini team={b} value={bv} fmt={fmt} leading={br.leader === 'blue'} align="right" />
      </div>

      {/* diverging race bar */}
      <div className="mt-3 h-3 rounded-full overflow-hidden flex bg-arena-surface2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${oShare}%` }} transition={{ duration: 0.8, ease: EASE }}
          style={{ background: COLORS.orange.hex }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${100 - oShare}%` }} transition={{ duration: 0.8, ease: EASE }}
          style={{ background: COLORS.blue.hex }} />
      </div>
    </div>
  )
}

function TeamMini({ team, value, fmt, leading, align }) {
  return (
    <div className={['min-w-0', align === 'right' ? 'text-right' : ''].join(' ')}>
      <div className="font-display font-black text-arena-ink text-lg tabular-nums" style={{ color: COLORS[team.colour].hex }}>{fmt(value)}</div>
      <div className="text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold truncate">{team.name} · {team.members.length}</div>
    </div>
  )
}

function RosterCard({ team, fo }) {
  const c = COLORS[team.colour]
  const top = [...team.members]
    .map((m) => ({ m, s: (fo.metricByConsultant.get(m.id)?.[fo.playedMonths[fo.playedMonths.length - 1]]) }))
    .sort((a, b) => (b.s?.flatness ?? 0) - (a.s?.flatness ?? 0))
    .slice(0, 5)
  return (
    <div className="arena-card p-4" style={{ boxShadow: `inset 0 0 0 1px ${c.hex}33` }}>
      <div className="flex items-center gap-2">
        <span className="h-9 w-9 rounded-xl grid place-items-center shrink-0" style={{ background: c.hex }}>
          <Swords size={16} className="text-white" strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <div className="font-display font-black text-arena-ink truncate" style={{ color: c.hex }}>{team.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">{team.members.length} players</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniStat label="Cadence" value={`${team.score.cadence.toFixed(0)}%`} />
        <MiniStat label="Forecast" value={`${team.score.forecast.toFixed(0)}%`} />
      </div>
      <div className="mt-3 space-y-1.5">
        {top.map(({ m }) => (
          <div key={m.id} className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md grid place-items-center text-[9px] font-display font-black text-white shrink-0" style={{ background: avatarColor(m.name) }}>{initials(m.name)}</span>
            <span className="text-xs font-display font-bold text-arena-ink truncate">{m.name}</span>
          </div>
        ))}
        {team.members.length > 5 && <div className="text-[10px] text-arena-muted font-display font-bold pl-1">+{team.members.length - 5} more</div>}
      </div>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-arena-bg/50 border border-arena-border p-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-arena-muted font-display font-bold">{label}</div>
      <div className="font-display font-black text-arena-ink text-base tabular-nums">{value}</div>
    </div>
  )
}
