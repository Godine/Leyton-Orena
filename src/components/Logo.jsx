// Minimalist Leyton Arena mark.
//
// Two colours, two shapes. The cream ring IS the "O" of Leyton — read as
// an aerial arena. Two diagonal slits in the tile colour cut through the
// ring; those gaps form an X (the swords) entirely in negative space.

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
      {/* Solid tile */}
      <rect width="64" height="64" rx="14" fill="#F75C03" />
      {/* Cream ring — the arena O */}
      <circle cx="32" cy="32" r="20" fill="none" stroke="#F5E6CA" strokeWidth="8" />
      {/* Negative-space swords: two diagonal cuts the colour of the tile */}
      <g fill="#F75C03">
        <rect x="-4" y="28" width="72" height="8" transform="rotate(45 32 32)" />
        <rect x="-4" y="28" width="72" height="8" transform="rotate(-45 32 32)" />
      </g>
    </svg>
  )
}
