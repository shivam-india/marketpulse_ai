/**
 * Liquid Glass Design System Tokens
 * Apple-inspired institutional financial intelligence design specification
 */

export const glassTokens = {
  colors: {
    background: "#08090B",
    secondary: "#0D0F12",
    surface: "rgba(255, 255, 255, 0.045)",
    surfaceHover: "rgba(255, 255, 255, 0.08)",
    surfaceActive: "rgba(255, 255, 255, 0.11)",
    border: "rgba(255, 255, 255, 0.09)",
    borderHover: "rgba(255, 255, 255, 0.15)",
    borderActive: "rgba(255, 255, 255, 0.22)",
    textPrimary: "#F5F5F2",
    textSecondary: "#92959D",
    textMuted: "#5F636B",
    accentChampagne: "#D4AF37",
    accentGold: "#E5C07B",
    bullish: "#22C55E",
    bullishMuted: "rgba(34, 197, 94, 0.12)",
    bearish: "#EF4444",
    bearishMuted: "rgba(239, 68, 68, 0.12)",
    warning: "#F59E0B",
    warningMuted: "rgba(245, 158, 11, 0.12)",
  },
  depth: {
    ambient: "z-0",
    glassNavigation: "z-30",
    primarySurface: "z-10",
    floatingIntelligence: "z-20",
    contextualPopover: "z-40",
    modal: "z-50",
    tooltip: "z-60",
  },
  transitions: {
    micro: "140ms cubic-bezier(0.16, 1, 0.3, 1)",
    default: "220ms cubic-bezier(0.16, 1, 0.3, 1)",
    panel: "450ms cubic-bezier(0.16, 1, 0.3, 1)",
    spatial: "600ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;
