"use client";

import React, { useState, useRef } from "react";
import { ChartVisionDetection } from "@/types/market";
import {
  FileImage,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";

interface ChartVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
}

export function ChartVisionModal({
  isOpen,
  onClose,
  activeSymbol,
}: ChartVisionModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visionResult, setVisionResult] = useState<ChartVisionDetection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setVisionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeChart = async () => {
    if (!imagePreview) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          assetSymbol: activeSymbol,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setVisionResult(json.data);
      }
    } catch (err) {
      console.error("Vision analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="liquid-glass-elevated rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-white/[0.14] shadow-2xl font-tabular">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#F5F5F2] uppercase tracking-wider">
                  Multimodal AI Chart Vision Parser
                </h2>
                <GlassCapsule variant="champagne" size="xs">
                  {activeSymbol}
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Upload any trading chart screenshot to extract market structure, imbalances, and candlestick patterns.
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

        {/* Upload & Preview Area */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-[#D4AF37]/40 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-white/[0.02] flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#92959D]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#F5F5F2]">
                Click or drag & drop chart screenshot
              </div>
              <p className="text-xs text-[#5F636B] mt-1 font-sans">
                Supports TradingView, MT4/MT5, cTrader, or broker chart captures (PNG, JPG)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] max-h-72 bg-black/40 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Chart preview"
                className="max-h-72 object-contain"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setVisionResult(null);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 text-[#F5F5F2] hover:bg-black/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleAnalyzeChart}
                disabled={loading}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {loading ? "Analyzing Chart Structures..." : "Run Multimodal AI Vision"}
              </GlassButton>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Vision Analysis Results */}
        {visionResult && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="font-semibold text-[#F5F5F2] text-xs uppercase">
                Detected Visual Structures
              </span>
              <GlassCapsule variant="champagne" size="xs">
                CONFIDENCE: {visionResult.confidenceScore}%
              </GlassCapsule>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase block">Detected Trend</span>
                <span className="font-bold text-[#F5F5F2] capitalize mt-0.5 block">{visionResult.trendDetected}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase block">Structure Break</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{visionResult.structureBreak || "None Detected"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase block">Volume Assessment</span>
                <span className="font-bold text-[#E5C07B] mt-0.5 block truncate">{visionResult.visibleVolumeAssessment || "Normal"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[10px] text-[#5F636B] uppercase block">Patterns Found</span>
                <span className="font-bold text-sky-400 mt-0.5 block">{visionResult.patternsIdentified.length} Detected</span>
              </div>
            </div>

            {visionResult.candlestickObservations.length > 0 && (
              <div className="text-xs text-[#92959D] font-sans leading-relaxed space-y-1">
                <span className="text-[#F5F5F2] font-semibold text-[11px] block">Observations:</span>
                {visionResult.candlestickObservations.map((obs, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[#D4AF37]">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            )}

            {visionResult.honestLimitationsNotice && (
              <div className="text-[11px] text-[#5F636B] font-sans border-t border-white/[0.04] pt-2">
                {visionResult.honestLimitationsNotice}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
