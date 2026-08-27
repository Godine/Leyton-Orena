# Leyton Arena

A gamified internal leaderboard for R&D tax consultants. Duolingo-style
energy applied to delivery metrics — streaks, badges, podiums, all-time
records, monthly quests, head-to-head duels, seasons/leagues, a points-and-
rewards economy, a manager cockpit, and an end-of-quarter "Wrapped" recap —
all running on mock data so the MVP can ship and be demoed before any backend
integration lands.

> Status: client-side MVP. No real auth, no API. Everything is rendered from
> in-memory mock data in Zustand stores. A full production build plan (Next.js
> + Postgres + SSO + the internal **Galileo** system of record) lives in
> [`docs/PRODUCTION_MASTER_PROMPTS.md`](docs/PRODUCTION_MASTER_PROMPTS.md),
> with the open integration questions in
> [`docs/QUESTIONS_FOR_IT.md`](docs/QUESTIONS_FOR_IT.md).

---

## Quick start

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
npm run lint     # eslint
```

Requires Node ≥ 18. Tested on Node 22.

---

## Tech stack

| Concern        | Choice                                                     |
| -------------- | ---------------------------------------------------------- |
| Framework      | React 18 + Vite 5                                          |
| Styling        | Tailwind CSS 3 with a custom theme (dark default + light)  |
| State          | Zustand (one store per domain: arena, notifs, quests, duels, rewards, sound) |
| Routing        | react-router-dom v6, lazy-loaded routes, mock auth guard   |
| Animation      | framer-motion (page transitions, podium, unlocks, race)    |
| Icons          | lucide-react (+ emojis for badges/records/rewards)         |
| Fonts          | Nunito (display) + DM Sans (body) via Google Fonts         |
| SFX            | tiny WebAudio-synthesised sounds (no asset files)          |
| PWA            | web manifest + service worker (`public/sw.js`)             |

---

## Feature overview

The app has a **public landing page** and a **mock login**, then an
authenticated product behind an auth guard. `/` shows the Landing page when
logged out and the Home dashboard when logged in.

| Route | Page | What it does |
| ----- | ---- | ------------ |
| `/`            | **Landing**      | Public marketing page with its own warm light palette: hero, an interactive "flatten the curve" Before/After chart, an animated leaderboard face-off, a duel-type picker, a tabbed 9-category badge ladder, and a points→rewards slider. |
| `/login`       | **Login**        | Mock/demo login — credentials are pre-filled; the real control is a dropdown to pick which consultant to sign in as. Flips a `localStorage` auth flag and redirects to Home. |
| `/` (authed)   | **Home**         | Welcome header, hero fire-streak, quick stats (ops/invoice vs target, rank + delta, streak), monthly challenges, live duels, team activity feed, and a "records under threat" widget. |
| `/leaderboard` | **Rankings**     | Filter bar (period · sort metric · location) plus a **Table/Race** view toggle. "Your position" card, top-3 podium, team metric cards, and either a ranked table or an animated race track that reorders on filter change. |
| `/seasons`     | **Seasons**      | Yearly season/league standings — season banner with your standing, five league tiers (Diamond → Bronze) with members, scores, and promotion/relegation zones. *(This is the sidebar's "Leaderboard" entry.)* |
| `/achievements`| **Achievements** | Badge trophy case: progress summary, rarity + "earned only" filters, 46 badges grouped into 9 categories with earned/total counts, unlock-burst animation, and a badge detail modal with criteria and holders. |
| `/records`     | **Records**      | "Hall of Records" of all-time bests grouped by category, with an "under threat" alert section when a runner-up is closing in on the holder. |
| `/profile`     | **Profile**      | Personal page with a "view as" consultant selector and quick actions. **Two tabs — Overview** (rings, trend chart, activity heatmap, rank summary, insights, category progress, fire & monthly streaks, next/showcase badges, personal records) **and Coaching** (grade, momentum, planning-discipline diagnosis, strengths/levers, recommendations, what-if projection). |
| `/manager`     | **Manager**      | Team cockpit with an All/Technical/Financial scope toggle. **Three tabs — Overview** (KPI row, "on fire" vs "needs attention", office breakdown, roster table), **Trends** (per-consultant momentum segmentation), and **The Curve** (back-load diagnosis, quarter-end uplift, pipeline-discipline pushers/pullers). |
| `/rewards`     | **Rewards**      | Redeem badge points for perks — balance + rarity breakdown, a 34-item catalogue across 7 categories with affordability bars, a redeem confirm modal, and redemption history. |
| `/wrapped`     | **Wrapped**      | Spotify-Wrapped-style scroll of recap slides for a chosen consultant (headline invoice, growth, biggest month, rarest badge, streaks, final standing) with a "share recap" copy-to-clipboard. |
| `/duels`       | **Duels**        | 1:1 head-to-head challenges — active duels + spectator board, a detailed duel view (margin bar, timeline, lead sparkline, trash-talk, cheer panel), past-duel history, and a "challenge a peer" creation modal. |
| `/compare`     | **Compare**      | Side-by-side A-vs-B consultant comparison (selection stored in URL params, with swap), win-count headline cards, and a per-metric grid with a win tally. |
| `/admin`       | **Admin**        | Demo control panel — demo mode, guided walkthrough, trigger sample unlock, reset notifications, sound toggle, full demo reset; editable consultant monthly-stats table; challenge editor; per-consultant targets editor; and a Microsoft Teams webhook config with test button. |

**Navigation.** The left sidebar links Home, Leaderboard (→ `/seasons`),
Achievements, Records, Rewards, Manager, and Rankings (→ `/leaderboard`).
Profile and Admin live in the top bar; Duels, Compare and Wrapped are reached
from Profile's quick actions or the command palette.

Cross-cutting features:

- **Command palette** — ⌘K (Ctrl+K) fuzzy search over pages, consultants, and
  badges; Enter jumps to a page, a profile, or the achievements gallery.
- **Notifications** — bell in the top bar with unread badge, a dropdown panel,
  and bottom-right toasts for new events.
- **Monthly challenges** — Duolingo-style quest cards with live per-user
  progress, days-left, and reward badges.
- **Daily fire streak** — a per-day "did this consultant advance ≥1 claim by a
  workflow stage today?" streak, with a 30-day breakdown modal.
- **Points & rewards economy** — badges earn points by rarity; points are spent
  on catalogue rewards, tracked as redemptions with history.
- **Sound effects** — optional tactile WebAudio SFX (unlock / win / milestone /
  pop), toggled from Admin.
- **Demo Mode** — rotates the active consultant every 8 s and fires sample
  toasts every 12 s so the dashboards stay alive during a presentation.
- **Guided walkthrough** — an onboarding overlay, auto-launched on first login
  and re-launchable from Admin.
- **Page transitions, error boundary, lazy routes, skeleton fallback, welcome
  splash, theme toggle, PWA manifest + service worker** — production-friendly polish.

### Screenshots

> _Placeholders — drop screenshots into `docs/screenshots/` and link them here._

---

## Project layout

```
src/
├── App.jsx, main.jsx
├── components/
│   ├── CommandPalette.jsx, Logo.jsx, PagePlaceholder.jsx, WelcomeSplash.jsx
│   ├── achievements/   # BadgeGrid, BadgeCard, BadgeDetailModal, UnlockAnimation, ProgressSummary
│   ├── admin/          # DemoModeDriver, WalkthroughOverlay
│   ├── home/           # WelcomeHeader, QuickStats, ChallengesPanel, DuelsPanel, ActivityFeed
│   ├── layout/         # AppShell, Sidebar, MobileMenu, TopBar, RoleSwitcher, ThemeToggle, RewardsBalance, navConfig
│   ├── leaderboard/    # Podium, LeaderboardTable, MetricCards, SparkLine, RaceTrack, YourPositionCard
│   ├── manager/        # TrendsTab, CurveTab
│   ├── notifications/  # NotificationBell, NotificationPanel, Toast
│   ├── profile/        # ProfileHeader, PerformanceRings, TrendChart, ActivityHeatmap, CoachingTab,
│   │                   #   InsightsCard, CategoryProgress, NextBadges, BadgeShowcase, StreakDisplay, PersonalRecords
│   ├── records/        # RecordCard, ThreatAlert
│   └── shared/         # ProgressRing, AnimatedCounter, LocationPill, TrendArrow, FireStreak,
│                       #   FireStreakDetailModal, SkeletonLoader, LoadingBar, EmptyState, ErrorBoundary
├── data/
│   ├── badges.js       # 46-badge registry across 9 categories with rarity styling
│   ├── consultants.js  # 25 mock consultants × 6 months of stats, derived badges, fire logs
│   └── workflow.js     # 10-stage claim workflow + client-name pool (fire-streak source)
├── pages/              # Landing, Login, Home, Leaderboard, Seasons, Achievements, Records,
│                       #   Profile, Manager, Rewards, Wrapped, Duels, Compare, Admin
├── store/
│   ├── useArenaStore.js        # consultants, badges, role view, current user, auth, theme, demo mode, Teams webhook
│   ├── useNotificationStore.js # notifications + toast state
│   ├── useChallengeStore.js    # active monthly challenges
│   ├── useDuelStore.js         # duels, scoring, cheers
│   ├── useRewardStore.js       # points economy, reward catalogue, redemptions
│   └── useSoundStore.js        # WebAudio SFX
├── utils/
│   ├── computeRankings.js       # leaderboard aggregation + trend
│   ├── computeRecords.js        # all-time records + threat detection
│   ├── computeLeagues.js        # season score + Diamond→Bronze league buckets
│   ├── computeWrapped.js        # per-consultant end-of-quarter recap
│   ├── computeInsights.js       # per-consultant heuristic insights (positive/caution/neutral)
│   ├── computeManagerInsights.js# manager overview rollups (movers, offices, attention)
│   ├── coachingInsights.js      # coaching grade, planning discipline, strengths/recs + manager trends/curve
│   ├── badgeEligibility.js      # heuristic progress toward locked badges
│   └── formatters.js            # currency / pct / days / location codes
└── styles/index.css             # Tailwind layers + theme tokens + reduced-motion
```

---

## Data model

### Consultant

25 consultants across two roles (Technical / Financial) and five offices
(London · Casablanca · Dublin · Glasgow · Bristol), each with 6 months of
stats (Oct 2024 – Mar 2025).

```js
{
  id: "c-01",
  name: "Oumayma El Mahjoubi",
  role: "Technical",                // "Technical" | "Financial"
  seniority: "Senior Consultant",   // nullable
  location: "Casablanca",           // London | Casablanca | Dublin | Glasgow | Bristol
  targets: { ops: 7, invoice: 55000, earlyPct: 70, daysClose: 4 },
  badges: ["front-loader", "on-fire", ...],
  badgeEarnedAt: { "front-loader": "2025-02", ... },
  streaks: { currentMonthlyStreak: 5, bestMonthlyStreak: 6 },
  lifetime: {                       // gates lifetime-ladder badges
    trustpilot: 5, contractDays: 8, champBest: 1,
    champTotal: 2, earliestDay: 3, firstOfMonthCount: 2,
  },
  monthlyStats: [
    {
      month: "2025-03",
      opsDelivered: 11,
      invoiceValue: 98000,
      invoiceBeforeDay15Pct: 83,
      clientRetentionFlags: 0,
      avgDaysToClose: 2.7,
      pushedOps: 0,                 // planning discipline: committed then slipped later
      pulledOps: 1,                 // delivered ahead of a future commitment
      latePushedOps: 0,             // pushes in the final week — the "worst" pattern
    },
    // ...6 months total
  ],
  fire: {                           // daily claim-stage-advance streak
    current: 11, best: 14,
    log: [1,0,1,...],               // 30-day 0/1 log ending today
    moves: [{ date, client, fromStage, toStage }, ...],
    todayIso: "2025-08-27",
  },
}
```

### Badge

46 badges across **9 categories** — Early Invoicing, Monthly Streaks, Big
Revenue, Volume, Client Voice (Trustpilot), Speed to Cash, Championship,
Reliability, and Daily Fire. Each badge sits at a `tier` within its category
ladder and carries one of **five rarities** (common → rare → epic → legendary →
mythic).

```js
{
  id: "front-loader",
  category: "early-invoicing",
  tier: 7,
  name: "Front-Loader",
  icon: "⚡",
  rarity: "legendary",             // common | rare | epic | legendary | mythic
  description: "80%+ of monthly invoice raised before day 15.",
  criteria: "invoiceBeforeDay15Pct ≥ 80.",
}
```

### Record

```js
{
  id: "highest-monthly-invoice",
  title: "Highest Single-Month Invoice",
  category: "invoice",              // "invoice" | "delivery" | "efficiency" | "streaks"
  icon: "💰",
  holderId: "c-09",
  value: 102000,
  month: "2025-02",
  format: (v) => "£102K",
  runnerUp: { consultantId: "c-01", value: 98000 },
  threatRatio: 0.96,                // 1.0 = tied
  betterWhenLower: false,
}
```

### Challenge

```js
{
  id: "front-load-current",
  title: "Front-Load the Month",
  type: "individual",               // "individual" | "team"
  metric: "invoiceBeforeDay15Pct",
  target: 70,
  daysLeft: 12,
  icon: "⚡",
  reward: { type: "badge", badgeId: "front-loader" },
  progressFn: (user, peers, latestMonth, challenge) => ({
    value, target, ratio, completed, valueLabel, targetLabel,
  }),
}
```

### Duel

```js
{
  id: "d-001",
  challengerId: "c-01",
  opponentId: "c-05",
  metric: "invoiceValue",           // invoiceValue | opsDelivered | invoiceBeforeDay15Pct | avgDaysToClose
  durationDays: 30,                 // 7 | 14 | 30
  startedAt: 1716394800000,
  endsAt: 1718900000000,            // ms epoch
  stake: "Loser buys lunch",
  message: "Bring it — front-load month.",
  cheers: { "c-08": "c-01", ... },  // spectatorId → side backed
  status: "active",                 // "active" | "completed"
  winnerId: "c-01",                 // when completed
  scores: { "c-01": 4, "c-05": 2 },
}
```

### Reward & Redemption

Points are earned from badges by rarity (**common 10, rare 25, epic 50,
legendary 100, mythic 250**) and spent on a 34-item catalogue across 7
categories (Treats, Wellness, Cause, Time, Growth, Experience, Recognition).

```js
// Reward
{ id: "coffee", name: "Coffee on us", cost: 50, icon: "☕", category: "Treats", description: "..." }

// Redemption
{ id: "r-001", consultantId: "c-08", rewardId: "conference", at: 1716394800000 }
```

### Notification

```js
{
  id: "n-001",
  kind: "badge",                    // "badge" | "rank" | "record" | "challenge" | "streak" | "team"
  title: "You earned ⚡ Front-Loader!",
  body: "Raised 80%+ of your monthly invoice value before day 15.",
  at: 1716394800000,                // ms epoch
  read: false,
}
```

### Claim workflow (fire-streak source)

The daily fire streak is driven by advances along a canonical 10-stage claim
cycle (`src/data/workflow.js`):

```
Handover completed → Overview completed → First Scoping → Scoping completed →
Technical Report drafted → Technical Report reviewed → Costs Received →
Assessment drafted → Assessment reviewed → Invoiced
```

A day "lights" the streak if at least one claim advanced by one stage that day.

---

## Theme & brand

Leyton-branded orange rather than the original Duolingo green. Colours are
stored as space-separated RGB channels so Tailwind's
`rgb(var(--token) / <alpha-value>)` pattern gives working opacity.

**Dark is the default** (`:root`); light mode is applied via a
`[data-theme='light']` attribute on `<html>`, set by an inline script in
`index.html` from `localStorage['arena-theme']` before React mounts (so there's
no flash). The top-bar toggle persists the choice.

| Token / accent            | Dark              | Light             | Used for                    |
| ------------------------- | ----------------- | ----------------- | --------------------------- |
| `--arena-bg-rgb`          | `26 26 46`        | `248 249 252`     | App background              |
| `--arena-surface-rgb`     | `34 34 61`        | `255 255 255`     | Card surfaces               |
| `--arena-surface2-rgb`    | `42 42 74`        | `240 241 247`     | Raised surfaces             |
| `--arena-card-rgb`        | `30 42 71`        | `255 255 255`     | Gradient card base          |
| `--arena-border-rgb`      | `52 52 90`        | `218 222 234`     | Borders                     |
| `--arena-ink-rgb`         | `245 245 251`     | `26 26 46`        | Primary text                |
| `--arena-muted-rgb`       | `160 160 192`     | `97 100 128`      | Secondary text              |
| `--arena-green` (brand)   | `#F75C03` (Leyton orange, shared)     || Primary positive accent     |
| `--arena-amber`           | `#ffc800` (shared)                    || Records, legendary, peaks   |
| `--arena-coral`           | `#ff4b4b` (shared)                    || Streaks, negative, threat   |

Additional accents used across the UI (from `tailwind.config.js`): blue
`#1cb0f6` (rare/team), purple `#ce82ff` (epic), plus teal/rose on the Landing
page. Rarity and location colours are defined alongside them.

---

## Demo mode

Toggle from **Admin → Demo Mode** to make the app self-driving:

- Rotates the "current user" every **8 s** so dashboards cycle through all 25
  consultants live.
- Fires a sample notification + toast every **12 s** (badge, rank, record,
  challenge, streak).
- The guided walkthrough overlay can be launched independently for narrated
  demos, and sound effects can be toggled on for extra polish.

---

## Deployment

A static SPA. `npm run build` emits `dist/`. Both Netlify (`netlify.toml` +
`public/_redirects`) and Vercel (`vercel.json`) are configured to rewrite all
routes to `index.html` for client-side routing. A web manifest and service
worker (`public/sw.js`) make it installable as a PWA.

---

## From MVP to production

This repo is both the working MVP **and** the pitch package for a real build:

- `docs/PRODUCTION_MASTER_PROMPTS.md` — a sequenced 14-phase build spec for a
  Next.js + TypeScript + Postgres/Prisma + SSO (Azure AD/Okta) app, sourcing
  delivery data from the internal **Galileo** system of record behind a
  swappable adapter, with server-authoritative points and audited admin.
- `docs/QUESTIONS_FOR_IT.md` — the open access, data-mapping, identity, privacy
  and ops questions to resolve with IT before wiring Galileo.
- `Leyton-Arena-Pitch.pptx` / `scripts/build_pitch_deck.py` — the stakeholder
  pitch deck and the python-pptx generator that builds it.

Headline roadmap items (see the docs above for the full plan):

- **Galileo data sync** — replace `data/consultants.js` with an ingestion layer
  that materialises monthly stats + claim-stage events from Galileo (read-only).
- **Real auth & roles** — SSO so consultants see their own profile and managers
  get team-scoped admin controls.
- **Server-side everything** — challenges, duels, seasons, and the points/rewards
  economy persisted and transactional rather than in-memory.
- **Insights hardening** — replace hardcoded thresholds with per-role/office
  baselines and ship the end-of-quarter "spike" analysis that anchors the
  business case.

---

## License

Internal — not for distribution.
