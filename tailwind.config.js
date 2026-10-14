/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b0d12',
        panel: '#11141c',
        border: '#1f2430'
      }
    },
  },
  plugins: [],
}
