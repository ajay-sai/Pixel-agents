import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "pixel-bg": "#0f0f23",
        "pixel-card": "#1a1a2e",
        "pixel-border": "#333366",
        "pixel-green": "#00ff41",
        "pixel-pink": "#ff00ff",
        "pixel-cyan": "#00ffff",
        "pixel-yellow": "#ffff00",
        "pixel-red": "#ff4444",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
