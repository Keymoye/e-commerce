import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // or "class" if you’ll toggle manually
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        purple: "var(--color-purple)",
        pink: "var(--color-pink)",
        soft: "var(--color-soft)",
      },
    },
  },
  plugins: [],
};

export default config;
