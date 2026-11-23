"use client";

import React, { useState } from "react";
import { AIReasoningOutput, AssetInfo } from "@/types/market";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  Activity,
  Droplets,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatPrice } from "@/lib/utils";

interface AIOutlookPanelProps {
  outlook: AIReasoningOutput;
  asset: AssetInfo;
  onOpenWhyModal: () => void;
}

export function AIOutlookPanel({ outlook, asset, onOpenWhyModal }: AIOutlookPanelProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const isBullish = outlook.overallBias === "bullish";
  const isBearish = outlook.overallBias === "bearish";

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* 1. Pulse Intelligence Signature Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#E5C07B] shadow-[0_0_24px_-4px_rgba(212,175,55,0.35)]">
            <Sparkles className="w-5 h-5 text-[#E5C07B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F2] uppercase font-tabular">
                Pulse Intelligence
              </h2>
              <GlassCapsule variant="champagne" size="xs">
                {outlook.timeframe.toUpperCase()} OUTLOOK
              </GlassCapsule>
            </div>
            <p className="text-xs text-[#92959D] mt-0.5">
              Bayesian multi-factor confluence assessment & structural scenarios
            </p>
          </div>
        </div>

        {/* View Reasoning Toggle Button */}
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.04] text-xs font-tabular text-[#E5C07B] border border-[#D4AF37]/30 transition-all duration-200 active:scale-[0.98]"
        >
          <span>{isReasoningExpanded ? "Collapse Evidence" : "View Reasoning →"}</span>
          {isReasoningExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* 2. Primary Pulse Intelligence Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-tabular">
        {/* Bias Card */}
        <div
          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
            isBullish
              ? "bg-emerald-500/[0.06] border-emerald-500/25"
              : isBearish
              ? "bg-rose-500/[0.06] border-rose-500/25"
              : "bg-amber-500/[0.06] border-amber-500/25"
          }`}
        >
          <span className="text-[10px] text-[#92959D] uppercase tracking-wider font-medium">
            Market Bias
          </span>
          <div className="flex items-center gap-2 my-1">
            {isBullish ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : isBearish ? (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            ) : (
              <div className="w-4 h-1 bg-amber-400 rounded-full" />
            )}
            <span
              className={`text-xl font-bold uppercase tracking-tight ${
                isBullish
                  ? "text-emerald-400"
                  : isBearish
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {outlook.overallBias}
            </span>
          </div>
          <span className="text-[10px] text-[#5F636B]">
            {outlook.scenarios.baseCase.direction.toUpperCase()} SCENARIO LEADING
          </span>
        </div>

        {/* Model Confidence */}
        <div className="p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] text-[#92959D] uppercase tracking-wider font-medium">
            <span>Analysis Confidence</span>
            <span className="text-[#F5F5F2] font-bold text-sm">
              {outlook.calibratedConfidence}%
            </span>
          </div>
          <div className="my-2">
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-600 ${
                  isBullish
                    ? "bg-emerald-400"
                    : isBearish
                    ? "bg-rose-400"
                    : "bg-amber-400"
                }`}
                style={{ width: `${outlook.calibratedConfidence}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#5F636B]">
            Calibrated likelihood (not guaranteed)
          </span>
        </div>

        {/* Confluence Score */}
        <div className="p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between">
          <span className="text-[10px] text-[#92959D] uppercase tracking-wider font-medium">
            Confluence Score
          </span>
          <div className="text-xl font-bold text-[#F5F5F2] my-1">
            {outlook.confluenceScore}
            <span className="text-xs text-[#5F636B] font-normal ml-1">/ 100</span>
          </div>
          <span className="text-[10px] text-[#5F636B]">
            {outlook.confluenceScore >= 70 ? "HIGH CONFLUENCE" : "MODERATE ALIGNMENT"}
          </span>
        </div>

        {/* Regime */}
        <div className="p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between">
          <span className="text-[10px] text-[#92959D] uppercase tracking-wider font-medium">
            Market Regime
          </span>
          <div className="text-xs font-bold text-[#E5C07B] uppercase tracking-tight my-1 truncate">
            {outlook.marketRegime.replace(/_/g, " ")}
          </div>
          <span className="text-[10px] text-[#5F636B]">
            Adaptive structural alignment
          </span>
        </div>
      </div>

      {/* 3. Factor Overview Ribbon */}
      <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs font-tabular">
        <div className="flex flex-wrap items-center gap-4 text-[#92959D]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">Liquidity:</span>
            <span className="text-emerald-400 font-semibold">
              {outlook.confluenceBreakdown.liquidity >= 60 ? "↑ ACCUMULATING" : "→ BALANCED"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">Momentum:</span>
            <span className="text-emerald-400 font-semibold">
              {outlook.confluenceBreakdown.momentum >= 60 ? "↑ BULLISH" : "↓ CONSOLIDATING"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">Order Flow:</span>
            <span className="text-sky-400 font-semibold">
              {outlook.confluenceBreakdown.orderFlow >= 60 ? "↑ BUY PRESSURE" : "→ NEUTRAL"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">Macro:</span>
            <span className="text-[#E5C07B] font-semibold">
              {outlook.confluenceBreakdown.macro >= 60 ? "↑ CONSTRUCTIVE" : "→ BALANCED"}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenWhyModal}
          className="text-[11px] text-[#92959D] hover:text-[#F5F5F2] flex items-center gap-1 underline underline-offset-4"
        >
          <HelpCircle className="w-3 h-3 text-[#D4AF37]" />
          <span>Full Algorithmic Deep Dive</span>
        </button>
      </div>

      {/* 4. Smoothly Expandable Reasoning Section */}
      {isReasoningExpanded && (
        <div className="space-y-4 pt-3 border-t border-white/[0.06] animate-fadeIn">
          {/* Analytical Confluence Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-tabular text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">Structure</span>
              <span className="text-sm font-bold text-[#F5F5F2]">
                {outlook.confluenceBreakdown.marketStructure}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">Liquidity</span>
              <span className="text-sm font-bold text-emerald-400">
                {outlook.confluenceBreakdown.liquidity}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">Momentum</span>
              <span className="text-sm font-bold text-sky-400">
                {outlook.confluenceBreakdown.momentum}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">Order Flow</span>
              <span className="text-sm font-bold text-[#E5C07B]">
                {outlook.confluenceBreakdown.orderFlow}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">News NLP</span>
              <span className="text-sm font-bold text-[#F5F5F2]">
                {outlook.confluenceBreakdown.news}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-[#5F636B] uppercase block">Macro</span>
              <span className="text-sm font-bold text-[#F5F5F2]">
                {outlook.confluenceBreakdown.macro}
              </span>
            </div>
          </div>

          {/* Supporting Evidence vs Conflicting Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tabular">
            {/* Supporting Evidence */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Supporting Confluence Evidence</span>
              </div>
              <div className="space-y-1.5 text-[#92959D] font-sans">
                {outlook.keyReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conflicting Signals */}
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Conflicting Signals & Risk Factors</span>
              </div>
              <div className="space-y-1.5 text-[#92959D] font-sans">
                {outlook.conflictingSignals.map((signal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">⚠</span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scenarios & Invalidation */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3 font-tabular text-xs">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[#F5F5F2]">
                Base Case Expectation ({outlook.scenarios.baseCase.probability}%)
              </div>
              <div className="text-[#5F636B]">
                Target: <span className="text-[#E5C07B] font-semibold">{outlook.scenarios.baseCase.targetArea}</span>
              </div>
            </div>
            <p className="text-[#92959D] font-sans leading-relaxed">
              {outlook.scenarios.baseCase.title}. Structure is respecting key higher lows with liquidity pools positioned overhead.
            </p>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[#5F636B]">
              <span>Invalidation Trigger:</span>
              <span className="text-rose-400 font-semibold font-tabular">
                ${formatPrice(outlook.keyLevels.thesisInvalidation)}
              </span>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
