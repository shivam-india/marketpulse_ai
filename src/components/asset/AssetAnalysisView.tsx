"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  AssetInfo,
  Timeframe,
  OHLCV,
  AIReasoningOutput,
} from "@/types/market";
import { InteractiveChart } from "./InteractiveChart";
import { AIOutlookPanel } from "../ai/AIOutlookPanel";
import { ConfluenceGauge } from "../ai/ConfluenceGauge";
import { MarketStructureCard } from "./MarketStructureCard";
import { LiquidityMap } from "./LiquidityMap";
import { OrderFlowPanel } from "./OrderFlowPanel";
import { WhyModal } from "../ai/WhyModal";
import { analyzeMarketStructure } from "@/lib/analysis/market-structure";
import { computeOrderFlowAnalysis } from "@/lib/analysis/order-flow-engine";
import { identifyLiquidityPools } from "@/lib/analysis/liquidity-engine";
import {
  Clock,
  Droplets,
  Layers,
  Sparkles,
  Camera,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { MarketPrice } from "@/components/ui/MarketPrice";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Tabs } from "@/components/ui/Tabs";
import { formatPrice, formatPercent } from "@/lib/utils";

interface AssetAnalysisViewProps {
  asset: AssetInfo;
  onOpenVisionModal: () => void;
}

export function AssetAnalysisView({ asset, onOpenVisionModal }: AssetAnalysisViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("15m");
  const [bars, setBars] = useState<OHLCV[]>([]);
  const [outlook, setOutlook] = useState<AIReasoningOutput | null>(null);
  const [realOrderFlowData, setRealOrderFlowData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"quick" | "deep" | "mtf">("deep");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const lastFetchTimeRef = useRef<number>(Date.now());

  const loadData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [candleRes, outlookRes, orderFlowRes] = await Promise.all([
        fetch(
          `/api/markets/candles?symbol=${encodeURIComponent(asset.symbol)}&timeframe=${timeframe}&count=120`
        ),
        fetch(
          `/api/ai/outlook?symbol=${encodeURIComponent(asset.symbol)}&timeframe=${timeframe}`
        ),
        fetch(
          `/api/orderflow?symbol=${encodeURIComponent(asset.symbol)}`
        ),
      ]);

      const [candleJson, outlookJson, orderFlowJson] = await Promise.all([
        candleRes.json(),
        outlookRes.json(),
        orderFlowRes.json(),
      ]);

      if (candleJson.bars) {
        setBars(candleJson.bars);
      }
      if (outlookJson.success && outlookJson.data) {
        setOutlook(outlookJson.data);
      }
      if (orderFlowJson.success && orderFlowJson.data) {
        setRealOrderFlowData(orderFlowJson.data);
      }

      lastFetchTimeRef.current = Date.now();
      setSecondsAgo(0);
    } catch (err) {
      console.error("Failed to load asset analysis:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [asset.symbol, timeframe]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastFetchTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [asset.symbol, timeframe]);

  const isUp = asset.change24hPercent >= 0;

  const tech = bars.length > 0 ? analyzeMarketStructure(bars, timeframe) : null;
  const { analysis: fallbackOrderFlow, footprintBars: fallbackFootprint } =
    bars.length > 0
      ? computeOrderFlowAnalysis(bars, asset)
      : {
          analysis: {
            isAvailable: false,
            sourceNote: "Order-flow data unavailable for this instrument.",
            cumulativeDeltaSummary: { periodDelta: 0, trend: "neutral" as const, divergenceDetected: false },
            volumeProfile: { poc: asset.currentPrice, vah: asset.currentPrice, val: asset.currentPrice, highVolumeNodes: [], lowVolumeNodes: [] },
            aggression: { buyPressurePercent: 50, sellPressurePercent: 50, recentImbalanceSpike: false },
          },
          footprintBars: [],
        };

  const orderFlowToUse = realOrderFlowData?.orderFlow || fallbackOrderFlow;
  const footprintBarsToUse = realOrderFlowData?.footprintBars?.length
    ? realOrderFlowData.footprintBars
    : fallbackFootprint;

  const pools =
    bars.length > 0 && tech
      ? identifyLiquidityPools(bars, tech.marketStructure.points, asset.currentPrice, asset.pipSize)
      : [];

  return (
    <div className="space-y-5">
      {/* 1. Hero Instrument Header */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Asset Identity & Hero Price */}
          <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F2] font-tabular">
                  {asset.symbol}
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  {asset.category.toUpperCase()}
                </GlassCapsule>
                <GlassCapsule variant={isUp ? "bull" : "bear"} size="xs">
                  {isUp ? "BULLISH BIAS" : "BEARISH BIAS"}
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                {asset.name} • Quote provider: {asset.dataSource || "Realtime FX/Spot Feed"}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <MarketPrice
                price={asset.currentPrice}
                changePercent={asset.change24hPercent}
                size="hero"
              />
            </div>
          </div>

          {/* Controls & Telemetry */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] font-tabular text-xs text-[#92959D]">
              <Clock className="w-3.5 h-3.5 text-[#5F636B]" />
              <span>Updated {secondsAgo}s ago</span>
            </div>

            {/* Analysis Mode switcher */}
            <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] text-xs font-tabular">
              <button
                onClick={() => setAnalysisMode("quick")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  analysisMode === "quick"
                    ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                Quick
              </button>
              <button
                onClick={() => setAnalysisMode("deep")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  analysisMode === "deep"
                    ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                Deep Bayesian
              </button>
              <button
                onClick={() => setAnalysisMode("mtf")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  analysisMode === "mtf"
                    ? "bg-white/[0.14] text-[#F5F5F2] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                Multi-TF
              </button>
            </div>

            {/* Chart Screenshot Multimodal AI trigger */}
            <GlassButton
              variant="default"
              size="sm"
              icon={<Camera className="w-3.5 h-3.5 text-[#D4AF37]" />}
              onClick={onOpenVisionModal}
            >
              Analyze Chart Image
            </GlassButton>

            {/* Manual refresh button */}
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => loadData(false)}
              title="Refresh Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </GlassButton>
          </div>
        </div>

        {/* Spread, 24h High/Low and Pip size bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs font-tabular">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-[#5F636B] uppercase block">24h High</span>
            <span className="font-semibold text-[#F5F5F2]">${formatPrice(asset.high24h || asset.currentPrice * 1.008)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-[#5F636B] uppercase block">24h Low</span>
            <span className="font-semibold text-[#F5F5F2]">${formatPrice(asset.low24h || asset.currentPrice * 0.992)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-[#5F636B] uppercase block">Spread / Pip Size</span>
            <span className="font-semibold text-[#F5F5F2]">{asset.pipSize}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[10px] text-[#5F636B] uppercase block">Order Flow Status</span>
            <span className={asset.supportedOrderFlow ? "text-emerald-400 font-semibold" : "text-[#92959D]"}>
              {asset.supportedOrderFlow ? "LIVE L2 DOM" : "AGGREGATED PROXY"}
            </span>
          </div>
        </div>
      </GlassPanel>

      {/* 2. Interactive Chart Workspace */}
      <InteractiveChart
        asset={asset}
        timeframe={timeframe}
        bars={bars}
        supportLevels={tech?.marketStructure?.supportLevels}
        resistanceLevels={tech?.marketStructure?.resistanceLevels}
        onTimeframeChange={setTimeframe}
        onRefresh={() => loadData(false)}
      />

      {/* 3. Pulse Intelligence & Confluence Radar */}
      {outlook && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <AIOutlookPanel
              outlook={outlook}
              asset={asset}
              onOpenWhyModal={() => setIsWhyModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-1">
            <ConfluenceGauge outlook={outlook} />
          </div>
        </div>
      )}

      {/* 4. Market Structure Diagnostics Card */}
      {tech && (
        <MarketStructureCard
          tech={tech}
          asset={asset}
        />
      )}

      {/* 5. Liquidity Map & Order Flow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LiquidityMap
          pools={pools}
          asset={asset}
          realLiquidity={realOrderFlowData?.liquidityDepth}
        />

        <OrderFlowPanel
          orderFlow={orderFlowToUse}
          footprintBars={footprintBarsToUse}
          asset={asset}
        />
      </div>

      {/* Transparent Why Modal */}
      {outlook && (
        <WhyModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          outlook={outlook}
          asset={asset}
        />
      )}
    </div>
  );
}
