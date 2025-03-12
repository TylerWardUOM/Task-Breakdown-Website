module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // ✅ Ensures Tailwind scans your Next.js components
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Safelist any background color with arbitrary values for colors
    {
      pattern: /bg-(red|yellow|green|blue|indigo|purple|pink|gray|cool-gray|true-gray|warm-gray|blue-gray|emerald|teal|cyan|sky|rose)-([1-9][0-9]{2})/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class", // Ensures that dark mode is based on a class, not system preference
};
