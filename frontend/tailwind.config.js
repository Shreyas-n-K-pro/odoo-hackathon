/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand Colors ──────────────────────────────────────────────────────
      colors: {
        // Navy (sidebar, backgrounds)
        navy: {
          950: '#060C1A',
          900: '#0A1628',
          800: '#0F1F3D',
          700: '#162850',
          600: '#1E3766',
        },
        // Amber (primary CTA, logo, active states)
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // Status badge colors
        status: {
          available: '#10B981',   // green
          ontrip:    '#3B82F6',   // blue
          inshop:    '#F97316',   // orange
          retired:   '#EF4444',   // red
          active:    '#10B981',
          onleave:   '#F97316',
          inactive:  '#6B7280',
        },
      },
      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // ── Animations ───────────────────────────────────────────────────────
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-in':   'slideIn 0.4s ease-out',
        'shimmer':    'shimmer 2s infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                  to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
