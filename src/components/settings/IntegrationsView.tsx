"use client";

import React, { useState, useEffect } from "react";
import { ProviderStatus } from "@/lib/providers/types";
import {
  SlidersHorizontal,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCapsule } from "@/components/ui/GlassCapsule";

export function IntegrationsView() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        if (json.providers) {
          setProviders(json.providers);
        }
      } catch (err) {
        console.error("Failed to load integrations health:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, []);

  const integrationConfigs = [
    {
      envVar: "GEMINI_API_KEY",
      name: "Google Gemini 1.5 Pro / Flash API",
      provider: "Google AI Studio",
      category: "AI Reasoning & Multimodal Vision",
      description: "Powers real-time chart screenshot visual interpretation and deep macro reasoning.",
      link: "https://aistudio.google.com/",
    },
    {
      envVar: "OPENAI_API_KEY",
      name: "OpenAI GPT-4o API",
      provider: "OpenAI",
      category: "AI Reasoning",
      description: "Optional secondary model provider for ensemble market thesis generation.",
      link: "https://platform.openai.com/",
    },
    {
      envVar: "FINNHUB_API_KEY",
      name: "Finnhub Institutional Market API",
      provider: "Finnhub Stock & FX API",
      category: "Market Data & Quotes",
      description: "Direct real-time tick streaming for Forex, Commodities, and Indices.",
      link: "https://finnhub.io/",
    },
    {
      envVar: "POLYGON_API_KEY",
      name: "Polygon.io Market Feeds",
      provider: "Polygon.io",
      category: "Market Data",
      description: "Forex tick feeds and historical candlestick aggregations.",
      link: "https://polygon.io/",
    },
    {
      envVar: "ALPHA_VANTAGE_API_KEY",
      name: "Alpha Vantage Data Feed",
      provider: "Alpha Vantage",
      category: "Market Data & Indicators",
      description: "Historical tick and daily bars provider for walk-forward backtests.",
      link: "https://www.alphavantage.co/",
    },
    {
      envVar: "NEWS_API_KEY",
      name: "NewsAPI Financial Wire",
      provider: "NewsAPI",
      category: "News Wire",
      description: "Global financial news wire for macroeconomic sentiment parsing.",
      link: "https://newsapi.org/",
    },
  ];

  return (
    <div className="space-y-5 font-tabular">
      {/* Top Banner */}
      <GlassPanel variant="default" padding="md" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E5C07B]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-[#F5F5F2] tracking-tight">
                  API Keys & Sovereign Data Integrations
                </h1>
                <GlassCapsule variant="champagne" size="xs">
                  ENCRYPTED VAULT
                </GlassCapsule>
              </div>
              <p className="text-xs text-[#92959D] font-sans mt-0.5">
                Manage external API providers for live market data, economic calendar events, and multimodal AI models.
              </p>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrationConfigs.map((config) => {
          const liveStatus = providers.find((p) =>
            p.name.toLowerCase().includes(config.provider.toLowerCase().split(" ")[0])
          );
          const isConfigured = liveStatus
            ? liveStatus.apiKeySet || liveStatus.status === "connected" || liveStatus.status === "configured"
            : false;

          return (
            <GlassPanel
              key={config.envVar}
              variant="default"
              padding="md"
              className="flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#F5F5F2]">{config.name}</h3>
                    <span className="text-[10px] text-[#5F636B] uppercase font-semibold">
                      {config.category}
                    </span>
                  </div>
                  <GlassCapsule variant={isConfigured ? "bull" : "amber"} size="xs">
                    {isConfigured ? "ONLINE" : "PENDING KEY"}
                  </GlassCapsule>
                </div>

                <p className="text-xs text-[#92959D] font-sans leading-relaxed">
                  {config.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#5F636B]">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Env: {config.envVar}</span>
                </div>

                <a
                  href={config.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
