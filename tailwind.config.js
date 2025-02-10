/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
      },
    },
  },
  plugins: [],
} 