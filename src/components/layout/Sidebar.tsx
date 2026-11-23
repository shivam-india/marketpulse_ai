"use client";

import React from "react";
import {
  LayoutDashboard,
  LineChart,
  Radar,
  Calendar,
  Newspaper,
  Layers,
  BarChart3,
  History,
  FlaskConical,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

export type TerminalView =
  | "dashboard"
  | "asset_analysis"
  | "vision"
  | "forecast_lab"
  | "scanner"
  | "calendar"
  | "news"
  | "liquidity"
  | "order_flow"
  | "backtesting"
  | "history"
  | "integrations"
  | "admin";

interface SidebarProps {
  currentView: TerminalView;
  onSelectView: (view: TerminalView) => void;
}

export function Sidebar({ currentView, onSelectView }: SidebarProps) {
  const navItems: { id: TerminalView; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
    { id: "asset_analysis", label: "Intelligence", icon: LineChart, badge: "CORE" },
    { id: "vision", label: "Pulse Vision", icon: Layers, badge: "AI" },
    { id: "forecast_lab", label: "Forecast Lab", icon: FlaskConical, badge: "LAB" },
    { id: "scanner", label: "Market Scanner", icon: Radar },
    { id: "calendar", label: "Economic Calendar", icon: Calendar, badge: "LIVE" },
    { id: "news", label: "News Intelligence", icon: Newspaper },
    { id: "liquidity", label: "Liquidity Map", icon: Layers },
    { id: "order_flow", label: "Order Flow", icon: BarChart3 },
    { id: "backtesting", label: "Backtesting", icon: FlaskConical },
    { id: "history", label: "Forecast History", icon: History },
    { id: "integrations", label: "Integrations", icon: SlidersHorizontal },
    { id: "admin", label: "Admin Console", icon: ShieldCheck },
  ];

  return (
    <aside className="w-60 shrink-0 liquid-glass rounded-2xl m-3 border border-white/[0.08] flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        <div className="px-2 pt-1">
          <div className="text-[10px] uppercase font-tabular tracking-widest text-[#5F636B] font-semibold mb-2">
            INTELLIGENCE MODULES
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? "bg-white/[0.12] text-[#F5F5F2] border border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                      : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#E5C07B]" : "text-[#92959D]"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-tabular font-bold px-1.5 py-0.2 rounded-full ${
                        item.badge === "AI"
                          ? "bg-[#D4AF37]/20 text-[#E5C07B] border border-[#D4AF37]/35"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] font-tabular text-[10px] space-y-1 text-[#92959D]">
        <div className="flex justify-between items-center text-[#F5F5F2] font-medium">
          <span>REASONING ENGINE</span>
          <span className="text-emerald-400">BAYESIAN MTF</span>
        </div>
        <div className="flex justify-between">
          <span>REALTIME FEED</span>
          <span className="text-emerald-400">ACTIVE</span>
        </div>
      </div>
    </aside>
  );
}
