/**
 * Quantitative Forecasting Models
 * Directional probabilities, expected return, and volatility forecasters
 * across multiple temporal horizons (15m, 1h, 4h, 1D).
 */

import { PulseFeatureVector } from "../features/feature-engine";
import { PulseMarketRegime } from "../regime/regime-classifier";
import { Timeframe } from "@/types/market";

export type ForecastHorizon = "15m" | "1h" | "4h" | "1d";

export interface DirectionalProbabilities {
  up: number;
  neutral: number;
  down: number;
}

export interface HorizonForecast {
  horizon: ForecastHorizon;
  direction: DirectionalProbabilities;
  expectedReturnPercent: number; // e.g. +0.45% or -0.32%
  expectedVolatilityPercent: number;
  confidence: number;            // 0 - 100
  uncertainty: number;           // 0 - 1.0
  dominantBias: "bullish" | "bearish" | "neutral";
  modelAgreement: number;        // 0 to 1.0
  keyDrivers: string[];
}

/**
 * Model A: Directional Classifier (P(Up), P(Down), P(Neutral))
 */
export function predictDirection(
  features: PulseFeatureVector,
  regime: PulseMarketRegime,
  horizon: ForecastHorizon
): DirectionalProbabilities {
  const { returns, trend, momentum, structure, liquidity } = features;

  let bullScore = 0;
  let bearScore = 0;

  // Trend weights
  bullScore += Math.max(0, trend.emaAlignmentScore) * 35;
  bearScore += Math.max(0, -trend.emaAlignmentScore) * 35;

  // Momentum weights
  if (momentum.rsi14 > 52) bullScore += Math.min(25, (momentum.rsi14 - 50) * 1.5);
  else if (momentum.rsi14 < 48) bearScore += Math.min(25, (50 - momentum.rsi14) * 1.5);

  if (momentum.macdHistogram > 0) bullScore += 15;
  else if (momentum.macdHistogram < 0) bearScore += 15;

  // Structure weights
  if (structure.state.includes("bullish")) bullScore += 20;
  else if (structure.state.includes("bearish")) bearScore += 20;

  // Liquidity sweeps
  if (liquidity.recentSweepDetected) {
    if (returns.return1 > 0) bearScore += 20; // High swept, price exhausted
    else bullScore += 20;
  }

  // Horizon adjustment: longer horizons weight trend higher, shorter horizons weight momentum/volatility
  if (horizon === "1d" || horizon === "4h") {
    bullScore *= 1.2;
    bearScore *= 1.2;
  }

  const rawTotal = bullScore + bearScore + 40; // 40 base for neutral
  let pUp = Number((bullScore / rawTotal).toFixed(3));
  let pDown = Number((bearScore / rawTotal).toFixed(3));
  let pNeutral = Number((40 / rawTotal).toFixed(3));

  // Bound checks & normalization
  const sum = pUp + pDown + pNeutral;
  pUp = Number((pUp / sum).toFixed(2));
  pDown = Number((pDown / sum).toFixed(2));
  pNeutral = Number((1.0 - pUp - pDown).toFixed(2));

  return { up: pUp, neutral: pNeutral, down: pDown };
}

/**
 * Model B: Expected Return (projected return % over the specified horizon)
 */
export function estimateExpectedReturn(
  features: PulseFeatureVector,
  direction: DirectionalProbabilities,
  horizon: ForecastHorizon
): number {
  const { returns, volatility, trend } = features;
  const netDirectionalDelta = direction.up - direction.down; // e.g. +0.45 or -0.30

  // Horizon scalar: 15m (1x ATR), 1h (1.8x ATR), 4h (3.2x ATR), 1d (5.5x ATR)
  const horizonScalars: Record<ForecastHorizon, number> = {
    "15m": 0.4,
    "1h": 0.8,
    "4h": 1.6,
    "1d": 3.0,
  };

  const baseAtrReturn = (volatility.atrPercent * horizonScalars[horizon]) / 2;
  const projectedReturn = netDirectionalDelta * baseAtrReturn + (trend.ema20Slope * 0.2);

  return Number(projectedReturn.toFixed(3));
}

/**
 * Model C: Expected Realized Volatility Forecaster
 */
export function estimateExpectedVolatility(
  features: PulseFeatureVector,
  regime: PulseMarketRegime,
  horizon: ForecastHorizon
): number {
  const { volatility } = features;
  let baseVol = volatility.atrPercent;

  if (regime === "HIGH_VOLATILITY") baseVol *= 1.4;
  else if (regime === "LOW_VOLATILITY") baseVol *= 0.75;
  else if (regime === "BREAKOUT") baseVol *= 1.25;

  const horizonMultiplier: Record<ForecastHorizon, number> = {
    "15m": 0.5,
    "1h": 1.0,
    "4h": 2.0,
    "1d": 3.8,
  };

  return Number((baseVol * horizonMultiplier[horizon]).toFixed(2));
}

/**
 * Multi-Horizon Forecast Generator
 */
export function generateMultiHorizonForecasts(
  features: PulseFeatureVector,
  regime: PulseMarketRegime
): Record<ForecastHorizon, HorizonForecast> {
  const horizons: ForecastHorizon[] = ["15m", "1h", "4h", "1d"];
  const results: Record<ForecastHorizon, HorizonForecast> = {} as any;

  for (const h of horizons) {
    const direction = predictDirection(features, regime, h);
    const expectedReturnPercent = estimateExpectedReturn(features, direction, h);
    const expectedVolatilityPercent = estimateExpectedVolatility(features, regime, h);

    let dominantBias: HorizonForecast["dominantBias"] = "neutral";
    if (direction.up >= 0.52) dominantBias = "bullish";
    else if (direction.down >= 0.52) dominantBias = "bearish";

    const spread = Math.abs(direction.up - direction.down);
    const confidence = Math.min(Math.round((spread * 100) + 45), 90);
    const uncertainty = Number((1.0 - confidence / 100).toFixed(2));
    const modelAgreement = Number((1.0 - (direction.neutral * 0.8)).toFixed(2));

    const keyDrivers: string[] = [];
    if (Math.abs(features.trend.emaAlignmentScore) >= 0.5) {
      keyDrivers.push(`EMA alignment (${features.trend.emaAlignmentScore > 0 ? "Bullish" : "Bearish"})`);
    }
    if (features.momentum.rsi14 >= 60 || features.momentum.rsi14 <= 40) {
      keyDrivers.push(`RSI Momentum (${features.momentum.rsi14})`);
    }
    if (features.volatility.volatilityState !== "normal") {
      keyDrivers.push(`Volatility State: ${features.volatility.volatilityState}`);
    }

    results[h] = {
      horizon: h,
      direction,
      expectedReturnPercent,
      expectedVolatilityPercent,
      confidence,
      uncertainty,
      dominantBias,
      modelAgreement,
      keyDrivers,
    };
  }

  return results;
}
