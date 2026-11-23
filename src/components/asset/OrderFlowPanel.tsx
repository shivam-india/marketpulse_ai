"use client";

import React, { useState } from "react";
import { OrderFlowAnalysis, OrderFlowFootprintBar, AssetInfo } from "@/types/market";
import { BarChart3, AlertTriangle, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { formatPrice } from "@/lib/utils";

interface OrderFlowPanelProps {
  orderFlow: OrderFlowAnalysis;
  footprintBars: OrderFlowFootprintBar[];
  asset: AssetInfo;
}

export function OrderFlowPanel({ orderFlow, footprintBars, asset }: OrderFlowPanelProps) {
  const [activeTab, setActiveTab] = useState<"footprint" | "delta" | "volume_profile">("footprint");

  if (!orderFlow.isAvailable) {
    return (
      <GlassPanel variant="default" padding="md" className="space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="text-xs font-semibold uppercase font-tabular tracking-wider">
            Order-Flow Telemetry Offline For {asset.symbol}
          </h3>
        </div>
        <p className="text-xs text-[#92959D] leading-relaxed">
          Direct tick-level futures / ECN order-book depth feeds are unavailable for {asset.symbol} on the current data provider.
          Live Level 2 DOM and footprint delta matrix are currently active for crypto assets (BTC, ETH, SOL).
        </p>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-[#5F636B] space-y-1 font-tabular">
          <div className="font-semibold text-[#92959D]">Data Architecture Disclosure:</div>
          <div>• Tick delta stream: Offline for spot FX & CFD instruments.</div>
          <div>• To inspect live L2 footprint & delta, select BTC/USD, ETH/USD, or SOL/USD.</div>
        </div>
      </GlassPanel>
    );
  }

  const { cumulativeDeltaSummary, volumeProfile, aggression } = orderFlow;
  const isAccumulating = cumulativeDeltaSummary.trend === "accumulating";

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
            Order Flow & Volume Delta
          </h3>
          <GlassCapsule variant="bull" size="xs">
            LIVE L2
          </GlassCapsule>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] font-tabular text-xs">
          <button
            onClick={() => setActiveTab("footprint")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "footprint"
                ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                : "text-[#92959D] hover:text-[#F5F5F2]"
            }`}
          >
            Footprint Grid
          </button>
          <button
            onClick={() => setActiveTab("delta")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "delta"
                ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                : "text-[#92959D] hover:text-[#F5F5F2]"
            }`}
          >
            Cumulative Delta
          </button>
          <button
            onClick={() => setActiveTab("volume_profile")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "volume_profile"
                ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                : "text-[#92959D] hover:text-[#F5F5F2]"
            }`}
          >
            Volume Profile
          </button>
        </div>
      </div>

      {/* Aggression & Delta Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-tabular text-xs">
        {/* CVD */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
          <span className="text-[10px] text-[#5F636B] uppercase font-medium">Cumulative Volume Delta</span>
          <div className="flex items-center gap-2 my-1">
            {isAccumulating ? (
              <ArrowUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-rose-400" />
            )}
            <span
              className={`text-base font-bold ${
                isAccumulating ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {cumulativeDeltaSummary.periodDelta > 0 ? "+" : ""}
              {cumulativeDeltaSummary.periodDelta.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-[#5F636B] capitalize">
            Trend: {cumulativeDeltaSummary.trend}
          </span>
        </div>

        {/* Aggression */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
          <span className="text-[10px] text-[#5F636B] uppercase font-medium">Aggressive Pressure</span>
          <div className="my-1 space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">{aggression.buyPressurePercent}% Buy</span>
              <span className="text-rose-400">{aggression.sellPressurePercent}% Sell</span>
            </div>
            <div className="h-1.5 w-full bg-rose-500/20 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${aggression.buyPressurePercent}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-[#5F636B]">
            {aggression.recentImbalanceSpike ? "⚠️ Delta Imbalance Spike" : "Order absorption normal"}
          </span>
        </div>

        {/* POC */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
          <span className="text-[10px] text-[#5F636B] uppercase font-medium">Point of Control (POC)</span>
          <div className="text-base font-bold text-[#E5C07B] my-1">
            ${formatPrice(volumeProfile.poc)}
          </div>
          <span className="text-[10px] text-[#5F636B]">
            VAH: ${formatPrice(volumeProfile.vah)} | VAL: ${formatPrice(volumeProfile.val)}
          </span>
        </div>
      </div>

      {/* Tab: Footprint Grid */}
      {activeTab === "footprint" && (
        <div className="space-y-2 font-tabular text-xs">
          <div className="overflow-x-auto max-h-[220px]">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase">
                <tr>
                  <th className="p-2">Price Level</th>
                  <th className="p-2 text-right text-rose-400">Bid (Agg. Sells)</th>
                  <th className="p-2 text-right text-emerald-400">Ask (Agg. Buys)</th>
                  <th className="p-2 text-right">Delta</th>
                  <th className="p-2 text-right">Imbalance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {footprintBars.length > 0 && footprintBars[0].priceLevels.map((lvl, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-2 font-bold text-[#F5F5F2]">
                      ${formatPrice(lvl.price)}
                    </td>
                    <td className="p-2 text-right text-rose-300">
                      {lvl.bidVolume.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-emerald-300">
                      {lvl.askVolume.toLocaleString()}
                    </td>
                    <td
                      className={`p-2 text-right font-bold ${
                        lvl.delta > 0
                          ? "text-emerald-400"
                          : lvl.delta < 0
                          ? "text-rose-400"
                          : "text-[#5F636B]"
                      }`}
                    >
                      {lvl.delta > 0 ? "+" : ""}
                      {lvl.delta.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      {lvl.imbalanceBuy ? (
                        <GlassCapsule variant="bull" size="xs">BUY IMB</GlassCapsule>
                      ) : lvl.imbalanceSell ? (
                        <GlassCapsule variant="bear" size="xs">SELL IMB</GlassCapsule>
                      ) : (
                        <span className="text-[#5F636B]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Cumulative Delta */}
      {activeTab === "delta" && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3 font-tabular text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#F5F5F2] font-semibold">Cumulative Volume Delta Summary</span>
            <span className="text-[#5F636B] text-[11px]">
              {cumulativeDeltaSummary.divergenceDetected
                ? "⚠️ Delta Divergence Detected"
                : "No divergence detected against price"}
            </span>
          </div>
          <p className="text-[#92959D] font-sans leading-relaxed">
            Cumulative volume delta measures net market order aggression. When delta moves higher while price consolidates, it signifies institutional limit absorption.
          </p>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
            <span className="text-[#92959D]">Net Period Aggressive Delta:</span>
            <span className={`font-bold ${cumulativeDeltaSummary.periodDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {cumulativeDeltaSummary.periodDelta > 0 ? "+" : ""}{cumulativeDeltaSummary.periodDelta.toLocaleString()} contracts
            </span>
          </div>
        </div>
      )}

      {/* Tab: Volume Profile */}
      {activeTab === "volume_profile" && (
        <div className="space-y-3 font-tabular text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[#92959D]">Value Area High (VAH):</span>
              <span className="font-bold text-[#F5F5F2]">${formatPrice(volumeProfile.vah)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#E5C07B] font-semibold">Point of Control (POC):</span>
              <span className="font-bold text-[#E5C07B]">${formatPrice(volumeProfile.poc)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#92959D]">Value Area Low (VAL):</span>
              <span className="font-bold text-[#F5F5F2]">${formatPrice(volumeProfile.val)}</span>
            </div>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
