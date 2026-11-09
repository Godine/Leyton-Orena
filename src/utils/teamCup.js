// Half-year team competition — "The Face-Off" (Orange vs Blue).
//
// Four teams per half: Orange-TC, Blue-TC, Orange-FC, Blue-FC. TC races TC,
// FC races FC. Two cups scored from synthetic WEEKLY data (the engine will feed
// real weekly invoice actuals later):
//   • Cadence Cup   — flattest weekly-by-value delivery within each month,
//                     averaged across the half. Flat = good.
//   • Forecast Cup  — smallest gap between the month's landing and the forecast
//                     set at the start of the month. Close = good.
//
// Everything here is pure + deterministic so the prototype is stable.

export const COLORS = {
  orange: { id: 'orange', name: 'Orange', hex: '#F75C03', soft: '#F75C0322' },
  blue:   { id: 'blue',   name: 'Blue',   hex: '#1cb0f6', soft: '#1cb0f622' },
}
export const CUPS = {
  cadence:  { id: 'cadence',  name: 'Cadence Cup',  blurb: 'Flattest weekly delivery', icon: 'waves' },
  forecast: { id: 'forecast', name: 'Forecast Cup', blurb: 'Closest to forecast',       icon: 'target' },
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295 // 0..1
}
const clamp01 = (x) => Math.max(0, Math.min(1, x))
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const std = (xs) => {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

// Within-month weekly split by delivery profile. Flat profiles spread evenly;
// inconsistent ones back-load toward the final week (the peak-month problem).
const WEEK_SHAPE = {
  strong:       [0.26, 0.26, 0.25, 0.23],
  steady:       [0.27, 0.26, 0.24, 0.23],
  improving:    [0.20, 0.23, 0.28, 0.29],
  inconsistent: [0.11, 0.17, 0.27, 0.45],
}
// Forecast error magnitude by profile — how far the month lands from plan.
const FORECAST_ERR = { strong: 0.03, steady: 0.06, improving: 0.09, inconsistent: 0.20 }

function weeklyFor(consultant, monthStat) {
  const V = Math.max(0, monthStat.invoiceValue ?? 0)
  const base = WEEK_SHAPE[consultant.profile] ?? WEEK_SHAPE.steady
  const seed = hash(`${consultant.id}:${monthStat.month}`)
  // deterministic jitter, renormalised
  const w = base.map((b, i) => Math.max(0.02, b + (hash(`${consultant.id}:${monthStat.month}:${i}`) - 0.5) * 0.06))
  const sum = w.reduce((a, b) => a + b, 0)
  const weeks = w.map((x) => (V * x) / sum)
  // Flatness: 1 − coefficient of variation of the weeks (1 = perfectly flat)
  const m = mean(weeks)
  const cv = m ? std(weeks) / m : 0
  const flatness = clamp01(1 - cv)
  // Forecast set at month start, then the actual lands near it (by profile).
  const errMag = FORECAST_ERR[consultant.profile] ?? 0.08
  const signed = (seed - 0.5) * 2 * errMag // ± errMag
  const forecast = Math.round(V / (1 + signed)) || V
  const gap = forecast ? Math.abs(V - forecast) / forecast : 0
  const accuracy = clamp01(1 - gap)
  return { weeks, flatness, forecast, actual: V, accuracy, gap }
}


// Snake draft a role pool into two colour teams, seeded by strength desc.
function snakeDraft(pool) {
  const order = []
  const teams = { orange: [], blue: [] }
  pool.forEach((c, i) => {
    // Snake: 0→orange, 1→blue, 2→blue, 3→orange, … balances strong picks.
    const col = [0, 3].includes(i % 4) ? 'orange' : 'blue'
    teams[col].push(c)
    order.push({ pick: i + 1, colour: col, consultant: c })
  })
  return { teams, order }
}

export function buildFaceOff(consultants, months, opts = {}) {
  const sorted = [...months].sort()
  const rounds = sorted                   // each month is a round
  const throughRound = opts.throughRound ?? Math.max(1, Math.ceil(sorted.length * 0.75)) // live mid-half
  const playedMonths = sorted.slice(0, throughRound)

  // Per-consultant weekly metrics for every month.
  const metricByConsultant = new Map()
  for (const c of consultants) {
    const perMonth = {}
    for (const s of c.monthlyStats) if (sorted.includes(s.month)) perMonth[s.month] = weeklyFor(c, s)
    metricByConsultant.set(c.id, perMonth)
  }

  // Snake-draft seed = the consultant's own delivery quality on the COMPETED
  // dimensions (cadence flatness + forecast accuracy), averaged over the half.
  // Seeding on this — not on invoice volume — is what keeps the teams balanced
  // on what the cups actually measure, so the races stay close.
  const qualityOf = (c) => {
    const per = metricByConsultant.get(c.id) || {}
    const vals = Object.values(per).map((m) => (m.flatness + m.accuracy) / 2)
    return mean(vals)
  }

  // Draft per discipline.
  const roles = ['Technical', 'Financial']
  const roleKey = { Technical: 'TC', Financial: 'FC' }
  const drafts = {}
  for (const role of roles) {
    const pool = consultants.filter((c) => c.role === role)
      .sort((a, b) => qualityOf(b) - qualityOf(a))
    drafts[role] = snakeDraft(pool)
  }

  // Build the 4 teams.
  const teams = []
  for (const role of roles) {
    for (const colour of ['orange', 'blue']) {
      const members = drafts[role].teams[colour]
      teams.push({
        id: `${colour}-${roleKey[role]}`,
        colour, role, roleKey: roleKey[role],
        name: `${COLORS[colour].name} ${roleKey[role]}`,
        members,
      })
    }
  }

  // Score a team over a set of months.
  const scoreTeam = (team, monthKeys) => {
    const perRound = monthKeys.map((m) => {
      const fl = [], ac = []
      for (const c of team.members) {
        const mm = metricByConsultant.get(c.id)?.[m]
        if (mm) { fl.push(mm.flatness); ac.push(mm.accuracy) }
      }
      return { month: m, flatness: mean(fl) * 100, accuracy: mean(ac) * 100 }
    })
    return {
      perRound,
      cadence: mean(perRound.map((r) => r.flatness)),
      forecast: mean(perRound.map((r) => r.accuracy)),
    }
  }

  for (const t of teams) t.score = scoreTeam(t, playedMonths)

  // Brackets: head-to-head within discipline for each cup.
  const bracket = (roleK, cup) => {
    const o = teams.find((t) => t.colour === 'orange' && t.roleKey === roleK)
    const b = teams.find((t) => t.colour === 'blue' && t.roleKey === roleK)
    const ov = o.score[cup], bv = b.score[cup]
    return { roleKey: roleK, cup, orange: o, blue: b, orangeVal: ov, blueVal: bv, leader: ov >= bv ? 'orange' : 'blue' }
  }
  const brackets = []
  for (const roleK of ['TC', 'FC']) for (const cup of ['cadence', 'forecast']) brackets.push(bracket(roleK, cup))

  // Colour war — contests won across the 4 (2 cups × 2 brackets).
  const wins = { orange: 0, blue: 0 }
  for (const br of brackets) wins[br.leader] += 1

  // Rewards pool — winners of each contest bank points for their colour.
  const PER_CONTEST = 250
  const rewardPool = { orange: 0, blue: 0 }
  for (const br of brackets) rewardPool[br.leader] += PER_CONTEST
  // small participation bonus scaled by score
  for (const t of teams) rewardPool[t.colour] += Math.round((t.score.cadence + t.score.forecast) / 2)

  return {
    rounds, throughRound, playedMonths, teams, brackets, wins, rewardPool,
    drafts, metricByConsultant,
    leader: wins.orange === wins.blue ? 'tie' : (wins.orange > wins.blue ? 'orange' : 'blue'),
  }
}
