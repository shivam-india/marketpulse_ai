"use client";

import React, { useState, useEffect } from "react";
import { EconomicEvent, ImportanceLevel } from "@/types/market";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Filter,
  Globe,
  ChevronDown,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

export function EconomicCalendarView() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all");
  const [selectedImportance, setSelectedImportance] = useState<string>("all");

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch("/api/calendar");
        const json = await res.json();
        if (json.success && json.data) {
          setEvents(json.data);
        }
      } catch (err) {
        console.error("Failed to load economic calendar:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  const currencies = ["all", "USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

  const filtered = events.filter((e) => {
    if (selectedCurrency !== "all" && e.currency !== selectedCurrency) return false;
    if (selectedImportance !== "all" && e.importance !== selectedImportance) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Global Sovereign Economic Calendar
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  FOREX FACTORY FEED
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Tracks scheduled central-bank interest rate decisions, inflation gauges, and sovereign data prints.
              </p>
            </div>
          </div>

          {/* Currency Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] font-tabular text-xs">
            {currencies.map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition-all ${
                  selectedCurrency === curr
                    ? "bg-white/[0.14] text-[#F5F5F2]"
                    : "text-[#92959D] hover:text-[#F5F5F2]"
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Importance Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] font-tabular text-xs">
          <span className="text-[#5F636B] text-[11px] uppercase font-semibold mr-1">Impact:</span>
          {["all", "critical", "high", "medium", "low"].map((imp) => (
            <button
              key={imp}
              onClick={() => setSelectedImportance(imp)}
              className={`px-3 py-1 rounded-xl capitalize font-medium transition-all ${
                selectedImportance === imp
                  ? "bg-white/[0.14] text-[#F5F5F2] border border-white/[0.2]"
                  : "text-[#92959D] hover:text-[#F5F5F2]"
              }`}
            >
              {imp}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Events Table Container */}
      <GlassPanel variant="default" padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-tabular text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] text-[#5F636B] uppercase tracking-wider bg-white/[0.01]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3">Currency</th>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-3 text-right">Actual</th>
                <th className="py-3 px-3 text-right">Forecast</th>
                <th className="py-3 px-4 text-right">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5F636B]">
                    Loading sovereign calendar events...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5F636B]">
                    No economic events match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((evt, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-[#92959D] whitespace-nowrap">
                      {evt.date} • <strong className="text-[#F5F5F2]">{evt.time}</strong>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#F5F5F2] bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.08]">
                        {evt.currency}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-[#F5F5F2] max-w-sm">
                      {evt.title}
                    </td>
                    <td className="py-3 px-3">
                      <GlassCapsule
                        variant={
                          evt.importance === "critical"
                            ? "bear"
                            : evt.importance === "high"
                            ? "amber"
                            : "neutral"
                        }
                        size="xs"
                      >
                        {evt.importance.toUpperCase()}
                      </GlassCapsule>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#F5F5F2]">
                      {evt.actual || "—"}
                    </td>
                    <td className="py-3 px-3 text-right text-[#92959D]">
                      {evt.forecast || "—"}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5F636B]">
                      {evt.previous || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
