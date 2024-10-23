import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#197A56",
        "primary-dark": "#146A4A",
        secondary: "#00BE71",
        "secondary-dark": "#00A862",
        tertiary: "#646464",
        "tertiary-dark": "#4A4A4A",
      },
    },
  },
  plugins: [],
};

export default config;
