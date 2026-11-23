"use client";

import React from "react";
import { AIReasoningOutput } from "@/types/market";
import { Layers, ShieldCheck, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

interface ConfluenceGaugeProps {
  outlook: AIReasoningOutput;
}

export function ConfluenceGauge({ outlook }: ConfluenceGaugeProps) {
  const { confluenceBreakdown, multiTimeframeViews, confluenceScore, overallBias } = outlook;

  const categories = [
    { label: "Market Structure", value: confluenceBreakdown.marketStructure },
    { label: "Liquidity Profile", value: confluenceBreakdown.liquidity },
    { label: "Momentum Confluence", value: confluenceBreakdown.momentum },
    { label: "Order Flow Aggression", value: confluenceBreakdown.orderFlow },
    { label: "News NLP Sentiment", value: confluenceBreakdown.news },
    { label: "Macro Yield Spread", value: confluenceBreakdown.macro },
  ];

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
            Market Score & Confluence
          </h3>
        </div>
        <div className="flex items-center gap-2 font-tabular">
          <span className="text-[11px] text-[#5F636B]">SCORE</span>
          <span className="text-base font-bold text-[#E5C07B]">{confluenceScore}</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2.5 font-tabular text-xs">
        {categories.map((cat) => {
          return (
            <div key={cat.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#92959D]">{cat.label}</span>
                <span className="text-[#F5F5F2] font-semibold">{cat.value}</span>
              </div>
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#D4AF37]/60 to-[#E5C07B]"
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Timeframe Alignment */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
        <div className="text-[10px] uppercase font-tabular text-[#5F636B] font-semibold tracking-wider">
          Multi-Timeframe Structure Alignment
        </div>
        <div className="grid grid-cols-5 gap-1.5 font-tabular text-center">
          {multiTimeframeViews.map((view) => {
            const isBull = view.bias === "bullish";
            const isBear = view.bias === "bearish";

            return (
              <div
                key={view.timeframe}
                className="p-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
              >
                <div className="text-[9px] text-[#5F636B] uppercase font-semibold">
                  {view.timeframe}
                </div>
                <div
                  className={`text-[11px] font-bold uppercase mt-0.5 ${
                    isBull
                      ? "text-emerald-400"
                      : isBear
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {isBull ? "BULL" : isBear ? "BEAR" : "NEUT"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
