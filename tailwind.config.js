/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./screens/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'primary-color': '#0E0E0E',
        'secondary-color': '#1DB954',
        'tertiary-color': '#1E1E1E',
        'text-primary-color': '#F5F5F7',
        'text-secondary-color': '#A0A0A5',
        'text-tertiary-color': '#6E6E73',
      },
      fontFamily: {
        sans: ['Inter'],
        light: ['Inter-Light'],
        medium: ['Inter-Medium'],
        semibold: ['Inter-SemiBold'],
        bold: ['Inter-Bold'],
        extrabold: ['Inter-Extrabold'],
      },
    },
  },
  plugins: [],
}