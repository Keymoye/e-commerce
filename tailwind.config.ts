import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", 
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      backgroundImage: {
        "gradient-main":
          "linear-gradient(to bottom right, var(--color-primary), var(--color-background))",
      },
    },
  },
  plugins: [],
};

export default config;
