import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
        pitch: {
          DEFAULT: '#000000',
          950: '#050505',
          900: '#0a0a0a',
          850: '#141414',
          800: '#1e1e1e',
        },
        gold: {
          light: '#efc676',
          DEFAULT: '#dfb15b',
          dark: '#b88836',
          hover: '#efc676',
        },
        brandGold: {
          light: '#efc676',
          DEFAULT: '#dfb15b',
          dark: '#b88836',
          accent: '#dfb15b',
        },
        brandDark: {
          DEFAULT: '#141414',
          deep: '#0a0a0a',
          card: '#181818',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#1EA952',
        }
      },
      fontFamily: {
        sans: ['Titillium Web', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Titillium Web', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'liquid': '0 20px 50px -15px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
        'liquid-hover': '0 30px 60px -15px rgba(0, 0, 0, 0.95), inset 0 1px 2px 0 rgba(255, 255, 255, 0.22)',
        'liquid-sm': '0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
