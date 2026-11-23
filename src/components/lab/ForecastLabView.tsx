"use client";

import React, { useState } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { BacktestResult, Timeframe } from "@/types/market";
import { CalibrationReport } from "@/lib/calibration/calibration-engine";
import { pulseMemory } from "@/lib/memory/pulse-memory";
import {
  FlaskConical,
  Play,
  TrendingUp,
  Percent,
  AlertTriangle,
  Clock,
  Layers,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Database,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatPrice } from "@/lib/utils";

export function ForecastLabView() {
  const [selectedAsset, setSelectedAsset] = useState<string>("XAU/USD");
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("15m");
  const [lookbackBars, setLookbackBars] = useState<number>(200);
  const [minConfluence, setMinConfluence] = useState<number>(68);
  const [riskReward, setRiskReward] = useState<number>(2.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  // Calibration metrics from Pulse Memory
  const calibrationReport = pulseMemory.getCalibrationMetrics();
  const driftStatus = pulseMemory.checkModelDrift();
  const similarConditions = pulseMemory.queryHistoricalSimilarConditions(selectedAsset, "TREND_UP");

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
    <div className="space-y-6 font-tabular">
      {/* 1. Header Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Forecast Lab & Quantitative Audit
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  RESEARCH SUITE
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Model calibration curves, Brier scores, chronological walk-forward validation, and historical memory recall.
              </p>
            </div>
          </div>
        </div>

        {/* Drift Status Banner */}
        {driftStatus.driftDetected ? (
          <div className="p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-sans">{driftStatus.warningMessage}</span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-sans">
                Model performance stable. Rolling 10-forecast accuracy ({driftStatus.recentAccuracy}%) aligns with historical baseline ({driftStatus.historicalAccuracy}%).
              </span>
            </div>
            <GlassCapsule variant="bull" size="xs">
              ZERO DRIFT
            </GlassCapsule>
          </div>
        )}
      </GlassPanel>

      {/* 2. Calibration & Performance Intelligence Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <GlassPanel variant="flat" padding="sm">
          <span className="text-[10px] text-[#5F636B] uppercase font-semibold">Brier Score</span>
          <div className="text-2xl font-bold text-[#E5C07B] mt-1">
            {calibrationReport.brierScore}
          </div>
          <span className="text-[10px] text-[#5F636B]">Lower is better (0.0 perfect, 0.25 coin toss)</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <span className="text-[10px] text-[#5F636B] uppercase font-semibold">Log Loss (Cross-Entropy)</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {calibrationReport.logLoss}
          </div>
          <span className="text-[10px] text-[#5F636B]">Probability calibration metric</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <span className="text-[10px] text-[#5F636B] uppercase font-semibold">Directional Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {calibrationReport.directionalHitRatePercent}%
          </div>
          <span className="text-[10px] text-[#5F636B]">Empirical hit rate over verified horizons</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <span className="text-[10px] text-[#5F636B] uppercase font-semibold">Return Error (MAE)</span>
          <div className="text-2xl font-bold text-[#F5F5F2] mt-1">
            ±{calibrationReport.expectedReturnMAE}%
          </div>
          <span className="text-[10px] text-[#5F636B]">Mean absolute expected move error</span>
        </GlassPanel>
      </div>

      {/* 3. Memory Recall: "How has this model performed in conditions similar to today's?" */}
      <GlassPanel variant="default" padding="md" className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-semibold text-[#F5F5F2] uppercase tracking-wider">
              Pulse Memory Recall: Conditions Similar to Today's
            </h3>
          </div>
          <GlassCapsule variant="champagne" size="xs">
            {similarConditions.matchedCount} HISTORICAL MATCHES
          </GlassCapsule>
        </div>

        <p className="text-xs text-[#92959D] font-sans leading-relaxed">
          {similarConditions.historicalReliability}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          {similarConditions.sampleCases.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#F5F5F2]">{c.symbol} ({c.timeframe.toUpperCase()})</span>
                <GlassCapsule variant={c.actualOutcome === "success" ? "bull" : "bear"} size="xs">
                  {c.actualOutcome?.toUpperCase()}
                </GlassCapsule>
              </div>
              <div className="text-[10px] text-[#5F636B]">
                Predicted: <strong className="text-[#F5F5F2] uppercase">{c.predictedBias} ({c.confidence}%)</strong>
              </div>
              <div className="text-[10px] text-[#92959D] truncate font-sans">
                Realized: +{c.actualReturnPercent}% return
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* 4. Walk-Forward Chronological Backtest Studio */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F2]">
              Walk-Forward Backtesting Configuration
            </h3>
            <p className="text-xs text-[#92959D] font-sans mt-0.5">
              Strictly rolling train/test split. Prevents future lookahead leakage.
            </p>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleRunBacktest}
            disabled={loading}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            {loading ? "Simulating Walk-Forward..." : "Run Chronological Simulation"}
          </GlassButton>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Asset</label>
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
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Bars Count</label>
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
            <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Risk / Reward</label>
            <input
              type="number"
              step="0.1"
              value={riskReward}
              onChange={(e) => setRiskReward(Number(e.target.value))}
              className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
            />
          </div>
        </div>

        {/* Backtest Result Section */}
        {result && (
          <div className="pt-4 border-t border-white/[0.06] space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase">Win Rate</span>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">{result.winRatePercent}%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase">Profit Factor</span>
                <div className="text-xl font-bold text-[#E5C07B] mt-0.5">{result.profitFactor}x</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase">Max Drawdown</span>
                <div className="text-xl font-bold text-rose-400 mt-0.5">-{result.maxDrawdownPercent}%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase">Sharpe Ratio</span>
                <div className="text-xl font-bold text-[#F5F5F2] mt-0.5">{result.sharpeRatio}</div>
              </div>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
