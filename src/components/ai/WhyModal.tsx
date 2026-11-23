"use client";

import React from "react";
import { AIReasoningOutput, AssetInfo } from "@/types/market";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlook: AIReasoningOutput;
  asset: AssetInfo;
}

export function WhyModal({ isOpen, onClose, outlook, asset }: WhyModalProps) {
  if (!isOpen) return null;

  const isBullish = outlook.overallBias === "bullish";
  const isBearish = outlook.overallBias === "bearish";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="liquid-glass-elevated rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 border border-white/[0.14] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wide">
                Algorithmic Explainability & Evidence
              </h2>
              <p className="text-xs text-[#92959D] mt-0.5">
                Transparent breakdown of model reasoning for {asset.symbol} ({outlook.timeframe.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thesis Summary Card */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between font-tabular text-xs">
          <div>
            <span className="text-[#92959D]">CURRENT MODEL BIAS: </span>
            <span
              className={`font-bold uppercase ${
                isBullish
                  ? "text-emerald-400"
                  : isBearish
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {outlook.overallBias} ({outlook.calibratedConfidence}%)
            </span>
          </div>
          <div className="text-[#92959D]">
            CONFLUENCE: <span className="text-[#E5C07B] font-bold">{outlook.confluenceScore}/100</span>
          </div>
        </div>

        {/* Section 1: Supporting Evidence */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 font-tabular uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Primary Supporting Evidence (Why {outlook.overallBias.toUpperCase()}?)</span>
          </div>
          <div className="space-y-2">
            {outlook.keyReasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 text-xs text-[#F5F5F2] flex items-start gap-2.5"
              >
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Conflicting Signals */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 font-tabular uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Conflicting Signals & Risk Factors</span>
          </div>
          <div className="space-y-2">
            {outlook.conflictingSignals.map((signal, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-xs text-[#F5F5F2] flex items-start gap-2.5"
              >
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
                <span className="leading-relaxed">{signal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Integrity Disclaimer */}
        <div className="pt-3 border-t border-white/[0.06] text-[11px] text-[#5F636B] leading-relaxed">
          Confidence is calibrated via historical Bayesian walk-forward testing. No analytical projection constitutes financial advice or guarantee of future execution.
        </div>
      </div>
    </div>
  );
}
