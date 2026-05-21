/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D0D0F',
          secondary: '#18181B',
          card: '#1C1C21',
          hover: '#222228',
        },
        border: {
          default: '#2A2A32',
          hover: '#3A3A45',
          focus: '#7C6FF7',
        },
        accent: {
          primary: '#7C6FF7',
          hover: '#6B5FE6',
          secondary: '#F97066',
          green: '#34D399',
          yellow: '#FBBF24',
        },
        text: {
          primary: '#F4F4F5',
          secondary: '#A1A1AA',
          muted: '#52525B',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'glass': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 15px rgba(124, 111, 247, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-1': 'linear-gradient(135deg, #7C6FF7, #F97066)',
        'gradient-2': 'linear-gradient(135deg, #7C6FF7, #34D399)',
      }
    },
  },
  plugins: [],
}
