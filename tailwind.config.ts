import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        elevated: "hsl(var(--elevated) / <alpha-value>)",
        fg: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted-foreground) / <alpha-value>)",
        line: "hsl(var(--border) / <alpha-value>)",
        coral: "hsl(var(--coral) / <alpha-value>)",
        ember: "hsl(var(--ember) / <alpha-value>)",
        wine: "hsl(var(--wine) / <alpha-value>)",
        ok: "hsl(var(--ok) / <alpha-value>)",
        sky: "hsl(var(--sky) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { page: "1160px" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        pulseRing: "pulseRing 1.8s cubic-bezier(0.2,0.6,0.3,1) infinite",
        floaty: "floaty 5s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
