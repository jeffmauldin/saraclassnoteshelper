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
        sky: {
          50: "#f2f5f9",
          100: "#e4ebf2",
          200: "#cbd7e5",
          300: "#a4b9d1",
          400: "#7594b9",
          500: "#51749f",
          600: "#3b5a82",
          700: "#2d4666",
          800: "#243750",
          900: "#1d2c3f",
          950: "#101823",
        },
        brand: {
          50: "#f2f5f9",
          100: "#e4ebf2",
          200: "#cbd7e5",
          300: "#a4b9d1",
          400: "#7594b9",
          500: "#51749f",
          600: "#3b5a82",
          700: "#2d4666",
          800: "#243750",
          900: "#1d2c3f",
          950: "#101823",
        },
      },
    },
  },
  plugins: [],
};
export default config;
