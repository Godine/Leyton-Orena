import { Link } from 'react-router-dom'

// Reusable empty-state card with a small inline SVG illustration and an
// optional CTA. `art` picks one of the prebuilt illustrations.

const ART = {
  trophy: (
    <svg viewBox="0 0 96 96" className="w-24 h-24" aria-hidden>
      <defs>
        <linearGradient id="es-trophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCB7A" />
          <stop offset="100%" stopColor="#F75C03" />
        </linearGradient>
      </defs>
      <path d="M30 18 H66 L62 50 Q55 60 48 60 Q41 60 34 50 Z" fill="url(#es-trophy)" />
      <path d="M30 22 Q14 22 16 38 Q18 50 32 48" fill="none" stroke="#F75C03" strokeWidth="3" strokeLinecap="round"/>
      <path d="M66 22 Q82 22 80 38 Q78 50 64 48" fill="none" stroke="#F75C03" strokeWidth="3" strokeLinecap="round"/>
      <rect x="42" y="60" width="12" height="14" rx="2" fill="#9C7012"/>
      <rect x="32" y="74" width="32" height="6" rx="2" fill="#9C7012"/>
      <circle cx="48" cy="36" r="3" fill="#fff" opacity="0.7"/>
    </svg>
  ),
  medal: (
    <svg viewBox="0 0 96 96" className="w-24 h-24" aria-hidden>
      <defs>
        <linearGradient id="es-medal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFCB7A" />
          <stop offset="100%" stopColor="#9C7012" />
        </linearGradient>
      </defs>
      <path d="M30 10 L48 38 L66 10 L58 10 L48 26 L38 10 Z" fill="#ff4b4b"/>
      <circle cx="48" cy="58" r="22" fill="url(#es-medal)" stroke="#fff" strokeWidth="2" strokeOpacity="0.2"/>
      <text x="48" y="64" textAnchor="middle" fill="#3F1500" fontSize="20" fontWeight="900" fontFamily="Nunito">★</text>
    </svg>
  ),
  swords: (
    <svg viewBox="0 0 96 96" className="w-24 h-24" aria-hidden>
      <defs>
        <linearGradient id="es-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A9B0BE"/>
          <stop offset="50%" stopColor="#fff"/>
          <stop offset="100%" stopColor="#7B8290"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-35 48 48)">
        <rect x="46" y="14" width="4" height="56" rx="1" fill="url(#es-blade)"/>
        <path d="M46 70 L48 76 L50 70 Z" fill="url(#es-blade)"/>
        <rect x="38" y="14" width="20" height="4" rx="2" fill="#FFE07A"/>
        <rect x="47" y="6" width="2" height="9" fill="#3A1F08"/>
        <circle cx="48" cy="6" r="2.5" fill="#FFE07A"/>
      </g>
      <g transform="rotate(35 48 48)">
        <rect x="46" y="14" width="4" height="56" rx="1" fill="url(#es-blade)"/>
        <path d="M46 70 L48 76 L50 70 Z" fill="url(#es-blade)"/>
        <rect x="38" y="14" width="20" height="4" rx="2" fill="#FFE07A"/>
        <rect x="47" y="6" width="2" height="9" fill="#3A1F08"/>
        <circle cx="48" cy="6" r="2.5" fill="#FFE07A"/>
      </g>
      <circle cx="48" cy="48" r="3" fill="#FFE07A" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 96 96" className="w-24 h-24" aria-hidden>
      <defs>
        <linearGradient id="es-gift" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8A3D"/>
          <stop offset="100%" stopColor="#F75C03"/>
        </linearGradient>
      </defs>
      <rect x="20" y="38" width="56" height="42" rx="6" fill="url(#es-gift)"/>
      <rect x="18" y="32" width="60" height="12" rx="4" fill="#C44A02"/>
      <rect x="44" y="32" width="8" height="48" fill="#FFCB7A"/>
      <path d="M44 32 Q34 22 30 14 Q42 14 48 26 Q54 14 66 14 Q62 22 52 32 Z" fill="#FFCB7A"/>
    </svg>
  ),
  badges: (
    <svg viewBox="0 0 96 96" className="w-24 h-24" aria-hidden>
      <circle cx="32" cy="48" r="18" fill="#1cb0f6" opacity="0.85"/>
      <circle cx="64" cy="48" r="18" fill="#ce82ff" opacity="0.85"/>
      <circle cx="48" cy="36" r="20" fill="#ffc800"/>
      <text x="48" y="44" textAnchor="middle" fontSize="22" fontFamily="Nunito" fontWeight="900" fill="#3F1500">★</text>
    </svg>
  ),
}

export default function EmptyState({
  art = 'trophy',
  title,
  body,
  ctaLabel,
  ctaTo,
  ctaOnClick,
  className = '',
}) {
  const cta = ctaLabel ? (
    ctaTo ? (
      <Link to={ctaTo} className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-accent-green text-arena-bg text-xs font-display font-bold shadow-glow">
        {ctaLabel}
      </Link>
    ) : (
      <button onClick={ctaOnClick} className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-accent-green text-arena-bg text-xs font-display font-bold shadow-glow">
        {ctaLabel}
      </button>
    )
  ) : null

  return (
    <div className={['arena-card py-10 px-6 text-center flex flex-col items-center', className].join(' ')}>
      <div className="opacity-90">{ART[art] ?? ART.trophy}</div>
      <h3 className="mt-2 font-display font-black text-arena-ink text-lg">{title}</h3>
      {body && <p className="mt-1 text-sm text-arena-muted max-w-sm">{body}</p>}
      {cta}
    </div>
  )
}
