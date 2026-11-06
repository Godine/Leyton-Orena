// Pure KPI scoring (spec prompt 8). Reads ratios from kpi_results and app
// settings; never mutates anything. The only intended deviation from the
// workbook is KPI 1 scoring at ratio ≥ 0.95 (the workbook used > 1.00).
import { SETTINGS, FISCAL_MONTHS } from './data/kpiData.js'

const T = SETTINGS.thresholds
const MONTHLY_SCORING_FROM = SETTINGS.monthlyScoringFrom    // 3 = Sep
const QUARTERLY_SCORING_FROM = SETTINGS.quarterlyScoringFrom // 2 = Q2
const NEAR = 0.05 // "within 5 percentage points of the threshold" → amber

// status: 'hit' | 'near' | 'miss' | 'na'
function band(ratio, threshold) {
  if (ratio >= threshold) return 'hit'
  if (ratio >= threshold - NEAR) return 'near'
  return 'miss'
}

// Score a single monthly KPI (1–3) for a given fiscal month (1=Jul).
export function scoreMonthlyKpi(kpi, result, fiscalMonth) {
  if (!result) return { point: 0, status: 'empty', ratio: null }
  const { ratio, no_data } = result
  if (no_data || ratio == null) return { point: 0, status: 'na', ratio: null }

  let status
  if (kpi === 1) {
    status = band(ratio, T.kpi1)
  } else if (kpi === 2) {
    const lower = T.kpi2Min // 0.80
    const upper = T.kpi2Max // 1.20
    if (fiscalMonth === 1) {
      // July: lower bound only.
      status = band(ratio, lower)
    } else {
      // Aug–Jun: inside [lower, upper).
      if (ratio >= lower && ratio < upper) status = 'hit'
      else if (ratio < lower && ratio >= lower - NEAR) status = 'near'
      else if (ratio >= upper && ratio <= upper + NEAR) status = 'near'
      else status = 'miss'
    }
  } else if (kpi === 3) {
    status = band(ratio, T.kpi3)
  }
  return { point: status === 'hit' ? 1 : 0, status, ratio }
}

// Score a single quarterly KPI (4–6).
export function scoreQuarterlyKpi(kpi, result) {
  if (!result) return { point: 0, status: 'empty', ratio: null }
  const { ratio, no_data } = result
  if ((kpi === 5 || kpi === 6) && (no_data || ratio == null)) {
    return { point: 0, status: 'na', ratio: null } // "No data" → N/A, 0 points
  }
  const r = ratio ?? 0
  const threshold = kpi === 4 ? T.kpi4 : kpi === 5 ? T.kpi5 : T.kpi6
  const status = band(r, threshold)
  return { point: status === 'hit' ? 1 : 0, status, ratio: r }
}

export function kpiThreshold(kpi) {
  return { 1: T.kpi1, 2: T.kpi2Min, 3: T.kpi3, 4: T.kpi4, 5: T.kpi5, 6: T.kpi6 }[kpi]
}
export const KPI2_CAP = T.kpi2Max

// Monthly points (0–3) for a consultant's fiscal month, given its result map.
export function monthlyPoints(results, fiscalMonth) {
  let pts = 0
  for (const kpi of [1, 2, 3]) {
    const r = results[`month:${fiscalMonth}:${kpi}`]
    pts += scoreMonthlyKpi(kpi, r, fiscalMonth).point
  }
  return pts
}

// Quarter points (0–3) for a consultant's quarter.
export function quarterPoints(results, quarter) {
  let pts = 0
  for (const kpi of [4, 5, 6]) {
    const r = results[`quarter:${quarter}:${kpi}`]
    pts += scoreQuarterlyKpi(kpi, r).point
  }
  return pts
}

export function monthScored(fiscalMonth) {
  return fiscalMonth >= MONTHLY_SCORING_FROM
}
export function quarterScored(quarter) {
  return quarter >= QUARTERLY_SCORING_FROM
}

// Does the consultant have any data for this fiscal month? (any of KPI 1–3)
export function monthHasData(results, fiscalMonth) {
  return [1, 2, 3].some((k) => results[`month:${fiscalMonth}:${k}`])
}
export function quarterHasData(results, quarter) {
  return [4, 5, 6].some((k) => results[`quarter:${quarter}:${k}`])
}

// Monthly verdict for a scored month. `prevWasMiss` = previous *scored* month
// was a miss (<2 pts) → two consecutive misses ⇒ Performance review.
export function monthlyVerdict(results, fiscalMonth, prevWasMiss) {
  if (!monthScored(fiscalMonth)) return { kind: 'not-scored', label: 'Not scored' }
  if (!monthHasData(results, fiscalMonth)) return { kind: 'empty', label: '—' }
  const pts = monthlyPoints(results, fiscalMonth)
  const miss = pts < 2
  if (miss && prevWasMiss) return { kind: 'review', label: 'Performance review', points: pts }
  return miss
    ? { kind: 'below', label: 'Below expectation', points: pts }
    : { kind: 'meets', label: 'Meets expectation', points: pts }
}

// Quarterly verdict. Review if < 2 quarter points OR < 6 monthly points across
// the quarter's three months.
export function quarterlyVerdict(results, quarter) {
  if (!quarterScored(quarter)) return { kind: 'not-scored', label: 'Not scored' }
  if (!quarterHasData(results, quarter)) return { kind: 'empty', label: '—' }
  const qPts = quarterPoints(results, quarter)
  const months = FISCAL_MONTHS.filter((m) => m.quarter === quarter).map((m) => m.period)
  const mPts = months.reduce((a, p) => a + monthlyPoints(results, p), 0)
  if (qPts < 2 || mPts < 6) return { kind: 'review', label: 'Performance review', qPts, mPts }
  return { kind: 'meets', label: 'On track', qPts, mPts }
}

// Consecutive scored months meeting expectation, counted from the first scored
// month (StreakFlame).
export function meetsStreak(results) {
  const scored = FISCAL_MONTHS.filter((m) => monthScored(m.period) && monthHasData(results, m.period))
  let streak = 0
  for (const m of scored) {
    if (monthlyPoints(results, m.period) >= 2) streak += 1
    else streak = 0
  }
  return streak
}
