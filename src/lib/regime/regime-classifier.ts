/**
 * Pulse Regime Engine
 * Classifies market conditions into discrete behavioral states and dynamically
 * calibrates model weights for the PulseCore ensemble.
 */

import { PulseFeatureVector } from "../features/feature-engine";

export type PulseMarketRegime =
  | "TREND_UP"
  | "TREND_DOWN"
  | "RANGE"
  | "HIGH_VOLATILITY"
  | "LOW_VOLATILITY"
  | "BREAKOUT"
  | "REVERSAL"
  | "UNCERTAIN";

export interface DynamicModelWeights {
  trendModel: number;      // Weight given to moving average & slope models
  momentumModel: number;   // Weight given to RSI / MACD acceleration
  structureModel: number;  // Weight given to swing high/low break
  liquidityModel: number;  // Weight given to stop cluster sweeps
  volatilityModel: number; // Weight given to variance expansion
  macroModel: number;      // Weight given to interest rate & DXY beta
}

export interface RegimeClassificationResult {
  primaryRegime: PulseMarketRegime;
  regimeProbabilities: Record<PulseMarketRegime, number>;
  confidence: number;
  dynamicWeights: DynamicModelWeights;
  behavioralCharacteristics: string;
  recommendedBias: "trend_following" | "mean_reversion" | "breakout_seeking" | "defensive";
  rationale: string[];
}

export function classifyMarketRegime(
  features: PulseFeatureVector
): RegimeClassificationResult {
  const { returns, trend, momentum, volatility, structure, liquidity } = features;

  const probs: Record<PulseMarketRegime, number> = {
    TREND_UP: 0.1,
    TREND_DOWN: 0.1,
    RANGE: 0.15,
    HIGH_VOLATILITY: 0.1,
    LOW_VOLATILITY: 0.1,
    BREAKOUT: 0.15,
    REVERSAL: 0.15,
    UNCERTAIN: 0.15,
  };

  const rationale: string[] = [];

  // 1. Trend Evidence
  if (trend.emaAlignmentScore >= 0.5 && trend.ema20Slope > 0.02) {
    probs.TREND_UP += 0.45;
    rationale.push(`Bullish EMA alignment (+${trend.emaAlignmentScore}) with positive slope.`);
  } else if (trend.emaAlignmentScore <= -0.5 && trend.ema20Slope < -0.02) {
    probs.TREND_DOWN += 0.45;
    rationale.push(`Bearish EMA alignment (${trend.emaAlignmentScore}) with downward slope.`);
  }

  // 2. Volatility Compression vs Expansion
  if (volatility.volatilityState === "contracting" || volatility.bollingerBandwidth < 1.4) {
    probs.LOW_VOLATILITY += 0.35;
    probs.RANGE += 0.25;
    rationale.push(`Bollinger bandwidth compressed to ${volatility.bollingerBandwidth}% (volatility squeeze).`);
  } else if (volatility.volatilityState === "extreme" || volatility.bollingerBandwidth > 5.0) {
    probs.HIGH_VOLATILITY += 0.45;
    rationale.push(`Elevated realized volatility (${volatility.realizedVol20}%) indicates institutional repricing.`);
  }

  // 3. Breakout Detection
  if (
    structure.barsSinceLastBOS <= 2 &&
    volatility.volumeRatio20 > 1.4 &&
    Math.abs(returns.return1) > 0.4
  ) {
    probs.BREAKOUT += 0.4;
    rationale.push(`Fresh Break of Structure detected (${structure.barsSinceLastBOS} bars ago) with ${volatility.volumeRatio20}x volume expansion.`);
  }

  // 4. Reversal / Liquidity Sweep Detection
  if (structure.recentCHoCH || liquidity.recentSweepDetected) {
    probs.REVERSAL += 0.45;
    rationale.push(
      liquidity.recentSweepDetected
        ? "Liquidity pool sweep observed above key swing pivot."
        : "Change of Character (CHoCH) structural reversal detected."
    );
  }

  // 5. Range Detection
  if (
    Math.abs(trend.emaAlignmentScore) < 0.3 &&
    Math.abs(returns.return5) < 0.6 &&
    momentum.rsi14 >= 42 &&
    momentum.rsi14 <= 58
  ) {
    probs.RANGE += 0.35;
    rationale.push(`Price oscillating within bounds; RSI neutral at ${momentum.rsi14}.`);
  }

  // Normalize probabilities so sum = 1.0
  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  for (const k in probs) {
    probs[k as PulseMarketRegime] = Number((probs[k as PulseMarketRegime] / total).toFixed(3));
  }

  // Determine primary regime
  let primaryRegime: PulseMarketRegime = "RANGE";
  let maxP = -1;
  for (const k in probs) {
    const key = k as PulseMarketRegime;
    if (probs[key] > maxP) {
      maxP = probs[key];
      primaryRegime = key;
    }
  }

  // Confidence is margin of separation
  const sorted = Object.values(probs).sort((a, b) => b - a);
  const confidence = Math.min(Math.round((sorted[0] + (sorted[0] - sorted[1])) * 100), 92);

  // Dynamic Ensemble Weights conditioning based on regime
  const dynamicWeights: DynamicModelWeights = {
    trendModel: 0.2,
    momentumModel: 0.2,
    structureModel: 0.2,
    liquidityModel: 0.15,
    volatilityModel: 0.15,
    macroModel: 0.1,
  };

  let behavioralCharacteristics = "Balanced market conditions with moderate directional conviction.";
  let recommendedBias: RegimeClassificationResult["recommendedBias"] = "trend_following";

  switch (primaryRegime) {
    case "TREND_UP":
    case "TREND_DOWN":
      dynamicWeights.trendModel = 0.35;
      dynamicWeights.momentumModel = 0.25;
      dynamicWeights.structureModel = 0.2;
      dynamicWeights.liquidityModel = 0.1;
      dynamicWeights.volatilityModel = 0.05;
      dynamicWeights.macroModel = 0.05;
      behavioralCharacteristics = "Directional expansion respecting structural pivots. Pullbacks favor continuation.";
      recommendedBias = "trend_following";
      break;

    case "RANGE":
      dynamicWeights.trendModel = 0.1;
      dynamicWeights.momentumModel = 0.2;
      dynamicWeights.structureModel = 0.35;
      dynamicWeights.liquidityModel = 0.25;
      dynamicWeights.volatilityModel = 0.05;
      dynamicWeights.macroModel = 0.05;
      behavioralCharacteristics = "Price consolidating between established value areas. Mean-reversion dominates.";
      recommendedBias = "mean_reversion";
      break;

    case "HIGH_VOLATILITY":
      dynamicWeights.trendModel = 0.1;
      dynamicWeights.momentumModel = 0.15;
      dynamicWeights.structureModel = 0.15;
      dynamicWeights.liquidityModel = 0.2;
      dynamicWeights.volatilityModel = 0.3;
      dynamicWeights.macroModel = 0.1;
      behavioralCharacteristics = "Severe price dispersion with wide wick ranges. Wide stop cushions and lower position sizing advised.";
      recommendedBias = "defensive";
      break;

    case "LOW_VOLATILITY":
      dynamicWeights.trendModel = 0.15;
      dynamicWeights.momentumModel = 0.15;
      dynamicWeights.structureModel = 0.3;
      dynamicWeights.liquidityModel = 0.25;
      dynamicWeights.volatilityModel = 0.15;
      dynamicWeights.macroModel = 0.0;
      behavioralCharacteristics = "Volatility compression window. Order book accumulation preceding expansion.";
      recommendedBias = "breakout_seeking";
      break;

    case "BREAKOUT":
      dynamicWeights.trendModel = 0.3;
      dynamicWeights.momentumModel = 0.3;
      dynamicWeights.structureModel = 0.2;
      dynamicWeights.liquidityModel = 0.1;
      dynamicWeights.volatilityModel = 0.1;
      dynamicWeights.macroModel = 0.0;
      behavioralCharacteristics = "Momentum impulse breaching structural resistance/support with volume participation.";
      recommendedBias = "breakout_seeking";
      break;

    case "REVERSAL":
      dynamicWeights.trendModel = 0.1;
      dynamicWeights.momentumModel = 0.2;
      dynamicWeights.structureModel = 0.35;
      dynamicWeights.liquidityModel = 0.25;
      dynamicWeights.volatilityModel = 0.1;
      dynamicWeights.macroModel = 0.0;
      behavioralCharacteristics = "Exhaustion or liquidity sweep causing structural change of character (CHoCH).";
      recommendedBias = "mean_reversion";
      break;

    default:
      behavioralCharacteristics = "Mixed market signals across components; higher uncertainty calibration applied.";
      recommendedBias = "defensive";
      break;
  }

  return {
    primaryRegime,
    regimeProbabilities: probs,
    confidence,
    dynamicWeights,
    behavioralCharacteristics,
    recommendedBias,
    rationale,
  };
}
