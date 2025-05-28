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
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5'
        },
        secondary: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          dark: '#020617'
        },
        accent: '#f59e0b',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        notification: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem'
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem'
      },
      minHeight: {
        '16': '4rem',
        '20': '5rem',
        '24': '6rem'
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'neu-light': '8px 8px 16px rgba(163, 177, 198, 0.15), -8px -8px 16px rgba(255, 255, 255, 0.7)',
        'neu-dark': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'card': '0 10px 25px rgba(0, 0, 0, 0.1)'
        'card': '0 10px 25px rgba(0, 0, 0, 0.1)',

        xs: '2px'
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}