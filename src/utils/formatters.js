const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const COMPACT_GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 1,
  notation: 'compact',
})

export const formatCurrency = (v) => GBP.format(v ?? 0)
export const formatCurrencyCompact = (v) => COMPACT_GBP.format(v ?? 0)
export const formatPct = (v, digits = 0) => `${(v ?? 0).toFixed(digits)}%`
export const formatDays = (v) => `${(v ?? 0).toFixed(1)}d`
export const formatInt = (v) => new Intl.NumberFormat('en-GB').format(Math.round(v ?? 0))

export const LOCATION_CODE = { London: 'LDN', Casablanca: 'CAS', Dublin: 'DUB' }
