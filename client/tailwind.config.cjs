/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {  
      'xxs': {'max': '639px', "min": "0px"},
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [],
}
