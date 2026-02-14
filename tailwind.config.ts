import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        study: {
          mint: "var(--study-mint)",
          sage: "var(--study-sage)",
          sky: "#b5e8f0",
          lavender: "#d4c5f9",
          peach: "#ffdab9",
          cream: "var(--study-bg)",
          card: "var(--study-card)",
          ink: "var(--study-text)",
          soft: "var(--study-muted)",
          border: "var(--study-border)",
          "accent-hover": "var(--study-accent-hover)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
 