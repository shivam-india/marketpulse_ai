/**
 * PulseCore Model Ensemble
 * The central quantitative intelligence engine combining multi-component models,
 * dynamic regime weighting, and uncertainty estimation.
 */

import { PulseFeatureVector, extractPulseFeatures } from "../features/feature-engine";
import { classifyMarketRegime, RegimeClassificationResult, PulseMarketRegime } from "../regime/regime-classifier";
import {
  generateMultiHorizonForecasts,
  HorizonForecast,
  ForecastHorizon,
  DirectionalProbabilities,
} from "../models/forecasting-models";
import { OHLCV, AssetInfo, Timeframe } from "@/types/market";

export interface PulseCoreEnsembleOutput {
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  regime: PulseMarketRegime;
  regimeDetails: RegimeClassificationResult;

  // Primary Unified Forecast (defaulting to current active timeframe)
  direction: DirectionalProbabilities;
  dominantBias: "bullish" | "bearish" | "neutral";
  expectedReturnPercent: number;
  expectedVolatilityPercent: number;
  confidence: number;            // 0 - 100
  uncertainty: number;           // 0 - 1.0 (epistemic + aleatoric)
  modelAgreement: number;        // 0 to 1.0 across models

  // Component Model Scores (0 - 100)
  componentScores: {
    trendScore: number;
    momentumScore: number;
    volatilityScore: number;
    structureScore: number;
    liquidityScore: number;
    macroScore: number;
  };

  // Multi-Horizon Forecast Array (15m, 1h, 4h, 1D)
  multiHorizonForecasts: Record<ForecastHorizon, HorizonForecast>;

  // Evidentiary Breakdown
  supportingFactors: string[];
  conflictingFactors: string[];
  invalidationTrigger: number;
  priceTargets: {
    baseCaseTarget: number;
    bullBreakoutTarget: number;
    bearInvalidationTarget: number;
  };

  // Structured Summary for AI Explanation Layer
  structuredEvidenceSummary: string;
}

export function executePulseCoreEnsemble(
  bars: OHLCV[],
  asset: AssetInfo,
  timeframe: Timeframe
): PulseCoreEnsembleOutput | null {
  const features = extractPulseFeatures(bars, asset, timeframe);
  if (!features) return null;

  const regimeResult = classifyMarketRegime(features);
  const multiHorizon = generateMultiHorizonForecasts(features, regimeResult.primaryRegime);

  // Map timeframe to primary horizon
  const horizonMap: Record<Timeframe, ForecastHorizon> = {
    "1m": "15m",
    "5m": "15m",
    "15m": "15m",
    "30m": "1h",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1d",
  };
  const primaryHorizon = horizonMap[timeframe] || "15m";
  const primaryForecast = multiHorizon[primaryHorizon];

  // Component Model Scores calibrated 0 - 100
  const trendScore = Math.round(
    Math.min(100, Math.max(10, 50 + features.trend.emaAlignmentScore * 35 + features.trend.ema20Slope * 400))
  );
  const momentumScore = Math.round(
    Math.min(100, Math.max(10, features.momentum.rsi14 * 0.7 + (features.momentum.macdHistogram > 0 ? 30 : 10)))
  );
  const volatilityScore = Math.round(
    Math.min(100, Math.max(10, features.volatility.volatilityState === "contracting" ? 80 : 50))
  );
  const structureScore = Math.round(
    Math.min(100, Math.max(10, features.structure.state.includes("bullish") ? 78 : features.structure.state.includes("bearish") ? 22 : 50))
  );
  const liquidityScore = Math.round(
    Math.min(100, Math.max(10, features.liquidity.recentSweepDetected ? 40 : 75))
  );
  const macroScore = 65; // Baseline macro state

  // Supporting vs Conflicting Factors
  const supportingFactors: string[] = [];
  const conflictingFactors: string[] = [];

  if (features.trend.emaAlignmentScore >= 0.5) {
    supportingFactors.push(`Bullish EMA Stack: Price sits above EMA20 (+${features.trend.priceVsEma20Percent}%)`);
  } else if (features.trend.emaAlignmentScore <= -0.5) {
    supportingFactors.push(`Bearish EMA Stack: Price sits below EMA20 (${features.trend.priceVsEma20Percent}%)`);
  } else {
    conflictingFactors.push("EMAs compressing without clear directional separation.");
  }

  if (features.momentum.macdHistogramDelta > 0) {
    supportingFactors.push("MACD histogram expanding in direction of momentum.");
  } else if (features.momentum.macdHistogramDelta < 0) {
    conflictingFactors.push("MACD histogram decelerating, indicating momentum exhaustion.");
  }

  if (features.structure.recentCHoCH) {
    conflictingFactors.push("Recent structural change of character (CHoCH) introduces counter-trend risk.");
  }

  if (features.volatility.volatilityState === "extreme") {
    conflictingFactors.push("Realized volatility is in extreme percentile (wide spreads expected).");
  }

  // Price Targets & Invalidation
  const currentPrice = asset.currentPrice;
  const atr = features.volatility.atr14;

  const baseCaseTarget = Number(
    (currentPrice + (primaryForecast.dominantBias === "bullish" ? atr * 1.5 : -atr * 1.5)).toFixed(asset.decimals)
  );
  const bullBreakoutTarget = Number((currentPrice + atr * 2.8).toFixed(asset.decimals));
  const bearInvalidationTarget = Number(
    (currentPrice - (primaryForecast.dominantBias === "bullish" ? atr * 1.2 : -atr * 1.2)).toFixed(asset.decimals)
  );

  const structuredEvidenceSummary = `Observed ${asset.symbol} in ${regimeResult.primaryRegime} regime on ${timeframe}. Dominant probabilistic bias is ${primaryForecast.dominantBias.toUpperCase()} with ${primaryForecast.confidence}% confidence. Expected return over ${primaryHorizon} is ${primaryForecast.expectedReturnPercent}%, expected volatility is ${primaryForecast.expectedVolatilityPercent}%. Key driver: ${supportingFactors[0] || "Structural balance"}. Invalidation level: $${bearInvalidationTarget}.`;

  return {
    symbol: asset.symbol,
    timeframe,
    timestamp: features.timestamp,
    regime: regimeResult.primaryRegime,
    regimeDetails: regimeResult,
    direction: primaryForecast.direction,
    dominantBias: primaryForecast.dominantBias,
    expectedReturnPercent: primaryForecast.expectedReturnPercent,
    expectedVolatilityPercent: primaryForecast.expectedVolatilityPercent,
    confidence: primaryForecast.confidence,
    uncertainty: primaryForecast.uncertainty,
    modelAgreement: primaryForecast.modelAgreement,
    componentScores: {
      trendScore,
      momentumScore,
      volatilityScore,
      structureScore,
      liquidityScore,
      macroScore,
    },
    multiHorizonForecasts: multiHorizon,
    supportingFactors,
    conflictingFactors,
    invalidationTrigger: bearInvalidationTarget,
    priceTargets: {
      baseCaseTarget,
      bullBreakoutTarget,
      bearInvalidationTarget,
    },
    structuredEvidenceSummary,
  };
}
