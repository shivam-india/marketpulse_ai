import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#08090B",
          900: "#0D0F12",
          850: "#13161B",
          800: "#181D24",
          750: "#222731",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#F5F5F2",
          secondary: "#92959D",
          muted: "#5F636B",
        },
        liquid: {
          surface: "rgba(255, 255, 255, 0.045)",
          surfaceHover: "rgba(255, 255, 255, 0.08)",
          surfaceActive: "rgba(255, 255, 255, 0.11)",
          border: "rgba(255, 255, 255, 0.09)",
          borderHover: "rgba(255, 255, 255, 0.16)",
          champagne: "#D4AF37",
          champagneLight: "#E5C07B",
          champagneMuted: "rgba(212, 175, 55, 0.12)",
          bull: "#22C55E",
          bullSoft: "#4ADE80",
          bullMuted: "rgba(34, 197, 94, 0.12)",
          bear: "#EF4444",
          bearSoft: "#F87171",
          bearMuted: "rgba(239, 68, 68, 0.12)",
          amber: "#F59E0B",
          amberMuted: "rgba(245, 158, 11, 0.12)",
          sky: "#38BDF8",
          skyMuted: "rgba(56, 189, 248, 0.12)",
        },
        terminal: {
          950: "#08090B",
          900: "#0D0F12",
          850: "#13161B",
          800: "#181D24",
          border: "rgba(255, 255, 255, 0.08)",
          muted: "#92959D",
          text: "#F5F5F2",
        },
        market: {
          bull: "#22C55E",
          bullMuted: "rgba(34, 197, 94, 0.12)",
          bear: "#EF4444",
          bearMuted: "rgba(239, 68, 68, 0.12)",
          accent: "#38BDF8",
          gold: "#D4AF37",
          violet: "#A855F7",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "JetBrains Mono",
          "IBM Plex Mono",
          "ui-monospace",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        liquid: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        liquidHover: "0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)",
        liquidModal: "0 24px 64px -12px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        glowChampagne: "0 0 24px -4px rgba(212, 175, 55, 0.22)",
        glowBull: "0 0 20px -4px rgba(34, 197, 94, 0.25)",
        glowBear: "0 0 20px -4px rgba(239, 68, 68, 0.25)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        pulseSubtle: "pulseSubtle 3s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        ticker: "ticker 40s linear infinite",
        fadeIn: "fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        expand: "expand 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.97)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        expand: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
