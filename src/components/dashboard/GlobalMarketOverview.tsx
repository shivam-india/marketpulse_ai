"use client";

import React, { useState, useEffect } from "react";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo, EconomicEvent, MarketNewsItem } from "@/types/market";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Newspaper,
  Layers,
  ChevronRight,
  Activity,
  Droplets,
  ShieldCheck,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { MarketPrice } from "@/components/ui/MarketPrice";
import { formatPrice, formatPercent } from "@/lib/utils";

interface GlobalMarketOverviewProps {
  onSelectAsset: (asset: AssetInfo) => void;
  upcomingEvents: EconomicEvent[];
  topNews: MarketNewsItem[];
}

export function GlobalMarketOverview({
  onSelectAsset,
  upcomingEvents,
  topNews,
}: GlobalMarketOverviewProps) {
  const [liveAssets, setLiveAssets] = useState<AssetInfo[]>(SUPPORTED_ASSETS);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch("/api/markets/quotes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLiveAssets(json.data);
        }
      } catch (err) {
        console.warn("Failed to fetch live quotes for overview:", err);
      }
    }
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered asset sets
  const indices = liveAssets.filter((a) => a.category === "index").slice(0, 4);
  const forex = liveAssets.filter((a) => a.category === "forex").slice(0, 4);
  const commodities = liveAssets.filter((a) => a.category === "commodity").slice(0, 4);
  const crypto = liveAssets.filter((a) => a.category === "crypto").slice(0, 4);

  // High Confluence AI Watchlist items
  const aiWatchlist = [
    {
      asset: liveAssets.find((a) => a.symbol === "XAU/USD") || SUPPORTED_ASSETS[0],
      bias: "BULLISH" as const,
      confidence: 78,
      confluenceScore: 84,
      liquidity: "Overhead buyside pool at $4,095",
      catalyst: "Holding higher lows; DXY softening at resistance",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "BTC/USD") || SUPPORTED_ASSETS[0],
      bias: "BULLISH" as const,
      confidence: 82,
      confluenceScore: 88,
      liquidity: "Aggressive absorption at $91,200",
      catalyst: "Institutional ETF net inflows + NQ high-beta tech alignment",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "EUR/USD") || SUPPORTED_ASSETS[0],
      bias: "BEARISH" as const,
      confidence: 71,
      confluenceScore: 76,
      liquidity: "Sellside liquidity tapped at 1.0520",
      catalyst: "Eurozone growth drag; transatlantic rate spread widening",
    },
    {
      asset: liveAssets.find((a) => a.symbol === "WTI Crude") || SUPPORTED_ASSETS[0],
      bias: "NEUTRAL" as const,
      confidence: 58,
      confluenceScore: 61,
      liquidity: "Equilibrium range between $68.50-$71.20",
      catalyst: "OPEC+ cuts balanced by seasonal demand softness",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Global Macro Environment & Regime Radar */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B] shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Global Macro Environment & Regime Radar
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  CONSTRUCTIVE RISK-ON
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Cross-asset synthesis of sovereign yields, currency differentials, index momentum, and central-bank policy expectations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-tabular">
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#5F636B] tracking-wider block">
                Macro Confluence
              </span>
              <span className="text-sm font-bold text-[#E5C07B]">
                78 / 100
              </span>
            </div>
          </div>
        </div>

        {/* Macro Gauge Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-tabular">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="text-[10px] text-[#92959D] tracking-wider uppercase font-medium">
              DXY Dollar Index
            </div>
            <div className="text-base font-bold text-[#F5F5F2] mt-1">
              104.72
              <span className="text-xs text-rose-400 ml-1.5 font-normal">-0.24%</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 truncate">
              Softening Near Resistance
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="text-[10px] text-[#92959D] tracking-wider uppercase font-medium">
              US 10Y Yield
            </div>
            <div className="text-base font-bold text-[#F5F5F2] mt-1">
              4.38%
              <span className="text-xs text-emerald-400 ml-1.5 font-normal">-4 bps</span>
            </div>
            <div className="text-[10px] text-sky-400 mt-0.5 truncate">
              Rate Compression Window
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="text-[10px] text-[#92959D] tracking-wider uppercase font-medium">
              CBOE VIX Volatility
            </div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              14.82
              <span className="text-xs text-emerald-400 ml-1.5 font-normal">-3.4%</span>
            </div>
            <div className="text-[10px] text-[#92959D] mt-0.5 truncate">
              Low Hedging Demand
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
            <div className="text-[10px] text-[#92959D] tracking-wider uppercase font-medium">
              Gold / Silver Ratio
            </div>
            <div className="text-base font-bold text-[#F5F5F2] mt-1">
              84.2
              <span className="text-xs text-sky-400 ml-1.5 font-normal">Expansion</span>
            </div>
            <div className="text-[10px] text-[#E5C07B] mt-0.5 truncate">
              Safe Haven Premium
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 2. High Confluence Watchlist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92959D] font-tabular">
              High-Confluence Market Setups
            </h2>
          </div>
          <span className="text-[11px] text-[#5F636B] font-tabular">
            Multi-timeframe Bayesian scores &gt; 70
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {aiWatchlist.map((item) => {
            const isBull = item.bias === "BULLISH";
            const isBear = item.bias === "BEARISH";

            return (
              <button
                key={item.asset.symbol}
                onClick={() => onSelectAsset(item.asset)}
                className="liquid-glass-interactive rounded-2xl p-4 text-left flex flex-col justify-between border border-white/[0.08] hover:border-white/[0.18] transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-tabular font-bold text-base text-[#F5F5F2] group-hover:text-[#E5C07B] transition-colors">
                        {item.asset.symbol}
                      </div>
                      <div className="text-[11px] text-[#92959D] truncate">
                        {item.asset.name}
                      </div>
                    </div>
                    <GlassCapsule
                      variant={isBull ? "bull" : isBear ? "bear" : "amber"}
                      size="xs"
                    >
                      {item.bias}
                    </GlassCapsule>
                  </div>

                  <div className="my-2.5">
                    <MarketPrice
                      price={item.asset.currentPrice}
                      changePercent={item.asset.change24hPercent}
                      size="md"
                    />
                  </div>

                  <p className="text-xs text-[#92959D] leading-relaxed line-clamp-2 mt-2">
                    {item.catalyst}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-tabular">
                  <div className="text-[11px] text-[#5F636B]">
                    Confluence: <span className="text-[#F5F5F2] font-semibold">{item.confluenceScore}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Market Categories Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#92959D]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#92959D] font-tabular">
              Market Intelligence Matrix
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Forex */}
          <GlassPanel variant="default" padding="sm" className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-[#92959D] font-tabular border-b border-white/[0.06]">
              <span className="font-semibold uppercase tracking-wider text-[#F5F5F2]">Forex Pairs</span>
              <span className="text-[10px]">SPOT FX</span>
            </div>
            <div className="space-y-1">
              {forex.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] transition-all text-left font-tabular"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#F5F5F2]">{asset.symbol}</div>
                    <div className="text-[10px] text-[#5F636B]">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#F5F5F2]">
                      ${formatPrice(asset.currentPrice, 4, 5)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        asset.change24hPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPercent(asset.change24hPercent)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Commodities */}
          <GlassPanel variant="default" padding="sm" className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-[#92959D] font-tabular border-b border-white/[0.06]">
              <span className="font-semibold uppercase tracking-wider text-[#F5F5F2]">Commodities</span>
              <span className="text-[10px]">METALS & ENERGY</span>
            </div>
            <div className="space-y-1">
              {commodities.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] transition-all text-left font-tabular"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#F5F5F2]">{asset.symbol}</div>
                    <div className="text-[10px] text-[#5F636B]">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#F5F5F2]">
                      ${formatPrice(asset.currentPrice)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        asset.change24hPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPercent(asset.change24hPercent)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Indices */}
          <GlassPanel variant="default" padding="sm" className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-[#92959D] font-tabular border-b border-white/[0.06]">
              <span className="font-semibold uppercase tracking-wider text-[#F5F5F2]">Global Indices</span>
              <span className="text-[10px]">BENCHMARKS</span>
            </div>
            <div className="space-y-1">
              {indices.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] transition-all text-left font-tabular"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#F5F5F2]">{asset.symbol}</div>
                    <div className="text-[10px] text-[#5F636B]">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#F5F5F2]">
                      ${formatPrice(asset.currentPrice)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        asset.change24hPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPercent(asset.change24hPercent)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>

          {/* Crypto */}
          <GlassPanel variant="default" padding="sm" className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-[#92959D] font-tabular border-b border-white/[0.06]">
              <span className="font-semibold uppercase tracking-wider text-[#F5F5F2]">Digital Assets</span>
              <span className="text-[10px] text-emerald-400">LIVE L2 DOM</span>
            </div>
            <div className="space-y-1">
              {crypto.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => onSelectAsset(asset)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] transition-all text-left font-tabular"
                >
                  <div>
                    <div className="font-semibold text-xs text-[#F5F5F2]">{asset.symbol}</div>
                    <div className="text-[10px] text-[#5F636B]">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#F5F5F2]">
                      ${formatPrice(asset.currentPrice)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        asset.change24hPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPercent(asset.change24hPercent)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* 4. Macro Intelligence & News Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <GlassPanel variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
                Imminent Sovereign Macro Events
              </h3>
            </div>
            <span className="text-[10px] font-tabular text-[#92959D]">Forex Factory Feed</span>
          </div>

          <div className="space-y-2">
            {upcomingEvents.slice(0, 4).map((evt, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3 font-tabular text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#F5F5F2] w-10">{evt.currency}</span>
                  <div>
                    <div className="font-medium text-[#F5F5F2] line-clamp-1">{evt.title}</div>
                    <div className="text-[10px] text-[#5F636B]">{evt.time} • {evt.date}</div>
                  </div>
                </div>
                <GlassCapsule
                  variant={evt.importance === "critical" ? "bear" : evt.importance === "high" ? "amber" : "neutral"}
                  size="xs"
                >
                  {evt.importance.toUpperCase()}
                </GlassCapsule>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Top Intelligence News */}
        <GlassPanel variant="default" padding="md" className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-xs font-semibold text-[#F5F5F2] uppercase font-tabular tracking-wider">
                Financial News & Sentiment Intelligence
              </h3>
            </div>
            <span className="text-[10px] font-tabular text-[#92959D]">Finnhub + NLP</span>
          </div>

          <div className="space-y-2">
            {topNews.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-medium text-[#F5F5F2] line-clamp-1 font-sans">{item.headline}</div>
                  <div className="text-[10px] text-[#5F636B] font-tabular mt-0.5">
                    {item.source} • {new Date(item.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <GlassCapsule
                  variant={item.sentiment.bias === "bullish" ? "bull" : item.sentiment.bias === "bearish" ? "bear" : "neutral"}
                  size="xs"
                >
                  {item.sentiment.bias}
                </GlassCapsule>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
