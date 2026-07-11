import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a1628",
          900: "#0f1f38",
          800: "#152a4a",
          700: "#1c3760",
          600: "#25477a",
        },
        forest: {
          600: "#1f7a4d",
          500: "#22945c",
          400: "#34b075",
          300: "#6fd19a",
        },
        sand: {
          50: "#f7f8fa",
          100: "#eef1f5",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(10, 22, 40, 0.06), 0 1px 3px 0 rgba(10, 22, 40, 0.08)",
        // Soft "under-glow" shadows used on hover for buttons and cards —
        // a diffuse, mostly-below tinted shadow rather than a hard drop shadow.
        "glow-soft": "0 14px 34px -12px rgba(15, 31, 56, 0.22), 0 6px 16px -6px rgba(34, 148, 92, 0.18)",
        "glow-green": "0 12px 28px -8px rgba(34, 148, 92, 0.55)",
        "glow-violet": "0 12px 28px -8px rgba(124, 58, 237, 0.5)",
        "glow-blue": "0 12px 28px -8px rgba(37, 99, 235, 0.45)",
        "glow-slate": "0 10px 24px -8px rgba(15, 23, 42, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
