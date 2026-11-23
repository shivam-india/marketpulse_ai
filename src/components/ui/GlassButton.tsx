"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "accent" | "bull" | "bear";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function GlassButton({
  variant = "default",
  size = "md",
  icon,
  className,
  children,
  ...props
}: GlassButtonProps) {
  const variantStyles = {
    default:
      "bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] text-[#F5F5F2] border border-white/[0.09] hover:border-white/[0.18] shadow-[0_2px_10px_rgba(0,0,0,0.2)]",
    primary:
      "bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 active:bg-[#D4AF37]/15 text-[#F5F5F2] border border-[#D4AF37]/40 shadow-[0_0_20px_-4px_rgba(212,175,55,0.3)]",
    accent:
      "bg-sky-500/15 hover:bg-sky-500/25 active:bg-sky-500/10 text-sky-300 border border-sky-500/35 shadow-[0_0_20px_-4px_rgba(56,189,248,0.3)]",
    bull:
      "bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/10 text-emerald-300 border border-emerald-500/35",
    bear:
      "bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/10 text-rose-300 border border-rose-500/35",
    ghost:
      "bg-transparent hover:bg-white/[0.06] active:bg-transparent text-[#92959D] hover:text-[#F5F5F2] border border-transparent hover:border-white/[0.08]",
  };

  const sizeStyles = {
    xs: "px-2 py-1 text-[11px] rounded-lg gap-1.5",
    sm: "px-2.5 py-1.5 text-xs rounded-xl gap-2",
    md: "px-3.5 py-2 text-xs font-medium rounded-xl gap-2",
    lg: "px-4 py-2.5 text-sm font-medium rounded-2xl gap-2.5",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
