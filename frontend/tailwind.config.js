/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FFF7ED',
          100: '#FCECCF',
          200: '#F5DEB3',
          300: '#E8D5B7',
          400: '#D4C4A8',
          500: '#BFA48E',
        },
        coffee: {
          50:  '#9C8470',
          100: '#8A7260',
          200: '#6B4C3B',
          300: '#5A3D2B',
          400: '#442D1D',
          500: '#442D1D',
          600: '#3A2518',
          700: '#2E1E12',
          800: '#1A110A',
          900: '#0D0805',
        },
        accent: {
          warm:   '#C4956A',
          gold:   '#D4A76A',
          orange: '#E8945A',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        'glass':   '0 8px 32px rgba(68, 45, 29, 0.06)',
        'glass-lg':'0 20px 60px rgba(68, 45, 29, 0.08)',
        'glow':    '0 0 30px rgba(196, 149, 106, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        'float':      'floatIdle 6s ease-in-out infinite',
        'pulse-slow': 'energyPulse 3s ease-in-out infinite',
        'spin-slow':  'orbSpin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
