/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#1a1a2e',
          surface: '#22223d',
          surface2: '#2a2a4a',
          card: '#1e2a47',
          border: '#34345a',
          green: '#F75C03',        // legacy token alias — now Leyton orange
          'green-dark': '#C44A02',
          amber: '#ffc800',
          coral: '#ff4b4b',
          ink: '#f5f5fb',
          muted: '#a0a0c0',
          orange: '#F75C03',
          'orange-dark': '#C44A02',
          'orange-soft': '#FF8A3D',
          navy: '#0F1845',
        },
        accent: {
          green: '#F75C03',        // primary accent (was Duolingo green, now Leyton orange)
          orange: '#F75C03',
          amber: '#ffc800',
          coral: '#ff4b4b',
          blue: '#1cb0f6',
          purple: '#ce82ff',
        },
        rarity: {
          common: '#8e8ea0',
          rare: '#1cb0f6',
          epic: '#ce82ff',
          legendary: '#ffc800',
        },
        location: {
          london: '#64748b',
          casablanca: '#d97706',
          dublin: '#059669',
        },
      },
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(247, 92, 3, 0.40)',
        'glow-amber': '0 0 24px rgba(255, 200, 0, 0.35)',
        card: '0 4px 0 0 rgba(0,0,0,0.35)',
      },
      keyframes: {
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        flame: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-2px) scale(1.08)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2.4s ease-in-out infinite',
        flame: 'flame 1.2s ease-in-out infinite',
        bounceIn: 'bounceIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
