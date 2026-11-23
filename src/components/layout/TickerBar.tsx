"use client";

import React, { useState, useEffect } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo } from "@/types/market";
import { ArrowUpRight, ArrowDownRight, Radio } from "lucide-react";
import { formatPrice, formatPercent } from "@/lib/utils";

interface TickerBarProps {
  onSelectAsset: (asset: AssetInfo) => void;
  activeSymbol: string;
}

export function TickerBar({ onSelectAsset, activeSymbol }: TickerBarProps) {
  const [marqueeAssets, setMarqueeAssets] = useState<AssetInfo[]>(
    SUPPORTED_ASSETS.slice(0, 14)
  );

  useEffect(() => {
    async function loadTicker() {
      try {
        const res = await fetch("/api/markets/quotes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setMarqueeAssets(json.data);
        }
      } catch {
        // preserve existing
      }
    }
    loadTicker();
    const interval = setInterval(loadTicker, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-3 sm:px-6 py-1">
      <div className="max-w-[1720px] mx-auto liquid-glass rounded-xl px-3 py-1.5 flex items-center gap-3 overflow-x-auto no-scrollbar select-none border border-white/[0.06]">
        {/* Feed pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] uppercase font-tabular tracking-wider text-[#92959D] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-[#F5F5F2]">TICKER</span>
        </div>

        {/* Ticker Assets Track */}
        <div className="flex items-center gap-2 shrink-0">
          {marqueeAssets.map((asset) => {
            const isSelected = asset.symbol === activeSymbol;
            const isPositive = asset.change24hPercent >= 0;

            return (
              <button
                key={asset.id || asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-left transition-all duration-150 active:scale-[0.98] shrink-0 font-tabular ${
                  isSelected
                    ? "bg-white/[0.14] border border-white/[0.22] text-[#F5F5F2] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                    : "bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                <span className="font-semibold text-xs text-[#F5F5F2]">
                  {asset.symbol}
                </span>
                <span className="text-xs text-[#92959D]">
                  ${formatPrice(asset.currentPrice)}
                </span>
                <span
                  className={`flex items-center text-[11px] font-medium ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                  )}
                  {formatPercent(asset.change24hPercent)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
