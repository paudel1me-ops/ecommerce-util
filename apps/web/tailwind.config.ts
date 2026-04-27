import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // ── Brand design tokens ───────────────────────────────────────────────
      colors: {
        brand: {
          primary:   '#1a1a2e', // deep navy
          secondary: '#e8b86d', // warm gold
          accent:    '#16213e',
        },
        origin: {
          verified: '#16a34a', // trust green
          flagged:  '#d97706', // caution amber
          rejected: '#dc2626', // alert red
          unknown:  '#6b7280', // neutral gray
        },
        marketplace: {
          surface:  '#f9fafb',
          elevated: '#ffffff',
          border:   '#e5e7eb',
        },
      },
      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      // ── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'origin-badge': '0 0 0 2px #16a34a33',
      },
      // ── Animation ─────────────────────────────────────────────────────────
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config