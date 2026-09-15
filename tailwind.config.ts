import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2A4A',
          50: '#EEF1F6',
          100: '#D6DCE9',
          200: '#AEB9D2',
          300: '#8695BA',
          400: '#5C6C99',
          500: '#3B4C77',
          600: '#1B2A4A',
          700: '#152140',
          800: '#101832',
          900: '#0B1124',
        },
        paper: {
          DEFAULT: '#FAF8F3',
          dim: '#F2EEE3',
        },
        parchment: '#EDE7D9',
        brass: {
          DEFAULT: '#B08D57',
          light: '#D3B98C',
          dark: '#8A6B3D',
        },
        moss: {
          DEFAULT: '#2F5233',
          light: '#EAF1E7',
        },
        rust: {
          DEFAULT: '#A63D33',
          light: '#F6E7E4',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        ledger: '0 1px 0 0 rgba(27, 42, 74, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
