"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "live" | "updating" | "offline" | "warning";
  label?: string;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  className,
}: StatusIndicatorProps) {
  const statusConfig = {
    live: {
      color: "bg-emerald-400",
      pingColor: "bg-emerald-400",
      text: "text-emerald-300",
      defaultLabel: "LIVE",
    },
    updating: {
      color: "bg-sky-400",
      pingColor: "bg-sky-400",
      text: "text-sky-300",
      defaultLabel: "UPDATING",
    },
    warning: {
      color: "bg-amber-400",
      pingColor: "bg-amber-400",
      text: "text-amber-300",
      defaultLabel: "DEGRADED",
    },
    offline: {
      color: "bg-slate-500",
      pingColor: "bg-slate-500",
      text: "text-slate-400",
      defaultLabel: "OFFLINE",
    },
  };

  const current = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md font-tabular text-[10px] uppercase font-semibold tracking-wider select-none",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {status !== "offline" && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
              current.pingColor
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            current.color
          )}
        />
      </span>
      <span className={current.text}>{label || current.defaultLabel}</span>
    </div>
  );
}
