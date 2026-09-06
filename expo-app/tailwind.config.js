/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: "#00296b",
          DEFAULT: "#003f88",
        },
        brand: {
          blue: "#00509d",
          yellow: "#fdc500",
          yellowLight: "#ffd500",
        },
      },
    },
  },
  plugins: [],
};
