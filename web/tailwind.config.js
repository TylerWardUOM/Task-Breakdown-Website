module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",  // ✅ Ensures Tailwind scans your Next.js components
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
