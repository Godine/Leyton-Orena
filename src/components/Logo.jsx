// Reflective Leyton Arena mark. A rounded orange tile with a layered
// gradient body, a glassy top highlight to give the "reflective" feel,
// and a bolt of lightning centred on top. Renders crisp at any size.

export default function Logo({ size = 40, className = '', title = 'Leyton Arena' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        {/* Main body — warm orange with a deeper shadow at bottom-right */}
        <linearGradient id="logo-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#FFB54D" />
          <stop offset="48%"  stopColor="#F75C03" />
          <stop offset="100%" stopColor="#8E3300" />
        </linearGradient>
        {/* Reflective top sweep — a glassy highlight */}
        <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Inner shadow / vignette to give body depth */}
        <radialGradient id="logo-vignette" cx="50%" cy="100%" r="80%">
          <stop offset="55%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
        {/* Soft drop shadow under the bolt */}
        <filter id="logo-bolt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
          <feOffset dx="0" dy="0.6" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tile background */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-body)" />
      {/* Vignette overlay */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-vignette)" />

      {/* Glassy reflective top highlight */}
      <path
        d="M 12 2 L 52 2 Q 62 2 62 12 L 62 24 Q 32 36 2 22 L 2 12 Q 2 2 12 2 Z"
        fill="url(#logo-shine)"
      />

      {/* Subtle inner ring for crispness */}
      <rect
        x="2.5" y="2.5" width="59" height="59" rx="13.5"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* Lightning bolt — speed / arena energy */}
      <path
        d="M 36 16 L 21 36 L 30 36 L 25 50 L 43 28 L 34 28 L 38 16 Z"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        filter="url(#logo-bolt-shadow)"
      />
    </svg>
  )
}
