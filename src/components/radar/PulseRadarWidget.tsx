"use client";

import React, { useState, useEffect } from "react";
import { RadarEvent } from "@/lib/radar/what-changed-engine";
import {
  Radar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

export function PulseRadarWidget() {
  const [events, setEvents] = useState<RadarEvent[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRadar() {
      try {
        const res = await fetch("/api/radar/what-changed?limit=6");
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
          if (json.data.length > 0) {
            setExpandedEventId(json.data[0].id);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch radar events:", err);
      }
    }
    loadRadar();
    const interval = setInterval(loadRadar, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassPanel variant="default" padding="md" className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
            <Radar className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F5F5F2] font-tabular">
                Pulse Radar & "What Changed?" Engine
              </h2>
              <GlassCapsule variant="champagne" size="xs">
                PROACTIVE INTELLIGENCE
              </GlassCapsule>
            </div>
            <p className="text-[11px] text-[#92959D] mt-0.5">
              Continuously monitors regime shifts, cross-market divergences, volatility surges, and forecast adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 font-tabular text-xs">
        {events.map((evt) => {
          const isExpanded = expandedEventId === evt.id;
          const isCritical = evt.severity === "critical";
          const isModerate = evt.severity === "moderate";

          return (
            <div
              key={evt.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "bg-white/[0.05] border-white/[0.16] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
              }`}
            >
              <button
                onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                className="w-full p-3.5 flex items-center justify-between text-left gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isCritical
                        ? "bg-rose-400 animate-ping"
                        : isModerate
                        ? "bg-[#E5C07B]"
                        : "bg-sky-400"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-sm text-[#F5F5F2] flex items-center gap-2">
                      <span>{evt.title}</span>
                      <GlassCapsule
                        variant={isCritical ? "bear" : isModerate ? "champagne" : "sky"}
                        size="xs"
                      >
                        {evt.type.replace(/_/g, " ")}
                      </GlassCapsule>
                    </div>
                    <div className="text-[11px] text-[#5F636B] mt-0.5">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Assets: {evt.affectedInstruments.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {evt.didForecastChange && (
                    <GlassCapsule variant="amber" size="xs">
                      FORECAST ADJUSTED
                    </GlassCapsule>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#92959D]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#92959D]" />
                  )}
                </div>
              </button>

              {/* Expanded "What Changed?" Breakdown */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.04] animate-fadeIn text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-[10px] text-[#5F636B] uppercase font-semibold block">
                        What Changed?
                      </span>
                      <p className="text-[#F5F5F2] font-sans leading-relaxed">
                        {evt.whatChanged}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-[10px] text-[#5F636B] uppercase font-semibold block">
                        Why Does It Matter?
                      </span>
                      <p className="text-[#92959D] font-sans leading-relaxed">
                        {evt.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#D4AF37]/[0.04] border border-[#D4AF37]/20 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#E5C07B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#E5C07B] text-[11px] block uppercase">
                        Impact On Model Outlook:
                      </span>
                      <p className="text-[#F5F5F2] font-sans text-xs mt-0.5 leading-relaxed">
                        {evt.forecastDeltaExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
