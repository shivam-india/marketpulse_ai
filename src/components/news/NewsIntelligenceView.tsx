"use client";

import React, { useState, useEffect } from "react";
import { MarketNewsItem } from "@/types/market";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

export function NewsIntelligenceView() {
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch("/api/news?limit=20");
        const json = await res.json();
        if (json.success && json.data) {
          setNews(json.data);
        }
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (filterSentiment !== "all" && item.sentiment.bias !== filterSentiment) return false;
    if (
      searchQuery &&
      !item.headline.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  Global Financial News & Intelligence Feed
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  NLP SENTIMENT
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] mt-0.5">
                Evaluates macroeconomic impact, currency sensitivity, and institutional catalyst positioning.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F636B]" />
            <input
              type="text"
              placeholder="Filter headlines & catalysts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] text-xs text-[#F5F5F2] font-tabular pl-8 pr-3 py-1.5 rounded-xl border border-white/[0.08] focus:outline-none focus:border-[#D4AF37]/50 placeholder:text-[#5F636B]"
            />
          </div>
        </div>

        {/* Sentiment Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] font-tabular text-xs">
          <span className="text-[#5F636B] text-[11px] uppercase font-semibold mr-1">Sentiment:</span>
          {["all", "bullish", "bearish", "neutral"].map((sent) => (
            <button
              key={sent}
              onClick={() => setFilterSentiment(sent)}
              className={`px-3 py-1 rounded-xl capitalize font-medium transition-all ${
                filterSentiment === sent
                  ? "bg-white/[0.14] text-[#F5F5F2] border border-white/[0.2]"
                  : "text-[#92959D] hover:text-[#F5F5F2] hover:bg-white/[0.04]"
              }`}
            >
              {sent}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Editorial News Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-8 text-center text-xs text-[#5F636B] font-tabular">
            Loading real-time news intelligence...
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-xs text-[#5F636B] font-tabular">
            No headlines match the current filter.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isBull = item.sentiment.bias === "bullish";
            const isBear = item.sentiment.bias === "bearish";

            return (
              <GlassPanel
                key={item.id}
                variant="interactive"
                padding="md"
                className="flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-[11px] font-tabular text-[#5F636B]">
                      <span className="font-semibold text-[#E5C07B]">{item.source}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.timestamp * 1000).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <GlassCapsule
                      variant={isBull ? "bull" : isBear ? "bear" : "neutral"}
                      size="xs"
                    >
                      {item.sentiment.bias}
                    </GlassCapsule>
                  </div>

                  <h3 className="text-sm font-semibold text-[#F5F5F2] leading-snug font-sans hover:text-[#E5C07B] transition-colors">
                    {item.headline}
                  </h3>

                  <p className="text-xs text-[#92959D] leading-relaxed mt-2 line-clamp-3 font-sans">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-tabular">
                  <div className="flex items-center gap-2 text-[#5F636B]">
                    <span>Score: <strong className="text-[#F5F5F2]">{item.sentiment.score > 0 ? "+" : ""}{item.sentiment.score.toFixed(2)}</strong></span>
                    {item.affectedAssets && item.affectedAssets.length > 0 && (
                      <span className="text-[#92959D] truncate max-w-[140px]">
                        [{item.affectedAssets.join(", ")}]
                      </span>
                    )}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                    >
                      <span>Read Original</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </GlassPanel>
            );
          })
        )}
      </div>
    </div>
  );
}
