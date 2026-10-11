/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: { 950: "#070a14", 900: "#0b1020", 800: "#111833", 700: "#1a2347" },
      },
      boxShadow: { glow: "0 0 40px -10px rgba(124,58,237,0.55)" },
    },
  },
  plugins: [],
};
