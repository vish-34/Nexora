/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        moss: {
          950: '#0d1c16',
          900: '#132820',
          850: '#173329',
          800: '#1b3c30',
          750: '#214739',
          700: '#295444',
          600: '#386c58',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          200: '#cbd8ce',
          300: '#a3baa8',
          400: '#7c9c84',
          500: '#5c7f66',
        },
        lime: {
          100: '#f7fcd4',
          200: '#eff9ad',
          300: '#dff279',
          400: '#cbe74f',
          500: '#b1d12c',
        }
      }
    },
  },
  plugins: [],
}
