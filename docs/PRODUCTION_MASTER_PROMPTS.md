# Leyton Arena — Production Master Prompts

A sequenced set of build prompts to replicate the MVP as a production
application on the company environment.

**Target stack:** Next.js (App Router, TypeScript) · PostgreSQL + Prisma ·
company SSO (Azure AD / Okta via NextAuth) · Galileo database as the system
of record · Tailwind CSS · TanStack Query + Zustand · Framer Motion.

**How to use:** Run the prompts **in order**. Each is self-contained, written
for a coding agent but readable as a spec. Each ends with **Acceptance
criteria** — do not proceed to the next phase until they pass. Phases 0–3 are
foundation; 4–12 are feature modules; 13–14 are insights and hardening.

> Replace every `<PLACEHOLDER>` before running. Keep the MVP repo open as the
> visual + behavioural reference — the goal is functional parity, not a
> pixel-diff.

---

## Canonical domain model (shared context — paste into every prompt)

```
Consultant
  id, fullName, email, role ('Technical'|'Financial'), office
  ('London'|'Casablanca'|'Dublin'|'Glasgow'|'Bristol'), seniority, joinedAt,
  managerId (nullable), avatarInitials

MonthlyStat  (one row per consultant per month)
  consultantId, month (YYYY-MM)
  opsDelivered:int, invoiceValue:int(£), invoiceBeforeDay15Pct:0-100,
  avgDaysToClose:float, clientRetentionFlags:int,
  pushedOps:int, pulledOps:int, latePushedOps:int   // planning discipline

ClaimStageEvent  (drives the daily-fire system)
  claimId, consultantId, clientName, fromStage, toStage, occurredAt
  Workflow stages (order):
    Handover completed → Overview completed → First Scoping →
    Scoping completed → Technical Report drafted → Technical Report reviewed →
    Costs Received → Assessment drafted → Assessment reviewed → Invoiced

FireStreak (derived) current:int, best:int, log[dateISO], todayIso
Badge  id, category, tier(1-5), name, icon, rarity
       (common|rare|epic|legendary|mythic), description, criteria
BadgeCategory  early-invoicing, streaks, revenue, volume, reviews, speed,
       championship, reliability, fire
BadgeAward  consultantId, badgeId, earnedAt(month)
Target  consultantId, month, opsTarget, invoiceTarget, earlyPctTarget
Duel  id, challengerId, opponentId, metric, startAt, endAt, stake(points),
      status, spectators[], winnerId
Reward id, name, category, cost(points), icon, stock
Redemption consultantId, rewardId, redeemedAt, status
Season id, name, startAt, endAt, leagueTier, standings[]
Notification id, consultantId, type, title, body, read, createdAt
```

Points economy: badges → points by rarity (common 10, rare 25, epic 60,
legendary 120, mythic 250). Duels stake/award points. Redemptions spend them.

---

## Phase 0 — Project foundation & architecture

```
You are building "Leyton Arena", a production gamification platform for R&D
tax consultants, replacing an existing React+Vite MVP. Set up the foundation.

Stack: Next.js 14+ (App Router, TypeScript, strict), Tailwind CSS, Prisma +
PostgreSQL, TanStack Query for server state, Zustand for ephemeral UI state,
Framer Motion for animation, lucide-react for icons, Vitest + Playwright.

Tasks:
1. Scaffold a Next.js App Router project in TypeScript strict mode. Configure
   ESLint + Prettier, absolute imports (@/*), and a CI-friendly `npm run
   verify` = typecheck + lint + test + build.
2. Establish the design system as CSS variables consumed by Tailwind:
   - Brand: orange #F75C03, amber #ffc800; accents teal #2DD4BF, blue #1cb0f6,
     purple #ce82ff, coral #ff4b4b, rose #ff5c8a.
   - Light theme is DEFAULT (warm cream #fdfaf4 surfaces). Dark theme via a
     [data-theme] attribute on <html>, toggled and persisted client-side.
     Use the rgb(var(--token) / <alpha-value>) pattern so opacity works.
   - Typography: a display font (heavy weights) + body font. Provide an
     `arena-card` and `arena-chip` utility matching the MVP.
3. Create the app shell: fixed left sidebar (desktop), top bar with search
   (⌘K), theme toggle, points balance pill, notification bell, profile + admin
   quick buttons; a mobile hamburger drawer. Route groups: (marketing) for
   landing/login, (app) for the authenticated product behind a guard.
4. Set up Prisma with the full schema from the "Canonical domain model" above.
   Generate migrations. Add a typed data-access layer in /server/repositories
   (no direct Prisma calls from components).
5. Add a seed script that recreates the MVP's mock dataset (25+ consultants,
   6 months of stats, badges, duels, rewards) so the app is demo-able before
   Galileo is connected.

Acceptance criteria:
- `npm run verify` passes. App boots to a themed shell with working light/dark.
- Prisma migrate + seed populate a local Postgres; a repository test reads a
  consultant back. Sidebar + top bar render and are responsive.
```

---

## Phase 1 — Authentication & SSO

```
Add company SSO to Leyton Arena using NextAuth (Auth.js).

Requirements:
- Provider: <Azure AD | Okta> via OIDC. Read tenant/client/secret from env
  (AUTH_<PROVIDER>_ID/SECRET/ISSUER). Never hardcode.
- On first sign-in, upsert a Consultant from the SSO profile (email is the
  join key to Galileo later). Store role/office if present in claims; else
  default and flag for admin completion.
- Middleware guards all (app) routes; unauthenticated users are redirected to
  a branded /login that shows a single "Sign in with <Provider>" button
  (mirrors the MVP login screen, minus the mock consultant picker).
- Session exposes { userId, consultantId, role, isManager, isAdmin }. Add
  role-based helpers: requireAuth(), requireManager(), requireAdmin().
- Keep a DEV_MOCK_AUTH=true escape hatch (only outside production) that logs in
  as a seeded consultant, so the team can work before IdP config lands.

Acceptance criteria:
- Signing in through the IdP creates/updates a Consultant and lands on Home.
- Hitting an (app) route while signed out redirects to /login.
- Manager/Admin-only server actions reject non-privileged sessions (tested).
```

---

## Phase 2 — Galileo data layer (real system of record)

```
Connect Leyton Arena to the Galileo database as the source of truth for
delivery data, behind a swappable adapter so the app never couples to Galileo
internals.

Requirements:
1. Define a DataSource interface in /server/datasource with methods the app
   needs: listConsultants(), getMonthlyStats(range), getStageEvents(range),
   getTargets(). Provide TWO implementations:
   - GalileoDataSource: reads from Galileo (<connection details / read-replica
     / API — confirm with IT>). Map Galileo entities → the canonical model.
     Read-only. Handle auth via service credentials from env.
   - SeedDataSource: reads the seeded Postgres (used in dev / until Galileo
     access is granted). Selected by env DATA_SOURCE=galileo|seed.
2. Build an ingestion job (scheduled, e.g. nightly + on-demand) that pulls from
   the active DataSource and materialises MonthlyStat + ClaimStageEvent into
   our Postgres. Gamification state (badges, points, duels) is always OURS,
   computed from ingested facts — Galileo stays read-only.
3. Derive the planning-discipline fields (pushedOps, pulledOps, latePushedOps)
   from Galileo claim date movements: a claim whose target-delivery month moves
   later = pushed; earlier = pulled; a push occurring in the final 5 days of
   the month = latePushed. Document the exact mapping with IT sign-off.
4. Add observability: row counts, last-sync timestamp, and a reconciliation
   report (Galileo totals vs ingested totals) surfaced in Admin.

Acceptance criteria:
- DATA_SOURCE=seed runs fully offline. DATA_SOURCE=galileo ingests a real
  window into Postgres with a reconciliation report and no write-back to
  Galileo. Adapter is unit-tested with a Galileo fixture.
```

---

## Phase 3 — Core compute engine (metrics, ranks, fire, badges)

```
Port the MVP's pure computation utilities to typed, tested server/shared
modules. These are the heart of the product — replicate their behaviour
exactly. Reference the MVP files named in each bullet.

1. rankings (computeRankings.js): aggregate MonthlyStats over a period
   (month|quarter|all), sort by metric (invoiceValue|opsDelivered|
   invoiceBeforeDay15Pct desc; avgDaysToClose asc), produce ranked rows with
   6-month sparklines, trend (up/down/flat vs prior period), and prior-period
   ranks for ▲/▼ deltas (buildPriorRanks). Include team totals.
2. fire streak: from ClaimStageEvents, compute current/best streak + a 14/30-
   day log. A day counts if ≥1 stage advance occurred. Timezone = company TZ.
3. badges (badges.js + badgeEligibility.js): the 9 categories and full ladder
   (5 tiers each, common→mythic) with the EXACT criteria from the MVP,
   including the progressive early-invoicing threshold ladder (40/50/60/70/80/
   90% before day 15) and reliability (consecutive zero-pushed-ops months).
   Compute earned badges + "closest to unlock" with progress.
4. records (computeRecords.js): all-time/leaderboard records + "under threat".
5. leagues/seasons (computeLeagues.js) and wrapped (computeWrapped.js).
6. planning discipline + coaching (coachingInsights.js): pushRate, pullRate,
   latePushRate, planningAccuracy, netMovement, momentum tag, letter grade,
   ranked strengths/weaknesses with confidence labels, recommendations tied to
   badge ladders, and the what-if projection. Plus the manager rollup
   (managerTrendsForTeam): segment by momentum, pushers/pullers lists,
   team planning accuracy, the curve (monthly invoice with quarter-end
   attribution), back-load contributors, office breakdown.

Each module: pure functions, no I/O, 100% unit-tested against fixtures ported
from the MVP so numbers match.

Acceptance criteria:
- Test suite reproduces the MVP's computed values for a seeded consultant
  (rank, fire, badge set, coaching grade, push/pull rates) within rounding.
```

---

## Phase 4 — Home dashboard

```
Build the Home page (reference MVP pages/Home.jsx). Authenticated landing
inside the app.

Include: greeting + today's date; three performance rings (invoice, ops,
early-invoice %) vs target for the current month; live monthly challenges
strip; head-to-head duels in flight; team activity feed (recent stage
advances, badge unlocks, records broken); "records under threat" teaser; a
fire-streak widget (click → 14-day breakdown modal). Data via TanStack Query
against server actions using the Phase 3 engine. Animate with Framer Motion,
skeleton loading states.

Acceptance criteria:
- Rings reflect real current-month stats vs targets; activity feed paginates;
  fire widget opens the 14-day modal; all data server-fetched, no client mock.
```

---

## Phase 5 — Leaderboard (+ Rankings)

```
Build the Leaderboard experience (reference pages/Leaderboard.jsx and
components/leaderboard/*).

Include: a "Your position" hero card (rank, value, gap to #1 and to next,
position delta); filter bar (period month|quarter|all, sort metric, office);
Table view AND Race view (toggle) — table has rank, consultant, office,
primary+secondary metric, 6-month sparkline, ▲/▼ move column, badge count;
race view is horizontal bars scaled to the leader. Top-3 Podium with medals,
crown on #1, position-delta chips, badge/fire footer, click-through to profile.
Metric cards for team totals. Smooth reorder animations (layout).

Acceptance criteria:
- Changing period/metric/office reorders live with correct deltas; both views
  render the same underlying rows; every row deep-links to the profile.
```

---

## Phase 6 — Profile (Overview + Coaching tabs)

```
Build the Profile page with two tabs (reference pages/Profile.jsx,
components/profile/*, components/profile/CoachingTab.jsx).

Overview tab: header (name/office/seniority/join date/lifetime totals);
performance rings vs team average + target; trend chart; activity heatmap;
rank summary with delta; personal insights; category progress; fire streak;
monthly-target streak; next badges; personal records; badge showcase (opens a
badge detail modal). A "Quick actions" strip linking Wrapped, Duels, Compare.
An admin/self "view as" consultant selector.

Coaching tab: headline grade + momentum; delivery-rhythm bar chart (6 months,
quarter-end highlighted, early-% line overlay); PLANNING DISCIPLINE card
(forecast pattern tag reliable|puller|pusher|last-week-pusher, planning
accuracy, pushed/pulled/late-week counts, push-vs-pull bar); ranked strengths
and "levers" with confidence pills; recommendations grid (effort+impact,
tied to badges); "what would change" projection. All from the Phase 3
coaching engine.

Acceptance criteria:
- Both tabs render real computed data; planning-discipline tag matches the
  engine; badge modal shows holders; "view as" respects permissions (a normal
  consultant can only view self unless manager/admin).
```

---

## Phase 7 — Achievements & Records

```
Build Achievements (reference pages/Achievements.jsx) and Records
(pages/Records.jsx).

Achievements: 9 category sections, each a 5-tier ladder common→mythic; earned
vs locked with progress bars; rarity legend; badge detail modal with criteria,
holders, and points value. Filter by category/rarity/earned.

Records: all-time leaderboard records per metric; current holder; "under
threat" indicators; personal-best callouts.

Acceptance criteria:
- Every badge from the registry renders in the right category/tier with correct
  rarity + points; locked badges show real progress; records reflect seeded/
  ingested data.
```

---

## Phase 8 — Rewards & points economy

```
Build Rewards (reference pages/Rewards.jsx, store/useRewardStore.js) as a REAL
transactional system (not localStorage).

Include: live points balance = earned (from badges by rarity) minus spent
(redemptions) plus/minus duel outcomes; a catalog of 34 rewards across tiers
(10–1000 pts) with stock; redeem flow that writes a Redemption, decrements
stock, and emits a notification; redemption history with status
(requested|approved|fulfilled). Server-authoritative balance (never trust the
client). Admin approval queue for redemptions.

Acceptance criteria:
- Balance is computed server-side and cannot go negative; redeeming persists,
  decrements stock, notifies, and appears in history; concurrent redeem is
  race-safe (transaction).
```

---

## Phase 9 — Duels & challenges

```
Build Duels (reference pages/Duels.jsx, store/useDuelStore.js,
store/useChallengeStore.js).

Include: create a 1:1 duel (pick metric, duration, stake points), invite an
opponent, optional spectators who can cheer; live progress bars from the
metric engine; resolution at endAt → winner takes the pot (points transfer),
notifications, and a Championship-badge check; monthly team challenges with
shared progress. All state server-persisted; points changes transactional.

Acceptance criteria:
- A duel runs end-to-end: create → accept → live progress → auto-resolve →
  points move → notification → badge check. Stakes can't exceed balance.
```

---

## Phase 10 — Seasons, leagues & Wrapped

```
Build Seasons/leagues (reference pages/Seasons.jsx, computeLeagues.js) and
Wrapped (pages/Wrapped.jsx, computeWrapped.js).

Seasons: quarter-long competitions with league tiers (Bronze→Silver→Gold→
Champion), standings, promotion/relegation at season close, trophy cabinet on
profile, countdown to close.

Wrapped: an end-of-quarter, Spotify-style recap — swipeable/animated cards of
hero stats, top moments, biggest wins; shareable. Generated per consultant
from the engine.

Acceptance criteria:
- Season standings compute from real data; closing a season snapshots results
  and applies promotion/relegation; Wrapped generates per consultant and is
  navigable.
```

---

## Phase 11 — Manager cockpit (Overview + Trends + Curve)

```
Build the Manager page with three tabs (reference pages/Manager.jsx,
components/manager/TrendsTab.jsx, CurveTab.jsx). Manager/admin only, scoped to
the manager's team (or all, for admins).

Overview: team KPI row; "On fire" vs "Needs attention" lists; office breakdown;
roster table. All drill through to profiles.

Trends: every team member segmented by momentum (Improving|Steady|Spiky|
Sliding) as filter chips; per-consultant cards with mini-metrics + trend
arrows, top strength, top risk, and a one-click "Nudge" that sends a coaching
prompt (Teams/Outlook) to the consultant.

The Curve: diagnosis card (team back-loaded share + quarter-end uplift);
monthly invoice trend chart with quarter-end highlights + early-% line;
PIPELINE DISCIPLINE panel with two columns — "Worst: pushes accounts" (ranked
by late-week share × push rate) and "Best: pulls work forward"; back-load
contributors; office breakdown with cadence-health bars.

Acceptance criteria:
- Data is team-scoped and permission-gated; momentum segments and push/pull
  rankings match the engine; "Nudge" sends a real message via the configured
  channel; managers cannot see teams they don't own.
```

---

## Phase 12 — Admin, notifications & integrations

```
Build Admin (reference pages/Admin.jsx), the notification system
(store/useNotificationStore.js, components/notifications/*), and outbound
integrations.

Admin: edit/override MonthlyStats fields (incl. pushed/pulled/latePushed) with
audit trail; manage targets; manage challenges; approve redemptions; manage
rewards catalog + stock; configure the Teams webhook; data-sync/reconciliation
dashboard from Phase 2; feature flags; demo mode.

Notifications: server-generated on badge unlocks, duel events, record breaks,
redemption status, season close, manager nudges; bell with unread count;
panel; optional email/Teams fan-out.

Integrations: Teams webhook (milestones, nudges); an outbound email adapter;
all secrets from env.

Acceptance criteria:
- Admin edits are audited and permission-gated; notifications generate on the
  listed events and mark read; Teams webhook posts a milestone in a test.
```

---

## Phase 13 — Insights hardening & the "why the spike" analysis

```
Elevate the insights engine from heuristics toward a defensible analytical
layer now that real Galileo history is available.

1. Replace hardcoded thresholds with configurable, per-role/office baselines
   computed from the actual distribution (percentiles), so "fast closer" etc.
   are relative to real peers.
2. Add the org-level spike analysis: decompose the end-of-month and end-of-
   quarter invoicing spike by office, role, seniority, and claim type; quantify
   how much of the last-week volume each consultant contributes; surface the
   biggest levers. This is the analysis that justified the project — make it a
   first-class Manager/Admin report with export.
3. Keep every insight labelled with confidence and the data window it used.
   Log which heuristics fire most so the strongest can later graduate to a
   learned model. Do NOT ship a black-box model yet — explainability first.

Acceptance criteria:
- Baselines recompute from real data; the spike report attributes last-week
  volume to consultants/offices and exports; every insight cites its window +
  confidence.
```

---

## Phase 14 — Production hardening

```
Make Leyton Arena production-ready on the company environment.

- Security: authz on every server action (owner/manager/admin), input
  validation (zod), rate limiting, audit logging, secrets in the company
  vault, CSP + security headers, dependency scanning. Data-privacy review of
  what consultant data is displayed and to whom.
- Performance: cache expensive rollups (leaderboard, manager) with sane
  invalidation on ingest; paginate lists; image/font optimisation; Lighthouse
  budget in CI.
- Reliability: health checks, structured logging, error tracking (Sentry or
  company standard), the nightly ingest as a monitored job with alerting on
  reconciliation drift.
- Accessibility: keyboard nav, focus management, ARIA, prefers-reduced-motion,
  colour-contrast in both themes.
- CI/CD: pipeline running `npm run verify` + e2e (Playwright) on PR; deploy to
  the company environment (<platform>); DB migration strategy; staging +
  production with seeded/real data separation.
- Docs: architecture overview, data-flow (Galileo → ingest → compute → UI),
  runbooks, onboarding.

Acceptance criteria:
- CI green (typecheck/lint/unit/e2e/build); staging deploy reachable behind
  SSO; ingest job monitored; a11y + Lighthouse budgets met; security checklist
  signed off.
```

---

## Suggested sequencing & parallelism

- **Critical path:** 0 → 1 → 2 → 3, then 4/5/6 can parallelise once the engine
  (3) is stable.
- **Parallelisable after Phase 3:** 7, 8, 9, 10 are largely independent.
- **Depends on multiple modules:** 11 (Manager) needs 3 + points/duels; 13
  needs real Galileo data (2) + engine (3).
- **Always last:** 14.

## Definition of done (whole app)

Functional parity with the MVP (every page + interaction listed above), running
on real SSO and Galileo-sourced data, with server-authoritative points, audited
admin, monitored ingestion, and the spike-analysis report that anchors the
business case.
```
