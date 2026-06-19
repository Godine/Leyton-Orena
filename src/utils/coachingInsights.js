// Heuristic coaching engine. No ML, no real data — just a handful of rules
// over what's already in the seed: 6 months of opsDelivered, invoiceValue,
// invoiceBeforeDay15Pct, avgDaysToClose, clientRetentionFlags, pushedOps,
// plus the fire streak log. Returns a structured bundle the UI can render.
//
// Every insight carries a confidence label. The goal is honest signals, not
// false precision: when we only have 6 months of data we say so.

const QUARTER_END_MONTHS = new Set([3, 6, 9, 12]) // Mar Jun Sep Dec

// Simple linear regression on (i, y) pairs → slope, normalised by mean.
function trendSlope(values) {
  const n = values.length
  if (n < 2) return 0
  const xs = values.map((_, i) => i)
  const xMean = xs.reduce((a, b) => a + b, 0) / n
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean)
    den += (xs[i] - xMean) ** 2
  }
  const slope = den ? num / den : 0
  return yMean ? slope / yMean : 0 // % change per period vs mean
}

// Coefficient of variation — std/mean. 0 means perfectly steady.
function cv(values) {
  if (!values.length) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (!mean) return 0
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  return Math.sqrt(variance) / mean
}

function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0 }

function quartile(values, q) {
  const s = [...values].sort((a, b) => a - b)
  const i = Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))
  return s[i]
}

function pctRank(value, peerValues, betterWhenHigher = true) {
  if (!peerValues.length) return 0.5
  const below = peerValues.filter((v) => betterWhenHigher ? v < value : v > value).length
  return below / peerValues.length
}

function confidenceLabel(strength) {
  if (strength >= 0.75) return { tone: 'high',   label: 'High confidence' }
  if (strength >= 0.45) return { tone: 'medium', label: 'Medium confidence' }
  return { tone: 'low', label: 'Early signal' }
}

// ─── Core: per-consultant bundle ────────────────────────────────────────────
export function coachingInsights(consultant, allConsultants, sortedMonths) {
  const peers = allConsultants.filter((c) => c.role === consultant.role && c.id !== consultant.id)
  const stats = consultant.monthlyStats
  const last6 = sortedMonths.slice(-6)
  const window = stats.filter((s) => last6.includes(s.month))

  const ops    = window.map((s) => s.opsDelivered)
  const inv    = window.map((s) => s.invoiceValue)
  const front  = window.map((s) => s.invoiceBeforeDay15Pct)
  const close  = window.map((s) => s.avgDaysToClose)
  const pushed = window.map((s) => s.pushedOps ?? 0)
  const pulled = window.map((s) => s.pulledOps ?? 0)
  const latePushed = window.map((s) => s.latePushedOps ?? 0)
  const flags  = window.map((s) => s.clientRetentionFlags ?? 0)

  // Planning discipline — accuracy + push/pull behaviour.
  // planned = ops actually delivered + ops that slipped (pushed) — what they
  // committed to. Pulled ops are over-delivery from a future commitment.
  const planned = ops.map((o, i) => o + pushed[i])
  const plannedTotal = planned.reduce((a, b) => a + b, 0)
  const pushedTotal = pushed.reduce((a, b) => a + b, 0)
  const pulledTotal = pulled.reduce((a, b) => a + b, 0)
  const latePushedTotal = latePushed.reduce((a, b) => a + b, 0)
  const pushRate     = plannedTotal ? pushedTotal     / plannedTotal : 0
  const pullRate     = plannedTotal ? pulledTotal     / plannedTotal : 0
  const latePushRate = pushedTotal  ? latePushedTotal / pushedTotal  : 0
  const planningAccuracy = 1 - pushRate

  // Per-consultant facts
  const facts = {
    avgOps:        mean(ops),
    avgInv:        mean(inv),
    avgFront:      mean(front),
    avgClose:      mean(close),
    avgPushed:     mean(pushed),
    avgPulled:     mean(pulled),
    avgLatePushed: mean(latePushed),
    avgFlags:      mean(flags),
    cvOps:         cv(ops),
    cvFront:       cv(front),
    slopeOps:      trendSlope(ops),
    slopeInv:      trendSlope(inv),
    slopeFront:    trendSlope(front),
    slopeClose:    trendSlope(close),
    slopePushed:   trendSlope(pushed),
    slopePulled:   trendSlope(pulled),
    pushRate,
    pullRate,
    latePushRate,
    planningAccuracy,
    netMovement:   pulledTotal - pushedTotal, // positive = net pulled forward
    bestMonth:     window.reduce((m, s) => (s.invoiceValue > (m?.invoiceValue ?? -1) ? s : m), null),
    worstMonth:    window.reduce((m, s) => (s.invoiceValue < (m?.invoiceValue ?? Infinity) ? s : m), null),
    currentStreak: consultant.fire?.current ?? 0,
    bestStreak:    consultant.fire?.best ?? 0,
    monthlyStreak: consultant.streaks?.currentMonthlyStreak ?? 0,
  }

  // Peer percentiles within same role
  const peerStats = peers.map((p) => {
    const s = p.monthlyStats.filter((m) => last6.includes(m.month))
    const pPlanned = s.reduce((a, b) => a + b.opsDelivered + (b.pushedOps ?? 0), 0)
    const pPushed  = s.reduce((a, b) => a + (b.pushedOps ?? 0), 0)
    const pPulled  = s.reduce((a, b) => a + (b.pulledOps ?? 0), 0)
    return {
      avgFront: mean(s.map((x) => x.invoiceBeforeDay15Pct)),
      avgClose: mean(s.map((x) => x.avgDaysToClose)),
      avgOps:   mean(s.map((x) => x.opsDelivered)),
      avgInv:   mean(s.map((x) => x.invoiceValue)),
      cvOps:    cv(s.map((x) => x.opsDelivered)),
      pushRate: pPlanned ? pPushed / pPlanned : 0,
      pullRate: pPlanned ? pPulled / pPlanned : 0,
      planning: pPlanned ? 1 - (pPushed / pPlanned) : 1,
    }
  })

  const rk = {
    front:    pctRank(facts.avgFront,          peerStats.map((p) => p.avgFront), true),
    close:    pctRank(facts.avgClose,          peerStats.map((p) => p.avgClose), false),
    ops:      pctRank(facts.avgOps,            peerStats.map((p) => p.avgOps),   true),
    inv:      pctRank(facts.avgInv,            peerStats.map((p) => p.avgInv),   true),
    cvOps:    pctRank(facts.cvOps,             peerStats.map((p) => p.cvOps),    false),
    push:     pctRank(facts.pushRate,          peerStats.map((p) => p.pushRate), false),
    pull:     pctRank(facts.pullRate,          peerStats.map((p) => p.pullRate), true),
    planning: pctRank(facts.planningAccuracy,  peerStats.map((p) => p.planning), true),
  }

  // ─── Rule book → strengths / weaknesses / recommendations ──────────────
  const STRENGTH_RULES = [
    {
      when: rk.front >= 0.7,
      icon: 'zap',
      title: 'Front-loader',
      detail: `Invoicing ${Math.round(facts.avgFront)}% by day 15 — top ${Math.round((1 - rk.front) * 100)}% of ${consultant.role.toLowerCase()} consultants.`,
      strength: rk.front,
    },
    {
      when: rk.close >= 0.7,
      icon: 'gauge',
      title: 'Fast closer',
      detail: `Avg ${facts.avgClose.toFixed(1)} days handover → invoice. Faster than ${Math.round(rk.close * 100)}% of peers.`,
      strength: rk.close,
    },
    {
      when: facts.slopeOps > 0.05,
      icon: 'trending-up',
      title: 'Trending up',
      detail: `Ops delivered is climbing ~${Math.round(facts.slopeOps * 100)}% per month over the last ${window.length}.`,
      strength: Math.min(1, facts.slopeOps * 6),
    },
    {
      when: rk.cvOps >= 0.7,
      icon: 'check-circle',
      title: 'Consistent cadence',
      detail: `Month-to-month variance is lower than ${Math.round(rk.cvOps * 100)}% of peers. Reliability badge in reach.`,
      strength: rk.cvOps,
    },
    {
      when: facts.currentStreak >= 7,
      icon: 'flame',
      title: 'On fire',
      detail: `${facts.currentStreak}-day fire streak. Keep it alive for the next streak badge.`,
      strength: Math.min(1, facts.currentStreak / 30),
    },
    {
      when: facts.avgFlags < 0.5,
      icon: 'shield',
      title: 'Trusted by clients',
      detail: `Less than 0.5 retention flags per month on average — clients keep coming back.`,
      strength: 0.7,
    },
    {
      when: facts.planningAccuracy >= 0.9 && rk.planning >= 0.65,
      icon: 'target',
      title: 'Reliable forecaster',
      detail: `Planning accuracy ${Math.round(facts.planningAccuracy * 100)}% — what you commit to ships. Top ${Math.round((1 - rk.planning) * 100)}% of peers.`,
      strength: Math.min(1, facts.planningAccuracy),
    },
    {
      when: facts.pullRate >= 0.1 && facts.netMovement > 0,
      icon: 'pull-forward',
      title: 'Pulls work forward',
      detail: `Pulled ${pulledTotal} claim${pulledTotal === 1 ? '' : 's'} forward from future months and net delivered ahead of plan. ` +
              `That's how you build buffer for crunch.`,
      strength: Math.min(1, facts.pullRate * 2.5),
    },
  ]

  const WEAKNESS_RULES = [
    {
      when: facts.avgFront < 50,
      icon: 'calendar',
      title: 'Back-loaded month',
      detail: `Only ${Math.round(facts.avgFront)}% of value invoiced before day 15. Most work ships in the second half — that's the spike.`,
      severity: (50 - facts.avgFront) / 50,
    },
    {
      when: facts.cvOps > 0.35,
      icon: 'wave',
      title: 'Spiky cadence',
      detail: `Monthly variance is high (CV ${facts.cvOps.toFixed(2)}). Big months follow quiet ones — invoicing forecast is hard.`,
      severity: Math.min(1, (facts.cvOps - 0.3) * 2),
    },
    {
      when: facts.avgClose > 5,
      icon: 'clock',
      title: 'Slow to close',
      detail: `Avg ${facts.avgClose.toFixed(1)} days from handover to invoice. Batching closes is delaying cash and breaking pacing.`,
      severity: Math.min(1, (facts.avgClose - 5) / 5),
    },
    {
      when: facts.slopeOps < -0.04,
      icon: 'trending-down',
      title: 'Drifting down',
      detail: `Ops delivered is slipping ~${Math.round(Math.abs(facts.slopeOps) * 100)}% per month. Reverse it before it becomes a habit.`,
      severity: Math.min(1, Math.abs(facts.slopeOps) * 8),
    },
    {
      when: facts.avgPushed > 1,
      icon: 'redo',
      title: 'Frequent rework',
      detail: `~${facts.avgPushed.toFixed(1)} pushed ops per month. Quality at first pass would unlock speed downstream.`,
      severity: Math.min(1, (facts.avgPushed - 1) / 2),
    },
    {
      when: facts.currentStreak === 0 && facts.bestStreak > 0,
      icon: 'flame-off',
      title: 'Broken streak',
      detail: `Fire is at 0 (best was ${facts.bestStreak}). One advance today restarts it.`,
      severity: 0.6,
    },
    {
      when: facts.latePushRate > 0.4 && facts.avgLatePushed >= 0.5,
      // The pattern the user called "the worst type": pushing accounts
      // from this month into next in the final week.
      icon: 'push-late',
      title: 'Last-week pusher',
      detail: `~${Math.round(facts.latePushRate * 100)}% of your pushes happen in the final week of the month. ` +
              `That's the worst signal — work was committed, then quietly slipped at the wire. Surface risks earlier.`,
      severity: Math.min(1, facts.latePushRate + 0.2),
    },
    {
      when: facts.pushRate > 0.18,
      icon: 'push',
      title: 'Pushes accounts',
      detail: `${Math.round(facts.pushRate * 100)}% of committed ops slip into a later month on average. ` +
              `Forecast accuracy is ${Math.round(facts.planningAccuracy * 100)}% — finance can't plan around that.`,
      severity: Math.min(1, facts.pushRate * 3),
    },
  ]

  const strengths = STRENGTH_RULES
    .filter((r) => r.when)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((r) => ({ ...r, confidence: confidenceLabel(r.strength) }))

  const weaknesses = WEAKNESS_RULES
    .filter((r) => r.when)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3)
    .map((r) => ({ ...r, confidence: confidenceLabel(r.severity) }))

  // ─── Actionable recommendations ────────────────────────────────────────
  const recs = []

  if (facts.avgFront < 60) {
    const target = Math.min(85, Math.round(facts.avgFront + 15))
    const liftPct = Math.round(((target - facts.avgFront) / Math.max(facts.avgFront, 1)) * 100)
    recs.push({
      priority: 'high',
      icon: 'calendar',
      title: 'Ship one claim by day 10',
      body: `Lift early-invoice % from ${Math.round(facts.avgFront)}% to ${target}% by closing one claim in the first week. ` +
            `That's ${liftPct}% lift and a tier-up on the Early Invoicing ladder.`,
      effort: 'Low effort · 1 claim/month',
      impact: 'High · flattens cadence',
    })
  }
  if (facts.avgClose > 4.5) {
    const newClose = Math.max(2.5, facts.avgClose - 1.5)
    const extraOps = Math.round((facts.avgOps * (facts.avgClose - newClose) / facts.avgClose) * 0.6) + 1
    recs.push({
      priority: 'high',
      icon: 'clock',
      title: 'Close one claim per week instead of batching',
      body: `Trim avg days-to-close from ${facts.avgClose.toFixed(1)}d to ${newClose.toFixed(1)}d. ` +
            `At your current pace that frees roughly +${extraOps} ops a month — and pushes you toward the Speed-to-Cash badge.`,
      effort: 'Medium · habit change',
      impact: 'High · revenue + badge',
    })
  }
  if (facts.cvOps > 0.35) {
    recs.push({
      priority: 'medium',
      icon: 'wave',
      title: 'Pick a weekly cadence — same time, same day',
      body: `Your big months follow quiet ones. A Friday cadence ("close one claim before EOW") smooths the line ` +
            `and unlocks the Consistent Cadence tier.`,
      effort: 'Low · calendar block',
      impact: 'Medium · fewer surprises',
    })
  }
  if (facts.avgPushed > 1.2) {
    recs.push({
      priority: 'medium',
      icon: 'redo',
      title: 'Add a same-week tech-report review',
      body: `Quality-at-first-pass reduces rework. Review reports within 5 days of drafting and pushed ops drops to <1/month.`,
      effort: 'Low · 30 min/week',
      impact: 'Medium · quality badge',
    })
  }
  if (facts.currentStreak === 0) {
    recs.push({
      priority: 'high',
      icon: 'flame',
      title: 'Light the fire today',
      body: `Advance any claim by one stage to restart your fire. Best streak was ${facts.bestStreak} — you can do better.`,
      effort: 'Tiny · today',
      impact: 'High · momentum',
    })
  }
  if (facts.latePushRate > 0.4 || facts.pushRate > 0.18) {
    recs.push({
      priority: 'high',
      icon: 'push-late',
      title: 'Tuesday risk checkpoint',
      body: `Every Tuesday, flag any committed claim at risk for the month. Push early, never in the final week. ` +
            `Lifts planning accuracy from ${Math.round(facts.planningAccuracy * 100)}% — and finance starts trusting your forecast.`,
      effort: 'Low · 5 min/week',
      impact: 'High · forecast trust',
    })
  }
  if (facts.pullRate < 0.05 && facts.cvOps < 0.35 && facts.planningAccuracy > 0.85) {
    recs.push({
      priority: 'medium',
      icon: 'pull-forward',
      title: 'Pull one claim forward',
      body: `Plan is solid — there's room to over-deliver. Pull one claim from next month to land it early. ` +
            `Builds buffer for crunch and unlocks the Pull-forward tier.`,
      effort: 'Medium · pipeline review',
      impact: 'High · buffer + badge',
    })
  }
  if (facts.slopeFront < -0.04 && facts.avgFront >= 55) {
    recs.push({
      priority: 'medium',
      icon: 'calendar',
      title: 'Protect your front-loading habit',
      body: `Front-loading has slipped over the last few months. Pin one claim a week to day-10 to hold the line.`,
      effort: 'Low · routine',
      impact: 'Medium · cadence',
    })
  }
  if (!recs.length) {
    recs.push({
      priority: 'low',
      icon: 'sparkles',
      title: 'Reach for a Mythic',
      body: `Strong across the board. Pick the rarest badge on your ladder and chase it next month — that's the next level.`,
      effort: 'Stretch',
      impact: 'Status',
    })
  }

  // ─── "What-if" projection ──────────────────────────────────────────────
  const projection = (() => {
    const closeDelta = Math.min(2, Math.max(0, facts.avgClose - 3))
    const newClose = Math.max(2.5, facts.avgClose - closeDelta)
    const liftOps = Math.round((facts.avgOps * (closeDelta / Math.max(facts.avgClose, 1))) * 0.5)
    const liftInvK = Math.round((facts.avgInv * (closeDelta / Math.max(facts.avgClose, 1))) * 0.5 / 1000)
    const frontTarget = Math.min(85, Math.round(facts.avgFront + 15))
    return {
      closeDelta:  closeDelta.toFixed(1),
      newClose:    newClose.toFixed(1),
      liftOps,
      liftInvK,
      frontTarget,
      currentFront: Math.round(facts.avgFront),
    }
  })()

  // ─── Delivery rhythm (six months of normalised invoiceValue) ───────────
  const rhythm = window.map((s, i) => ({
    month: s.month,
    ops: s.opsDelivered,
    inv: s.invoiceValue,
    front: s.invoiceBeforeDay15Pct,
    close: s.avgDaysToClose,
    quarterEnd: QUARTER_END_MONTHS.has(Number(s.month.split('-')[1])),
  }))

  // Momentum tag for the headline
  const momentum =
    facts.slopeOps > 0.06 || facts.slopeInv > 0.06   ? 'improving'
    : facts.slopeOps < -0.06 || facts.slopeInv < -0.06 ? 'sliding'
    : facts.cvOps > 0.35                              ? 'spiky'
    : 'steady'

  // Headline grade — planning discipline now part of the rubric.
  const grade =
    rk.inv >= 0.75 && rk.front >= 0.6 && facts.cvOps < 0.3 && facts.planningAccuracy >= 0.9 ? 'A'
    : rk.inv >= 0.5 && rk.front >= 0.5 && facts.planningAccuracy >= 0.8                     ? 'B'
    : rk.inv >= 0.3 && facts.latePushRate < 0.5                                              ? 'C'
    :                                                                                         'D'

  // Planning discipline tag — one of four states the UI can theme on.
  const planningTag =
    facts.latePushRate > 0.4 && facts.avgLatePushed >= 0.5 ? 'last-week-pusher'
    : facts.pushRate > 0.18                                ? 'pusher'
    : facts.pullRate >= 0.1 && facts.netMovement > 0       ? 'puller'
    :                                                        'reliable'

  return {
    consultant,
    facts, rk, rhythm, projection,
    momentum, grade, planningTag,
    strengths, weaknesses, recs,
  }
}

// ─── Manager-side bundle ────────────────────────────────────────────────────
// Per-consultant momentum + risk, plus team-wide cadence diagnosis.
export function managerTrendsForTeam(consultants, sortedMonths, roleFilter = 'All') {
  const pool = consultants.filter((c) => roleFilter === 'All' || c.role === roleFilter)
  const rows = pool.map((c) => {
    const i = coachingInsights(c, consultants, sortedMonths)
    return {
      consultant: c,
      momentum: i.momentum,
      grade: i.grade,
      planningTag: i.planningTag,
      facts: i.facts,
      topStrength: i.strengths[0] ?? null,
      topRisk: i.weaknesses[0] ?? null,
      slopeOps: i.facts.slopeOps,
      slopeInv: i.facts.slopeInv,
      cvOps: i.facts.cvOps,
      avgFront: i.facts.avgFront,
      avgClose: i.facts.avgClose,
      currentStreak: i.facts.currentStreak,
      pushRate: i.facts.pushRate,
      pullRate: i.facts.pullRate,
      latePushRate: i.facts.latePushRate,
      planningAccuracy: i.facts.planningAccuracy,
      netMovement: i.facts.netMovement,
      // single-number health for sorting
      health: i.rk.inv * 0.35 + i.rk.front * 0.25 + i.rk.cvOps * 0.15 + i.rk.planning * 0.15 + (i.facts.currentStreak >= 7 ? 0.1 : 0),
    }
  })

  const improving = rows.filter((r) => r.momentum === 'improving').sort((a, b) => b.slopeOps - a.slopeOps)
  const sliding   = rows.filter((r) => r.momentum === 'sliding').sort((a, b) => a.slopeOps - b.slopeOps)
  const spiky     = rows.filter((r) => r.momentum === 'spiky').sort((a, b) => b.cvOps - a.cvOps)
  const steady    = rows.filter((r) => r.momentum === 'steady').sort((a, b) => b.health - a.health)

  // ─── The Curve: monthly aggregates with quarter-end attribution ──────
  const months = sortedMonths.slice(-6)
  const curve = months.map((m) => {
    const mStats = pool.flatMap((c) => c.monthlyStats.filter((s) => s.month === m))
    const inv = mStats.reduce((a, b) => a + b.invoiceValue, 0)
    const front = mStats.length ? mStats.reduce((a, b) => a + b.invoiceBeforeDay15Pct, 0) / mStats.length : 0
    const close = mStats.length ? mStats.reduce((a, b) => a + b.avgDaysToClose, 0) / mStats.length : 0
    const ops = mStats.reduce((a, b) => a + b.opsDelivered, 0)
    const mNum = Number(m.split('-')[1])
    return {
      month: m,
      inv, front, close, ops,
      quarterEnd: QUARTER_END_MONTHS.has(mNum),
      backLoadedShare: Math.round(100 - front), // % of value shipped after day 15
    }
  })

  // Top contributors to back-loaded volume (low front-load % × big invoice)
  const backLoadContrib = pool
    .map((c) => {
      const last = c.monthlyStats[c.monthlyStats.length - 1]
      if (!last) return null
      const backValue = (last.invoiceValue * (100 - last.invoiceBeforeDay15Pct)) / 100
      return { consultant: c, backValue, frontPct: last.invoiceBeforeDay15Pct, latest: last }
    })
    .filter(Boolean)
    .sort((a, b) => b.backValue - a.backValue)
    .slice(0, 6)

  // Quarter-end pattern: compare avgInv in qEnd months vs others
  const qEndMonths = curve.filter((c) => c.quarterEnd)
  const nonQEnd = curve.filter((c) => !c.quarterEnd)
  const qEndAvg = qEndMonths.length ? qEndMonths.reduce((a, b) => a + b.inv, 0) / qEndMonths.length : 0
  const nonQEndAvg = nonQEnd.length ? nonQEnd.reduce((a, b) => a + b.inv, 0) / nonQEnd.length : 0
  const quarterUplift = nonQEndAvg ? Math.round(((qEndAvg - nonQEndAvg) / nonQEndAvg) * 100) : 0

  // Officewise rollup
  const byLocation = {}
  pool.forEach((c) => {
    const last = c.monthlyStats[c.monthlyStats.length - 1]
    if (!last) return
    const loc = c.location || 'Other'
    if (!byLocation[loc]) byLocation[loc] = { name: loc, headcount: 0, inv: 0, frontSum: 0, closeSum: 0 }
    byLocation[loc].headcount += 1
    byLocation[loc].inv += last.invoiceValue
    byLocation[loc].frontSum += last.invoiceBeforeDay15Pct
    byLocation[loc].closeSum += last.avgDaysToClose
  })
  const officeRows = Object.values(byLocation).map((o) => ({
    ...o,
    avgFront: o.frontSum / o.headcount,
    avgClose: o.closeSum / o.headcount,
  })).sort((a, b) => b.inv - a.inv)

  // Pipeline discipline — top pushers (worst) and top pullers (best). Rank
  // pushers by latePushRate first (the "worst type") then total pushRate.
  const pushers = [...rows]
    .filter((r) => r.pushRate > 0.08 || r.latePushRate > 0.2)
    .sort((a, b) => (b.latePushRate * 0.6 + b.pushRate * 0.4) - (a.latePushRate * 0.6 + a.pushRate * 0.4))
    .slice(0, 6)
  const pullers = [...rows]
    .filter((r) => r.netMovement > 0 && r.pullRate >= 0.08)
    .sort((a, b) => (b.pullRate - b.pushRate) - (a.pullRate - a.pushRate))
    .slice(0, 6)

  // Team-wide planning-accuracy single number, weighted by planned volume.
  const totalPlanned = rows.reduce((a, r) => a + (r.facts.avgOps + r.facts.avgPushed), 0)
  const teamPlanning = totalPlanned
    ? rows.reduce((a, r) => a + r.planningAccuracy * (r.facts.avgOps + r.facts.avgPushed), 0) / totalPlanned
    : 1
  const teamLatePushShare = rows.reduce((a, r) => a + r.facts.avgLatePushed, 0)
                          / Math.max(rows.reduce((a, r) => a + r.facts.avgPushed, 0), 1)

  return {
    rows, improving, sliding, spiky, steady,
    curve, qEndAvg, nonQEndAvg, quarterUplift,
    backLoadContrib, officeRows,
    pushers, pullers, teamPlanning, teamLatePushShare,
  }
}
