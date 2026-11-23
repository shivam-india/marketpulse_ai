"use client";

import React, { useState } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { BacktestResult, Timeframe } from "@/types/market";
import {
  FlaskConical,
  Play,
  TrendingUp,
  Percent,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatPrice } from "@/lib/utils";

export function BacktestView() {
  const [selectedAsset, setSelectedAsset] = useState<string>("XAU/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("15m");
  const [lookbackBars, setLookbackBars] = useState<number>(200);
  const [minConfluence, setMinConfluence] = useState<number>(68);
  const [riskReward, setRiskReward] = useState<number>(2.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedAsset,
          timeframe: selectedTimeframe,
          lookbackBars,
          minConfluenceScore: minConfluence,
          riskRewardRatio: riskReward,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error("Backtest failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Walk-Forward Strategy Backtesting Studio
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  ZERO LOOKAHEAD BIAS
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Evaluates quantitative multi-factor confluence model strictly using information available at bar close.
              </p>
            </div>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleRunBacktest}
            disabled={loading}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            {loading ? "Running Simulation..." : "Execute Walk-Forward Test"}
          </GlassButton>
        </div>

        {/* Configuration Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-white/[0.06] font-tabular text-xs">
          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Instrument</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            >
              {SUPPORTED_ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol} className="bg-[#0D0F12]">
                  {a.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as Timeframe)}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            >
              <option value="5m" className="bg-[#0D0F12]">5M</option>
              <option value="15m" className="bg-[#0D0F12]">15M</option>
              <option value="1h" className="bg-[#0D0F12]">1H</option>
              <option value="4h" className="bg-[#0D0F12]">4H</option>
              <option value="1d" className="bg-[#0D0F12]">1D</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Historical Bars</label>
            <input
              type="number"
              value={lookbackBars}
              onChange={(e) => setLookbackBars(Number(e.target.value))}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Min Confluence</label>
            <input
              type="number"
              value={minConfluence}
              onChange={(e) => setMinConfluence(Number(e.target.value))}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Target R:R</label>
            <input
              type="number"
              step="0.1"
              value={riskReward}
              onChange={(e) => setRiskReward(Number(e.target.value))}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Results View */}
      {result && (
        <div className="space-y-4 font-tabular animate-fadeIn">
          {/* Key Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <GlassPanel variant="flat" padding="sm">
              <span className="text-[10px] text-[#5F636B] uppercase font-medium">Win Rate</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {result.winRatePercent}%
              </div>
              <span className="text-[10px] text-[#5F636B]">
                {result.winCount} wins / {result.totalTrades} signals
              </span>
            </GlassPanel>

            <GlassPanel variant="flat" padding="sm">
              <span className="text-[10px] text-[#5F636B] uppercase font-medium">Profit Factor</span>
              <div className="text-xl font-bold text-[#E5C07B] mt-1">
                {result.profitFactor}x
              </div>
              <span className="text-[10px] text-[#5F636B]">Gross profit vs gross loss</span>
            </GlassPanel>

            <GlassPanel variant="flat" padding="sm">
              <span className="text-[10px] text-[#5F636B] uppercase font-medium">Max Drawdown</span>
              <div className="text-xl font-bold text-rose-400 mt-1">
                -{result.maxDrawdownPercent}%
              </div>
              <span className="text-[10px] text-[#5F636B]">Peak-to-trough decline</span>
            </GlassPanel>

            <GlassPanel variant="flat" padding="sm">
              <span className="text-[10px] text-[#5F636B] uppercase font-medium">Sharpe Ratio</span>
              <div className="text-xl font-bold text-[#F5F5F2] mt-1">
                {result.sharpeRatio}
              </div>
              <span className="text-[10px] text-[#5F636B]">Expectancy: {result.expectancyPips} pips</span>
            </GlassPanel>
          </div>

          {/* Trade Log Table */}
          <GlassPanel variant="default" padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-semibold text-xs text-[#F5F5F2] uppercase">
                Simulated Signal Execution History
              </span>
              <span className="text-xs text-[#5F636B]">
                Asset: {result.assetSymbol} • {result.timeframe.toUpperCase()}
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase bg-white/[0.01]">
                    <th className="py-2.5 px-3">Entry Time</th>
                    <th className="py-2.5 px-3">Direction</th>
                    <th className="py-2.5 px-3">Entry Price</th>
                    <th className="py-2.5 px-3">Exit Price</th>
                    <th className="py-2.5 px-3">Outcome</th>
                    <th className="py-2.5 px-3 text-right">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {result.tradesList.map((trade) => {
                    const isWin = trade.outcome === "win";
                    return (
                      <tr key={trade.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 text-[#92959D]">
                          {new Date(trade.entryTime).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold uppercase">
                          <span className={trade.direction === "long" ? "text-emerald-400" : "text-rose-400"}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#F5F5F2]">
                          ${formatPrice(trade.entryPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-[#F5F5F2]">
                          ${formatPrice(trade.exitPrice)}
                        </td>
                        <td className="py-2.5 px-3">
                          <GlassCapsule variant={isWin ? "bull" : "bear"} size="xs">
                            {trade.outcome.toUpperCase()}
                          </GlassCapsule>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                          {trade.returnPercent > 0 ? "+" : ""}{trade.returnPercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
