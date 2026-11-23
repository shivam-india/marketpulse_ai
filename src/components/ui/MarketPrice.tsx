"use client";

import React from "react";
import { cn, formatPrice, formatPercent } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MarketPriceProps {
  price: number;
  changePercent?: number;
  currencyPrefix?: string;
  size?: "sm" | "md" | "lg" | "hero";
  showChange?: boolean;
  className?: string;
}

export function MarketPrice({
  price,
  changePercent,
  currencyPrefix = "$",
  size = "md",
  showChange = true,
  className,
}: MarketPriceProps) {
  const isUp = (changePercent ?? 0) >= 0;
  const isZero = (changePercent ?? 0) === 0;

  const sizeStyles = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl sm:text-2xl font-bold tracking-tight",
    hero: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-baseline gap-2.5 font-tabular", className)}>
      <span className={cn("text-[#F5F5F2] font-semibold", sizeStyles[size])}>
        <span className="text-[#92959D] font-normal text-[0.8em] mr-0.5">
          {currencyPrefix}
        </span>
        {formatPrice(price)}
      </span>

      {showChange && changePercent !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-md",
            isZero
              ? "bg-white/[0.06] text-[#92959D]"
              : isUp
              ? "bg-emerald-500/[0.12] text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/[0.12] text-rose-400 border border-rose-500/20"
          )}
        >
          {isUp ? (
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
          )}
          <span>{formatPercent(changePercent)}</span>
        </span>
      )}
    </div>
  );
}
