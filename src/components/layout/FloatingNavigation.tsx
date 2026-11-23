"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Search,
  Bell,
  Camera,
  Layers,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  History,
  FlaskConical,
  X,
  Command,
  TrendingUp,
} from "lucide-react";
import { TerminalView } from "./Sidebar";
import { AssetInfo } from "@/types/market";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { getCurrentSessions } from "@/lib/analysis/session-engine";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatPrice, formatPercent } from "@/lib/utils";

interface FloatingNavigationProps {
  currentView: TerminalView;
  onSelectView: (view: TerminalView) => void;
  activeAsset: AssetInfo;
  onSelectAsset: (asset: AssetInfo) => void;
  onOpenVisionModal: () => void;
  onOpenAlertsModal: () => void;
}

export function FloatingNavigation({
  currentView,
  onSelectView,
  activeAsset,
  onSelectAsset,
  onOpenVisionModal,
  onOpenAlertsModal,
}: FloatingNavigationProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [sessionsInfo, setSessionsInfo] = useState(getCurrentSessions());
  const [currentTime, setCurrentTime] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${now.toISOString().slice(11, 19)} UTC`
      );
      setSessionsInfo(getCurrentSessions(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMoreMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const filteredAssets = SUPPORTED_ASSETS.filter(
    (a) =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mainNavItems: { id: TerminalView; label: string }[] = [
    { id: "dashboard", label: "Markets" },
    { id: "asset_analysis", label: "Intelligence" },
    { id: "scanner", label: "Scanner" },
    { id: "liquidity", label: "Liquidity" },
    { id: "order_flow", label: "Order Flow" },
    { id: "news", label: "News" },
    { id: "calendar", label: "Calendar" },
  ];

  const moreNavItems: { id: TerminalView; label: string; icon: any }[] = [
    { id: "vision", label: "Pulse Vision & Compare", icon: Camera },
    { id: "forecast_lab", label: "Forecast Lab & Calibration", icon: FlaskConical },
    { id: "backtesting", label: "Backtest Studio", icon: FlaskConical },
    { id: "history", label: "Forecast Track Record", icon: History },
    { id: "integrations", label: "API Integrations", icon: SlidersHorizontal },
    { id: "admin", label: "Console Diagnostics", icon: ShieldCheck },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 select-none">
        {/* Floating Glass Navigation Container */}
        <div className="max-w-[1720px] mx-auto liquid-glass-elevated rounded-2xl px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 border border-white/[0.12] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)]">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectView("dashboard")}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 via-white/[0.08] to-transparent border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_20px_-3px_rgba(212,175,55,0.35)] group-hover:scale-105 transition-transform duration-200">
                <Activity className="w-4 h-4 text-[#E5C07B]" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-semibold text-sm text-[#F5F5F2] tracking-tight">
                    MarketPulse
                  </span>
                  <span className="text-[10px] font-tabular px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#E5C07B] border border-[#D4AF37]/35 font-medium">
                    AI
                  </span>
                </div>
                <span className="text-[9px] text-[#5F636B] tracking-wider uppercase font-tabular">
                  INSTITUTIONAL
                </span>
              </div>
            </button>
          </div>

          {/* Center: Morphing Glass Navigation Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            {mainNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? "text-[#F5F5F2] bg-white/[0.12] border border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                      : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[1.5px] bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                  )}
                </button>
              );
            })}

            {/* More Menu Popover */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  moreNavItems.some((n) => n.id === currentView)
                    ? "text-[#F5F5F2] bg-white/[0.12] border border-white/[0.18]"
                    : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.04]"
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {moreMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 liquid-glass-elevated rounded-xl p-1.5 border border-white/[0.14] shadow-2xl z-50 animate-fadeIn"
                  onMouseLeave={() => setMoreMenuOpen(false)}
                >
                  {moreNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectView(item.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition-all ${
                          isActive
                            ? "bg-white/[0.12] text-[#F5F5F2] font-medium"
                            : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.06]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 opacity-70" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Utility Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Capsule Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-xs text-[#92959D] hover:text-[#F5F5F2] transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 text-[#92959D]" />
              <span className="hidden sm:inline font-tabular">
                {activeAsset.symbol}
              </span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-tabular bg-white/[0.08] px-1.5 py-0.5 rounded text-[#5F636B] border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>

            {/* Sessions Indicator (Desktop) */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[10px] font-tabular text-[#92959D]">
              <Globe className="w-3 h-3 text-[#5F636B]" />
              <span className="text-[#5F636B]">{currentTime}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className={sessionsInfo.sessionDetails.tokyo.isOpen ? "text-emerald-400 font-medium" : "text-[#5F636B]"}>
                TYO
              </span>
              <span className={sessionsInfo.sessionDetails.london.isOpen ? "text-emerald-400 font-medium" : "text-[#5F636B]"}>
                LDN
              </span>
              <span className={sessionsInfo.sessionDetails.new_york.isOpen ? "text-emerald-400 font-medium" : "text-[#5F636B]"}>
                NYC
              </span>
            </div>

            {/* Chart Vision Button */}
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onOpenVisionModal}
              title="Multimodal Chart Vision AI"
              className="hidden sm:inline-flex"
            >
              <Camera className="w-3.5 h-3.5" />
            </GlassButton>

            {/* Alerts Manager Button */}
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={onOpenAlertsModal}
              title="Price & Confluence Alerts"
              className="hidden sm:inline-flex"
            >
              <Bell className="w-3.5 h-3.5" />
            </GlassButton>

            {/* Status Pulse */}
            <StatusIndicator status="live" label="FEED 100%" />

            {/* Mobile Navigation Dropdown Trigger */}
            <div className="lg:hidden">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[#92959D]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sheet */}
        {moreMenuOpen && (
          <div className="lg:hidden mt-2 liquid-glass-elevated rounded-2xl p-3 border border-white/[0.14] shadow-2xl animate-fadeIn space-y-1">
            {[...mainNavItems, ...moreNavItems].map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    setMoreMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.12] text-[#F5F5F2] border border-white/[0.18]"
                      : "text-[#92959D] hover:text-[#F5F5F2]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Spotlight Asset Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl liquid-glass-elevated rounded-3xl p-4 border border-white/[0.16] shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-xs text-[#92959D]">
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-medium text-[#F5F5F2]">Search Financial Instruments</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search symbol (e.g. XAU/USD, EUR/USD, BTC, US30)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] text-sm text-[#F5F5F2] font-tabular px-4 py-2.5 rounded-2xl border border-white/[0.1] focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-[#5F636B]"
              />
            </div>

            {/* Quick List */}
            <div className="max-h-72 overflow-y-auto space-y-1 pt-1">
              {filteredAssets.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#5F636B]">
                  No matching assets found
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const isCurrent = asset.symbol === activeAsset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        onSelectAsset(asset);
                        setSearchOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        isCurrent
                          ? "bg-white/[0.1] border border-white/[0.15]"
                          : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-tabular font-bold text-sm text-[#F5F5F2]">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-[#92959D]">{asset.name}</span>
                        <span className="text-[10px] uppercase font-tabular px-1.5 py-0.2 rounded bg-white/[0.06] text-[#5F636B]">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-tabular font-semibold text-[#F5F5F2]">
                          ${formatPrice(asset.currentPrice)}
                        </div>
                        <div
                          className={`text-[10px] font-tabular ${
                            asset.change24hPercent >= 0
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {formatPercent(asset.change24hPercent)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
