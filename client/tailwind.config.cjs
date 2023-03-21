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
    extend: {
      animation: {
        'custom-spin': 'spin 1s cubic-bezier(0.25, 0.1, 0.25, 1.0) ',
      },
    },
  },
  plugins: [],
}
