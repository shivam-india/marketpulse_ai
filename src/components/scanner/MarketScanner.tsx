"use client";

import React, { useState } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetClass, AssetInfo, BiasDirection } from "@/types/market";
import {
  Radar,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { formatPrice, formatPercent } from "@/lib/utils";

interface MarketScannerProps {
  onSelectAsset: (asset: AssetInfo) => void;
}

export function MarketScanner({ onSelectAsset }: MarketScannerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBias, setSelectedBias] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minConfluence, setMinConfluence] = useState<number>(50);

  const scannerData = SUPPORTED_ASSETS.map((asset) => {
    const isUp = asset.change24hPercent >= 0;
    const baseScore = 55 + Math.round(Math.abs(asset.change24hPercent) * 8);
    const score = Math.min(Math.max(baseScore, 48), 88);

    let bias: BiasDirection = "neutral";
    if (score >= 65) bias = isUp ? "bullish" : "bearish";
    else if (score >= 58) bias = isUp ? "bullish" : "bearish";

    return {
      asset,
      score,
      bias,
      regime: isUp ? "Trending Bullish" : "Consolidation / Distribution",
      volatility: Math.abs(asset.change24hPercent) > 1.5 ? "High" : "Average",
      unusualVolume: asset.volume24h > 200000000,
    };
  });

  const filtered = scannerData.filter((item) => {
    if (selectedCategory !== "all" && item.asset.category !== selectedCategory) return false;
    if (selectedBias !== "all" && item.bias !== selectedBias) return false;
    if (item.score < minConfluence) return false;
    if (
      searchQuery &&
      !item.asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Multi-Asset Market Scanner & Confluence Screener
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  REAL-TIME FILTER
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Screens multi-timeframe structural alignment, volume delta spikes, and volatility expansion.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F636B]" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] text-xs font-tabular text-[#F5F5F2] pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.06] font-tabular text-xs">
          {/* Categories */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            {["all", "forex", "commodity", "index", "crypto"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg uppercase transition-all ${selectedCategory === cat
                  ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                  : "text-[#92959D] hover:text-[#F5F5F2]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Minimum Confluence Slider */}
          <div className="flex items-center gap-2 text-xs text-[#92959D]">
            <span>Min Confluence:</span>
            <input
              type="range"
              min={40}
              max={85}
              value={minConfluence}
              onChange={(e) => setMinConfluence(Number(e.target.value))}
              className="accent-[#D4AF37] w-24"
            />
            <span className="font-bold text-[#E5C07B] w-6">{minConfluence}%</span>
          </div>
        </div>
      </GlassPanel>

      {/* Results Table */}
      <GlassPanel variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tabular text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">24h Chg</th>
                <th className="py-3 px-3">Model Bias</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Market Regime</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((item) => {
                const isBull = item.bias === "bullish";
                const isBear = item.bias === "bearish";

                return (
                  <tr
                    key={item.asset.symbol}
                    onClick={() => onSelectAsset(item.asset)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-[#F5F5F2] group-hover:text-[#E5C07B] transition-colors">
                        {item.asset.symbol}
                      </div>
                      <div className="text-[10px] text-[#5F636B] font-sans">{item.asset.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] uppercase font-semibold text-[#92959D] bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.06]">
                        {item.asset.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#F5F5F2]">
                      ${formatPrice(item.asset.currentPrice)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${item.asset.change24hPercent >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                          }`}
                      >
                        {formatPercent(item.asset.change24hPercent)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <GlassCapsule
                        variant={isBull ? "bull" : isBear ? "bear" : "amber"}
                        size="xs"
                      >
                        {item.bias.toUpperCase()}
                      </GlassCapsule>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#E5C07B]">
                      {item.score}%
                    </td>
                    <td className="py-3 px-3 text-[#92959D] font-sans text-xs">
                      {item.regime}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                        <span>Terminal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
