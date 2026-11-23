/**
 * Pulse Radar & "What Changed?" Engine
 * Continuously tracks market state transitions, regime shifts, cross-market divergences,
 * and answers:
 * - What changed?
 * - Why did it matter?
 * - Which instruments were affected?
 * - Did the forecast change?
 * - Why did the forecast change?
 */

import { AssetInfo } from "@/types/market";
import { PulseMarketRegime } from "../regime/regime-classifier";

export type RadarEventType =
  | "VOLATILITY_EXPANSION"
  | "REGIME_TRANSITION"
  | "CROSS_MARKET_DIVERGENCE"
  | "LIQUIDITY_SWEEP"
  | "MODEL_CONFIDENCE_SHIFT"
  | "MACRO_SURPRISE";

export interface RadarEvent {
  id: string;
  timestamp: string;
  type: RadarEventType;
  severity: "info" | "moderate" | "critical";
  title: string;
  affectedInstruments: string[];
  whatChanged: string;
  whyItMatters: string;
  didForecastChange: boolean;
  forecastDeltaExplanation: string;
}

class WhatChangedEngine {
  private events: RadarEvent[] = [];

  constructor() {
    this.seedInitialRadarEvents();
  }

  public getRecentRadarEvents(limit = 10): RadarEvent[] {
    return this.events.slice(0, limit);
  }

  public registerEvent(event: Omit<RadarEvent, "id" | "timestamp">): RadarEvent {
    const newEvent: RadarEvent = {
      ...event,
      id: `radar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    if (this.events.length > 100) this.events.pop();
    return newEvent;
  }

  private seedInitialRadarEvents() {
    const now = Date.now();
    this.events = [
      {
        id: "radar-seed-01",
        timestamp: new Date(now - 1000 * 60 * 18).toISOString(),
        type: "CROSS_MARKET_DIVERGENCE",
        severity: "moderate",
        title: "Gold / DXY Decoupling Detected",
        affectedInstruments: ["XAU/USD", "DXY", "EUR/USD"],
        whatChanged: "Gold advanced +0.64% while US Dollar Index (DXY) held flat at 104.72.",
        whyItMatters: "Traditional inverse correlation (-0.82) decoupled as central bank safe-haven bids dominated over FX rate spreads.",
        didForecastChange: true,
        forecastDeltaExplanation: "Gold bullish probability upgraded from 64% to 78%. Macro model weight adjusted for independent reserve accumulation.",
      },
      {
        id: "radar-seed-02",
        timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
        type: "VOLATILITY_EXPANSION",
        severity: "info",
        title: "Crypto L2 Order Imbalance Expansion",
        affectedInstruments: ["BTC/USD", "ETH/USD"],
        whatChanged: "Aggressive market buy orders exceeded sell absorption by 2.4:1 above $91,000.",
        whyItMatters: "Large resting limit asks were consumed without triggering pullbacks, signaling institutional continuation.",
        didForecastChange: false,
        forecastDeltaExplanation: "Forecast remained strongly Bullish (82% confidence); invalidation level trailed higher to $89,400.",
      },
      {
        id: "radar-seed-03",
        timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
        type: "REGIME_TRANSITION",
        severity: "moderate",
        title: "EUR/USD Transitioned to TREND_DOWN",
        affectedInstruments: ["EUR/USD", "GBP/USD"],
        whatChanged: "Price breached key intraday higher-low pivot at 1.0560 with volume confirmation.",
        whyItMatters: "Market structure shifted from consolidation to bearish expansion, aligning with the daily downtrend.",
        didForecastChange: true,
        forecastDeltaExplanation: "Dominant bias flipped from Neutral to Bearish (71% confidence). Target lowered to 1.0480.",
      },
      {
        id: "radar-seed-04",
        timestamp: new Date(now - 1000 * 60 * 240).toISOString(),
        type: "LIQUIDITY_SWEEP",
        severity: "critical",
        title: "Crude Oil Stop Hunt Near $71.50 Resistance",
        affectedInstruments: ["WTI Crude", "Brent Crude"],
        whatChanged: "Price briefly pierced $71.50 resistance by 18 cents before closing with a heavy rejection wick.",
        whyItMatters: "Resting buyside stop liquidity was purged by sellers, exhausting immediate upward momentum.",
        didForecastChange: true,
        forecastDeltaExplanation: "Bullish scenario invalidated. Regime classified as RANGE with mean-reversion favored back to $68.80.",
      },
    ];
  }
}

export const whatChangedEngine = new WhatChangedEngine();
