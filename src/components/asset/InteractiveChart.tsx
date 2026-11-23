"use client";

import React, { useEffect, useRef, useState } from "react";
import { OHLCV, Timeframe, AssetInfo, SupportResistanceLevel } from "@/types/market";
import { calculateEMA } from "@/lib/analysis/technical-indicators";
import { Maximize2, RefreshCw, Eye, Layers, TrendingUp } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { formatPrice, formatPercent } from "@/lib/utils";

interface InteractiveChartProps {
  asset: AssetInfo;
  timeframe: Timeframe;
  bars: OHLCV[];
  supportLevels?: SupportResistanceLevel[];
  resistanceLevels?: SupportResistanceLevel[];
  onTimeframeChange: (tf: Timeframe) => void;
  onRefresh?: () => void;
}

export function InteractiveChart({
  asset,
  timeframe,
  bars,
  supportLevels = [],
  resistanceLevels = [],
  onTimeframeChange,
  onRefresh,
}: InteractiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);

  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(true);
  const [showSRLines, setShowSRLines] = useState(true);
  const [hoverBar, setHoverBar] = useState<OHLCV | null>(null);

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: "1m", label: "1M" },
    { id: "5m", label: "5M" },
    { id: "15m", label: "15M" },
    { id: "30m", label: "30M" },
    { id: "1h", label: "1H" },
    { id: "4h", label: "4H" },
    { id: "1d", label: "1D" },
    { id: "1w", label: "1W" },
  ];

  useEffect(() => {
    if (!chartContainerRef.current || bars.length === 0) return;

    let isMounted = true;

    async function initChart() {
      const { createChart, ColorType, CrosshairMode } = await import("lightweight-charts");

      if (!isMounted || !chartContainerRef.current) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#08090B" },
          textColor: "#92959D",
          fontSize: 11,
          fontFamily: "-apple-system, SF Mono, JetBrains Mono, monospace",
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.025)" },
          horzLines: { color: "rgba(255, 255, 255, 0.025)" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: "rgba(212, 175, 55, 0.4)",
            width: 1,
            style: 2,
            labelBackgroundColor: "#13161B",
          },
          horzLine: {
            color: "rgba(212, 175, 55, 0.4)",
            width: 1,
            style: 2,
            labelBackgroundColor: "#13161B",
          },
        },
        rightPriceScale: {
          borderColor: "rgba(255, 255, 255, 0.08)",
          scaleMargins: {
            top: 0.1,
            bottom: 0.22,
          },
        },
        timeScale: {
          borderColor: "rgba(255, 255, 255, 0.08)",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstanceRef.current = chart;

      // Candlestick series with Apple liquid styling
      const candleSeries = chart.addCandlestickSeries({
        upColor: "#22C55E",
        downColor: "#EF4444",
        borderVisible: false,
        wickUpColor: "#22C55E",
        wickDownColor: "#EF4444",
      });
      candleSeriesRef.current = candleSeries;

      const candleData = bars.map((b) => ({
        time: b.time as any,
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
      }));
      candleSeries.setData(candleData);

      // Volume histogram overlay
      const volumeSeries = chart.addHistogramSeries({
        color: "rgba(255, 255, 255, 0.08)",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });

      const volumeData = bars.map((b) => ({
        time: b.time as any,
        value: b.volume,
        color: b.close >= b.open ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
      }));
      volumeSeries.setData(volumeData);

      // EMAs
      const closePrices = bars.map((b) => b.close);

      if (showEMA20 && bars.length >= 20) {
        const ema20 = calculateEMA(closePrices, 20);
        const emaSeries = chart.addLineSeries({
          color: "#38BDF8",
          lineWidth: 1,
          title: "EMA 20",
        });
        emaSeries.setData(
          ema20.map((v, i) => ({ time: bars[i].time as any, value: v }))
        );
      }

      if (showEMA50 && bars.length >= 50) {
        const ema50 = calculateEMA(closePrices, 50);
        const emaSeries = chart.addLineSeries({
          color: "#D4AF37",
          lineWidth: 1,
          title: "EMA 50",
        });
        emaSeries.setData(
          ema50.map((v, i) => ({ time: bars[i].time as any, value: v }))
        );
      }

      if (showEMA200 && bars.length >= 100) {
        const ema200 = calculateEMA(closePrices, Math.min(200, bars.length));
        const emaSeries = chart.addLineSeries({
          color: "#A855F7",
          lineWidth: 1,
          title: "EMA 200",
        });
        emaSeries.setData(
          ema200.map((v, i) => ({ time: bars[i].time as any, value: v }))
        );
      }

      // Support & Resistance price lines
      if (showSRLines) {
        resistanceLevels.slice(0, 2).forEach((res) => {
          candleSeries.createPriceLine({
            price: res.price,
            color: "rgba(239, 68, 68, 0.5)",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Res ${res.touches}x`,
          });
        });

        supportLevels.slice(0, 2).forEach((sup) => {
          candleSeries.createPriceLine({
            price: sup.price,
            color: "rgba(34, 197, 94, 0.5)",
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Sup ${sup.touches}x`,
          });
        });
      }

      // Crosshair move listener for contextual hover data
      chart.subscribeCrosshairMove((param: any) => {
        if (!param || !param.time || !param.seriesData) {
          setHoverBar(null);
          return;
        }
        const data = param.seriesData.get(candleSeries);
        if (data) {
          setHoverBar({
            time: param.time,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: 0,
          });
        }
      });

      // Fit content
      chart.timeScale().fitContent();

      // Responsive resize observer
      const handleResize = () => {
        if (chartContainerRef.current && chartInstanceRef.current) {
          chartInstanceRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    initChart();

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [bars, timeframe, showEMA20, showEMA50, showEMA200, showSRLines]);

  const latestBar = hoverBar || (bars.length > 0 ? bars[bars.length - 1] : null);

  return (
    <GlassPanel variant="default" padding="none" className="overflow-hidden border border-white/[0.08]">
      {/* Top Chart Toolbar */}
      <div className="p-3 sm:p-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Timeframe Selector Liquid Capsule */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06] select-none">
          {timeframes.map((tf) => {
            const isActive = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-3 py-1 rounded-xl font-tabular text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? "bg-white/[0.14] text-[#F5F5F2] border border-white/[0.2] shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-semibold"
                    : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.04]"
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Technical Indicators Overlays Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-tabular select-none">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2.5 py-1 rounded-xl border transition-all ${
              showEMA20
                ? "bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold"
                : "bg-white/[0.03] border-white/[0.06] text-[#5F636B]"
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2.5 py-1 rounded-xl border transition-all ${
              showEMA50
                ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#E5C07B] font-semibold"
                : "bg-white/[0.03] border-white/[0.06] text-[#5F636B]"
            }`}
          >
            EMA 50
          </button>
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2.5 py-1 rounded-xl border transition-all ${
              showEMA200
                ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold"
                : "bg-white/[0.03] border-white/[0.06] text-[#5F636B]"
            }`}
          >
            EMA 200
          </button>
          <button
            onClick={() => setShowSRLines(!showSRLines)}
            className={`px-2.5 py-1 rounded-xl border transition-all ${
              showSRLines
                ? "bg-white/[0.12] border-white/[0.2] text-[#F5F5F2] font-semibold"
                : "bg-white/[0.03] border-white/[0.06] text-[#5F636B]"
            }`}
          >
            S/R Levels
          </button>
        </div>
      </div>

      {/* Floating Contextual OHLCV HUD */}
      {latestBar && (
        <div className="px-4 py-2 border-b border-white/[0.04] bg-white/[0.01] flex flex-wrap items-center gap-x-5 gap-y-1 font-tabular text-xs text-[#92959D]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">O:</span>
            <span className="text-[#F5F5F2] font-semibold">${formatPrice(latestBar.open)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">H:</span>
            <span className="text-emerald-400 font-semibold">${formatPrice(latestBar.high)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">L:</span>
            <span className="text-rose-400 font-semibold">${formatPrice(latestBar.low)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">C:</span>
            <span className="text-[#F5F5F2] font-semibold">${formatPrice(latestBar.close)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#5F636B]">CHG:</span>
            <span
              className={`font-semibold ${
                latestBar.close >= latestBar.open ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatPercent(((latestBar.close - latestBar.open) / latestBar.open) * 100)}
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div
        ref={chartContainerRef}
        className="w-full h-[460px] sm:h-[520px] relative cursor-crosshair"
      />
    </GlassPanel>
  );
}
