/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'navy-dark': 'var(--color-navy-dark)',
        'navy':      'var(--color-navy)',
        'blue':      'var(--color-blue)',
        'yellow':    'var(--color-yellow)',
        'yellow-light': 'var(--color-yellow-light)',
      }
    },
  },
  plugins: [],
}
