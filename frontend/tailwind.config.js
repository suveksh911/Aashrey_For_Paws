/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8D6E63',
        'primary-dark': '#5D4037',
        accent: '#FFAB91',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}

