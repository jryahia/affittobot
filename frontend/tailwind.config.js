/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "verde-italia": "#009246",
        "rosso-italia": "#CE2B37",
        "oro": "#C8A84B",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "gauge-fill": "gaugeFill 1s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        gaugeFill: {
          from: { "stroke-dashoffset": "283" },
          to: { "stroke-dashoffset": "var(--gauge-offset)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
