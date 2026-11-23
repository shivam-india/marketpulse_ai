"use client";

import React, { useState, useEffect } from "react";
import { FloatingNavigation } from "@/components/layout/FloatingNavigation";
import { TickerBar } from "@/components/layout/TickerBar";
import { TerminalView } from "@/components/layout/Sidebar";
import { GlobalMarketOverview } from "@/components/dashboard/GlobalMarketOverview";
import { AssetAnalysisView } from "@/components/asset/AssetAnalysisView";
import { MarketScanner } from "@/components/scanner/MarketScanner";
import { EconomicCalendarView } from "@/components/calendar/EconomicCalendarView";
import { NewsIntelligenceView } from "@/components/news/NewsIntelligenceView";
import { BacktestView } from "@/components/backtesting/BacktestView";
import { PredictionHistoryView } from "@/components/history/PredictionHistoryView";
import { IntegrationsView } from "@/components/settings/IntegrationsView";
import { AdminView } from "@/components/admin/AdminView";
import { PulseVisionView } from "@/components/vision/PulseVisionView";
import { ForecastLabView } from "@/components/lab/ForecastLabView";
import { ChartVisionModal } from "@/components/vision/ChartVisionModal";
import { AlertsManager } from "@/components/alerts/AlertsManager";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { AssetInfo, EconomicEvent, MarketNewsItem } from "@/types/market";
import { ShieldCheck, Info } from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<TerminalView>("dashboard");
  const [activeAsset, setActiveAsset] = useState<AssetInfo>(
    SUPPORTED_ASSETS.find((a) => a.symbol === "XAU/USD") || SUPPORTED_ASSETS[0]
  );

  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const [upcomingEvents, setUpcomingEvents] = useState<EconomicEvent[]>([]);
  const [topNews, setTopNews] = useState<MarketNewsItem[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [eventRes, newsRes] = await Promise.all([
          fetch("/api/calendar"),
          fetch("/api/news?limit=10"),
        ]);
        const eventJson = await eventRes.json();
        const newsJson = await newsRes.json();

        if (eventJson.data) setUpcomingEvents(eventJson.data);
        if (newsJson.data) setTopNews(newsJson.data);
      } catch (err) {
        console.error("Initial data fetch failed:", err);
      }
    }
    fetchInitialData();
  }, []);

  const handleSelectAsset = (asset: AssetInfo) => {
    setActiveAsset(asset);
    setCurrentView("asset_analysis");
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F5F2] flex flex-col font-sans selection:bg-[#D4AF37]/25 selection:text-[#F5F5F2]">
      {/* Floating Apple Liquid Glass Navigation */}
      <FloatingNavigation
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        activeAsset={activeAsset}
        onSelectAsset={handleSelectAsset}
        onOpenVisionModal={() => setIsVisionModalOpen(true)}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* Real-time Liquid Ticker Ribbon */}
      <TickerBar
        activeSymbol={activeAsset.symbol}
        onSelectAsset={handleSelectAsset}
      />

      {/* Main Terminal Workspace Layout */}
      <main className="flex-1 px-3 sm:px-6 py-4 max-w-[1720px] mx-auto w-full transition-all duration-300">
        <div key={currentView} className="animate-fadeIn">
          {currentView === "dashboard" && (
            <GlobalMarketOverview
              onSelectAsset={handleSelectAsset}
              upcomingEvents={upcomingEvents}
              topNews={topNews}
            />
          )}

          {currentView === "asset_analysis" && (
            <AssetAnalysisView
              asset={activeAsset}
              onOpenVisionModal={() => setIsVisionModalOpen(true)}
            />
          )}

          {currentView === "vision" && (
            <PulseVisionView asset={activeAsset} />
          )}

          {currentView === "forecast_lab" && (
            <ForecastLabView />
          )}

          {currentView === "scanner" && (
            <MarketScanner onSelectAsset={handleSelectAsset} />
          )}

          {currentView === "calendar" && <EconomicCalendarView />}

          {currentView === "news" && <NewsIntelligenceView />}

          {currentView === "liquidity" && (
            <div className="space-y-4">
              <div className="liquid-glass rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#F5F5F2] tracking-wide uppercase font-tabular">
                    Liquidity Intelligence Deep Dive: {activeAsset.symbol}
                  </h2>
                  <p className="text-xs text-[#92959D] mt-0.5">
                    Resting stop liquidity, equal highs/lows, and order-book depth profile.
                  </p>
                </div>
              </div>
              <AssetAnalysisView
                asset={activeAsset}
                onOpenVisionModal={() => setIsVisionModalOpen(true)}
              />
            </div>
          )}

          {currentView === "order_flow" && (
            <div className="space-y-4">
              <div className="liquid-glass rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#F5F5F2] tracking-wide uppercase font-tabular">
                    Order Flow & Footprint Delta Matrix: {activeAsset.symbol}
                  </h2>
                  <p className="text-xs text-[#92959D] mt-0.5">
                    Cumulative Volume Delta (CVD), absorption signals, and footprint clusters.
                  </p>
                </div>
              </div>
              <AssetAnalysisView
                asset={activeAsset}
                onOpenVisionModal={() => setIsVisionModalOpen(true)}
              />
            </div>
          )}

          {currentView === "backtesting" && <BacktestView />}

          {currentView === "history" && <PredictionHistoryView />}

          {currentView === "integrations" && <IntegrationsView />}

          {currentView === "admin" && <AdminView />}
        </div>
      </main>

      {/* Institutional Platform Footer */}
      <footer className="mt-auto px-4 sm:px-6 py-6 border-t border-white/[0.06] text-xs text-[#5F636B] font-tabular max-w-[1720px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>MarketPulse AI Pro v2.4 • Institutional Financial Research Terminal</span>
        </div>
        <div className="text-center sm:text-right text-[11px] text-[#5F636B] max-w-xl">
          Analytical platform only. All outlooks are probabilistic models, not guarantees or financial advice.
        </div>
      </footer>

      {/* Multimodal AI Chart Vision Modal */}
      <ChartVisionModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        activeSymbol={activeAsset.symbol}
      />

      {/* Alerts Manager Modal */}
      <AlertsManager
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        activeAsset={activeAsset}
      />
    </div>
  );
}
