/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#FFF4EE",
          100: "#FFE8D9",
          200: "#FFD0B5",
          300: "#FFB088",
          400: "#FF8C4E",
          500: "#FF7221",
          600: "#E5600F",
          700: "#C24D08",
          800: "#9A3D06",
          900: "#7A3005",
          950: "#431803",
        },
        surface:        "#ffffff",
        "surface-muted": "#f8fafc",
        border:         "#e2e8f0",
        success: { light: "#f0fdf4", DEFAULT: "#22c55e", dark: "#15803d" },
        warning: { light: "#fefce8", DEFAULT: "#eab308", dark: "#a16207" },
        danger:  { light: "#fef2f2", DEFAULT: "#ef4444", dark: "#b91c1c" },
        info:    { light: "#eff6ff", DEFAULT: "#3b82f6", dark: "#1d4ed8" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      spacing: {
        "sidebar-w":    "260px",
        "topbar-h":     "64px",
        "sidebar-w-sm": "72px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card:      "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        sidebar:   "2px 0 8px 0 rgb(0 0 0 / 0.06)",
        topbar:    "0 1px 4px 0 rgb(0 0 0 / 0.06)",
      },
      keyframes: {
        "fade-in":       { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-in-left": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(0)" } },
        shimmer:         { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in":       "fade-in 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.25s ease-out",
        shimmer:         "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
