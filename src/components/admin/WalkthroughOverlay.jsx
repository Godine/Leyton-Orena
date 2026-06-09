import { useEffect, useLayoutEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, X, MousePointerClick, Sparkles,
  Trophy, Flame, Swords, Gift, Search, Bell, Sun, Users,
  Award, Crown,
} from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'

// ─────────────────────────────────────────────────────────────────────────────
// Illustrations — inline mini-mockups that visualise each page so the user
// sees what they'll be looking at before they click into it.
// ─────────────────────────────────────────────────────────────────────────────

function HomeMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="hm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F75C03" />
          <stop offset="100%" stopColor="#ffc800" />
        </linearGradient>
      </defs>
      {/* progress rings row */}
      {[40, 120, 200].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={40} r={22} fill="none" stroke="#2a2a3a" strokeWidth="6" />
          <circle
            cx={cx} cy={40} r={22}
            fill="none" stroke="url(#hm-ring)" strokeWidth="6"
            strokeDasharray={`${(0.6 + i * 0.15) * 138} 138`}
            strokeLinecap="round" transform={`rotate(-90 ${cx} 40)`}
          />
          <text x={cx} y={45} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="900">
            {[62, 78, 91][i]}%
          </text>
        </g>
      ))}
      {/* challenge bar */}
      <rect x="248" y="20" width="60" height="40" rx="10" fill="#1a1a26" stroke="#2a2a3a" />
      <circle cx="262" cy="40" r="6" fill="#F75C03" />
      <rect x="272" y="32" width="28" height="4" rx="2" fill="#3a3a4a" />
      <rect x="272" y="40" width="20" height="4" rx="2" fill="#3a3a4a" />
      {/* activity rows */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0, ${78 + i * 18})`}>
          <circle cx="20" cy="6" r="5" fill={['#ffc800', '#F75C03', '#2DD4BF'][i]} />
          <rect x="32" y="2" width="180" height="4" rx="2" fill="#2a2a3a" />
          <rect x="32" y="9" width="100" height="3" rx="1.5" fill="#1f1f2c" />
          <rect x="270" y="2" width="36" height="10" rx="5" fill="#1a1a26" stroke="#2a2a3a" />
        </g>
      ))}
    </svg>
  )
}

function LeaderboardMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="lb-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd86b" />
          <stop offset="100%" stopColor="#F75C03" />
        </linearGradient>
      </defs>
      {/* podium */}
      <rect x="40" y="60" width="60" height="60" rx="8" fill="#1a1a26" stroke="#2a2a3a" />
      <rect x="130" y="30" width="60" height="90" rx="8" fill="#1a1a26" stroke="#ffc800" strokeWidth="1.5" />
      <rect x="220" y="75" width="60" height="45" rx="8" fill="#1a1a26" stroke="#2a2a3a" />
      {/* medals */}
      <circle cx="160" cy="48" r="10" fill="url(#lb-gold)" />
      <text x="160" y="52" textAnchor="middle" fill="#1a1a26" fontSize="11" fontWeight="900">1</text>
      <circle cx="70" cy="78" r="8" fill="#c0c7d6" />
      <text x="70" y="82" textAnchor="middle" fill="#1a1a26" fontSize="9" fontWeight="900">2</text>
      <circle cx="250" cy="93" r="8" fill="#cd7f32" />
      <text x="250" y="97" textAnchor="middle" fill="#1a1a26" fontSize="9" fontWeight="900">3</text>
      {/* crown over 1st */}
      <path d="M150 22 l4 -10 l6 6 l6 -10 l6 10 l6 -6 l4 10 z" fill="#ffc800" />
      {/* sparklines */}
      <polyline points="50,108 60,102 70,106 80,98 90,104" stroke="#F75C03" strokeWidth="1.5" fill="none" />
      <polyline points="140,78 150,72 160,76 170,68 180,74" stroke="#ffc800" strokeWidth="1.5" fill="none" />
      <polyline points="230,108 240,104 250,108 260,100 270,106" stroke="#F75C03" strokeWidth="1.5" fill="none" />
      {/* names */}
      <rect x="48" y="92" width="44" height="4" rx="2" fill="#3a3a4a" />
      <rect x="138" y="58" width="44" height="4" rx="2" fill="#fff" />
      <rect x="228" y="102" width="44" height="4" rx="2" fill="#3a3a4a" />
    </svg>
  )
}

function AchievementsMock() {
  const tiles = [
    { c: '#8e8ea0', emoji: '🥉' }, { c: '#1cb0f6', emoji: '⚡' },
    { c: '#ce82ff', emoji: '🔥' }, { c: '#ffc800', emoji: '👑' },
    { c: '#2DD4BF', emoji: '💎' }, { c: '#F75C03', emoji: '🏆' },
  ]
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      {tiles.map((t, i) => {
        const x = 18 + (i % 6) * 50
        const y = 30
        return (
          <g key={i}>
            <rect x={x} y={y} width="40" height="40" rx="10" fill="#1a1a26" stroke={t.c} strokeWidth="1.5" opacity="0.9" />
            <text x={x + 20} y={y + 26} textAnchor="middle" fontSize="16">{t.emoji}</text>
            <rect x={x + 4} y={y + 46} width="32" height="3" rx="1.5" fill={t.c} opacity="0.7" />
          </g>
        )
      })}
      {/* ladder line */}
      <text x="160" y="100" textAnchor="middle" fill="#9aa0b4" fontSize="9" fontWeight="700" letterSpacing="2">
        COMMON · RARE · EPIC · LEGENDARY · MYTHIC
      </text>
      {/* tier dots */}
      {[80, 130, 160, 190, 240].map((cx, i) => (
        <circle key={cx} cx={cx} cy={118} r="4" fill={['#8e8ea0', '#1cb0f6', '#ce82ff', '#ffc800', '#2DD4BF'][i]} />
      ))}
      <line x1="80" y1="118" x2="240" y2="118" stroke="#2a2a3a" strokeWidth="1" />
    </svg>
  )
}

function DuelsMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      {/* left fighter */}
      <circle cx="70" cy="60" r="28" fill="#1a1a26" stroke="#F75C03" strokeWidth="2" />
      <text x="70" y="66" textAnchor="middle" fill="#F75C03" fontSize="20" fontWeight="900">YT</text>
      <rect x="40" y="98" width="60" height="6" rx="3" fill="#2a2a3a" />
      <rect x="40" y="98" width="44" height="6" rx="3" fill="#F75C03" />
      {/* VS */}
      <circle cx="160" cy="60" r="22" fill="#ffc800" />
      <text x="160" y="68" textAnchor="middle" fill="#1a1a26" fontSize="20" fontWeight="900">VS</text>
      {/* right fighter */}
      <circle cx="250" cy="60" r="28" fill="#1a1a26" stroke="#2DD4BF" strokeWidth="2" />
      <text x="250" y="66" textAnchor="middle" fill="#2DD4BF" fontSize="20" fontWeight="900">EM</text>
      <rect x="220" y="98" width="60" height="6" rx="3" fill="#2a2a3a" />
      <rect x="220" y="98" width="38" height="6" rx="3" fill="#2DD4BF" />
      {/* stake */}
      <rect x="100" y="118" width="120" height="14" rx="7" fill="#1a1a26" stroke="#2a2a3a" />
      <text x="160" y="128" textAnchor="middle" fill="#ffc800" fontSize="10" fontWeight="900">
        STAKE · 50 PTS · 14 DAYS
      </text>
    </svg>
  )
}

function FireMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="flame" cx="0.5" cy="0.7" r="0.5">
          <stop offset="0%" stopColor="#ffc800" />
          <stop offset="60%" stopColor="#F75C03" />
          <stop offset="100%" stopColor="#7a1f00" />
        </radialGradient>
      </defs>
      {/* flame */}
      <path
        d="M70 100 C 40 80 50 50 70 35 C 75 50 85 50 80 30 C 100 40 110 70 95 95 Z"
        fill="url(#flame)" stroke="#ffc800" strokeWidth="1"
      />
      <text x="73" y="78" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900">12</text>
      <text x="73" y="120" textAnchor="middle" fill="#9aa0b4" fontSize="9" fontWeight="700" letterSpacing="2">DAYS</text>
      {/* 14-day grid */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 140 + (i % 7) * 22
        const y = 30 + Math.floor(i / 7) * 28
        const hit = [0, 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13].includes(i)
        return (
          <rect
            key={i}
            x={x} y={y} width="16" height="20" rx="4"
            fill={hit ? '#F75C03' : '#1a1a26'}
            stroke={hit ? '#ffc800' : '#2a2a3a'}
          />
        )
      })}
      <text x="175" y="110" textAnchor="middle" fill="#9aa0b4" fontSize="8" fontWeight="700" letterSpacing="2">
        LAST 14 DAYS · CLICK TO EXPAND
      </text>
    </svg>
  )
}

function RewardsMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      {/* coins pile */}
      <circle cx="60" cy="80" r="26" fill="#ffc800" />
      <circle cx="60" cy="80" r="18" fill="#F75C03" />
      <text x="60" y="86" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">pt</text>
      <circle cx="38" cy="60" r="10" fill="#ffc800" opacity="0.8" />
      <circle cx="86" cy="56" r="8" fill="#ffc800" opacity="0.6" />
      {/* reward tiles */}
      {[
        { label: 'Coffee', cost: '10', c: '#8e8ea0' },
        { label: 'Lunch', cost: '50', c: '#1cb0f6' },
        { label: 'Hoodie', cost: '120', c: '#ce82ff' },
        { label: 'Day off', cost: '250', c: '#ffc800' },
      ].map((r, i) => (
        <g key={r.label} transform={`translate(${130 + (i % 2) * 80}, ${20 + Math.floor(i / 2) * 58})`}>
          <rect width="72" height="48" rx="10" fill="#1a1a26" stroke={r.c} strokeWidth="1.5" />
          <rect x="6" y="6" width="60" height="3" rx="1.5" fill={r.c} />
          <text x="36" y="28" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">{r.label}</text>
          <text x="36" y="42" textAnchor="middle" fill={r.c} fontSize="9" fontWeight="900">{r.cost} pt</text>
        </g>
      ))}
    </svg>
  )
}

function SeasonsMock() {
  return (
    <svg viewBox="0 0 320 140" className="w-full h-full" aria-hidden>
      {/* tiers */}
      {[
        { y: 28, c: '#cd7f32', label: 'BRONZE' },
        { y: 56, c: '#c0c7d6', label: 'SILVER' },
        { y: 84, c: '#ffc800', label: 'GOLD' },
        { y: 112, c: '#2DD4BF', label: 'CHAMPION' },
      ].map((t) => (
        <g key={t.label}>
          <rect x="18" y={t.y - 10} width="120" height="20" rx="10" fill="#1a1a26" stroke={t.c} strokeWidth="1.5" />
          <circle cx="32" cy={t.y} r="6" fill={t.c} />
          <text x="46" y={t.y + 3.5} fill="#fff" fontSize="9" fontWeight="900" letterSpacing="2">{t.label}</text>
        </g>
      ))}
      {/* season trophy */}
      <g transform="translate(220, 35)">
        <path d="M0 0 L60 0 L54 50 L6 50 Z" fill="#ffc800" stroke="#F75C03" strokeWidth="2" />
        <rect x="22" y="50" width="16" height="14" fill="#F75C03" />
        <rect x="14" y="64" width="32" height="6" rx="2" fill="#F75C03" />
        <text x="30" y="30" textAnchor="middle" fill="#1a1a26" fontSize="22" fontWeight="900">S2</text>
      </g>
      <text x="250" y="118" textAnchor="middle" fill="#9aa0b4" fontSize="9" fontWeight="700" letterSpacing="2">
        12 DAYS LEFT
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions. Two kinds:
//   - 'tour': rich card centred on screen with illustration + bullets + CTA
//   - 'spot': dim background and highlight a real DOM element via data-tour
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    kind: 'tour',
    title: 'Welcome to Leyton Arena',
    eyebrow: 'A quick tour · ~60 seconds',
    body: 'A gamified leaderboard for R&D tax consultants. We\'ll walk you through the chrome — sidebar, search, points, notifications — and the key pages, with a live preview of each.',
    illustration: 'hero',
    accent: '#F75C03',
  },
  {
    kind: 'spot',
    target: '[data-tour="sidebar"]',
    placement: 'right',
    title: 'Your map · the sidebar',
    body: 'Pages live in three collapsible groups — Compete, Achieve, Leadership. Click a group header to expand. Home and My Profile are always one tap away.',
    hint: 'Click any group header to open it',
    accent: '#2DD4BF',
  },
  {
    kind: 'tour',
    title: 'Home — your morning coffee',
    eyebrow: 'Page · /',
    body: 'Quick progress rings for the month\'s metrics, live monthly challenges, head-to-head duels in flight, team activity, and any records under threat.',
    bullets: [
      { icon: 'spark', text: 'Three rings: invoice, ops delivered, early-invoice %' },
      { icon: 'flame', text: 'Challenges tick down as you advance claims' },
      { icon: 'users', text: 'Activity feed shows who just shipped what' },
    ],
    illustration: 'home',
    route: '/',
    accent: '#F75C03',
  },
  {
    kind: 'tour',
    title: 'Leaderboard',
    eyebrow: 'Page · /leaderboard',
    body: 'Top-3 podium with sparklines, a "Your Position" hero card, and a table that smoothly reorders as you change period, metric, or location. Flip to Race view for a Strava-style bar chart.',
    bullets: [
      { icon: 'crown', text: 'Click any row to jump to that consultant\'s profile' },
      { icon: 'spark', text: '6-month sparkline trend per row' },
      { icon: 'flame', text: '▲ / ▼ position deltas vs the prior period' },
    ],
    illustration: 'leaderboard',
    route: '/leaderboard',
    accent: '#ffc800',
  },
  {
    kind: 'tour',
    title: 'Achievements',
    eyebrow: 'Page · /achievements',
    body: '40+ badges across nine categories — early invoicing, monthly streaks, revenue, volume, client voice, speed to cash, championship, reliability, and daily fire. Each is a ladder from Common to Mythic.',
    bullets: [
      { icon: 'award', text: 'Five rarity tiers · Common → Mythic' },
      { icon: 'spark', text: 'Progress bar on every locked badge' },
      { icon: 'crown', text: 'Mythic badges unlock special profile flair' },
    ],
    illustration: 'achievements',
    route: '/achievements',
    accent: '#ce82ff',
  },
  {
    kind: 'tour',
    title: 'Daily fire — the streak',
    eyebrow: 'Across Home & Profile',
    body: 'Every consultant has a daily fire that grows by one whenever they advance at least one claim by one stage in the Leyton workflow (Handover → Overview → Scoping → Tech Report → Costs → Assessment → Invoiced).',
    bullets: [
      { icon: 'flame', text: 'One stage advance per day keeps it alive' },
      { icon: 'spark', text: 'Click the flame for a 14-day breakdown' },
      { icon: 'award', text: 'Streak badges at 7 · 30 · 100 · 365 days' },
    ],
    illustration: 'fire',
    accent: '#F75C03',
  },
  {
    kind: 'tour',
    title: 'Duels — head-to-head',
    eyebrow: 'Page · /duels',
    body: 'Challenge a peer 1:1. Pick a metric, a duration, and a stake. Spectators can cheer. Winner takes the pot.',
    bullets: [
      { icon: 'users', text: 'Any metric: invoice value, ops delivered, early-%' },
      { icon: 'spark', text: 'Live progress bars update as claims advance' },
      { icon: 'crown', text: 'Stake Arena points · winner takes the pot' },
    ],
    illustration: 'duels',
    route: '/duels',
    accent: '#2DD4BF',
  },
  {
    kind: 'tour',
    title: 'Seasons & Leagues',
    eyebrow: 'Page · /seasons',
    body: 'Quarter-long competitions. Climb from Bronze → Silver → Gold → Champion. Each season ends with a leaderboard freeze and a trophy.',
    bullets: [
      { icon: 'crown', text: 'Promotion / relegation at season end' },
      { icon: 'award', text: 'Trophy cabinet on your profile' },
      { icon: 'spark', text: 'Live countdown to season close' },
    ],
    illustration: 'seasons',
    route: '/seasons',
    accent: '#ffc800',
  },
  {
    kind: 'tour',
    title: 'Rewards',
    eyebrow: 'Page · /rewards',
    body: 'Badges convert to Arena points — 10 pts for Common up to 250 for Mythic. Cash them in for 34 real treats: coffee, lunch, hoodies, days off.',
    bullets: [
      { icon: 'award', text: '34 rewards from 10 to 1,000 points' },
      { icon: 'spark', text: 'Redemption history with one-tap re-cash' },
      { icon: 'flame', text: 'Spend doesn\'t reset badges — keep flexing them' },
    ],
    illustration: 'rewards',
    route: '/rewards',
    accent: '#ffc800',
  },
  {
    kind: 'spot',
    target: '[data-tour="cmdk"]',
    placement: 'bottom',
    title: 'Search & shortcuts · ⌘K',
    body: 'Fuzzy-search every consultant, badge and page from anywhere. Use ⌘K on Mac, Ctrl+K on Windows. Arrows to navigate, Enter to jump.',
    hint: 'Click the Search pill — or just press ⌘K',
    accent: '#2DD4BF',
  },
  {
    kind: 'spot',
    target: '[data-tour="rewards"]',
    placement: 'bottom',
    title: 'Your points — always visible',
    body: 'Your live Arena points balance lives in the top-right. Click it to jump straight to /rewards and cash in.',
    hint: 'Click the points pill any time',
    accent: '#ffc800',
  },
  {
    kind: 'spot',
    target: '[data-tour="bell"]',
    placement: 'bottom',
    title: 'Notifications',
    body: 'New badges, duels challenged, records broken, season closes — all land here with a red dot until you read them.',
    hint: 'Click the bell to open the panel',
    accent: '#F75C03',
  },
  {
    kind: 'spot',
    target: '[data-tour="theme"]',
    placement: 'bottom',
    title: 'Dark / light theme',
    body: 'Flip the theme for the whole app. We persist your choice so the next visit picks up where you left off.',
    hint: 'Click the sun / moon icon',
    accent: '#ffc800',
  },
  {
    kind: 'spot',
    target: '[data-tour="role"]',
    placement: 'right',
    title: 'Switch lens · Technical / Financial',
    body: 'Toggle the lens between Technical and Financial consultants. The leaderboard, profiles and stats re-scope instantly.',
    hint: 'Tap a role to switch',
    accent: '#2DD4BF',
  },
  {
    kind: 'tour',
    title: 'You\'re ready',
    eyebrow: 'Tour complete',
    body: 'Pop this tour open any time from Admin → Tour. Try a duel, flip the theme, ⌘K a colleague\'s name. Have fun.',
    bullets: [
      { icon: 'spark', text: 'Admin → Tour to re-open this walkthrough' },
      { icon: 'users', text: 'Profile → "view as" to demo other consultants' },
      { icon: 'crown', text: 'Try Demo Mode in Admin for a live ticker' },
    ],
    illustration: 'finish',
    accent: '#F75C03',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const BULLET_ICONS = {
  crown: Crown, spark: Sparkles, flame: Flame, users: Users, award: Award,
  sword: Swords, gift: Gift, search: Search, bell: Bell, sun: Sun,
}

function Illustration({ kind, accent }) {
  if (kind === 'home')         return <HomeMock />
  if (kind === 'leaderboard')  return <LeaderboardMock />
  if (kind === 'achievements') return <AchievementsMock />
  if (kind === 'duels')        return <DuelsMock />
  if (kind === 'fire')         return <FireMock />
  if (kind === 'rewards')      return <RewardsMock />
  if (kind === 'seasons')      return <SeasonsMock />
  if (kind === 'finish') {
    return (
      <div className="w-full h-full grid place-items-center">
        <motion.div
          initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="relative"
        >
          <div
            className="h-24 w-24 rounded-3xl grid place-items-center shadow-glow"
            style={{ background: `linear-gradient(135deg, ${accent}, #ffc800)` }}
          >
            <Trophy size={44} className="text-arena-bg" strokeWidth={2.6} />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], x: Math.cos(i * 1.25) * 60, y: Math.sin(i * 1.25) * 60 }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.18 }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkles size={14} style={{ color: accent }} />
            </motion.span>
          ))}
        </motion.div>
      </div>
    )
  }
  // hero
  return (
    <div className="w-full h-full grid place-items-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative h-28 w-28 rounded-[28px] grid place-items-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent}, #7a1f00 80%)`,
          boxShadow: `0 0 60px ${accent}80`,
        }}
      >
        <span className="font-display font-black text-arena-bg text-5xl leading-none">L</span>
        <motion.span
          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-arena-amber grid place-items-center text-arena-bg"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={16} strokeWidth={3} />
        </motion.span>
      </motion.div>
    </div>
  )
}

// Renders a fullscreen dim with a punched-out hole around the highlighted
// element + an animated pulsing ring + a floating tooltip card.
function Spotlight({ targetEl, title, body, hint, accent, children, onNext, onPrev, onClose, step, total }) {
  const [rect, setRect] = useState(null)

  useLayoutEffect(() => {
    if (!targetEl) { setRect(null); return }
    const measure = () => {
      const r = targetEl.getBoundingClientRect()
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    measure()
    // Scroll into view (centred) so the spotlight is always on screen.
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    const ro = new ResizeObserver(measure)
    ro.observe(targetEl)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const id = setInterval(measure, 200)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      clearInterval(id)
    }
  }, [targetEl])

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center">
        <div className="text-arena-muted">Locating…</div>
      </div>
    )
  }

  // Padding around the highlight cutout.
  const pad = 8
  const hx = rect.x - pad
  const hy = rect.y - pad
  const hw = rect.w + pad * 2
  const hh = rect.h + pad * 2

  // Decide tooltip placement. Prefer below; fallback above; left/right for tall.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const TOOLTIP_W = 360
  const TOOLTIP_H = 240
  const placeBelow = hy + hh + TOOLTIP_H + 20 < vh
  const placeRight = hx + hw + TOOLTIP_W + 20 < vw
  let tipX, tipY, originLabel
  if (placeBelow) {
    tipX = Math.min(Math.max(12, hx + hw / 2 - TOOLTIP_W / 2), vw - TOOLTIP_W - 12)
    tipY = hy + hh + 16
    originLabel = 'top'
  } else if (hy - TOOLTIP_H - 20 > 0) {
    tipX = Math.min(Math.max(12, hx + hw / 2 - TOOLTIP_W / 2), vw - TOOLTIP_W - 12)
    tipY = hy - TOOLTIP_H - 16
    originLabel = 'bottom'
  } else if (placeRight) {
    tipX = hx + hw + 16
    tipY = Math.min(Math.max(12, hy + hh / 2 - TOOLTIP_H / 2), vh - TOOLTIP_H - 12)
    originLabel = 'left'
  } else {
    tipX = Math.max(12, hx - TOOLTIP_W - 16)
    tipY = Math.min(Math.max(12, hy + hh / 2 - TOOLTIP_H / 2), vh - TOOLTIP_H - 12)
    originLabel = 'right'
  }

  return (
    <>
      {/* Dim with a transparent cutout */}
      <svg className="fixed inset-0 z-[60] pointer-events-none" width="100%" height="100%">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={hx} y={hy} width={hw} height={hh} rx="14" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-mask)" />
      </svg>

      {/* Pulsing rings around the highlight */}
      <motion.div
        className="fixed z-[61] pointer-events-none rounded-2xl"
        style={{ left: hx, top: hy, width: hw, height: hh, boxShadow: `0 0 0 2px ${accent}` }}
        animate={{ boxShadow: [`0 0 0 2px ${accent}`, `0 0 0 8px ${accent}30`, `0 0 0 2px ${accent}`] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <motion.div
        className="fixed z-[61] pointer-events-none rounded-2xl"
        style={{ left: hx, top: hy, width: hw, height: hh }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.0, 0.35, 0.0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="w-full h-full rounded-2xl" style={{ boxShadow: `0 0 40px 6px ${accent}` }} />
      </motion.div>

      {/* Cursor + click hint pointing at the centre of the highlight */}
      <motion.div
        className="fixed z-[62] pointer-events-none"
        style={{ left: hx + hw / 2 - 12, top: hy + hh + 4 }}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        <MousePointerClick size={24} color={accent} strokeWidth={2.6} />
      </motion.div>

      {/* Floating tooltip card */}
      <motion.div
        key={`tip-${title}`}
        initial={{ opacity: 0, y: originLabel === 'top' ? -8 : 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="fixed z-[63] bg-arena-surface border border-arena-border rounded-2xl shadow-2xl p-5"
        style={{ left: tipX, top: tipY, width: TOOLTIP_W }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
          aria-label="Close walkthrough"
        >
          <X size={16} />
        </button>
        <div
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-display font-black px-2 py-0.5 rounded-full"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <MousePointerClick size={10} strokeWidth={3} />
          Click hint
        </div>
        <h3 className="mt-2 font-display font-black text-arena-ink text-lg">{title}</h3>
        <p className="mt-1.5 text-sm text-arena-muted leading-relaxed">{body}</p>
        {hint && (
          <div
            className="mt-3 text-xs font-display font-bold rounded-xl px-3 py-2 inline-flex items-center gap-2"
            style={{ background: `${accent}14`, color: accent }}
          >
            <MousePointerClick size={12} strokeWidth={3} />
            {hint}
          </div>
        )}
        {children}
      </motion.div>
    </>
  )
}

export default function WalkthroughOverlay() {
  const open = useArenaStore((s) => s.walkthroughOpen)
  const setOpen = useArenaStore((s) => s.setWalkthroughOpen)
  const [step, setStep] = useState(0)
  const [targetEl, setTargetEl] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Reset to first step when re-opening.
  useEffect(() => { if (open) setStep(0) }, [open])

  // Find the highlighted DOM node for spotlight steps. Re-runs whenever the
  // step changes or the route changes (since opening a page can reflow chrome).
  useEffect(() => {
    if (!open) return
    const s = STEPS[step]
    if (s?.kind !== 'spot') { setTargetEl(null); return }
    let cancelled = false
    let tries = 0
    const find = () => {
      if (cancelled) return
      const el = document.querySelector(s.target)
      if (el) { setTargetEl(el); return }
      tries += 1
      if (tries < 30) setTimeout(find, 80)
    }
    find()
    return () => { cancelled = true }
  }, [open, step, location.pathname])

  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  const close = () => { setOpen(false); setStep(0) }
  const next = () => (isLast ? close() : setStep((s) => s + 1))
  const prev = () => setStep((s) => Math.max(0, s - 1))
  const goAndNext = (route) => {
    if (route && route !== location.pathname) navigate(route)
    next()
  }

  // ── Spotlight step ────────────────────────────────────────────────────────
  if (current.kind === 'spot') {
    return (
      <AnimatePresence>
        <Spotlight
          targetEl={targetEl}
          title={current.title}
          body={current.body}
          hint={current.hint}
          accent={current.accent}
          step={step}
          total={STEPS.length}
          onNext={next}
          onPrev={prev}
          onClose={close}
        >
          <ProgressDots step={step} total={STEPS.length} accent={current.accent} />
          <Controls
            isFirst={isFirst}
            isLast={isLast}
            onPrev={prev}
            onNext={next}
            onClose={close}
            accent={current.accent}
            step={step}
            total={STEPS.length}
          />
        </Spotlight>
      </AnimatePresence>
    )
  }

  // ── Tour card step ────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          key={current.title}
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 20, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative w-full max-w-xl bg-arena-surface border border-arena-border rounded-3xl overflow-hidden shadow-2xl"
        >
          <button
            onClick={close}
            className="absolute top-3 right-3 z-10 h-9 w-9 grid place-items-center rounded-full bg-arena-surface2/60 text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
            aria-label="Close walkthrough"
          >
            <X size={18} />
          </button>

          {/* Illustration band — coloured per step */}
          <div
            className="relative h-44 md:h-48 grid place-items-center overflow-hidden"
            style={{
              background:
                `radial-gradient(ellipse at 20% 0%, ${current.accent}33, transparent 60%),` +
                `radial-gradient(ellipse at 100% 100%, ${current.accent}22, transparent 50%),` +
                `linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.25))`,
            }}
          >
            {/* dotted grid */}
            <svg className="absolute inset-0 opacity-30" width="100%" height="100%" aria-hidden>
              <defs>
                <pattern id={`dots-${step}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill={current.accent} opacity="0.35" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#dots-${step})`} />
            </svg>

            <div className="relative w-[88%] h-[80%]">
              <Illustration kind={current.illustration} accent={current.accent} />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-display font-black text-arena-muted">
              <span>Step {step + 1} of {STEPS.length}</span>
              {current.eyebrow && (
                <>
                  <span>·</span>
                  <span style={{ color: current.accent }}>{current.eyebrow}</span>
                </>
              )}
            </div>
            <h2 className="mt-1.5 font-display font-black text-arena-ink text-2xl md:text-3xl leading-tight">
              {current.title}
            </h2>
            <p className="mt-2 text-arena-muted leading-relaxed">{current.body}</p>

            {current.bullets && (
              <ul className="mt-4 space-y-2">
                {current.bullets.map((b, i) => {
                  const Icon = BULLET_ICONS[b.icon] || Sparkles
                  return (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i + 0.1 }}
                      className="flex items-start gap-2.5 text-sm text-arena-ink/90"
                    >
                      <span
                        className="mt-0.5 h-6 w-6 rounded-lg grid place-items-center shrink-0"
                        style={{ background: `${current.accent}1a`, color: current.accent }}
                      >
                        <Icon size={13} strokeWidth={2.6} />
                      </span>
                      <span>{b.text}</span>
                    </motion.li>
                  )
                })}
              </ul>
            )}

            <ProgressDots step={step} total={STEPS.length} accent={current.accent} className="mt-5" />

            <Controls
              isFirst={isFirst}
              isLast={isLast}
              onPrev={prev}
              onNext={next}
              onClose={close}
              accent={current.accent}
              step={step}
              total={STEPS.length}
              route={current.route}
              onGoAndNext={goAndNext}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ProgressDots({ step, total, accent, className = '' }) {
  return (
    <div
      className={`grid gap-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="h-1.5 rounded-full"
          style={{ background: i <= step ? accent : 'rgba(255,255,255,0.08)' }}
          animate={{ opacity: i === step ? [0.6, 1, 0.6] : 1 }}
          transition={i === step ? { duration: 1.5, repeat: Infinity } : {}}
        />
      ))}
    </div>
  )
}

function Controls({ isFirst, isLast, onPrev, onNext, onClose, accent, step, total, route, onGoAndNext }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        onClick={onClose}
        className="text-xs text-arena-muted hover:text-arena-ink font-display font-bold"
      >
        Skip
      </button>
      <div className="ml-auto flex items-center gap-2">
        {!isFirst && (
          <button
            onClick={onPrev}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-arena-surface2 text-arena-ink/80 hover:text-arena-ink font-display font-bold text-xs"
          >
            <ChevronLeft size={12} strokeWidth={3} />
            Back
          </button>
        )}
        {route && onGoAndNext && (
          <button
            onClick={() => onGoAndNext(route)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-arena-surface2 text-arena-ink hover:bg-arena-surface2/80 font-display font-bold text-xs border border-arena-border"
          >
            Take me there
            <ChevronRight size={12} strokeWidth={3} />
          </button>
        )}
        <button
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-display font-black text-sm shadow-glow"
          style={{ background: accent, color: '#0b0b12' }}
        >
          {isLast ? 'Finish' : `Next · ${step + 2}/${total}`}
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}
