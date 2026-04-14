import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Commure Ambient — navy/blue recording, teal/cyan highlights */
        commure: {
          navy: "#0a1628",
          "navy-muted": "#132337",
          blue: "#1e40af",
          "blue-bright": "#2563eb",
          teal: "#0d9488",
          cyan: "#0891b2",
          "cyan-soft": "#22d3ee",
        },
      },
    },
  },
  plugins: [],
};
export default config;
