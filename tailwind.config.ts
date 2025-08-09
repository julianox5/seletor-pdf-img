import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0,0,0,.25)",
      }
    }
  },
  plugins: []
} satisfies Config;
