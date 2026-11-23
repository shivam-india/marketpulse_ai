"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCapsuleProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "bull" | "bear" | "amber" | "champagne" | "sky";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export function GlassCapsule({
  variant = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: GlassCapsuleProps) {
  const variantStyles = {
    neutral:
      "bg-white/[0.06] text-[#92959D] border border-white/[0.09]",
    bull:
      "bg-emerald-500/[0.12] text-emerald-300 border border-emerald-500/25",
    bear:
      "bg-rose-500/[0.12] text-rose-300 border border-rose-500/25",
    amber:
      "bg-amber-500/[0.12] text-amber-300 border border-amber-500/25",
    champagne:
      "bg-[#D4AF37]/[0.15] text-[#E5C07B] border border-[#D4AF37]/30",
    sky:
      "bg-sky-500/[0.12] text-sky-300 border border-sky-500/25",
  };

  const dotColors = {
    neutral: "bg-slate-400",
    bull: "bg-emerald-400",
    bear: "bg-rose-400",
    amber: "bg-amber-400",
    champagne: "bg-[#D4AF37]",
    sky: "bg-sky-400",
  };

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[10px] gap-1.5",
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-tabular font-medium rounded-full backdrop-blur-md tracking-wider uppercase select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
