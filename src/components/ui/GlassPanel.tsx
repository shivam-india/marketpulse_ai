"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated" | "flat";
  glow?: "none" | "champagne" | "bull" | "bear";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function GlassPanel({
  variant = "default",
  glow = "none",
  padding = "md",
  className,
  children,
  ...props
}: GlassPanelProps) {
  const variantStyles = {
    default: "liquid-glass rounded-2xl",
    interactive: "liquid-glass-interactive rounded-2xl cursor-pointer",
    elevated: "liquid-glass-elevated rounded-2xl",
    flat: "bg-white/[0.02] border border-white/[0.06] rounded-2xl",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-6 sm:p-8",
  };

  const glowStyles = {
    none: "",
    champagne: "shadow-[0_0_30px_-6px_rgba(212,175,55,0.22)] border-amber-400/20",
    bull: "shadow-[0_0_30px_-6px_rgba(34,197,94,0.22)] border-emerald-500/20",
    bear: "shadow-[0_0_30px_-6px_rgba(239,68,68,0.22)] border-rose-500/20",
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
