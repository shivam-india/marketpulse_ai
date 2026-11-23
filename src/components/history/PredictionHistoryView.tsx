"use client";

import React, { useState } from "react";
import { INITIAL_PREDICTION_HISTORY } from "@/lib/storage/store";
import { HistoricalPredictionRecord } from "@/types/market";
import { History, CheckCircle2, XCircle, TrendingUp, HelpCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { formatPrice } from "@/lib/utils";

export function PredictionHistoryView() {
  const [history, setHistory] = useState<HistoricalPredictionRecord[]>(INITIAL_PREDICTION_HISTORY);

  const totalEvaluated = history.filter((h) => h.actualOutcome).length;
  const successfulCount = history.filter((h) => h.actualOutcome === "success").length;
  const directionalAccuracy =
    totalEvaluated > 0 ? Number(((successfulCount / totalEvaluated) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-5 font-tabular">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Forecast Track Record & Self-Evaluation History
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  AUTONOMOUS AUDIT
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Every historical outlook is timestamped and tracked against subsequent price action to calibrate Bayesian confidence.
              </p>
            </div>
          </div>

          {/* Stats Capsule */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs">
            <div>
              <div className="text-[10px] text-[#5F636B] uppercase font-semibold">Directional Accuracy</div>
              <div className="text-lg font-bold text-emerald-400">
                {directionalAccuracy}%{" "}
                <span className="text-xs text-[#92959D] font-normal">
                  ({successfulCount}/{totalEvaluated})
                </span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/[0.08]" />
            <div>
              <div className="text-[10px] text-[#5F636B] uppercase font-semibold">Audited Forecasts</div>
              <div className="text-lg font-bold text-[#F5F5F2]">{history.length}</div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* History Log Table */}
      <GlassPanel variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3">Instrument</th>
                <th className="py-3 px-3">Timeframe</th>
                <th className="py-3 px-3">Predicted Bias</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Entry Price</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-4">Core Thesis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {history.map((record) => {
                const isSuccess = record.actualOutcome === "success";

                return (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#92959D] whitespace-nowrap">
                      {new Date(record.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#F5F5F2]">
                      {record.assetSymbol}
                    </td>
                    <td className="py-3 px-3 text-[#92959D] uppercase">
                      {record.timeframe}
                    </td>
                    <td className="py-3 px-3">
                      <GlassCapsule
                        variant={record.predictedBias === "bullish" ? "bull" : record.predictedBias === "bearish" ? "bear" : "amber"}
                        size="xs"
                      >
                        {record.predictedBias}
                      </GlassCapsule>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#F5F5F2]">
                      {record.predictedConfidence}%
                    </td>
                    <td className="py-3 px-3 text-[#F5F5F2]">
                      ${formatPrice(record.entryPrice)}
                    </td>
                    <td className="py-3 px-3">
                      {record.actualOutcome ? (
                        <GlassCapsule variant={isSuccess ? "bull" : "bear"} size="xs">
                          {isSuccess ? "CORRECT" : "INVALIDATED"}
                        </GlassCapsule>
                      ) : (
                        <span className="text-[#5F636B] text-[10px]">MONITORING</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-[#92959D] max-w-sm truncate">
                      {record.reasoningSnippet}
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
