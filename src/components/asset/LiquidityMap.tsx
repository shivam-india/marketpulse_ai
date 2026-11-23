"use client";

import React, { useState } from "react";
import { LiquidityPool, AssetInfo } from "@/types/market";
import { Droplets, AlertCircle, Target, Layers } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { formatPrice } from "@/lib/utils";

interface RealLiquidityData {
  isAvailable: boolean;
  providerName: string;
  bidLiquidityUSD: number;
  askLiquidityUSD: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  bids: { price: number; quantity: number; totalUSD: number }[];
  asks: { price: number; quantity: number; totalUSD: number }[];
  notice: string;
}

interface LiquidityMapProps {
  pools: LiquidityPool[];
  asset: AssetInfo;
  realLiquidity?: RealLiquidityData;
}

export function LiquidityMap({ pools, asset, realLiquidity }: LiquidityMapProps) {
  const isDirect = realLiquidity?.isAvailable ?? asset.supportedLiquidityDepth;
  const [activeTab, setActiveTab] = useState<"dom" | "pools">(isDirect ? "dom" : "pools");

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <Droplets className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
            Liquidity Intelligence & Depth
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          {isDirect && (
            <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] font-tabular text-xs">
              <button
                onClick={() => setActiveTab("dom")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === "dom"
                    ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                L2 DOM Book
              </button>
              <button
                onClick={() => setActiveTab("pools")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTab === "pools"
                    ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                Target Pools
              </button>
            </div>
          )}

          {/* Honest Disclosure Capsule */}
          <GlassCapsule variant={isDirect ? "bull" : "amber"} size="xs">
            {isDirect ? "LIVE L2 DOM" : "SWING POOL PROXY"}
          </GlassCapsule>
        </div>
      </div>

      {/* When real DOM is not available, show clear disclosure */}
      {!isDirect && (
        <div className="p-3 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 text-xs text-[#92959D] leading-relaxed font-sans space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 font-tabular">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Exchange L2 order-book feed unavailable for spot forex/indices</span>
          </div>
          <p className="text-[11px] text-[#5F636B]">
            Direct Level 2 book feeds require dedicated exchange/ECN connectivity. The concentrations below represent algorithmic liquidity pools derived from market structure swing highs/lows.
          </p>
        </div>
      )}

      {/* Real L2 DOM Book */}
      {isDirect && realLiquidity && activeTab === "dom" && (
        <div className="space-y-3 font-tabular text-xs">
          <div className="flex items-center justify-between text-xs text-[#92959D] p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <span className="text-[#5F636B]">Total Bids: </span>
              <strong className="text-emerald-400 font-semibold">
                ${(realLiquidity.bidLiquidityUSD / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
              </strong>
            </div>
            <div>
              <span className="text-[#5F636B]">Spread: </span>
              <strong className="text-[#F5F5F2]">{realLiquidity.spread}</strong>
            </div>
            <div>
              <span className="text-[#5F636B]">Total Asks: </span>
              <strong className="text-rose-400 font-semibold">
                ${(realLiquidity.askLiquidityUSD / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Bids */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-emerald-400 font-bold uppercase pb-1 border-b border-emerald-500/20">
                Bids (Buyers)
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto no-scrollbar">
                {realLiquidity.bids.slice(0, 8).map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-emerald-500/[0.08] transition-colors">
                    <span className="text-emerald-300 font-semibold">${formatPrice(b.price)}</span>
                    <span className="text-[#5F636B]">{b.quantity.toFixed(3)}</span>
                    <span className="text-[#92959D]">${Math.round(b.totalUSD).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-rose-400 font-bold uppercase pb-1 border-b border-rose-500/20">
                Asks (Sellers)
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto no-scrollbar">
                {realLiquidity.asks.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-rose-500/[0.08] transition-colors">
                    <span className="text-rose-300 font-semibold">${formatPrice(a.price)}</span>
                    <span className="text-[#5F636B]">{a.quantity.toFixed(3)}</span>
                    <span className="text-[#92959D]">${Math.round(a.totalUSD).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Pools Table */}
      {(!isDirect || activeTab === "pools") && (
        <div className="space-y-3 font-tabular text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase tracking-wider">
                  <th className="py-2 px-2.5">Pool Type</th>
                  <th className="py-2 px-2.5">Price Level</th>
                  <th className="py-2 px-2.5">Distance</th>
                  <th className="py-2 px-2.5">Est. Depth</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {pools.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#5F636B] italic">
                      No prominent liquidity pool within current buffer.
                    </td>
                  </tr>
                ) : (
                  pools.slice(0, 6).map((pool) => {
                    const isOverhead = pool.priceLevel > asset.currentPrice;

                    return (
                      <tr key={pool.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-2.5 flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="capitalize font-medium text-[#F5F5F2]">
                            {pool.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 font-bold text-[#F5F5F2]">
                          ${formatPrice(pool.priceLevel)}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span
                            className={isOverhead ? "text-rose-400" : "text-emerald-400"}
                          >
                            {isOverhead ? "+" : "-"}
                            {Math.abs(pool.distancePips)} pips ({pool.distancePercent}%)
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-[#92959D]">
                          ${(pool.estimatedVolumeUSD / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-2.5 px-2.5">
                          {pool.swept ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-[#5F636B] line-through">
                              SWEPT
                            </span>
                          ) : (
                            <GlassCapsule variant="champagne" size="xs">
                              ACTIVE TARGET
                            </GlassCapsule>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
