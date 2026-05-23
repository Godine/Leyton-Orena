# Leyton Arena

A gamified internal leaderboard for R&D tax consultants. Duolingo-style
energy applied to delivery metrics: streaks, badges, podiums, all-time
records, monthly quests, and notifications — all running on mock data so
the MVP can ship and be demoed before any backend integration lands.

> Status: client-side MVP. No auth, no API. Everything is rendered from
> in-memory mock data in a Zustand store.

---

## Quick start

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Requires Node ≥ 18. Tested on Node 22.

---

## Tech stack

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| Framework      | React 18 + Vite 5                                   |
| Styling        | Tailwind CSS 3 with a custom dark theme            |
| State          | Zustand (one store per domain: arena, notifs, quests) |
| Routing        | react-router-dom v6, lazy-loaded routes             |
| Animation      | framer-motion (page transitions, podium, unlocks)   |
| Icons          | lucide-react (+ emojis for badges/records)          |
| Fonts          | Nunito (display) + DM Sans (body) via Google Fonts  |

---

## Feature overview

| Page           | What it does                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Home** `/`             | Welcome line, quick stats with rings, active challenges, team activity feed, records-under-threat widget.                       |
| **Leaderboard** `/leaderboard` | Podium (2 · 1 · 3, 1st elevated + crowned, sparklines), team metric cards, ranked table that smoothly reorders on filter change, period / sort / location filters. |
| **Achievements** `/achievements` | 14-badge gallery with rarity tiers, unlock-burst animation for newly earned badges, badge detail modal with progress and holders, progress summary at top. |
| **Records** `/records`           | Hall of Fame of 10 all-time records grouped by category. "Under Threat" alerts when a runner-up is within 15% of the holder.   |
| **Profile** `/profile`           | Personal stats page with consultant selector ("view as"), progress rings, 6-month trend chart, streak flame, badge showcase, rank summary. |
| **Admin** `/admin`               | Editable consultant stats table, monthly challenge editor, demo-mode toggle, walkthrough launcher, reset/trigger buttons.     |

Cross-cutting features:

- **Notifications** — bell in the top bar with unread badge, a dropdown panel, and bottom-right toasts for new events.
- **Monthly challenges** — Duolingo-style quest cards with live per-user progress, days-left, and reward badges (with confetti on completion).
- **Demo Mode** — when toggled on from `/admin`, the app rotates the active consultant every 8s and fires sample toasts every 12s so the dashboards stay alive during a presentation.
- **Guided walkthrough** — 6-step overlay launched from `/admin`, useful for first-time stakeholder demos.
- **Page transitions, error boundary, lazy routes, skeleton fallback** — production-friendly polish.

### Screenshots

> _Placeholders — drop screenshots into `docs/screenshots/` and link them here._
>
> ![Home](docs/screenshots/home.png)
> ![Leaderboard](docs/screenshots/leaderboard.png)
> ![Achievements](docs/screenshots/achievements.png)
> ![Records](docs/screenshots/records.png)
> ![Profile](docs/screenshots/profile.png)
> ![Admin](docs/screenshots/admin.png)

---

## Project layout

```
src/
├── App.jsx, main.jsx
├── components/
│   ├── achievements/   # BadgeGrid, BadgeCard, BadgeDetailModal, UnlockAnimation, ProgressSummary
│   ├── admin/          # DemoModeDriver, WalkthroughOverlay
│   ├── home/           # WelcomeHeader, QuickStats, ChallengesPanel, ActivityFeed
│   ├── layout/         # AppShell, Sidebar, BottomTabs, TopBar, RoleSwitcher
│   ├── leaderboard/    # Podium, LeaderboardTable, MetricCards, SparkLine
│   ├── notifications/  # NotificationBell, NotificationPanel, Toast
│   ├── profile/        # ProfileHeader, PerformanceRings, TrendChart, BadgeShowcase, StreakDisplay
│   ├── records/        # RecordCard, ThreatAlert
│   └── shared/         # ProgressRing, AnimatedCounter, LocationPill, TrendArrow, SkeletonLoader, ErrorBoundary
├── data/
│   ├── badges.js       # 14-badge registry with rarity styling
│   └── consultants.js  # 16 mock consultants × 6 months of stats
├── pages/              # Home, Leaderboard, Achievements, Records, Profile, Admin
├── store/
│   ├── useArenaStore.js        # consultants, badges, role view, current user, demo mode
│   ├── useNotificationStore.js # notifications + toast state
│   └── useChallengeStore.js    # active monthly challenges
├── utils/
│   ├── computeRankings.js  # leaderboard aggregation + trend
│   ├── computeRecords.js   # all-time records + threat detection
│   ├── badgeEligibility.js # heuristic progress toward locked badges
│   └── formatters.js       # currency / pct / days / location codes
└── styles/index.css        # Tailwind layers + theme tokens + reduced-motion
```

---

## Data structures

### Consultant

```js
{
  id: "c-01",
  name: "Amélie Laurent",
  role: "Technical",                // "Technical" | "Financial"
  location: "London",               // "London" | "Casablanca" | "Dublin"
  badges: ["lab-rat", "front-loader", ...],
  badgeEarnedAt: { "lab-rat": "2024-11", ... },
  streaks: { currentMonthlyStreak: 5, bestMonthlyStreak: 6 },
  monthlyStats: [
    {
      month: "2025-03",
      opsDelivered: 11,
      invoiceValue: 98000,
      invoiceBeforeDay15Pct: 83,
      clientRetentionFlags: 0,
      avgDaysToClose: 2.7,
      pushedOps: 0,
    },
    // ...6 months total
  ],
}
```

### Badge

```js
{
  id: "front-loader",
  name: "Front-Loader",
  icon: "⚡",
  rarity: "rare",                   // "common" | "rare" | "epic" | "legendary"
  description: "Raised 80%+ of monthly invoice value before day 15.",
  criteria: "invoiceBeforeDay15Pct ≥ 80 in a single month.",
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

---

## Theme tokens

Defined in `tailwind.config.js`:

| Token            | Hex       | Used for                              |
| ---------------- | --------- | ------------------------------------- |
| `arena-bg`       | `#1a1a2e` | App background                        |
| `arena-surface`  | `#22223d` | Card surfaces                         |
| `arena-card`     | `#1e2a47` | Gradient card base                    |
| `accent-green`   | `#58cc02` | Primary positive accent (Duolingo green) |
| `accent-amber`   | `#ffc800` | Records, legendary, peak callouts     |
| `accent-coral`   | `#ff4b4b` | Streaks, negative trend, under-threat |
| `accent-blue`    | `#1cb0f6` | Rare rarity, team challenges          |
| `accent-purple`  | `#ce82ff` | Epic rarity                           |
| `location-*`     | various   | Location pills                        |

---

## Demo mode

Toggle from **Admin → Demo Mode** to make the app self-driving:

- Rotates the "current user" every **8 s** so the Profile page cycles
  through all 16 consultants live.
- Fires a sample notification + toast every **12 s** (badge, rank,
  record, challenge, streak).
- The walkthrough overlay can be launched independently for narrated demos.

---

## Roadmap

- **Odoo / data sync** — replace `data/consultants.js` with a thin
  fetch layer that calls the internal Odoo XML-RPC bridge nightly.
- **Real auth & roles** — SSO so consultants only see their own profile;
  team leads see admin controls.
- **Server-side challenges** — define monthly quests in a CMS or admin
  panel rather than in code.
- **Push notifications** — wire `addNotification` to a service-worker
  channel for real-time badge unlocks and record threats.
- **Mobile app** — wrap the existing React shell with Capacitor for
  iOS/Android, or port to React Native for native feel.
- **Historical depth** — extend `monthlyStats` beyond six months and
  add year-over-year comparisons on the Profile page.
- **Per-team leagues** — promote/relegate consultants by location or
  practice area, Duolingo-style.

---

## License

Internal — not for distribution.
