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
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        breastfeed: {
          light: '#fce7f3',
          DEFAULT: '#f472b6',
          dark: '#ec4899'
        },
        diaper: {
          light: '#fef3c7',
          DEFAULT: '#fbbf24',
          dark: '#f59e0b'
        },
        sleep: {
          light: '#ddd6fe',
          DEFAULT: '#a78bfa',
          dark: '#8b5cf6'
        },
        tummy: {
          light: '#d1fae5',
          DEFAULT: '#34d399',
          dark: '#10b981'
        },
        medication: {
          light: '#fecaca',
          DEFAULT: '#f87171',
          dark: '#ef4444'
        },
        other: {
          light: '#e0e7ff',
          DEFAULT: '#818cf8',
          dark: '#6366f1'
        }
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
