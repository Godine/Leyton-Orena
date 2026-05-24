// Manager-oriented rollups derived from the consultant dataset. Reuses the
// latest tracked month as "this month" and the prior month for trend/attention.

function pct(part, whole) {
  return whole === 0 ? 0 : (part / whole) * 100
}

function trendDir(curr, prev, betterWhenLower = false) {
  if (curr == null || prev == null) return 'flat'
  if (curr === prev) return 'flat'
  const up = curr > prev
  const good = betterWhenLower ? !up : up
  return good ? 'up' : 'down'
}

export function computeManagerInsights(consultants, months, scope = 'All') {
  const sorted = [...months].sort()
  const latest = sorted.at(-1)
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null

  const pool = consultants.filter((c) => scope === 'All' || c.role === scope)

  const rows = pool.map((c) => {
    const cur = c.monthlyStats.find((s) => s.month === latest) ?? null
    const prv = prev ? c.monthlyStats.find((s) => s.month === prev) ?? null : null
    const fire = c.fire ?? { current: 0, best: 0 }
    const streak = c.streaks ?? { currentMonthlyStreak: 0, bestMonthlyStreak: 0 }

    // Reasons a manager should celebrate this person.
    const momentum = []
    if (fire.current >= 7) momentum.push(`${fire.current}-day fire`)
    if (streak.currentMonthlyStreak >= 3) momentum.push(`${streak.currentMonthlyStreak}-mo streak`)
    if (prv && cur && cur.invoiceValue > prv.invoiceValue * 1.1) momentum.push('Invoice climbing')
    if (cur && cur.invoiceBeforeDay15Pct >= 80) momentum.push('Front-loaded')

    // Reasons a manager should check in.
    const attention = []
    if (streak.currentMonthlyStreak === 0) attention.push('Target streak broken')
    if (fire.current === 0) attention.push('Daily fire out')
    if (prv && cur && cur.invoiceValue < prv.invoiceValue * 0.9) attention.push('Invoice slipping')
    if (cur && cur.avgDaysToClose > 5) attention.push('Slow closes')
    if (cur && cur.invoiceBeforeDay15Pct < 50) attention.push('Late invoicing')
    if (cur && (cur.pushedOps ?? 0) >= 2) attention.push('Ops being pushed')

    const status = attention.length >= 2 ? 'risk' : attention.length === 1 ? 'watch' : 'healthy'

    return {
      consultant: c,
      cur,
      prv,
      fire,
      streak,
      momentum,
      attention,
      status,
      invoiceTrend: trendDir(cur?.invoiceValue, prv?.invoiceValue),
      closeTrend: trendDir(cur?.avgDaysToClose, prv?.avgDaysToClose, true),
    }
  })

  // Team totals for the latest month.
  const withCur = rows.filter((r) => r.cur)
  const sum = (sel) => withCur.reduce((a, r) => a + sel(r), 0)
  const mean = (sel) => (withCur.length ? sum(sel) / withCur.length : 0)

  const totals = {
    headcount: pool.length,
    ops: sum((r) => r.cur.opsDelivered),
    invoice: sum((r) => r.cur.invoiceValue),
    earlyPct: mean((r) => r.cur.invoiceBeforeDay15Pct),
    daysToClose: mean((r) => r.cur.avgDaysToClose),
    activeFires: rows.filter((r) => r.fire.current > 0).length,
    atRisk: rows.filter((r) => r.status === 'risk').length,
    badges: pool.reduce((a, c) => a + (c.badges?.length ?? 0), 0),
  }

  // Per-office breakdown.
  const locationMap = new Map()
  for (const r of rows) {
    const loc = r.consultant.location
    if (!locationMap.has(loc)) {
      locationMap.set(loc, { location: loc, count: 0, ops: 0, invoice: 0, earlyAcc: 0, earlyN: 0, fires: 0 })
    }
    const o = locationMap.get(loc)
    o.count += 1
    if (r.cur) {
      o.ops += r.cur.opsDelivered
      o.invoice += r.cur.invoiceValue
      o.earlyAcc += r.cur.invoiceBeforeDay15Pct
      o.earlyN += 1
    }
    if (r.fire.current > 0) o.fires += 1
  }
  const byLocation = [...locationMap.values()]
    .map((o) => ({
      location: o.location,
      count: o.count,
      ops: o.ops,
      invoice: o.invoice,
      earlyPct: o.earlyN ? o.earlyAcc / o.earlyN : 0,
      fires: o.fires,
    }))
    .sort((a, b) => b.invoice - a.invoice)

  const maxLocInvoice = Math.max(1, ...byLocation.map((o) => o.invoice))

  // On fire: anyone with momentum, ranked by current fire then invoice.
  const onFire = rows
    .filter((r) => r.momentum.length > 0)
    .sort((a, b) => b.fire.current - a.fire.current || (b.cur?.invoiceValue ?? 0) - (a.cur?.invoiceValue ?? 0))
    .slice(0, 6)

  // Needs attention: most flags first, then weakest invoice.
  const needsAttention = rows
    .filter((r) => r.attention.length > 0)
    .sort((a, b) => b.attention.length - a.attention.length || (a.cur?.invoiceValue ?? 0) - (b.cur?.invoiceValue ?? 0))
    .slice(0, 6)

  // Roster sorted by invoice desc for the full table.
  const roster = [...rows].sort((a, b) => (b.cur?.invoiceValue ?? 0) - (a.cur?.invoiceValue ?? 0))

  return { latest, prev, totals, byLocation, maxLocInvoice, onFire, needsAttention, roster, scope }
}

export { pct }
