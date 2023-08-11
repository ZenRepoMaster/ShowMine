/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          900: '#0d0b14',
          800: '#13101e',
          700: '#1a1630',
          600: '#231f3a',
          500: '#2d2848',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.25), transparent)',
        'card-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(245,158,11,0.04))',
        'glow-purple':   'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)',
      },
      boxShadow: {
        'glow-sm':   '0 0 12px rgba(124,58,237,0.35)',
        'glow-md':   '0 0 24px rgba(124,58,237,0.4)',
        'gold-glow': '0 0 16px rgba(245,158,11,0.4)',
      },
    },
  },
  plugins: [],
}
