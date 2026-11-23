"use client";

import React, { useState } from "react";
import { INITIAL_ALERTS } from "@/lib/storage/store";
import { UserAlert, AssetInfo } from "@/types/market";
import { SUPPORTED_ASSETS } from "@/lib/data/supported-assets";
import { Bell, Plus, Trash2, X, CheckCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";

interface AlertsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset: AssetInfo;
}

export function AlertsManager({ isOpen, onClose, activeAsset }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>(INITIAL_ALERTS);
  const [newSymbol, setNewSymbol] = useState(activeAsset.symbol);
  const [alertType, setAlertType] = useState<UserAlert["type"]>("confidence_threshold");
  const [targetValue, setTargetValue] = useState("75");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: UserAlert = {
      id: `alert-${Date.now()}`,
      assetSymbol: newSymbol,
      type: alertType,
      targetValue,
      isActive: true,
      createdAt: new Date().toISOString(),
      notifyBrowser: true,
      message:
        message ||
        `Alert triggered for ${newSymbol} (${alertType.replace(/_/g, " ")}) at threshold ${targetValue}`,
    };

    setAlerts([newAlert, ...alerts]);
    setMessage("");

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn font-tabular">
      <div className="liquid-glass-elevated rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 border border-white/[0.14] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F2] uppercase tracking-wider">
                Autonomous Confluence & Volatility Alerts
              </h2>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Set autonomous triggers for structural breaks, confidence spikes, and high-impact macro releases.
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

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <span className="text-xs font-semibold text-[#F5F5F2] uppercase block">
            Create New Market Trigger
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div>
              <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Asset</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
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
              <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Trigger Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as any)}
                className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
              >
                <option value="confidence_threshold" className="bg-[#0D0F12]">Confidence Threshold</option>
                <option value="break_of_structure" className="bg-[#0D0F12]">Break of Structure (BOS)</option>
                <option value="liquidity_pool_sweep" className="bg-[#0D0F12]">Liquidity Pool Sweep</option>
                <option value="order_flow_imbalance" className="bg-[#0D0F12]">Order Flow Imbalance</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#5F636B] uppercase block mb-1">Threshold / Level</label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 75 or price"
                className="w-full bg-white/[0.04] text-[#F5F5F2] p-2 rounded-xl border border-white/[0.08] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <GlassButton variant="primary" size="sm" type="submit" icon={<Plus className="w-3.5 h-3.5" />}>
              Arm Alert
            </GlassButton>
          </div>
        </form>

        {/* Active Alerts List */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase text-[#5F636B] font-semibold">
            Configured Triggers ({alerts.length})
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#F5F5F2]">{al.assetSymbol}</span>
                  <GlassCapsule variant="neutral" size="xs">
                    {al.type.replace(/_/g, " ")}
                  </GlassCapsule>
                  <span className="text-[#92959D] font-sans text-xs">{al.message}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAlert(al.id)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      al.isActive
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/[0.05] text-[#5F636B]"
                    }`}
                  >
                    {al.isActive ? "ARMED" : "MUTED"}
                  </button>

                  <button
                    onClick={() => handleDeleteAlert(al.id)}
                    className="p-1 rounded-lg text-[#5F636B] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
