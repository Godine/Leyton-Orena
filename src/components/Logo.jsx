// Leyton Arena mark. The "O" of Leyton, reimagined as a battle arena
// viewed from above — a cream ring with a dark sand pit, ringed with
// tiny tier ticks (amphitheatre seating), with two crossed swords
// laid across the top. The whole thing sits on the warm orange tile
// with a glassy reflective top highlight so it still feels brand.

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
        <linearGradient id="logo-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#FFB54D" />
          <stop offset="50%"  stopColor="#F75C03" />
          <stop offset="100%" stopColor="#8E3300" />
        </linearGradient>
        <radialGradient id="logo-vignette" cx="50%" cy="100%" r="80%">
          <stop offset="55%"  stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id="logo-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="logo-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FFF6E1" />
          <stop offset="100%" stopColor="#E5BD89" />
        </linearGradient>
        <radialGradient id="logo-sand" cx="50%" cy="40%" r="80%">
          <stop offset="0%"   stopColor="#7E2A00" />
          <stop offset="100%" stopColor="#3F1500" />
        </radialGradient>
        <linearGradient id="logo-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#A9B0BE" />
          <stop offset="35%"  stopColor="#FFFFFF" />
          <stop offset="65%"  stopColor="#E0E3EA" />
          <stop offset="100%" stopColor="#7B8290" />
        </linearGradient>
        <linearGradient id="logo-hilt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FFE07A" />
          <stop offset="100%" stopColor="#9C7012" />
        </linearGradient>
        <filter id="logo-bolt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
          <feOffset dx="0" dy="0.5" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tile background */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-tile)" />
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-vignette)" />

      {/* Arena floor — the "O" of Leyton */}
      <ellipse cx="32" cy="34" rx="22" ry="17" fill="url(#logo-ring)" />
      <ellipse cx="32" cy="35" rx="16.5" ry="11.5" fill="url(#logo-sand)" />

      {/* Amphitheatre tier ticks — twelve marks around the rim */}
      <g stroke="#9A6B26" strokeWidth="0.85" strokeLinecap="round" opacity="0.85">
        <line x1="32" y1="19" x2="32" y2="22" />
        <line x1="42" y1="20.5" x2="41" y2="23.4" />
        <line x1="49.5" y1="25" x2="47.6" y2="27" />
        <line x1="53" y1="34" x2="50" y2="34" />
        <line x1="49.5" y1="43" x2="47.6" y2="41" />
        <line x1="42" y1="47.5" x2="41" y2="44.6" />
        <line x1="32" y1="49" x2="32" y2="46" />
        <line x1="22" y1="47.5" x2="23" y2="44.6" />
        <line x1="14.5" y1="43" x2="16.4" y2="41" />
        <line x1="11" y1="34" x2="14" y2="34" />
        <line x1="14.5" y1="25" x2="16.4" y2="27" />
        <line x1="22" y1="20.5" x2="23" y2="23.4" />
      </g>

      {/* Crossed swords — laid across the arena, hilts at top */}
      <g filter="url(#logo-bolt-shadow)">
        {/* Sword going top-right → bottom-left (rotated −40°) */}
        <g transform="rotate(-40 32 32)">
          <rect x="30.7" y="10" width="2.6" height="32" rx="0.6" fill="url(#logo-blade)" />
          <path d="M 30.7 42 L 32 46 L 33.3 42 Z" fill="url(#logo-blade)" />
          <rect x="25.5" y="9.4" width="13" height="2.4" rx="1.2" fill="url(#logo-hilt)" />
          <rect x="31" y="4.2" width="2" height="5.4" fill="#3A1F08" />
          <circle cx="32" cy="4.2" r="1.6" fill="url(#logo-hilt)" />
        </g>
        {/* Sword going top-left → bottom-right (rotated +40°) */}
        <g transform="rotate(40 32 32)">
          <rect x="30.7" y="10" width="2.6" height="32" rx="0.6" fill="url(#logo-blade)" />
          <path d="M 30.7 42 L 32 46 L 33.3 42 Z" fill="url(#logo-blade)" />
          <rect x="25.5" y="9.4" width="13" height="2.4" rx="1.2" fill="url(#logo-hilt)" />
          <rect x="31" y="4.2" width="2" height="5.4" fill="#3A1F08" />
          <circle cx="32" cy="4.2" r="1.6" fill="url(#logo-hilt)" />
        </g>
        {/* Tiny rivet at the X centre */}
        <circle cx="32" cy="32" r="1.4" fill="url(#logo-hilt)" stroke="rgba(0,0,0,0.3)" strokeWidth="0.4" />
      </g>

      {/* Reflective top highlight */}
      <path
        d="M 12 2 L 52 2 Q 62 2 62 12 L 62 22 Q 32 32 2 20 L 2 12 Q 2 2 12 2 Z"
        fill="url(#logo-shine)"
      />

      {/* Inner ring stroke for crispness */}
      <rect
        x="2.5" y="2.5" width="59" height="59" rx="13.5"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
    </svg>
  )
}
