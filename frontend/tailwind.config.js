/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        campus: "#2563eb",
        mint: "#0f9f8f",
        paper: "#f7f8fb"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 51, 0.08)"
      }
    },
  },
  plugins: [],
}
