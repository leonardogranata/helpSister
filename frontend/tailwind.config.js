/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hs-purple-dark':  '#1a0533',
        'hs-purple':       '#6105A6',
        'hs-purple-mid':   '#A066CD',
        'hs-purple-light': '#C088ED',
        'hs-lavender':     '#ede9fe',
        'hs-bg':           '#F8F0FF',
        'hs-white':        '#FBFBFB',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"Outfit"', 'sans-serif'],
        alt:     ['"Jost"', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(97, 5, 166, 0.08)',
        md: '0 8px 24px rgba(97, 5, 166, 0.12)',
        lg: '0 16px 48px rgba(97, 5, 166, 0.18)',
      },
    },
  },
  plugins: [],
}