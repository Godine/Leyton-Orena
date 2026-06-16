import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import {
  Trophy, Flame, Swords, Gift, Sparkles, ShieldHalf, Crown, Award,
  ArrowRight, Search, Bell, Zap, Users, ChevronDown, GitCompare, Gauge,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useArenaStore } from '../store/useArenaStore.js'

// ─────────────────────────────────────────────────────────────────────────────
// Background — animated orbs + dotted grid + soft scanlines
// ─────────────────────────────────────────────────────────────────────────────
function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Big orange orb upper-left */}
      <motion.div
        className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(247,92,3,0.55), transparent 60%)' }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Amber orb lower-right */}
      <motion.div
        className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,200,0,0.35), transparent 60%)' }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Teal orb mid-right */}
      <motion.div
        className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.25), transparent 60%)' }}
        animate={{ x: [0, 40, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Dotted grid */}
      <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
        <defs>
          <pattern id="land-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.18)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#land-dots)" />
      </svg>
      {/* Scanline gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arena-bg/40 to-arena-bg" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────────────────────────
function TopNav() {
  return (
    <header className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5 select-none">
        <Logo size={36} className="drop-shadow-[0_4px_18px_rgba(247,92,3,0.5)]" />
        <div className="leading-none">
          <div className="font-display font-black text-lg md:text-xl tracking-tight text-white">
            Leyton<span className="text-arena-amber"> Arena</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-white/50 mt-1">
            R&D delivery · gamified
          </div>
        </div>
      </Link>

      <nav className="hidden md:flex items-center gap-7 text-sm font-display font-bold text-white/70">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#how" className="hover:text-white transition-colors">How it works</a>
        <a href="#preview" className="hover:text-white transition-colors">Preview</a>
      </nav>

      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-arena-amber text-arena-bg font-display font-black text-xs md:text-sm shadow-[0_6px_24px_rgba(255,200,0,0.45)] hover:brightness-110 transition"
      >
        Log in
        <ArrowRight size={14} strokeWidth={3} />
      </Link>
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative max-w-7xl mx-auto px-5 md:px-8 pt-20 md:pt-28 pb-24 md:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.22em] text-arena-amber font-display font-bold backdrop-blur"
        >
          <Sparkles size={12} strokeWidth={3} /> MVP · internal preview
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-5 font-display font-black text-white leading-[0.95] text-5xl md:text-7xl xl:text-8xl"
        >
          Turn the month-end
          <br />
          into a
          {' '}
          <span className="relative inline-block">
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(120deg, #F75C03, #ffc800, #F75C03)' }}
            >
              competition
            </span>
            <motion.span
              aria-hidden
              className="absolute -bottom-2 left-0 right-0 h-[6px] rounded-full"
              style={{ background: 'linear-gradient(90deg, #F75C03, #ffc800)' }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
            />
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed"
        >
          A gamified internal leaderboard for Leyton's R&D tax consultants.
          Daily fire streaks, head-to-head duels, season trophies, real rewards.
          Built to make hitting targets feel like winning, not reporting.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-arena-amber text-arena-bg font-display font-black text-sm md:text-base shadow-[0_8px_32px_rgba(255,200,0,0.45)] hover:brightness-110 transition"
          >
            Log in to the demo
            <ArrowRight size={16} strokeWidth={3} />
          </button>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/5 border border-white/15 text-white/80 hover:text-white hover:border-white/25 font-display font-bold text-sm transition"
          >
            See what's inside
            <ChevronDown size={14} strokeWidth={3} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40 font-display font-bold uppercase tracking-[0.18em]"
        >
          <span className="inline-flex items-center gap-1.5"><Users size={12} /> 25 consultants</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Award size={12} /> 40+ badges</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Trophy size={12} /> 12 pages</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Zap size={12} /> No backend</span>
        </motion.div>
      </div>

      <HeroVisual />
    </section>
  )
}

function HeroVisual() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 600], [0, -40])
  const y2 = useTransform(scrollY, [0, 600], [0, 40])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.8, ease: 'easeOut' }}
      className="lg:col-span-5 relative h-[480px] hidden lg:block"
    >
      {/* Backing glow */}
      <div
        className="absolute inset-0 rounded-[36px] opacity-70 blur-2xl"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(247,92,3,0.6), transparent 65%)' }}
      />

      {/* Podium card (back) */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-2 right-0 w-[300px] rounded-3xl border border-white/10 bg-arena-surface/90 backdrop-blur p-4 shadow-2xl"
      >
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-display font-bold">
          Leaderboard · This month
        </div>
        <div className="mt-3 flex items-end justify-center gap-2 h-32">
          <PodiumBar height={70}  color="#c0c7d6" label="2" />
          <PodiumBar height={108} color="#ffc800" label="1" crown />
          <PodiumBar height={56}  color="#cd7f32" label="3" />
        </div>
        <div className="mt-3 space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] w-4 font-display font-black text-white/40">#{i}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i === 1 ? '#ffc800' : '#F75C03' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${[92, 76, 64][i - 1]}%` }}
                  transition={{ delay: 0.8 + i * 0.15, duration: 0.9 }}
                />
              </div>
              <span className="text-[10px] tabular-nums font-display font-black text-white">
                £{[182, 154, 121][i - 1]}k
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fire card (front-left) */}
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-8 left-0 w-[230px] rounded-3xl border border-white/10 bg-arena-surface/90 backdrop-blur p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-display font-bold">
            Daily fire
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="text-2xl"
          >
            🔥
          </motion.div>
        </div>
        <div className="mt-1 font-display font-black text-white text-4xl">
          12<span className="text-base text-white/40"> days</span>
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
                style={{ background: hit ? '#F75C03' : 'rgba(255,255,255,0.05)' }}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 left-4 h-20 w-20 rounded-2xl grid place-items-center text-3xl"
        style={{
          background: 'linear-gradient(135deg, #2DD4BF, #1cb0f6)',
          boxShadow: '0 18px 50px rgba(45,212,191,0.45)',
        }}
      >
        💎
      </motion.div>

      {/* Floating points pill */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 right-6 px-3 py-1.5 rounded-full bg-arena-surface border border-white/10 shadow-xl flex items-center gap-1.5"
      >
        <span className="text-arena-amber text-sm">●</span>
        <span className="text-xs font-display font-black text-white tabular-nums">1,240 pt</span>
      </motion.div>
    </motion.div>
  )
}

function PodiumBar({ height, color, label, crown }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
      className="relative w-12 rounded-t-xl"
      style={{ background: `linear-gradient(180deg, ${color}, ${color}55)`, boxShadow: `0 0 24px ${color}40` }}
    >
      {crown && (
        <Crown
          className="absolute -top-5 left-1/2 -translate-x-1/2 text-arena-amber"
          size={18}
          strokeWidth={2.6}
        />
      )}
      <span className="absolute inset-x-0 bottom-1 text-center font-display font-black text-arena-bg text-sm">
        {label}
      </span>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Features grid
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Trophy, color: '#ffc800',
    title: 'Live leaderboard',
    body: 'Top-3 podium, Race view, sparklines, position deltas. Filter by period, metric or office and the table reorders smoothly.',
  },
  {
    icon: Flame, color: '#F75C03',
    title: 'Daily fire streaks',
    body: 'Advance one claim by one stage, keep your flame alive. Badges at 7, 30, 100, 365 days. 14-day calendar at a glance.',
  },
  {
    icon: Swords, color: '#2DD4BF',
    title: 'Head-to-head duels',
    body: 'Challenge a peer 1:1. Pick a metric, a duration, stake Arena points. Spectators cheer. Winner takes the pot.',
  },
  {
    icon: Award, color: '#ce82ff',
    title: '40+ badges, 5 tiers',
    body: 'Nine ladders from Common to Mythic — early invoicing, monthly streaks, revenue, client voice, speed to cash.',
  },
  {
    icon: ShieldHalf, color: '#1cb0f6',
    title: 'Seasons & leagues',
    body: 'Quarter-long competitions. Bronze → Silver → Gold → Champion. Trophy cabinet on your profile.',
  },
  {
    icon: Gift, color: '#ffc800',
    title: 'Real rewards',
    body: 'Cash badge points in for 34 treats — coffee, lunch, hoodies, days off. 10 to 1,000 points each.',
  },
  {
    icon: Sparkles, color: '#F75C03',
    title: 'Quarterly Wrapped',
    body: 'A Spotify-style end-of-quarter recap. Hero stats, top moments, swipeable cards, one-tap share.',
  },
  {
    icon: Gauge, color: '#2DD4BF',
    title: 'Manager cockpit',
    body: 'Team rollups, "on fire" vs "needs attention" lists, configurable targets, Teams webhook for milestones.',
  },
]

function Features() {
  return (
    <section id="features" className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="What's inside"
        title="Eight reasons month-end starts to feel different."
        body="Each feature is a real, working page in the demo. Click around — nothing is mocked up except the dataset."
      />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => <FeatureCard key={f.title} f={f} i={i} />)}
      </div>
    </section>
  )
}

function FeatureCard({ f, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const Icon = f.icon
  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ delay: (i % 4) * 0.08, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur hover:border-white/25 transition-colors"
    >
      <div
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
        style={{ background: f.color }}
      />
      <div
        className="h-11 w-11 rounded-xl grid place-items-center"
        style={{ background: `${f.color}22`, color: f.color, boxShadow: `inset 0 0 0 1px ${f.color}55` }}
      >
        <Icon size={20} strokeWidth={2.4} />
      </div>
      <h3 className="mt-4 font-display font-black text-white text-lg">{f.title}</h3>
      <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{f.body}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// How it works — 3 numbered steps
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: '01', title: 'Advance claims', color: '#F75C03',
      body: 'Move a claim along the Leyton workflow — Handover → Overview → Scoping → Tech Report → Costs → Assessment → Invoiced.',
    },
    {
      n: '02', title: 'Bank points & badges', color: '#ffc800',
      body: 'Each stage advance fuels your fire streak, climbs the leaderboard, and unlocks badges across nine ladders.',
    },
    {
      n: '03', title: 'Cash in', color: '#2DD4BF',
      body: 'Spend points on real rewards. Challenge a colleague to a duel. Lift the season trophy. Get Wrapped at quarter-end.',
    },
  ]
  return (
    <section id="how" className="relative max-w-7xl mx-auto px-5 md:px-8 py-24">
      <SectionHeader
        eyebrow="How it works"
        title="Three steps, then it loops forever."
      />
      <div className="mt-12 grid md:grid-cols-3 gap-5 relative">
        {/* connecting line */}
        <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {steps.map((s, i) => <Step key={s.n} s={s} i={i} />)}
      </div>
    </section>
  )
}

function Step({ s, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ delay: i * 0.15, duration: 0.6 }}
      className="relative p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur"
    >
      <div
        className="h-14 w-14 rounded-2xl grid place-items-center font-display font-black text-xl"
        style={{ background: s.color, color: '#0b0b12', boxShadow: `0 8px 28px ${s.color}55` }}
      >
        {s.n}
      </div>
      <h3 className="mt-4 font-display font-black text-white text-xl">{s.title}</h3>
      <p className="mt-2 text-sm text-white/60 leading-relaxed">{s.body}</p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated preview strip — marquee of mini app screens
// ─────────────────────────────────────────────────────────────────────────────
function PreviewStrip() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const items = [
    { label: 'Leaderboard', icon: Trophy,  color: '#ffc800' },
    { label: 'Duels',       icon: Swords,  color: '#2DD4BF' },
    { label: 'Achievements',icon: Award,   color: '#ce82ff' },
    { label: 'Rewards',     icon: Gift,    color: '#ffc800' },
    { label: 'Seasons',     icon: ShieldHalf, color: '#1cb0f6' },
    { label: 'Wrapped',     icon: Sparkles,color: '#F75C03' },
    { label: 'Compare',     icon: GitCompare, color: '#2DD4BF' },
    { label: 'Manager',     icon: Gauge,   color: '#F75C03' },
  ]
  return (
    <section id="preview" ref={ref} className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeader
          eyebrow="Live tour"
          title="Twelve pages. Zero backend. All in your browser."
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="mt-10 relative"
      >
        {/* edge fade */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-arena-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-arena-bg to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-4"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...items, ...items, ...items].map((it, i) => {
            const Icon = it.icon
            return (
              <div
                key={i}
                className="shrink-0 w-64 h-40 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-5 flex flex-col justify-between"
              >
                <div
                  className="h-9 w-9 rounded-xl grid place-items-center"
                  style={{ background: `${it.color}22`, color: it.color, boxShadow: `inset 0 0 0 1px ${it.color}55` }}
                >
                  <Icon size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-display font-bold">
                    Page
                  </div>
                  <div className="font-display font-black text-white text-lg leading-tight">
                    {it.label}
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats counters
// ─────────────────────────────────────────────────────────────────────────────
function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const stats = [
    { v: 25,  label: 'Consultants' },
    { v: 12,  label: 'Pages' },
    { v: 40,  label: 'Badges' },
    { v: 34,  label: 'Rewards' },
  ]
  return (
    <section ref={ref} className="relative max-w-5xl mx-auto px-5 md:px-8 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center p-6 rounded-2xl border border-white/10 bg-white/[0.03]"
          >
            <Counter target={s.v} inView={inView} />
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50 font-display font-bold">
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
  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 900)
      setVal(Math.round(p * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])
  return (
    <div className="font-display font-black text-white text-4xl md:text-5xl tabular-nums">
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
        className="relative overflow-hidden rounded-[36px] p-10 md:p-14 text-center border border-white/15"
        style={{
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(247,92,3,0.35), transparent 50%),' +
            'radial-gradient(ellipse at 100% 100%, rgba(255,200,0,0.25), transparent 50%),' +
            'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="inline-grid place-items-center h-16 w-16 rounded-2xl shadow-glow"
          style={{ background: 'linear-gradient(135deg, #F75C03, #ffc800)' }}
        >
          <Trophy size={28} className="text-arena-bg" strokeWidth={2.6} />
        </motion.div>
        <h2 className="mt-6 font-display font-black text-white text-3xl md:text-5xl leading-tight">
          Ready to enter the arena?
        </h2>
        <p className="mt-3 text-white/70 max-w-xl mx-auto">
          The login screen is one tap away. We'll prefill credentials so you can be playing
          inside ten seconds.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-arena-amber text-arena-bg font-display font-black text-base shadow-[0_8px_32px_rgba(255,200,0,0.45)] hover:brightness-110 transition"
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
      initial={{ y: 20, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="max-w-3xl"
    >
      <div className="text-[10px] uppercase tracking-[0.22em] text-arena-amber font-display font-bold">
        {eyebrow}
      </div>
      <h2 className="mt-2 font-display font-black text-white text-3xl md:text-5xl leading-[1.05]">
        {title}
      </h2>
      {body && <p className="mt-4 text-white/60 leading-relaxed">{body}</p>}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative max-w-7xl mx-auto px-5 md:px-8 pt-8 pb-12 border-t border-white/10 mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
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
  // If the user is already authed and lands on /, send them straight in.
  const isAuthed = useArenaStore((s) => s.isAuthed)
  const navigate = useNavigate()
  useEffect(() => {
    // If already logged in, send them straight to the app's home.
    // We use /leaderboard rather than / so we don't bounce back here.
    if (isAuthed) navigate('/leaderboard', { replace: true })
  }, [isAuthed, navigate])

  // Landing should always render dark, even if the app theme is light.
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'dark'
    return () => { document.documentElement.dataset.theme = prev || 'dark' }
  }, [])

  return (
    <div className="relative min-h-screen bg-arena-bg text-white overflow-x-hidden">
      <BackgroundFX />
      <TopNav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <PreviewStrip />
      <FinalCTA />
      <Footer />
    </div>
  )
}
