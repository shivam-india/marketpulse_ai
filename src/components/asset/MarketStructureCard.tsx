"use client";

import React from "react";
import { TechnicalAnalysisSummary, AssetInfo } from "@/types/market";
import { GitBranch, Shield, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { formatPrice } from "@/lib/utils";

interface MarketStructureCardProps {
  tech: TechnicalAnalysisSummary;
  asset: AssetInfo;
}

export function MarketStructureCard({ tech, asset }: MarketStructureCardProps) {
  const { marketStructure, trend, signals } = tech;
  const recentBreaks = marketStructure.breaks.slice(-3);

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
            Technical Market Structure & Break of Structure
          </h3>
        </div>
        <div className="flex items-center gap-2 font-tabular text-xs">
          <span className="text-[#5F636B]">STATE:</span>
          <GlassCapsule variant="champagne" size="xs">
            {marketStructure.state.replace(/_/g, " ")}
          </GlassCapsule>
        </div>
      </div>

      {/* Structural Signals Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tabular">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] text-[#5F636B] uppercase tracking-wider">Trend Classification</div>
          <div className="text-sm font-bold text-[#F5F5F2] capitalize mt-1">
            {trend.replace(/_/g, " ")}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] text-[#5F636B] uppercase tracking-wider">EMA Alignment</div>
          <div
            className={`text-sm font-bold uppercase mt-1 ${
              signals.emaAlignment === "bullish"
                ? "text-emerald-400"
                : signals.emaAlignment === "bearish"
                ? "text-rose-400"
                : "text-amber-400"
            }`}
          >
            {signals.emaAlignment}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] text-[#5F636B] uppercase tracking-wider">RSI (14) Momentum</div>
          <div className="text-sm font-bold text-[#F5F5F2] mt-1">
            {tech.indicators.rsi14}{" "}
            <span className="text-[10px] text-[#5F636B] font-normal">
              ({signals.rsiStatus.replace(/_/g, " ")})
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="text-[10px] text-[#5F636B] uppercase tracking-wider">Volatility Regime</div>
          <div className="text-sm font-bold text-[#F5F5F2] capitalize mt-1">
            {signals.volatilityStatus} (BBW: {tech.indicators.bollingerBands.bandwidth}%)
          </div>
        </div>
      </div>

      {/* Recent Structural Breaks (BOS / CHoCH) */}
      <div className="space-y-2 pt-1 font-tabular text-xs">
        <div className="text-[10px] uppercase text-[#5F636B] font-semibold tracking-wider">
          Recent Structural Breaks & Character Shifts (CHoCH)
        </div>
        {recentBreaks.length === 0 ? (
          <div className="text-xs text-[#5F636B] italic p-2">
            No structural break in current window.
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentBreaks.map((b, i) => {
              const isBull = b.type.includes("BULL");
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="flex items-center gap-2.5">
                    <GlassCapsule variant={isBull ? "bull" : "bear"} size="xs">
                      {b.type}
                    </GlassCapsule>
                    <span className="text-[#92959D] font-sans text-xs">{b.description}</span>
                  </div>
                  <span className="text-[#5F636B] text-[11px]">
                    Level: ${formatPrice(b.brokenLevel)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Support / Resistance Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] font-tabular text-xs">
        {/* Support */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase text-emerald-400 font-semibold tracking-wider">
            Institutional Support Zones
          </div>
          {marketStructure.supportLevels.slice(0, 3).map((sup, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20"
            >
              <span className="font-bold text-[#F5F5F2]">${formatPrice(sup.price)}</span>
              <span className="text-[#5F636B] text-[10px]">Touches: {sup.touches}</span>
              <span className="text-emerald-400 text-[10px]">Str: {sup.strength}/10</span>
            </div>
          ))}
        </div>

        {/* Resistance */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase text-rose-400 font-semibold tracking-wider">
            Institutional Resistance Zones
          </div>
          {marketStructure.resistanceLevels.slice(0, 3).map((res, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-rose-500/[0.04] border border-rose-500/20"
            >
              <span className="font-bold text-[#F5F5F2]">${formatPrice(res.price)}</span>
              <span className="text-[#5F636B] text-[10px]">Touches: {res.touches}</span>
              <span className="text-rose-400 text-[10px]">Str: {res.strength}/10</span>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
