import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#1C1917",
        paper: {
          DEFAULT: "#FAF8F5",
          warm: "#F5F0EB",
          deep: "#EDE8E1",
        },
        forest: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
          muted: "#40916C",
        },
        ember: {
          DEFAULT: "#C2410C",
          light: "#EA580C",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Sans 3"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(28, 25, 23, 0.08), 0 1px 2px rgba(28, 25, 23, 0.06)",
        "card-hover": "0 4px 12px rgba(28, 25, 23, 0.12), 0 2px 4px rgba(28, 25, 23, 0.08)",
        elevated: "0 10px 30px rgba(28, 25, 23, 0.12), 0 4px 8px rgba(28, 25, 23, 0.06)",
      },
      animation: {
        marquee: "marquee 8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
