import { LOCATION_CODE } from '../../utils/formatters.js'

const STYLES = {
  London:     'bg-location-london/20  text-slate-300  ring-location-london/40',
  Casablanca: 'bg-location-casablanca/20 text-amber-300 ring-location-casablanca/40',
  Dublin:     'bg-location-dublin/20  text-emerald-300 ring-location-dublin/40',
}

export default function LocationPill({ location, className = '' }) {
  const code = LOCATION_CODE[location] ?? location
  return (
    <span
      title={location}
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-display font-black tracking-wider ring-1',
        STYLES[location] ?? 'bg-arena-surface2 text-arena-muted ring-arena-border',
        className,
      ].join(' ')}
    >
      {code}
    </span>
  )
}
