"use client";

import React, { useState, useRef } from "react";
import { AssetInfo, ChartVisionDetection } from "@/types/market";
import { PulseCompareResult, VisionLiveComparison } from "@/lib/vision/pulse-vision-engine";
import {
  FileImage,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  X,
  SplitSquareVertical,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatPrice } from "@/lib/utils";

interface PulseVisionViewProps {
  asset: AssetInfo;
}

export function PulseVisionView({ asset }: PulseVisionViewProps) {
  const [activeTab, setActiveTab] = useState<"single" | "compare">("single");

  // Single Screenshot State
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<ChartVisionDetection | null>(null);
  const [liveComparison, setLiveComparison] = useState<VisionLiveComparison | null>(null);

  // Compare Screenshots State
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<PulseCompareResult | null>(null);

  const singleInputRef = useRef<HTMLInputElement>(null);
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  const handleSingleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSingleImage(reader.result as string);
        setVisionResult(null);
        setLiveComparison(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeSingle = async () => {
    if (!singleImage) return;
    setSingleLoading(true);
    try {
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: singleImage,
          assetSymbol: asset.symbol,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVisionResult(json.data);

        // Compute live comparison
        const approxPrice =
          json.data.supportZones.length > 0 && json.data.resistanceZones.length > 0
            ? (json.data.supportZones[0].priceApprox + json.data.resistanceZones[0].priceApprox) / 2
            : asset.currentPrice;

        const delta = Number((((asset.currentPrice - approxPrice) / approxPrice) * 100).toFixed(2));
        const isOutdated = Math.abs(delta) > 1.2;

        setLiveComparison({
          screenshotPriceApprox: approxPrice,
          liveCurrentPrice: asset.currentPrice,
          priceDeltaPercent: delta,
          isScreenshotOutdated: isOutdated,
          stalenessAssessment: isOutdated
            ? `Screenshot price diverges from live price by ${delta > 0 ? "+" : ""}${delta}%. Price has continued to move since this capture.`
            : "Screenshot price levels align with current live market trading bounds.",
          structuralAlignment: isOutdated ? "diverged" : "aligned",
          fusionSummary: `Pulse Vision extracted ${json.data.trendDetected} structure with ${json.data.confidenceScore}% confidence.`,
        });
      }
    } catch (err) {
      console.error("Vision failed:", err);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleRunCompare = async () => {
    if (!imageA || !imageB) return;
    setCompareLoading(true);
    try {
      const res = await fetch("/api/ai/vision-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageA,
          imageB,
          assetSymbol: asset.symbol,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCompareResult(json.data);
      }
    } catch (err) {
      console.error("Pulse Compare failed:", err);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Pulse Vision & Multi-Screenshot Comparator
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  MULTIMODAL AI PIPELINE
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Extracts market structure from chart screenshots, fuses observations with live market data, and detects structural evolution across captures.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] font-tabular text-xs">
            <button
              onClick={() => setActiveTab("single")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "single"
                  ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                  : "text-[#92959D] hover:text-[#F5F5F2]"
              }`}
            >
              Single Chart Analysis
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "compare"
                  ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                  : "text-[#92959D] hover:text-[#F5F5F2]"
              }`}
            >
              Pulse Compare (2 Screenshots)
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Mode 1: Single Screenshot Analysis */}
      {activeTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-tabular">
          {/* Upload Canvas */}
          <GlassPanel variant="default" padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <span className="font-semibold text-[#F5F5F2] uppercase">
                Chart Screenshot Input ({asset.symbol})
              </span>
              {singleImage && (
                <button
                  onClick={() => {
                    setSingleImage(null);
                    setVisionResult(null);
                    setLiveComparison(null);
                  }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear Image
                </button>
              )}
            </div>

            {!singleImage ? (
              <div
                onClick={() => singleInputRef.current?.click()}
                className="border-2 border-dashed border-white/[0.12] hover:border-[#D4AF37]/40 rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-white/[0.02] flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#92959D]">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F5F5F2]">
                    Upload TradingView / MT5 Screenshot
                  </div>
                  <p className="text-xs text-[#5F636B] font-sans mt-1">
                    Accepts PNG, JPG, or clipboard paste
                  </p>
                </div>
                <input
                  ref={singleInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSingleUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/[0.1] bg-black/40 flex items-center justify-center max-h-80">
                  <img
                    src={singleImage}
                    alt="Uploaded chart"
                    className="max-h-80 object-contain w-full"
                  />
                </div>

                <div className="flex justify-end">
                  <GlassButton
                    variant="primary"
                    size="md"
                    onClick={handleAnalyzeSingle}
                    disabled={singleLoading}
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    {singleLoading ? "Analyzing Structures..." : "Run Multimodal AI Extraction"}
                  </GlassButton>
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Observations & Live Fusion */}
          <GlassPanel variant="default" padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <span className="font-semibold text-[#F5F5F2] uppercase">
                Pulse Vision Observations & Live Fusion
              </span>
              {visionResult && (
                <GlassCapsule variant="champagne" size="xs">
                  CONFIDENCE: {visionResult.confidenceScore}%
                </GlassCapsule>
              )}
            </div>

            {!visionResult ? (
              <div className="p-8 text-center text-xs text-[#5F636B] font-sans">
                Upload and analyze a chart screenshot to extract market structure and test live alignment.
              </div>
            ) : (
              <div className="space-y-4 text-xs animate-fadeIn">
                {/* Structural Summary Metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-[#5F636B] uppercase block">Detected Trend</span>
                    <span className="font-bold text-sm text-[#F5F5F2] capitalize mt-0.5 block">
                      {visionResult.trendDetected}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-[#5F636B] uppercase block">Structure Break</span>
                    <span className="font-bold text-sm text-emerald-400 mt-0.5 block">
                      {visionResult.structureBreak || "None Detected"}
                    </span>
                  </div>
                </div>

                {/* Live Market Fusion Card */}
                {liveComparison && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#E5C07B] uppercase text-[11px]">
                        Live Market Comparison:
                      </span>
                      <GlassCapsule
                        variant={liveComparison.isScreenshotOutdated ? "amber" : "bull"}
                        size="xs"
                      >
                        {liveComparison.isScreenshotOutdated ? "OUTDATED SCREENSHOT" : "LIVE ALIGNED"}
                      </GlassCapsule>
                    </div>
                    <p className="text-[#92959D] font-sans text-xs leading-relaxed">
                      {liveComparison.stalenessAssessment}
                    </p>
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[#5F636B]">
                      <span>Live Quote: <strong className="text-[#F5F5F2]">${formatPrice(liveComparison.liveCurrentPrice)}</strong></span>
                      <span>Variance: <strong className={liveComparison.priceDeltaPercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {liveComparison.priceDeltaPercent > 0 ? "+" : ""}{liveComparison.priceDeltaPercent}%
                      </strong></span>
                    </div>
                  </div>
                )}

                {/* Candlestick Observations */}
                {visionResult.candlestickObservations.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5 font-sans">
                    <span className="text-[10px] text-[#5F636B] uppercase font-semibold font-tabular block">
                      Visual Observations
                    </span>
                    {visionResult.candlestickObservations.map((obs, i) => (
                      <div key={i} className="flex items-start gap-2 text-[#F5F5F2] text-xs">
                        <span className="text-[#D4AF37]">•</span>
                        <span>{obs}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* Mode 2: Pulse Compare (Two Screenshots) */}
      {activeTab === "compare" && (
        <div className="space-y-5 font-tabular">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Screenshot A */}
            <GlassPanel variant="default" padding="sm" className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F5F5F2] uppercase">Capture A (Earlier State)</span>
                {imageA && (
                  <button onClick={() => setImageA(null)} className="text-xs text-rose-400 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              {!imageA ? (
                <div
                  onClick={() => inputARef.current?.click()}
                  className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:bg-white/[0.02]"
                >
                  <Upload className="w-5 h-5 mx-auto text-[#5F636B] mb-2" />
                  <span className="text-xs text-[#92959D]">Upload earlier chart screenshot</span>
                  <input ref={inputARef} type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setImageA(r.result as string);
                      r.readAsDataURL(f);
                    }
                  }} className="hidden" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/[0.08] max-h-56 bg-black/40">
                  <img src={imageA} alt="Capture A" className="max-h-56 object-contain w-full" />
                </div>
              )}
            </GlassPanel>

            {/* Screenshot B */}
            <GlassPanel variant="default" padding="sm" className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F5F5F2] uppercase">Capture B (Subsequent State)</span>
                {imageB && (
                  <button onClick={() => setImageB(null)} className="text-xs text-rose-400 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              {!imageB ? (
                <div
                  onClick={() => inputBRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 text-center cursor-pointer hover:bg-white/[0.02]"
                >
                  <Upload className="w-5 h-5 mx-auto text-[#5F636B] mb-2" />
                  <span className="text-xs text-[#92959D]">Upload subsequent chart screenshot</span>
                  <input ref={inputBRef} type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = () => setImageB(r.result as string);
                      r.readAsDataURL(f);
                    }
                  }} className="hidden" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/[0.08] max-h-56 bg-black/40">
                  <img src={imageB} alt="Capture B" className="max-h-56 object-contain w-full" />
                </div>
              )}
            </GlassPanel>
          </div>

          <div className="flex justify-center">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={handleRunCompare}
              disabled={compareLoading || !imageA || !imageB}
              icon={<SplitSquareVertical className="w-4 h-4" />}
            >
              {compareLoading ? "Computing Visual Delta..." : "Execute Pulse Compare"}
            </GlassButton>
          </div>

          {/* Compare Results Card */}
          {compareResult && (
            <GlassPanel variant="default" padding="md" className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
                <span className="font-semibold text-[#F5F5F2] uppercase tracking-wider">
                  Pulse Compare Delta Analysis ("What Changed?")
                </span>
                <GlassCapsule
                  variant={compareResult.structuralChanges.regimeShiftDetected ? "amber" : "bull"}
                  size="xs"
                >
                  {compareResult.structuralChanges.regimeShiftDetected ? "REGIME SHIFT DETECTED" : "STRUCTURE PRESERVED"}
                </GlassCapsule>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                  <span className="font-semibold uppercase text-[10px] text-[#5F636B] font-tabular block">
                    Structural Transformation Summary
                  </span>
                  <p className="text-[#F5F5F2] leading-relaxed">
                    {compareResult.whatChangedSummary}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                  <span className="font-semibold uppercase text-[10px] text-[#5F636B] font-tabular block">
                    Model Forecasting Implications
                  </span>
                  <p className="text-[#92959D] leading-relaxed">
                    {compareResult.implicationsForForecast}
                  </p>
                </div>
              </div>

              {compareResult.structuralChanges.brokenLevels.length > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs space-y-1">
                  <span className="text-[10px] uppercase text-[#E5C07B] font-semibold block">
                    Levels Breached Across Captures:
                  </span>
                  {compareResult.structuralChanges.brokenLevels.map((lvl, idx) => (
                    <div key={idx} className="text-[#F5F5F2]">
                      • {lvl}
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
}
