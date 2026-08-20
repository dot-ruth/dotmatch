import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C1917",
          dark: "#F5F5F4",
        },
        muted: {
          DEFAULT: "#78716C",
          dark: "#A8A29E",
        },
        subtle: {
          DEFAULT: "#A8A29E",
          dark: "#78716C",
        },
        surface: {
          DEFAULT: "#FAF8F5",
          warm: "#F5F0EB",
          deep: "#EDE8E1",
          dark: {
            DEFAULT: "#0C0A09",
            warm: "#1C1917",
            deep: "#292524",
          },
        },
        border: {
          DEFAULT: "#EDE8E1",
          dark: "#292524",
        },
        forest: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
          muted: "#40916C",
        },
        ember: {
          DEFAULT: "#92400E",
          light: "#B45309",
          muted: "#D97706",
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
        "fade-in": "fadeIn 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-33.333%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
