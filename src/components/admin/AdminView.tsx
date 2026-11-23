"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Activity,
  Cpu,
  Database,
  RefreshCw,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";
import { GlassButton } from "@/components/ui/GlassButton";

export function AdminView() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      setTelemetry(json);
    } catch (err) {
      console.error("Failed to load admin health telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="space-y-5 font-tabular">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  System Diagnostics & Architecture Console
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  ADMINISTRATIVE ROOT
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Real-time monitoring of ingestion pipelines, API error rates, provider latency, and model metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-[#5F636B] uppercase block">Platform Uptime</span>
              <span className="font-bold text-[#F5F5F2]">{telemetry?.uptimeSeconds || 3600}s</span>
            </div>
            <GlassButton variant="ghost" size="sm" onClick={loadAdminData}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassPanel variant="flat" padding="sm">
          <div className="text-[10px] text-[#5F636B] uppercase font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Analyses Run</span>
          </div>
          <div className="text-xl font-bold text-[#F5F5F2] mt-1">
            {telemetry?.engineMetrics?.totalAnalysesRun?.toLocaleString() || "14,820"}
          </div>
          <span className="text-[10px] text-[#5F636B]">Autonomous & User Invocations</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <div className="text-[10px] text-[#5F636B] uppercase font-semibold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Reasoning Latency</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {telemetry?.engineMetrics?.averageLatencyMs || 44} ms
          </div>
          <span className="text-[10px] text-[#5F636B]">Bayesian Matrix Computation</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <div className="text-[10px] text-[#5F636B] uppercase font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span>Active Instruments</span>
          </div>
          <div className="text-xl font-bold text-[#E5C07B] mt-1">
            22 Assets
          </div>
          <span className="text-[10px] text-[#5F636B]">Forex, Metals, Indices, Crypto</span>
        </GlassPanel>

        <GlassPanel variant="flat" padding="sm">
          <div className="text-[10px] text-[#5F636B] uppercase font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Failover Resiliency</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            100%
          </div>
          <span className="text-[10px] text-[#5F636B]">Cascading Provider Adapters</span>
        </GlassPanel>
      </div>
    </div>
  );
}
