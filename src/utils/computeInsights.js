// Hand-coded heuristics that mine each consultant's data for noteworthy
// patterns. Each insight is { id, icon, color, title, body, kind } where
// `kind` is 'positive' | 'caution' | 'neutral' — lets the UI tint accordingly.

function monthLong(iso) {
  const [y, m] = iso.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0 }
function sum(arr)  { return arr.reduce((a, b) => a + b, 0) }

export function computeInsights(consultant, allConsultants, _months) {
  const insights = []
  const stats = [...(consultant.monthlyStats ?? [])].sort((a, b) => a.month.localeCompare(b.month))
  if (stats.length === 0) return insights

  const half = Math.floor(stats.length / 2) || 1
  const recent = stats.slice(-half)
  const prior  = stats.slice(0, -half)

  // ── 1. Invoice trend ────────────────────────────────────────────────────────
  if (prior.length) {
    const rSum = sum(recent.map((s) => s.invoiceValue))
    const pSum = sum(prior.map((s) => s.invoiceValue))
    if (pSum > 0) {
      const delta = ((rSum - pSum) / pSum) * 100
      if (delta >= 8) {
        insights.push({
          id: 'trend-up', kind: 'positive', icon: '📈', color: '#58cc02',
          title: 'Invoice trending up',
          body: `+${Math.round(delta)}% over your last ${recent.length} months vs the previous ${prior.length}. Keep the momentum.`,
        })
      } else if (delta <= -8) {
        insights.push({
          id: 'trend-down', kind: 'caution', icon: '📉', color: '#ff4b4b',
          title: 'Invoice dipping',
          body: `${Math.round(delta)}% over your last ${recent.length} months. Worth a 1:1 — the dip is real.`,
        })
      }
    }
  }

  // ── 2. Peak month ───────────────────────────────────────────────────────────
  const peak = stats.reduce((best, s) => (s.invoiceValue > best.invoiceValue ? s : best), stats[0])
  if (peak.invoiceValue >= 60000) {
    insights.push({
      id: 'peak', kind: 'positive', icon: '🏔️', color: '#ffc800',
      title: 'Your peak month',
      body: `${monthLong(peak.month)} — £${(peak.invoiceValue / 1000).toFixed(0)}k invoiced. Still your record.`,
    })
  }

  // ── 3. Day-of-week fire pattern ─────────────────────────────────────────────
  const fire = consultant.fire
  if (fire?.log?.length) {
    const today = fire.todayIso ? new Date(fire.todayIso) : new Date()
    const outs = [0, 0, 0, 0, 0, 0, 0]
    fire.log.forEach((v, i) => {
      const daysAgo = fire.log.length - 1 - i
      const d = new Date(today); d.setDate(d.getDate() - daysAgo)
      if (v === 0) outs[d.getDay()] += 1
    })
    const weekdays = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']
    let worstDow = -1, worstCount = 2 // need at least 2 out-days to flag
    for (let dow = 1; dow <= 5; dow++) {
      if (outs[dow] > worstCount) { worstDow = dow; worstCount = outs[dow] }
    }
    if (worstDow !== -1) {
      insights.push({
        id: 'fire-dow', kind: 'caution', icon: '🔥', color: '#ff4b4b',
        title: `Your fire dies on ${weekdays[worstDow]}`,
        body: `${worstCount} ${weekdays[worstDow].toLowerCase().slice(0, -1)} fire-out days in the last month. Block 15 min that morning for a stage advance.`,
      })
    }
  }

  // ── 4. Role-relative position ──────────────────────────────────────────────
  const peers = allConsultants.filter((c) => c.role === consultant.role)
  const latestMonth = stats.at(-1)?.month
  if (latestMonth) {
    const ranking = peers
      .map((c) => ({ id: c.id, v: c.monthlyStats.find((s) => s.month === latestMonth)?.invoiceValue ?? 0 }))
      .sort((a, b) => b.v - a.v)
    const myRank = ranking.findIndex((r) => r.id === consultant.id) + 1
    if (myRank > 0) {
      if (myRank === 1) {
        insights.push({
          id: 'rank-first', kind: 'positive', icon: '🥇', color: '#ffc800',
          title: `#1 in ${consultant.role}`,
          body: `Top of the role-leaderboard this month. Defend it — the field is closing.`,
        })
      } else if (myRank <= 3) {
        insights.push({
          id: 'rank-top3', kind: 'positive', icon: '🏆', color: '#ffc800',
          title: `Top 3 in ${consultant.role}`,
          body: `You're #${myRank} of ${ranking.length}. Within striking distance of the crown.`,
        })
      } else if (myRank > ranking.length * 0.66) {
        insights.push({
          id: 'rank-back', kind: 'neutral', icon: '📡', color: '#ce82ff',
          title: `#${myRank} of ${ranking.length}`,
          body: `Plenty of room to climb. Pick one ladder (try Early Invoicing) — small wins compound.`,
        })
      }
    }
  }

  // ── 5. Speed gain (or loss) ─────────────────────────────────────────────────
  if (prior.length) {
    const recentClose = mean(recent.map((s) => s.avgDaysToClose ?? 0))
    const priorClose  = mean(prior.map((s) => s.avgDaysToClose ?? 0))
    const saved = priorClose - recentClose
    if (saved >= 0.8) {
      insights.push({
        id: 'speed-up', kind: 'positive', icon: '⚡', color: '#58cc02',
        title: 'You\'re closing faster',
        body: `Shaved ${saved.toFixed(1)} days off your average close vs earlier in the year.`,
      })
    } else if (saved <= -0.8) {
      insights.push({
        id: 'speed-down', kind: 'caution', icon: '🐌', color: '#ff4b4b',
        title: 'Closes slowing down',
        body: `Your average close has grown ${Math.abs(saved).toFixed(1)} days vs earlier this year.`,
      })
    }
  }

  // ── 6. Early-invoice trajectory ─────────────────────────────────────────────
  if (prior.length) {
    const r = mean(recent.map((s) => s.invoiceBeforeDay15Pct ?? 0))
    const p = mean(prior.map((s) => s.invoiceBeforeDay15Pct ?? 0))
    const delta = r - p
    if (delta >= 5) {
      insights.push({
        id: 'early-up', kind: 'positive', icon: '🌅', color: '#ffc800',
        title: 'Front-loading more',
        body: `Up ${Math.round(delta)} pp in early-invoice % over the last ${recent.length} months. The Front-Loader is close.`,
      })
    } else if (delta <= -5) {
      insights.push({
        id: 'early-down', kind: 'caution', icon: '🌙', color: '#ff4b4b',
        title: 'Slipping later in the month',
        body: `Early-invoice % is down ${Math.round(Math.abs(delta))} pp vs earlier this year. Try the day-5 nudge.`,
      })
    }
  }

  // ── 7. Streak crown ─────────────────────────────────────────────────────────
  const myBest = consultant.streaks?.bestMonthlyStreak ?? 0
  if (myBest >= 4) {
    const roleBest = Math.max(...peers.map((c) => c.streaks?.bestMonthlyStreak ?? 0))
    if (myBest === roleBest) {
      insights.push({
        id: 'streak-king', kind: 'positive', icon: '👑', color: '#ffc800',
        title: `Longest streak in ${consultant.role}`,
        body: `Your ${myBest}-month run is the role record. Don\'t let it slip.`,
      })
    }
  }

  // ── 8. Fire crown ───────────────────────────────────────────────────────────
  const myFire = consultant.fire?.best ?? 0
  if (myFire >= 14) {
    const teamFireBest = Math.max(...allConsultants.map((c) => c.fire?.best ?? 0))
    if (myFire === teamFireBest) {
      insights.push({
        id: 'fire-king', kind: 'positive', icon: '☄️', color: '#F75C03',
        title: 'Longest daily fire on the team',
        body: `${myFire} days. Nobody else is close — keep moving a claim every day.`,
      })
    }
  }

  // ── 9. Volume pattern ──────────────────────────────────────────────────────
  if (stats.length >= 3) {
    const bestOps = stats.reduce((b, s) => (s.opsDelivered > b.opsDelivered ? s : b), stats[0])
    if (bestOps.opsDelivered >= 10) {
      insights.push({
        id: 'volume', kind: 'neutral', icon: '💎', color: '#ce82ff',
        title: 'Volume peak',
        body: `Your biggest month was ${monthLong(bestOps.month)} with ${bestOps.opsDelivered} claims invoiced.`,
      })
    }
  }

  // Cap at the most-impactful six.
  return insights.slice(0, 6)
}
