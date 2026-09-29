/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vb-navy': '#0f172a',    // Deep Navy
        'vb-navy-light': '#1e293b', 
        'vb-saffron': '#ff9933', // Saffron inspired accent
        'vb-saffron-light': '#ffb366',
        'vb-saffron-dark': '#cc7a29',
        'vb-white': '#f8fafc',
        'vb-gray': '#e2e8f0',
        'vb-dark-gray': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
