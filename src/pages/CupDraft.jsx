import { useMemo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Play, FastForward, RotateCcw, ArrowLeft, Sparkles, Trophy } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { buildFaceOff, COLORS } from '../utils/teamCup.js'

const EASE = [0.22, 1, 0.36, 1]
const initials = (n = '') => n.split(/[\s-]+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
function avatarColor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return `hsl(${h % 360} 52% 45%)` }

export default function CupDraft() {
  const consultants = useArenaStore((s) => s.consultants)
  const months = useArenaStore((s) => s.months)
  const fo = useMemo(() => buildFaceOff(consultants, months), [consultants, months])

  // Combined draft timeline — interleave TC and FC round by round.
  const timeline = useMemo(() => {
    const tc = fo.drafts.Technical.order
    const fc = fo.drafts.Financial.order
    const out = []
    const max = Math.max(tc.length, fc.length)
    for (let i = 0; i < max; i++) {
      if (tc[i]) out.push({ ...tc[i], roleKey: 'TC' })
      if (fc[i]) out.push({ ...fc[i], roleKey: 'FC' })
    }
    return out
  }, [fo])

  const [revealed, setRevealed] = useState(0)   // number of picks shown
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!playing) return
    if (revealed >= timeline.length) { setPlaying(false); return }
    timer.current = setTimeout(() => setRevealed((r) => r + 1), revealed < 6 ? 650 : revealed < 16 ? 420 : 170)
    return () => clearTimeout(timer.current)
  }, [playing, revealed, timeline.length])

  const start = () => { if (revealed >= timeline.length) setRevealed(0); setPlaying(true) }
  const skip = () => { setPlaying(false); setRevealed(timeline.length) }
  const reset = () => { setPlaying(false); setRevealed(0) }

  const current = revealed > 0 ? timeline[revealed - 1] : null
  const done = revealed >= timeline.length

  // team id → revealed members
  const teamMembers = (colour, roleKey) =>
    timeline.slice(0, revealed).filter((p) => p.colour === colour && p.roleKey === roleKey).map((p) => p.consultant)

  const cols = [
    { colour: 'orange', roleKey: 'TC' }, { colour: 'blue', roleKey: 'TC' },
    { colour: 'orange', roleKey: 'FC' }, { colour: 'blue', roleKey: 'FC' },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <Link to="/cup" className="inline-flex items-center gap-1.5 text-xs text-arena-muted hover:text-arena-ink font-display font-bold">
          <ArrowLeft size={14} /> Back to the Face-Off
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <Trophy className="text-arena-amber" size={24} strokeWidth={2.4} />
          </div>
          <span className="arena-chip bg-arena-surface2 text-arena-muted">H1 · Draft day</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black">Draft <span className="text-arena-amber">Room</span></h1>
        <p className="text-arena-muted max-w-2xl">
          Snake draft, seeded on last half’s delivery. TC and FC each split into Orange and Blue — strong picks
          alternate so the teams stay balanced. Hit play and let the rivalries form.
        </p>
      </header>

      {/* Stage — on the clock */}
      <div className="arena-card p-0 overflow-hidden">
        <div className="relative px-6 py-8 grid place-items-center text-center min-h-[180px]"
          style={{ background: current ? `radial-gradient(circle at 50% 0%, ${COLORS[current.colour].hex}22, transparent 70%)` : undefined }}>
          <AnimatePresence mode="wait">
            {!current && !done && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-arena-muted font-display font-bold">The teams are empty. Start the draft to build Orange and Blue.</div>
              </motion.div>
            )}
            {current && (
              <motion.div key={current.pick + current.roleKey} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE }} className="flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-[0.25em] font-display font-black" style={{ color: COLORS[current.colour].hex }}>
                  {COLORS[current.colour].name} {current.roleKey} · pick #{current.pick}
                </div>
                <motion.div
                  className="mt-3 h-20 w-20 rounded-2xl grid place-items-center text-2xl font-display font-black text-white"
                  style={{ background: avatarColor(current.consultant.name), boxShadow: `0 0 0 4px ${COLORS[current.colour].hex}55` }}
                  initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }}>
                  {initials(current.consultant.name)}
                </motion.div>
                <div className="mt-3 font-display font-black text-arena-ink text-2xl">{current.consultant.name}</div>
                <div className="text-xs text-arena-muted font-display font-bold uppercase tracking-wider">{current.consultant.role} · {current.consultant.location}</div>
              </motion.div>
            )}
            {done && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center">
                <Sparkles size={28} className="text-arena-amber" />
                <div className="mt-2 font-display font-black text-arena-ink text-2xl">Rosters set!</div>
                <Link to="/cup" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-arena-amber text-arena-bg text-sm font-display font-black shadow-glow-amber">
                  See the Face-Off <Trophy size={14} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="px-5 py-3 border-t border-arena-border flex items-center gap-2">
          {!playing ? (
            <button onClick={start} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-arena-amber text-arena-bg text-sm font-display font-black shadow-glow-amber">
              <Play size={14} strokeWidth={3} /> {done ? 'Replay' : revealed > 0 ? 'Resume' : 'Start draft'}
            </button>
          ) : (
            <button onClick={() => setPlaying(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-arena-surface2 text-arena-ink text-sm font-display font-bold">
              Pause
            </button>
          )}
          <button onClick={skip} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display font-bold text-arena-muted hover:text-arena-ink"><FastForward size={13} /> Skip</button>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display font-bold text-arena-muted hover:text-arena-ink"><RotateCcw size={13} /> Reset</button>
          <div className="ml-auto text-xs text-arena-muted font-display font-bold tabular-nums">{Math.min(revealed, timeline.length)} / {timeline.length} picks</div>
        </div>
      </div>

      {/* Team columns filling up */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cols.map(({ colour, roleKey }) => {
          const members = teamMembers(colour, roleKey)
          const c = COLORS[colour]
          return (
            <div key={`${colour}-${roleKey}`} className="arena-card p-3" style={{ boxShadow: `inset 0 0 0 1px ${c.hex}33` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-7 w-7 rounded-lg grid place-items-center shrink-0" style={{ background: c.hex }}><Swords size={13} className="text-white" strokeWidth={2.6} /></span>
                <div className="font-display font-black text-sm" style={{ color: c.hex }}>{c.name} {roleKey}</div>
                <span className="ml-auto text-xs font-display font-black text-arena-muted tabular-nums">{members.length}</span>
              </div>
              <ul className="space-y-1 max-h-[46vh] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {members.map((m) => (
                    <motion.li key={m.id} layout initial={{ opacity: 0, x: -8, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="flex items-center gap-2 px-1.5 py-1 rounded-lg">
                      <span className="h-6 w-6 rounded-md grid place-items-center text-[9px] font-display font-black text-white shrink-0" style={{ background: avatarColor(m.name) }}>{initials(m.name)}</span>
                      <span className="text-xs font-display font-bold text-arena-ink truncate">{m.name}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {members.length === 0 && <li className="text-[11px] text-arena-muted px-1.5 py-2">—</li>}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
