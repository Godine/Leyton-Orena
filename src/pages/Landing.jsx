import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion, useScroll, useTransform, useInView, useReducedMotion, AnimatePresence,
} from 'framer-motion'
import {
  Trophy, Flame, Swords, Gift, Sparkles, ShieldHalf, Crown, Award,
  ArrowRight, ChevronDown, Zap, Users, TrendingUp, TrendingDown, Calendar,
  Target, ThumbsUp, AlertTriangle, Gauge, CheckCircle2, Lock, Star, Coffee,
  Pizza, Shirt, Plane, Briefcase, Headphones, Sun, MousePointerClick,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useArenaStore } from '../store/useArenaStore.js'

// Palette — warm light theme tuned to feel premium and on-brand.
const C = {
  bg:       '#fdfaf4',     // warm cream
  bg2:      '#fff5e6',
  surface:  '#ffffff',
  ink:      '#1a1a26',
  ink2:     '#3a3a4a',
  muted:    '#6e6e80',
  border:   '#ede5d6',
  orange:   '#F75C03',
  amber:    '#ffc800',
  teal:     '#2DD4BF',
  blue:     '#1cb0f6',
  purple:   '#ce82ff',
  rose:     '#ff5c8a',
  red:      '#ff4b4b',
}

// ─────────────────────────────────────────────────────────────────────────────
// Background — soft warm orbs + dotted grid
// ─────────────────────────────────────────────────────────────────────────────
function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.orange}55, transparent 60%)` }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.amber}66, transparent 60%)` }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 h-[320px] w-[320px] rounded-full"
        style={{ background: `radial-gradient(circle, ${C.teal}33, transparent 60%)` }}
        animate={{ x: [0, 40, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-40" aria-hidden>
        <defs>
          <pattern id="dots-light" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(26,26,38,0.18)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots-light)" />
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────────────────────────
function TopNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header
      className={[
        'sticky top-0 z-30 transition-all',
        scrolled ? 'backdrop-blur-md' : '',
      ].join(' ')}
      style={{ background: scrolled ? 'rgba(253,250,244,0.78)' : 'transparent', borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent' }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <Logo size={36} className="drop-shadow-[0_4px_18px_rgba(247,92,3,0.45)]" />
          <div className="leading-none">
            <div className="font-display font-black text-lg md:text-xl tracking-tight" style={{ color: C.ink }}>
              Leyton<span style={{ color: C.orange }}> Arena</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.22em] mt-1" style={{ color: C.muted }}>
              R&D delivery · gamified
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-display font-bold" style={{ color: C.ink2 }}>
          <NavAnchor href="#flatten">The curve</NavAnchor>
          <NavAnchor href="#challenges">Challenges</NavAnchor>
          <NavAnchor href="#badges">Badges</NavAnchor>
          <NavAnchor href="#rewards">Rewards</NavAnchor>
          <NavAnchor href="#manager">Manager</NavAnchor>
        </nav>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full font-display font-black text-xs md:text-sm transition shadow-[0_8px_24px_rgba(247,92,3,0.35)] hover:brightness-110"
          style={{ background: C.orange, color: '#fff' }}
        >
          Log in
          <ArrowRight size={14} strokeWidth={3} />
        </Link>
      </div>
    </header>
  )
}

function NavAnchor({ href, children }) {
  return (
    <a href={href} className="relative group" style={{ color: C.ink2 }}>
      {children}
      <span
        className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform"
        style={{ background: C.orange }}
      />
    </a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.22em] font-display font-bold"
          style={{ background: '#fff', borderColor: C.border, color: C.orange }}
        >
          <Sparkles size={12} strokeWidth={3} /> MVP · internal preview
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-5 font-display font-black leading-[0.95] text-5xl md:text-7xl xl:text-[88px]"
          style={{ color: C.ink }}
        >
          Make every day
          <br />
          a
          {' '}
          <span className="relative inline-block">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(120deg, ${C.orange}, ${C.amber}, ${C.orange})` }}
            >
              winning day
            </span>
            <motion.span
              aria-hidden
              className="absolute -bottom-2 left-0 right-0 h-[8px] rounded-full"
              style={{ background: `linear-gradient(90deg, ${C.orange}, ${C.amber})` }}
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
            />
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 text-lg md:text-xl max-w-2xl leading-relaxed"
          style={{ color: C.ink2 }}
        >
          Leyton Arena turns the daily grind of R&D claims into a
          {' '}<b style={{ color: C.ink }}>friendly competition</b> between consultants.
          Build streaks, unlock badges, duel a teammate, redeem real rewards —
          and watch the invoicing curve flatten as work spreads cleanly across the month.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-display font-black text-sm md:text-base shadow-[0_10px_36px_rgba(247,92,3,0.4)] hover:brightness-110 transition"
            style={{ background: C.orange, color: '#fff' }}
          >
            Log in to the demo
            <ArrowRight size={16} strokeWidth={3} />
          </button>
          <a
            href="#flatten"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-display font-bold text-sm border transition"
            style={{ background: '#fff', borderColor: C.border, color: C.ink2 }}
          >
            See it in action
            <ChevronDown size={14} strokeWidth={3} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-display font-bold uppercase tracking-[0.18em]"
          style={{ color: C.muted }}
        >
          <span className="inline-flex items-center gap-1.5"><Users size={12} /> 100+ consultants</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Award size={12} /> 40+ badges</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Gift size={12} /> 34 rewards</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Calendar size={12} /> Daily, not monthly</span>
        </motion.div>
      </div>

      <HeroVisual />
    </section>
  )
}

function HeroVisual() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 600], [0, -36])
  const y2 = useTransform(scrollY, [0, 600], [0, 36])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.8, ease: 'easeOut' }}
      className="lg:col-span-5 relative h-[500px] hidden lg:block"
    >
      {/* glow */}
      <div
        className="absolute inset-0 rounded-[36px] blur-2xl opacity-70"
        style={{ background: `radial-gradient(circle at 50% 50%, ${C.orange}66, transparent 65%)` }}
      />
      {/* Podium card */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-2 right-0 w-[300px] rounded-3xl border p-4 shadow-2xl"
        whileHover={{ y: -8, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: '#fff', border: `1px solid ${C.border}` }}
        />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.2em] font-display font-bold" style={{ color: C.muted }}>
            Leaderboard · today
          </div>
          <div className="mt-3 flex items-end justify-center gap-2 h-32">
            <PodiumBar height={70} color="#c0c7d6" label="2" />
            <PodiumBar height={108} color={C.amber} label="1" crown />
            <PodiumBar height={56} color="#cd7f32" label="3" />
          </div>
          <div className="mt-3 space-y-1.5">
            {[
              { v: 92, t: '£182k' },
              { v: 76, t: '£154k' },
              { v: 64, t: '£121k' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] w-4 font-display font-black" style={{ color: C.muted }}>#{i + 1}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1ece2' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? C.amber : C.orange }}
                    initial={{ width: 0 }}
                    animate={{ width: `${r.v}%` }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 0.9 }}
                  />
                </div>
                <span className="text-[10px] tabular-nums font-display font-black" style={{ color: C.ink }}>{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fire card */}
      <motion.div
        style={{ y: y2 }}
        whileHover={{ y: 8, rotate: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="absolute bottom-10 left-0 w-[240px] rounded-3xl border p-4 shadow-2xl"
      >
        <div className="absolute inset-0 rounded-3xl" style={{ background: '#fff', border: `1px solid ${C.border}` }} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.2em] font-display font-bold" style={{ color: C.muted }}>
              Daily fire
            </div>
            <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-2xl">
              🔥
            </motion.div>
          </div>
          <div className="mt-1 font-display font-black text-4xl" style={{ color: C.ink }}>
            12<span className="text-base" style={{ color: C.muted }}> days</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {Array.from({ length: 14 }).map((_, i) => {
              const hit = [0, 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13].includes(i)
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="h-4 rounded"
                  style={{ background: hit ? C.orange : '#f1ece2' }}
                />
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 left-4 h-20 w-20 rounded-2xl grid place-items-center text-3xl"
        style={{
          background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
          boxShadow: `0 18px 50px ${C.teal}55`,
        }}
      >
        💎
      </motion.div>

      {/* Floating points pill */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-6 px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5"
        style={{ background: '#fff', border: `1px solid ${C.border}` }}
      >
        <span style={{ color: C.amber }} className="text-sm">●</span>
        <span className="text-xs font-display font-black tabular-nums" style={{ color: C.ink }}>1,240 pt</span>
      </motion.div>
    </motion.div>
  )
}

function PodiumBar({ height, color, label, crown }) {
  return (
    <motion.div
      initial={{ height: 0 }} animate={{ height }} transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
      className="relative w-12 rounded-t-xl"
      style={{ background: `linear-gradient(180deg, ${color}, ${color}55)`, boxShadow: `0 0 24px ${color}40` }}
    >
      {crown && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2" size={18} strokeWidth={2.6} style={{ color: C.amber }} />}
      <span className="absolute inset-x-0 bottom-1 text-center font-display font-black text-sm" style={{ color: '#fff' }}>
        {label}
      </span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Flatten the curve — interactive before/after
// ─────────────────────────────────────────────────────────────────────────────
function FlattenSection() {
  const [withArena, setWithArena] = useState(false)
  const days = 30
  // Without Arena: traditional crunch — flat-ish then huge spike at the end.
  const without = Array.from({ length: days }, (_, i) => {
    const day = i + 1
    if (day < 20) return 1.5 + Math.sin(day * 0.6) * 0.4
    if (day < 26) return 2 + (day - 20) * 0.6
    return 8 + (day - 26) * 2.5 // crunch
  })
  // With Arena: even cadence with small daily wiggle.
  const withv = Array.from({ length: days }, (_, i) => {
    const base = 3.4
    return base + Math.sin(i * 0.9) * 0.6 + Math.cos(i * 0.4) * 0.4
  })
  const ymax = Math.max(...without)
  const data = withArena ? withv : without

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="flatten" ref={ref} className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="The whole point"
        title="Flatten the curve. Daily wins, not monthly crunch."
        body="Most teams ship most invoices in the last week of the month. Arena rewards consistent daily progress, so claims advance steadily — and the invoicing curve flattens across the whole month."
      />

      <div className="mt-10 rounded-[28px] border overflow-hidden shadow-xl"
        style={{ background: '#fff', borderColor: C.border }}
      >
        {/* Toggle row */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: C.border }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.muted }}>
              Invoiced value per day · this month
            </div>
            <div className="mt-1 font-display font-black text-2xl" style={{ color: C.ink }}>
              {withArena ? 'With Leyton Arena' : 'Without Leyton Arena'}
            </div>
          </div>
          <div className="inline-flex rounded-full border p-1 text-xs font-display font-bold" style={{ background: C.bg, borderColor: C.border }}>
            {[
              { key: false, label: 'Before' },
              { key: true,  label: 'After' },
            ].map((opt) => {
              const active = withArena === opt.key
              return (
                <button
                  key={String(opt.key)}
                  onClick={() => setWithArena(opt.key)}
                  className="relative px-4 py-1.5 rounded-full"
                  style={{ color: active ? '#fff' : C.ink2 }}
                >
                  {active && (
                    <motion.span
                      layoutId="flatten-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: opt.key ? C.orange : '#3a3a4a', boxShadow: opt.key ? `0 6px 18px ${C.orange}66` : 'none' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <div className="relative h-[260px] flex items-end gap-1">
            {data.map((v, i) => {
              const h = (v / ymax) * 230
              const isCrunch = !withArena && i >= 26
              const color = withArena ? C.orange : (isCrunch ? C.red : C.muted)
              return (
                <motion.div
                  key={`${withArena}-${i}`}
                  className="flex-1 rounded-t-md relative group"
                  initial={{ height: 0 }}
                  animate={inView ? { height: h } : { height: 0 }}
                  transition={{ delay: i * 0.012, type: 'spring', stiffness: 220, damping: 22 }}
                  style={{ background: withArena ? `linear-gradient(180deg, ${C.amber}, ${C.orange})` : color, minHeight: 4 }}
                >
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-display font-black whitespace-nowrap"
                    style={{ background: C.ink, color: '#fff' }}
                  >
                    Day {i + 1} · £{Math.round(v * 12)}k
                  </div>
                </motion.div>
              )
            })}
            {/* baseline */}
            <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: C.border }} />
          </div>

          {/* axis */}
          <div className="mt-2 flex justify-between text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.muted }}>
            <span>Day 1</span><span>Day 10</span><span>Day 20</span><span>Day 30</span>
          </div>

          {/* Annotation row */}
          <div className="mt-6 grid md:grid-cols-3 gap-3">
            <Annotation icon={Calendar} title="Daily cadence" body="Consultants advance one claim a day to keep their fire alive — work spreads naturally." active={withArena} />
            <Annotation icon={TrendingUp} title="Predictable revenue" body="Finance gets a steady stream of invoices instead of a month-end spike." active={withArena} />
            <Annotation icon={CheckCircle2} title="Less burnout" body="No more frantic last-week scramble. Pacing replaces panic." active={withArena} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Annotation({ icon: Icon, title, body, active }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.45, y: active ? 0 : 2 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border p-4"
      style={{ background: active ? `${C.orange}0d` : C.bg, borderColor: active ? `${C.orange}55` : C.border }}
    >
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: active ? C.orange : '#e6e0d2', color: active ? '#fff' : C.muted }}>
          <Icon size={14} strokeWidth={2.6} />
        </span>
        <div className="font-display font-black text-sm" style={{ color: C.ink }}>{title}</div>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: C.ink2 }}>{body}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Healthy competition — animated face-off
// ─────────────────────────────────────────────────────────────────────────────
function CompetitionSection() {
  const fighters = [
    { name: 'Oumayma B.', initials: 'OB', color: C.orange, score: 78, location: 'London',     trend: 'up'   },
    { name: 'Étienne M.', initials: 'EM', color: C.teal,   score: 72, location: 'Casablanca', trend: 'up'   },
    { name: 'Priya R.',   initials: 'PR', color: C.purple, score: 65, location: 'Bristol',    trend: 'flat' },
    { name: 'Hannah G.',  initials: 'HG', color: C.amber,  score: 58, location: 'Glasgow',    trend: 'down' },
  ]
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <section id="compete" ref={ref} className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="Healthy competition"
        title="Friendly rivalry beats quiet KPI dashboards."
        body="Arena makes progress visible without making it pressure. Side-by-side scoreboards, position deltas, podium spotlight — a culture where you cheer the leader and chase them."
      />

      <div className="mt-10 grid lg:grid-cols-12 gap-6">
        {/* Big board */}
        <div className="lg:col-span-7 rounded-[28px] border p-6 shadow-xl" style={{ background: '#fff', borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.muted }}>
              This week · Technical
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.orange }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: C.orange }} />
              Live
            </span>
          </div>
          <ol className="mt-4 space-y-2.5">
            {fighters.map((f, i) => (
              <motion.li
                key={f.name}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{ background: i === 0 ? `${C.amber}1f` : C.bg }}
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center font-display font-black text-sm shrink-0"
                  style={{ background: i <= 2 ? `${f.color}22` : '#ece5d6', color: i <= 2 ? f.color : C.muted, boxShadow: i <= 2 ? `inset 0 0 0 1.5px ${f.color}66` : undefined }}
                >
                  #{i + 1}
                </div>
                <div
                  className="h-9 w-9 rounded-lg grid place-items-center font-display font-black text-xs text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${f.color}, ${C.amber})` }}
                >
                  {f.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-display font-black" style={{ color: C.ink }}>{f.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.16em] font-display font-bold" style={{ color: C.muted }}>{f.location}</div>
                </div>
                <div className="flex-[2] hidden md:block">
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#ece5d6' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${f.score}%` } : {}}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.9 }}
                      style={{ background: `linear-gradient(90deg, ${f.color}, ${C.amber})` }}
                    />
                  </div>
                </div>
                <span className="font-display font-black text-sm tabular-nums w-12 text-right" style={{ color: C.ink }}>{f.score}</span>
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-display font-bold w-10 justify-end"
                  style={{ color: f.trend === 'up' ? C.teal : f.trend === 'down' ? C.red : C.muted }}
                >
                  {f.trend === 'up'   && <><TrendingUp size={10} strokeWidth={3} /> +2</>}
                  {f.trend === 'down' && <><TrendingDown size={10} strokeWidth={3} /> -1</>}
                  {f.trend === 'flat' && <>—</>}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Pillars */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <Pillar icon={Trophy} color={C.amber}  title="Podium spotlight" body="Top 3 of the week get a podium card on Home. Everyone sees who's flying." />
          <Pillar icon={Users}  color={C.teal}   title="Team-level pride" body="Filter by office: London vs Bristol vs Casablanca. Cheer your city." />
          <Pillar icon={TrendingUp} color={C.orange} title="Position deltas" body="▲ and ▼ arrows show movement vs the prior period — climb or get climbed." />
          <Pillar icon={Crown}  color={C.purple} title="Seasons & leagues" body="Quarterly trophies. Bronze → Silver → Gold → Champion. Promotion + relegation." />
        </div>
      </div>
    </section>
  )
}

function Pillar({ icon: Icon, color, title, body }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="rounded-2xl border p-5 shadow-sm"
      style={{ background: '#fff', borderColor: C.border }}
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: `${color}1f`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}>
          <Icon size={18} strokeWidth={2.4} />
        </span>
        <div className="font-display font-black text-base" style={{ color: C.ink }}>{title}</div>
      </div>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: C.ink2 }}>{body}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3) Challenges & duels — interactive picker
// ─────────────────────────────────────────────────────────────────────────────
const CHALLENGE_TYPES = [
  {
    id: 'fire',
    icon: Flame,  color: C.orange,
    title: 'Streak duel',
    body: 'First to a 7-day fire streak wins. Miss a day, you reset.',
    rule: 'One claim-advance per day. 7 days. Winner takes the pot.',
    stake: '+50 pts',
  },
  {
    id: 'invoice',
    icon: Trophy, color: C.amber,
    title: 'Invoice race',
    body: 'Most invoiced value over 14 days. Live progress bars.',
    rule: 'Sum of invoiced value over 14 days. Highest wins.',
    stake: '+120 pts',
  },
  {
    id: 'early',
    icon: Target, color: C.teal,
    title: 'Early-bird',
    body: '% of work invoiced before day 15. Reward predictable cadence.',
    rule: 'Highest early-invoice % across the month wins.',
    stake: '+80 pts',
  },
  {
    id: 'speed',
    icon: Zap,    color: C.purple,
    title: 'Speed-to-cash',
    body: 'Lowest avg days from handover to invoice. Faster than your rival.',
    rule: 'Avg days from Handover → Invoiced. Lowest wins.',
    stake: '+100 pts',
  },
]

function ChallengesSection() {
  const [pickId, setPickId] = useState('fire')
  const pick = CHALLENGE_TYPES.find((c) => c.id === pickId) ?? CHALLENGE_TYPES[0]
  const Icon = pick.icon

  return (
    <section id="challenges" className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="Fun, with stakes"
        title="Challenges that nudge the right behaviours."
        body="Every duel is built around a metric you'd want consultants to chase anyway: daily cadence, early invoicing, speed to cash. The reward is points; the side-effect is a healthier pipeline."
      />

      <div className="mt-10 grid lg:grid-cols-12 gap-6">
        {/* Picker */}
        <div className="lg:col-span-5 space-y-3">
          {CHALLENGE_TYPES.map((c) => {
            const active = c.id === pickId
            const CIcon = c.icon
            return (
              <motion.button
                key={c.id}
                onClick={() => setPickId(c.id)}
                whileHover={{ x: 4 }}
                className="w-full text-left rounded-2xl border p-4 transition-colors"
                style={{
                  background: active ? '#fff' : C.bg,
                  borderColor: active ? c.color : C.border,
                  boxShadow: active ? `0 14px 36px ${c.color}33` : '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: `${c.color}22`, color: c.color, boxShadow: `inset 0 0 0 1px ${c.color}55` }}>
                    <CIcon size={18} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-display font-black" style={{ color: C.ink }}>{c.title}</div>
                      <span className="text-[10px] uppercase tracking-wider font-display font-black px-2 py-0.5 rounded-full" style={{ background: `${c.color}22`, color: c.color }}>{c.stake}</span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: C.ink2 }}>{c.body}</p>
                  </div>
                  <MousePointerClick size={14} className="shrink-0 mt-1" style={{ color: active ? c.color : C.muted }} />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Live preview */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={pick.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="rounded-[28px] border p-6 shadow-xl"
              style={{ background: '#fff', borderColor: C.border }}
            >
              <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.muted }}>
                Challenge preview
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: `${pick.color}1f`, color: pick.color }}>
                  <Icon size={15} strokeWidth={2.6} />
                </span>
                <div className="font-display font-black text-xl" style={{ color: C.ink }}>{pick.title}</div>
              </div>

              {/* Two contenders racing */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <Contender name="Oumayma B." color={C.orange} pct={70} label="You" pick={pick.id} />
                <Contender name="Étienne M." color={C.teal}   pct={56} label="Rival" pick={pick.id} />
              </div>

              {/* Rule */}
              <div className="mt-6 flex items-center gap-3 rounded-xl p-3" style={{ background: C.bg }}>
                <span className="h-8 w-8 rounded-lg grid place-items-center" style={{ background: '#fff', color: pick.color, boxShadow: `inset 0 0 0 1px ${C.border}` }}>
                  <Target size={14} strokeWidth={2.6} />
                </span>
                <div className="text-xs" style={{ color: C.ink2 }}>
                  <span className="font-display font-black uppercase tracking-[0.18em] text-[10px]" style={{ color: C.muted }}>Rule · </span>
                  {pick.rule}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Contender({ name, color, pct, label, pick }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-display font-bold" style={{ color: C.ink2 }}>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {name}
          <span className="text-[10px] uppercase tracking-wider" style={{ color: C.muted }}> · {label}</span>
        </span>
        <span className="tabular-nums font-display font-black" style={{ color: C.ink }}>{pct}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full overflow-hidden" style={{ background: '#f1ece2' }}>
        <motion.div
          key={`${pick}-${name}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${C.amber})`, boxShadow: `0 0 16px ${color}55` }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) Badges — interactive grid with unlock rules
// ─────────────────────────────────────────────────────────────────────────────
const BADGE_CATEGORIES = [
  {
    id: 'fire', glyph: '🔥', tint: C.orange,
    title: 'Daily fire',
    desc: 'Reward keeping the flame alive day after day.',
    tiers: [
      { name: 'Spark',    rarity: 'common',    rule: 'Hit a 3-day fire streak' },
      { name: 'Kindle',   rarity: 'rare',      rule: 'Hit a 7-day fire streak' },
      { name: 'Blaze',    rarity: 'epic',      rule: 'Hit a 30-day fire streak' },
      { name: 'Inferno',  rarity: 'legendary', rule: 'Hit a 100-day fire streak' },
      { name: 'Phoenix',  rarity: 'mythic',    rule: 'Hit a 365-day fire streak' },
    ],
  },
  {
    id: 'early', glyph: '⚡', tint: C.teal,
    title: 'Early invoicing',
    desc: 'Reward predictable cadence over month-end crunch.',
    tiers: [
      { name: 'Day-15 club',  rarity: 'common',    rule: 'Invoice 25% before day 15' },
      { name: 'Front-foot',   rarity: 'rare',      rule: 'Invoice 50% before day 15' },
      { name: 'Head-start',   rarity: 'epic',      rule: 'Invoice 70% before day 15' },
      { name: 'Daybreak',     rarity: 'legendary', rule: 'Invoice 85% before day 15' },
      { name: 'Sunrise',      rarity: 'mythic',    rule: 'Invoice 95% before day 15, three months running' },
    ],
  },
  {
    id: 'streak', glyph: '🎯', tint: C.amber,
    title: 'Target streaks',
    desc: 'Reward consistency in hitting monthly targets.',
    tiers: [
      { name: 'Two in a row',   rarity: 'common',    rule: 'Hit target 2 months in a row' },
      { name: 'Hat-trick',      rarity: 'rare',      rule: 'Hit target 3 months in a row' },
      { name: 'Quarter master', rarity: 'epic',      rule: 'Hit target every month in a quarter' },
      { name: 'Pacemaker',      rarity: 'legendary', rule: 'Hit target 6 months in a row' },
      { name: 'Metronome',      rarity: 'mythic',    rule: 'Hit target every month for a year' },
    ],
  },
  {
    id: 'rev', glyph: '💎', tint: C.blue,
    title: 'Revenue',
    desc: 'Reward consultants who land big invoiced value.',
    tiers: [
      { name: '£50k month',  rarity: 'common',    rule: 'Invoice £50k in a month' },
      { name: '£100k month', rarity: 'rare',      rule: 'Invoice £100k in a month' },
      { name: '£250k month', rarity: 'epic',      rule: 'Invoice £250k in a month' },
      { name: '£500k month', rarity: 'legendary', rule: 'Invoice £500k in a month' },
      { name: '£1M month',   rarity: 'mythic',    rule: 'Invoice £1M in a single month' },
    ],
  },
  {
    id: 'speed', glyph: '🚀', tint: C.purple,
    title: 'Speed to cash',
    desc: 'Reward consultants who close claims fast.',
    tiers: [
      { name: 'Under 30',  rarity: 'common',    rule: 'Avg < 30 days handover → invoice' },
      { name: 'Under 21',  rarity: 'rare',      rule: 'Avg < 21 days handover → invoice' },
      { name: 'Under 14',  rarity: 'epic',      rule: 'Avg < 14 days handover → invoice' },
      { name: 'Under 7',   rarity: 'legendary', rule: 'Avg < 7 days handover → invoice' },
      { name: 'Same-day',  rarity: 'mythic',    rule: 'Avg < 3 days handover → invoice' },
    ],
  },
  {
    id: 'duel', glyph: '⚔️', tint: C.rose,
    title: 'Championship',
    desc: 'Reward duels won and trophies lifted.',
    tiers: [
      { name: 'Contender',  rarity: 'common',    rule: 'Win your first duel' },
      { name: 'Brawler',    rarity: 'rare',      rule: 'Win 3 duels in a row' },
      { name: 'Gladiator',  rarity: 'epic',      rule: 'Win 10 duels' },
      { name: 'Champion',   rarity: 'legendary', rule: 'Win a season trophy' },
      { name: 'Hall of Fame', rarity: 'mythic',  rule: 'Win 3 season trophies' },
    ],
  },
]

const RARITY = {
  common:    { c: '#8e8ea0', label: 'Common',    pts: 10  },
  rare:      { c: '#1cb0f6', label: 'Rare',      pts: 25  },
  epic:      { c: '#ce82ff', label: 'Epic',      pts: 60  },
  legendary: { c: '#ffc800', label: 'Legendary', pts: 120 },
  mythic:    { c: '#2DD4BF', label: 'Mythic',    pts: 250 },
}

function BadgesSection() {
  const [active, setActive] = useState(BADGE_CATEGORIES[0].id)
  const cat = BADGE_CATEGORIES.find((c) => c.id === active) ?? BADGE_CATEGORIES[0]

  return (
    <section id="badges" className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="Badges"
        title="40+ badges across 9 categories. Five tiers each."
        body="Every desirable behaviour has a ladder. Common → Rare → Epic → Legendary → Mythic. The progress is visible from the moment you start — you always know what's next."
      />

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {BADGE_CATEGORIES.map((c) => {
          const a = active === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-colors"
              style={{
                background: a ? '#fff' : C.bg,
                borderColor: a ? c.tint : C.border,
                color: a ? C.ink : C.ink2,
                boxShadow: a ? `0 6px 20px ${c.tint}33` : 'none',
              }}
            >
              <span className="text-base">{c.glyph}</span>
              <span className="font-display font-black text-sm">{c.title}</span>
            </button>
          )
        })}
      </div>

      {/* Tier ladder */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="mt-6 rounded-[28px] border p-6 md:p-8 shadow-xl"
          style={{ background: '#fff', borderColor: C.border }}
        >
          <div className="flex items-start gap-4">
            <div
              className="h-16 w-16 rounded-2xl grid place-items-center text-3xl shrink-0"
              style={{ background: `${cat.tint}1c`, boxShadow: `inset 0 0 0 1px ${cat.tint}55` }}
            >
              {cat.glyph}
            </div>
            <div>
              <div className="font-display font-black text-2xl" style={{ color: C.ink }}>{cat.title}</div>
              <p className="mt-1" style={{ color: C.ink2 }}>{cat.desc}</p>
            </div>
          </div>

          {/* Ladder */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {cat.tiers.map((t, i) => {
              const r = RARITY[t.rarity]
              return (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative rounded-2xl border overflow-hidden p-4 group cursor-default"
                  style={{ background: C.bg, borderColor: C.border }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-10 w-10 rounded-xl grid place-items-center text-xl"
                      style={{ background: `${r.c}1c`, boxShadow: `inset 0 0 0 1.5px ${r.c}66` }}
                    >
                      {cat.glyph}
                    </span>
                    <div>
                      <div className="font-display font-black text-sm" style={{ color: C.ink }}>{t.name}</div>
                      <div className="text-[9px] uppercase tracking-[0.18em] font-display font-bold" style={{ color: r.c }}>
                        {r.label}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs leading-relaxed" style={{ color: C.ink2 }}>
                    <span className="font-display font-black uppercase tracking-wider text-[9px] mr-1" style={{ color: C.muted }}>How to unlock ·</span>
                    {t.rule}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.muted }}>
                    <span>Tier {i + 1}/5</span>
                    <span style={{ color: r.c }}>{r.pts} pts</span>
                  </div>
                  <div
                    className="absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
                    style={{ background: r.c }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] font-display font-bold" style={{ color: C.muted }}>
            <span>Rarity scale:</span>
            {Object.entries(RARITY).map(([k, r]) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: r.c }} />
                {r.label} · {r.pts} pts
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) Rewards — points slider that unlocks tiles in real time
// ─────────────────────────────────────────────────────────────────────────────
const REWARD_TILES = [
  { id: 'coffee',  icon: Coffee,     label: 'Coffee on us',        cost: 10,    blurb: 'A coffee from anywhere · perfect Monday fuel.' },
  { id: 'lunch',   icon: Pizza,      label: 'Team lunch',          cost: 50,    blurb: 'Up to £20 reimbursed for any lunch order.' },
  { id: 'gear',    icon: Headphones, label: 'Noise-cancelling',    cost: 120,   blurb: 'Quality headphones for deep-work sessions.' },
  { id: 'hoodie',  icon: Shirt,      label: 'Leyton hoodie',       cost: 180,   blurb: 'Limited-run merch only Arena winners get.' },
  { id: 'wfa',     icon: Briefcase,  label: 'Work-from-anywhere',  cost: 400,   blurb: '5 work-from-anywhere days, no questions asked.' },
  { id: 'pto',     icon: Sun,        label: 'Extra PTO day',       cost: 600,   blurb: 'One bonus day off, on top of your allowance.' },
  { id: 'trip',    icon: Plane,      label: 'Weekend getaway',     cost: 1000,  blurb: 'Two-night break for you + plus-one.' },
]

function RewardsSection() {
  const [pts, setPts] = useState(220)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const affordable = REWARD_TILES.filter((r) => pts >= r.cost).length

  return (
    <section id="rewards" ref={ref} className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="Rewards"
        title="Badges aren't trophies on a shelf — they're spendable."
        body="Every badge converts to Arena points. Drag the slider to see what your balance unlocks. From a coffee to a long weekend, real treats — not gimmicks."
      />

      {/* Points & slider */}
      <div className="mt-10 rounded-[28px] border p-6 md:p-8 shadow-xl" style={{ background: '#fff', borderColor: C.border }}>
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.muted }}>
              Your balance
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <motion.span
                key={pts}
                initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="font-display font-black text-5xl md:text-6xl tabular-nums"
                style={{ color: C.ink }}
              >
                {pts.toLocaleString('en-GB')}
              </motion.span>
              <span className="text-base font-display font-bold" style={{ color: C.muted }}>Arena points</span>
            </div>
            <div className="mt-2 text-sm" style={{ color: C.ink2 }}>
              <span className="font-display font-black" style={{ color: C.orange }}>{affordable}</span> of {REWARD_TILES.length} rewards unlocked at this balance.
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold mb-2" style={{ color: C.muted }}>
              Drag to see your tier
            </div>
            <div className="relative">
              <input
                type="range" min={0} max={1100} step={10} value={pts}
                onChange={(e) => setPts(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${C.orange} 0%, ${C.amber} ${(pts / 1100) * 100}%, #ece5d6 ${(pts / 1100) * 100}%)`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: C.muted }}>
              <span>0</span><span>250</span><span>500</span><span>750</span><span>1000+</span>
            </div>
          </div>
        </div>

        {/* Tiles */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {REWARD_TILES.map((r, i) => {
            const Icon = r.icon
            const can = pts >= r.cost
            return (
              <motion.div
                key={r.id}
                initial={{ y: 14, opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl border p-3 overflow-hidden"
                style={{
                  background: can ? '#fff' : C.bg,
                  borderColor: can ? `${C.orange}66` : C.border,
                  boxShadow: can ? `0 10px 28px ${C.orange}22` : 'none',
                  opacity: can ? 1 : 0.55,
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center"
                  style={{ background: can ? `${C.orange}1f` : '#e6e0d2', color: can ? C.orange : C.muted, boxShadow: can ? `inset 0 0 0 1px ${C.orange}55` : 'none' }}
                >
                  <Icon size={18} strokeWidth={2.4} />
                </div>
                <div className="mt-3 font-display font-black text-sm leading-tight" style={{ color: C.ink }}>{r.label}</div>
                <div className="mt-1 text-[11px] leading-snug" style={{ color: C.ink2 }}>{r.blurb}</div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-display font-black uppercase tracking-wider">
                  <span style={{ color: can ? C.orange : C.muted }}>{r.cost} pt</span>
                  {can
                    ? <span className="inline-flex items-center gap-0.5" style={{ color: C.teal }}><CheckCircle2 size={11} strokeWidth={3} /> Unlock</span>
                    : <span className="inline-flex items-center gap-0.5" style={{ color: C.muted }}><Lock size={10} /> {r.cost - pts} more</span>}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Earn rule */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs" style={{ color: C.ink2 }}>
          <EarnRule color={C.orange} title="Earn by performing" body="Every badge unlocked credits points to your balance — from 10 (Common) to 250 (Mythic)." />
          <EarnRule color={C.amber}  title="Earn by competing" body="Win a duel, take the pot. Lift a season trophy, get a fat bonus drop." />
          <EarnRule color={C.teal}   title="Spend without losing" body="Cashing in rewards doesn't reset your badges — keep flexing them on your profile." />
        </div>
      </div>
    </section>
  )
}

function EarnRule({ color, title, body }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: C.bg, borderColor: C.border }}>
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg grid place-items-center" style={{ background: color, color: '#fff' }}>
          <Star size={14} strokeWidth={2.6} />
        </span>
        <div className="font-display font-black text-sm" style={{ color: C.ink }}>{title}</div>
      </div>
      <p className="mt-2 text-xs leading-relaxed">{body}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) Manager view — toggle between "On fire" and "Needs attention"
// ─────────────────────────────────────────────────────────────────────────────
const ON_FIRE = [
  { name: 'Oumayma Benali',  loc: 'London',     fire: 18, ops: 14, trend: '+22%' },
  { name: 'Étienne Marchand', loc: 'Casablanca', fire: 14, ops: 11, trend: '+18%' },
  { name: 'Priya Ramachandran', loc: 'Bristol',  fire: 12, ops: 9,  trend: '+12%' },
]
const NEEDS_ATTENTION = [
  { name: 'Hannah Galloway', loc: 'Glasgow',  fire: 0,  ops: 2,  trend: '−16%', reason: 'No claim advanced in 6 days · fire reset' },
  { name: 'Marc Lefèvre',    loc: 'Dublin',   fire: 1,  ops: 3,  trend: '−9%',  reason: 'Pipeline 38% behind monthly target' },
  { name: 'Yusuf Khan',      loc: 'London',   fire: 2,  ops: 4,  trend: '−4%',  reason: 'Avg days-to-close climbing 3 weeks running' },
]

function ManagerSection() {
  const [tab, setTab] = useState('fire')
  const data = tab === 'fire' ? ON_FIRE : NEEDS_ATTENTION
  const goodColor = C.teal
  const badColor  = C.rose

  return (
    <section id="manager" className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="For managers"
        title="Spot stars and stragglers in one glance."
        body="The Manager cockpit ranks your team into two lists: who's on fire (and worth celebrating), and who needs a kind nudge. No more digging through dashboards to find out."
      />

      <div className="mt-10 rounded-[28px] border overflow-hidden shadow-xl" style={{ background: '#fff', borderColor: C.border }}>
        {/* Tabs */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: C.border }}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.muted }}>
              Manager view · this week
            </div>
            <div className="mt-1 font-display font-black text-2xl" style={{ color: C.ink }}>
              {tab === 'fire' ? 'On fire — celebrate them' : 'Needs attention — coach them'}
            </div>
          </div>
          <div className="inline-flex rounded-full border p-1 text-xs font-display font-bold" style={{ background: C.bg, borderColor: C.border }}>
            <ManagerTab onClick={() => setTab('fire')}      active={tab === 'fire'}      color={goodColor} icon={ThumbsUp}        label={`On fire · ${ON_FIRE.length}`} />
            <ManagerTab onClick={() => setTab('attention')} active={tab === 'attention'} color={badColor}  icon={AlertTriangle}   label={`Needs attention · ${NEEDS_ATTENTION.length}`} />
          </div>
        </div>

        {/* Rows */}
        <ul className="divide-y" style={{ borderColor: C.border }}>
          <AnimatePresence mode="popLayout">
            {data.map((p, i) => {
              const tone = tab === 'fire' ? goodColor : badColor
              return (
                <motion.li
                  key={`${tab}-${p.name}`}
                  layout
                  initial={{ opacity: 0, x: tab === 'fire' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
                  className="px-6 py-4 flex items-center gap-4"
                >
                  <div
                    className="h-11 w-11 rounded-xl grid place-items-center font-display font-black text-sm text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${tone}, ${C.amber})` }}
                  >
                    {p.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-black" style={{ color: C.ink }}>{p.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] font-display font-bold" style={{ color: C.muted }}>{p.loc}</div>
                    {p.reason && (
                      <div className="mt-1 text-xs" style={{ color: badColor }}>
                        <AlertTriangle size={11} className="inline mr-1 -mt-0.5" strokeWidth={3} />
                        {p.reason}
                      </div>
                    )}
                  </div>
                  <Stat label="Fire" value={p.fire} unit="d" tone={p.fire >= 7 ? goodColor : (p.fire <= 2 ? badColor : C.muted)} icon="🔥" />
                  <Stat label="Ops"  value={p.ops}  unit=""  tone={p.ops >= 8 ? goodColor : (p.ops <= 3 ? badColor : C.muted)} icon="✓" />
                  <div className="hidden md:flex flex-col items-end w-24">
                    <div className="text-[10px] uppercase tracking-[0.16em] font-display font-bold" style={{ color: C.muted }}>vs last</div>
                    <div className="font-display font-black text-sm" style={{ color: tone }}>
                      {p.trend}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {/* Insight strip */}
        <div className="px-6 py-5 grid sm:grid-cols-3 gap-3 border-t" style={{ borderColor: C.border, background: C.bg }}>
          <Insight color={goodColor} icon={ThumbsUp}      title="Easy wins"        body="Send a Teams shout-out to your top 3 in two clicks. Public recognition fuels the next streak." />
          <Insight color={badColor}  icon={AlertTriangle} title="Surface concerns" body="Anyone with a broken fire + falling trend bubbles up — coach them before it becomes month-end pain." />
          <Insight color={C.amber}   icon={Gauge}         title="Hit your number"  body="Team rollups show pace vs target. Drill from any tile straight to a consultant's profile." />
        </div>
      </div>
    </section>
  )
}

function ManagerTab({ onClick, active, color, icon: Icon, label }) {
  return (
    <button onClick={onClick} className="relative px-3 py-1.5 rounded-full" style={{ color: active ? '#fff' : C.ink2 }}>
      {active && (
        <motion.span
          layoutId="manager-pill"
          className="absolute inset-0 rounded-full"
          style={{ background: color, boxShadow: `0 6px 18px ${color}66` }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        <Icon size={12} strokeWidth={3} />
        {label}
      </span>
    </button>
  )
}

function Stat({ label, value, unit, tone, icon }) {
  return (
    <div className="hidden sm:flex flex-col items-end w-16">
      <div className="text-[10px] uppercase tracking-[0.16em] font-display font-bold" style={{ color: C.muted }}>{label}</div>
      <div className="font-display font-black text-sm tabular-nums" style={{ color: tone }}>
        <span className="mr-0.5">{icon}</span>{value}{unit}
      </div>
    </div>
  )
}

function Insight({ color, icon: Icon, title, body }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ background: '#fff', color, boxShadow: `inset 0 0 0 1px ${C.border}` }}>
        <Icon size={14} strokeWidth={2.6} />
      </span>
      <div className="text-xs" style={{ color: C.ink2 }}>
        <div className="font-display font-black mb-0.5" style={{ color: C.ink }}>{title}</div>
        {body}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats counters
// ─────────────────────────────────────────────────────────────────────────────
function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const stats = [
    { v: 100, label: 'Consultants' },
    { v: 10,  label: 'Challenge categories' },
    { v: 40,  label: 'Badges' },
    { v: 34,  label: 'Rewards' },
  ]
  return (
    <section ref={ref} className="relative max-w-5xl mx-auto px-5 md:px-8 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center p-6 rounded-2xl border"
            style={{ background: '#fff', borderColor: C.border }}
          >
            <Counter target={s.v} inView={inView} />
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] font-display font-bold" style={{ color: C.muted }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Counter({ target, inView }) {
  const [val, setVal] = useState(0)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!inView) return
    if (reduce) { setVal(target); return }
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 900)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, reduce])
  return (
    <div className="font-display font-black text-4xl md:text-5xl tabular-nums" style={{ color: C.ink }}>
      {val}+
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  const navigate = useNavigate()
  return (
    <section className="relative max-w-5xl mx-auto px-5 md:px-8 py-24">
      <div
        className="relative overflow-hidden rounded-[36px] p-10 md:p-14 text-center border shadow-xl"
        style={{
          borderColor: C.border,
          background:
            `radial-gradient(ellipse at 0% 0%, ${C.orange}33, transparent 50%),` +
            `radial-gradient(ellipse at 100% 100%, ${C.amber}33, transparent 50%),` +
            `linear-gradient(180deg, #fff, ${C.bg})`,
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="inline-grid place-items-center h-16 w-16 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.amber})`, boxShadow: `0 14px 36px ${C.orange}55` }}
        >
          <Trophy size={28} style={{ color: '#fff' }} strokeWidth={2.6} />
        </motion.div>
        <h2 className="mt-6 font-display font-black text-3xl md:text-5xl leading-tight" style={{ color: C.ink }}>
          Build the team you'd want to be on.
        </h2>
        <p className="mt-3 max-w-xl mx-auto" style={{ color: C.ink2 }}>
          Pre-filled credentials, mock data, twelve real pages. You'll be playing inside ten seconds.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full font-display font-black text-base shadow-[0_12px_36px_rgba(247,92,3,0.45)] hover:brightness-110 transition"
          style={{ background: C.orange, color: '#fff' }}
        >
          Log in to the demo
          <ArrowRight size={18} strokeWidth={3} />
        </button>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, body }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  return (
    <motion.div
      ref={ref}
      initial={{ y: 20, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="max-w-3xl"
    >
      <div className="text-[10px] uppercase tracking-[0.22em] font-display font-bold" style={{ color: C.orange }}>
        {eyebrow}
      </div>
      <h2 className="mt-2 font-display font-black text-3xl md:text-5xl leading-[1.05]" style={{ color: C.ink }}>
        {title}
      </h2>
      {body && <p className="mt-4 leading-relaxed" style={{ color: C.ink2 }}>{body}</p>}
    </motion.div>
  )
}

function Footer() {
  return (
    <footer className="relative max-w-7xl mx-auto px-5 md:px-8 pt-8 pb-12 mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
      style={{ color: C.muted, borderTop: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2">
        <Logo size={20} />
        <span className="font-display font-bold">Leyton Arena · MVP preview</span>
      </div>
      <div className="font-display font-bold uppercase tracking-[0.18em]">
        Internal use only · not a real product (yet)
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const isAuthed = useArenaStore((s) => s.isAuthed)
  const navigate = useNavigate()
  useEffect(() => {
    if (isAuthed) navigate('/leaderboard', { replace: true })
  }, [isAuthed, navigate])

  // Force light mode for the landing, regardless of saved theme.
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'light'
    return () => { document.documentElement.dataset.theme = prev || 'dark' }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: C.bg, color: C.ink }}>
      <BackgroundFX />
      <TopNav />
      <Hero />
      <Stats />
      <FlattenSection />
      <CompetitionSection />
      <ChallengesSection />
      <BadgesSection />
      <RewardsSection />
      <ManagerSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}
