import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#1E3A5F",  // Navy
          600: "#162D4A",
          700: "#0F1F33",
          900: "#080F1A",
        },
        gold: {
          400: "#D4AF37",
          500: "#C9A227",
          600: "#B8920F",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
        },
      },
      fontFamily: {
        // Hebrew font stack
        sans: ["Rubik", "Assistant", "system-ui", "sans-serif"],
      },
      direction: {
        rtl: "rtl",
      },
    },
  },
  plugins: [],
};

export default config;
