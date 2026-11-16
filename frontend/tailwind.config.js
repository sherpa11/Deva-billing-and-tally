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
          DEFAULT: '#176B45',
          hover: '#125538',
          light: '#EAF4ED',
          border: '#CBE5D3',
        },
        forest: {
          50: '#F2F8F4',
          100: '#EAF4ED',
          200: '#D5E9DC',
          500: '#2E8C5F',
          600: '#176B45',
          700: '#125538',
          800: '#0E402B',
          900: '#092B1D',
        },
        surface: {
          bg: '#F6F8F5',
          card: '#FFFFFF',
          border: '#E5EBE6',
          hover: '#F0F4F1',
        },
        content: {
          main: '#25332C',
          secondary: '#748078',
          muted: '#9EAAA2',
        },
        status: {
          warning: '#D99A36',
          warningLight: '#FDF6E9',
          danger: '#D9534F',
          dangerLight: '#FDEEEF',
          success: '#176B45',
          successLight: '#EAF4ED',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', '"Mukta Malar"', '"Latha"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        card: '0 2px 4px rgba(37, 51, 44, 0.04)',
        elevated: '0 8px 24px rgba(37, 51, 44, 0.08)',
      }
    },
  },
  plugins: [],
}
