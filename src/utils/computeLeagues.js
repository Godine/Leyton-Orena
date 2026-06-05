// Yearly seasons with five leagues (Bronze → Silver → Gold → Platinum →
// Diamond). Consultants get a season score derived from invoice, badges,
// fire, and championship runs; the score sorts everyone descending and
// the top buckets become higher leagues.
//
// Promotion / relegation rules at the end of each season:
//   - Top 20% of each non-Diamond league promote one tier up
//   - Bottom 20% of each non-Bronze league relegate one tier down

export const LEAGUES = [
  { id: 'diamond',  name: 'Diamond',  icon: '💎', color: '#2DD4BF', accent: 'text-teal-300' },
  { id: 'platinum', name: 'Platinum', icon: '⚪', color: '#E5E7EB', accent: 'text-arena-ink' },
  { id: 'gold',     name: 'Gold',     icon: '🥇', color: '#ffc800', accent: 'text-arena-amber' },
  { id: 'silver',   name: 'Silver',   icon: '🥈', color: '#c0c7d6', accent: 'text-slate-300' },
  { id: 'bronze',   name: 'Bronze',   icon: '🥉', color: '#cd7f32', accent: 'text-orange-300' },
]

// Current season runs the calendar year. End-of-year resets the standings.
export function currentSeason(today = new Date()) {
  const year = today.getFullYear()
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31, 23, 59, 59)
  const total = end - start
  const elapsed = Math.max(0, today - start)
  const remaining = Math.max(0, end - today)
  const days = Math.ceil(remaining / (24 * 3600 * 1000))
  return {
    name: `Season ${year}`,
    year, start, end,
    elapsedFrac: Math.min(1, elapsed / total),
    daysLeft: days,
  }
}

// Score: a single number that captures both this-year delivery and lifetime
// prestige so the leagues feel earned rather than purely current-month.
export function seasonScore(consultant) {
  const invoice = (consultant.monthlyStats ?? []).reduce((a, s) => a + (s.invoiceValue ?? 0), 0)
  return Math.floor(invoice / 1000)               // £k of invoice
    + (consultant.badges?.length ?? 0) * 50       // badge weight
    + (consultant.lifetime?.champBest ?? 0) * 200 // championship multiplier
    + (consultant.fire?.best ?? 0) * 5            // fire streak nudge
    + (consultant.streaks?.bestMonthlyStreak ?? 0) * 60
}

export function computeLeagues(consultants) {
  const scored = consultants
    .map((c) => ({ consultant: c, score: seasonScore(c) }))
    .sort((a, b) => b.score - a.score)

  const bucket = Math.ceil(scored.length / LEAGUES.length)
  const leagues = LEAGUES.map((league, i) => {
    const members = scored
      .slice(i * bucket, (i + 1) * bucket)
      .map((entry, rank) => ({ ...entry, rank: rank + 1 }))
    return { ...league, members }
  })

  // Mark promotion + relegation zones. Top N promote (next league), bottom N
  // relegate (previous league). With small buckets (≈5) keep the zone at one
  // slot each so the demo reads cleanly.
  const PROMO_N = 1
  const RELEG_N = 1
  leagues.forEach((league, i) => {
    league.members.forEach((m, j) => {
      m.zone = null
      if (i > 0 && j < PROMO_N) m.zone = 'promotion'
      else if (i < LEAGUES.length - 1 && j >= league.members.length - RELEG_N) m.zone = 'relegation'
    })
  })

  const byConsultant = {}
  leagues.forEach((league) => {
    league.members.forEach((m) => {
      byConsultant[m.consultant.id] = { league: league.id, rank: m.rank, score: m.score, zone: m.zone }
    })
  })

  return { leagues, byConsultant }
}
