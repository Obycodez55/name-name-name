/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        accent: {
          50: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        game: {
          background: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
        }
      },
      fontFamily: {
        'game': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-gentle': 'bounce 1s infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'letter-reveal': 'letterReveal 0.5s ease-out',
        'score-pop': 'scorePop 0.3s ease-out',
      },
      keyframes: {
        letterReveal: {
          '0%': { transform: 'scale(0) rotate(180deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(90deg)', opacity: '0.7' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        scorePop: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}