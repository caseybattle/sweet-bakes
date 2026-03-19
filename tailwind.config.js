/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0B0C",
        bone: "#FAF9F6",
        neonPink: "#E00065",
        hotPink: "#EC4899",
        pinkMid: "#F9A8D4",
        cream: "#FFFAF5",
      },
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
