// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    // se tiver outras pastas com TSX:
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 30px -10px rgba(0,0,0,.25)" },
    },
  },
  plugins: [],
};

export default config;
