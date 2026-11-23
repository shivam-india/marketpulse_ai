"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GlassPanel } from "./GlassPanel";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  trend?: "bull" | "bear" | "neutral";
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  change,
  trend = "neutral",
  icon,
  hint,
  className,
}: MetricCardProps) {
  const trendColors = {
    bull: "text-emerald-400",
    bear: "text-rose-400",
    neutral: "text-[#92959D]",
  };

  return (
    <GlassPanel
      variant="flat"
      padding="sm"
      className={cn(
        "flex flex-col justify-between transition-all hover:bg-white/[0.04]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-sans text-[#92959D] uppercase tracking-wider font-medium">
          {label}
        </span>
        {icon && <span className="text-[#5F636B]">{icon}</span>}
      </div>

      <div className="my-1.5 flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold font-tabular text-[#F5F5F2] tracking-tight">
          {value}
        </span>
        {change && (
          <span className={cn("text-xs font-tabular font-medium", trendColors[trend])}>
            {change}
          </span>
        )}
      </div>

      {(subValue || hint) && (
        <div className="text-[10px] font-sans text-[#5F636B] truncate">
          {subValue || hint}
        </div>
      )}
    </GlassPanel>
  );
}
