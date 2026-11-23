"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = "md",
  className,
}: TabsProps<T>) {
  const sizeStyles = {
    sm: "p-0.5 text-xs gap-1",
    md: "p-1 text-xs gap-1.5",
    lg: "p-1.5 text-sm gap-2",
  };

  const itemSizeStyles = {
    sm: "px-2.5 py-1 rounded-lg",
    md: "px-3 py-1.5 rounded-xl",
    lg: "px-4 py-2 rounded-xl",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl p-1 select-none",
        sizeStyles[size],
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] focus:outline-none",
              itemSizeStyles[size],
              isActive
                ? "bg-white/[0.12] text-[#F5F5F2] border border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.05] border border-transparent"
            )}
          >
            {tab.icon && <span className="mr-1.5 opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-tabular",
                  isActive
                    ? "bg-[#D4AF37]/25 text-[#E5C07B] border border-[#D4AF37]/35"
                    : "bg-white/10 text-slate-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
