/**
 * Pulse Feature Engine
 * Quantitative feature extraction pipeline for financial market time-series
 */

import { OHLCV, Timeframe, AssetInfo } from "@/types/market";
import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateATR,
  calculateBollingerBands,
} from "../analysis/technical-indicators";
import { identifySwingPivots, identifyBOSandCHoCH, detectFairValueGaps } from "../analysis/market-structure";

export interface PulseFeatureVector {
  timestamp: number;
  timeframe: Timeframe;
  symbol: string;

  // Price & Return Features
  returns: {
    return1: number;       // 1-bar return %
    return5: number;       // 5-bar cumulative return %
    return20: number;      // 20-bar cumulative return %
    logReturn1: number;    // Logarithmic return
    momentum: number;      // Rate of change %
    acceleration: number;  // Derivative of momentum
    bodyToRangeRatio: number; // Candle compactness (0 to 1)
    upperWickRatio: number;
    lowerWickRatio: number;
  };

  // Trend Features
  trend: {
    ema20Slope: number;    // % change per bar
    ema50Slope: number;
    emaAlignmentScore: number; // +1.0 (strong bull) to -1.0 (strong bear)
    priceVsEma20Percent: number;
    priceVsEma50Percent: number;
    priceVsEma200Percent: number;
    higherHighCount: number;
    lowerLowCount: number;
  };

  // Momentum Features
  momentum: {
    rsi14: number;
    rsiDelta3: number;     // RSI change over 3 bars
    macdLine: number;
    signalLine: number;
    macdHistogram: number;
    macdHistogramDelta: number; // Momentum acceleration
  };

  // Volatility Features
  volatility: {
    atr14: number;
    atrPercent: number;    // ATR relative to price %
    realizedVol20: number; // 20-bar annualized realized volatility %
    parkinsonVol20: number; // High-Low variance estimator %
    bollingerBandwidth: number; // (Upper - Lower) / Middle %
    volatilityState: "contracting" | "expanding" | "extreme" | "normal";
    volumeRatio20: number; // Current volume / 20-period avg volume
  };

  // Market Structure Features
  structure: {
    state: "bullish_continuation" | "bearish_continuation" | "bullish_reversal_choch" | "bearish_reversal_choch" | "consolidation";
    distanceToNearestSwingHighPercent: number;
    distanceToNearestSwingLowPercent: number;
    barsSinceLastBOS: number;
    recentCHoCH: boolean;
    unfilledFVGCount: number;
  };

  // Liquidity Context
  liquidity: {
    overheadLiquidityPoolPips: number;
    downsideLiquidityPoolPips: number;
    recentSweepDetected: boolean;
    estimatedImbalanceRatio: number; // Buy vs Sell pressure proxy
  };
}

export function extractPulseFeatures(
  bars: OHLCV[],
  asset: AssetInfo,
  timeframe: Timeframe
): PulseFeatureVector | null {
  if (!bars || bars.length < 25) return null;

  const n = bars.length;
  const currentBar = bars[n - 1];
  const prevBar = bars[n - 2];
  const close = currentBar.close;
  const open = currentBar.open;
  const high = currentBar.high;
  const low = currentBar.low;

  // 1. Price & Return Features
  const return1 = ((close - prevBar.close) / prevBar.close) * 100;
  const return5 = n >= 6 ? ((close - bars[n - 6].close) / bars[n - 6].close) * 100 : return1;
  const return20 = n >= 21 ? ((close - bars[n - 21].close) / bars[n - 21].close) * 100 : return5;
  const logReturn1 = Math.log(close / prevBar.close);

  const prevReturn1 = n >= 3 ? ((prevBar.close - bars[n - 3].close) / bars[n - 3].close) * 100 : 0;
  const acceleration = return1 - prevReturn1;

  const candleRange = Math.max(high - low, close * 0.0001);
  const bodySize = Math.abs(close - open);
  const bodyToRangeRatio = Number((bodySize / candleRange).toFixed(3));
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;
  const upperWickRatio = Number((upperWick / candleRange).toFixed(3));
  const lowerWickRatio = Number((lowerWick / candleRange).toFixed(3));

  // 2. Trend & EMAs
  const closePrices = bars.map((b) => b.close);
  const ema20 = calculateEMA(closePrices, 20);
  const ema50 = calculateEMA(closePrices, Math.min(50, n));
  const ema200 = calculateEMA(closePrices, Math.min(200, n));

  const currEma20 = ema20[n - 1];
  const prevEma20 = ema20[n - 2] || currEma20;
  const ema20Slope = Number((((currEma20 - prevEma20) / prevEma20) * 100).toFixed(4));

  const currEma50 = ema50[n - 1];
  const prevEma50 = ema50[n - 2] || currEma50;
  const ema50Slope = Number((((currEma50 - prevEma50) / prevEma50) * 100).toFixed(4));

  const currEma200 = ema200[n - 1];

  let emaAlignmentScore = 0;
  if (close > currEma20 && currEma20 > currEma50 && currEma50 > currEma200) {
    emaAlignmentScore = 1.0; // Perfect Bull Stack
  } else if (close < currEma20 && currEma20 < currEma50 && currEma50 < currEma200) {
    emaAlignmentScore = -1.0; // Perfect Bear Stack
  } else if (close > currEma20 && currEma20 > currEma50) {
    emaAlignmentScore = 0.5;
  } else if (close < currEma20 && currEma20 < currEma50) {
    emaAlignmentScore = -0.5;
  }

  const priceVsEma20Percent = Number((((close - currEma20) / currEma20) * 100).toFixed(2));
  const priceVsEma50Percent = Number((((close - currEma50) / currEma50) * 100).toFixed(2));
  const priceVsEma200Percent = Number((((close - currEma200) / currEma200) * 100).toFixed(2));

  // 3. Momentum
  const rsi = calculateRSI(closePrices, 14);
  const currRsi = rsi[n - 1];
  const rsi3BarsAgo = rsi[Math.max(0, n - 4)] || currRsi;
  const rsiDelta3 = Number((currRsi - rsi3BarsAgo).toFixed(2));

  const macd = calculateMACD(closePrices);
  const currMacdHist = macd.histogram[n - 1] || 0;
  const prevMacdHist = macd.histogram[n - 2] || currMacdHist;
  const macdHistogramDelta = Number((currMacdHist - prevMacdHist).toFixed(4));

  // 4. Volatility
  const atr = calculateATR(bars, 14);
  const currAtr = atr[n - 1] || candleRange;
  const atrPercent = Number(((currAtr / close) * 100).toFixed(2));

  // Realized volatility of log returns over past 20 bars
  const window20 = bars.slice(-21);
  const logReturns: number[] = [];
  for (let i = 1; i < window20.length; i++) {
    logReturns.push(Math.log(window20[i].close / window20[i - 1].close));
  }
  const meanLogReturn = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
  const variance = logReturns.reduce((acc, r) => acc + Math.pow(r - meanLogReturn, 2), 0) / (logReturns.length - 1 || 1);
  const realizedVol20 = Number((Math.sqrt(variance) * Math.sqrt(252 * 24 * 4) * 100).toFixed(2)); // Annualized proxy

  // Parkinson volatility using high/low
  let parkinsonSum = 0;
  for (let i = 1; i < window20.length; i++) {
    const hlRatio = Math.log(window20[i].high / window20[i].low);
    parkinsonSum += hlRatio * hlRatio;
  }
  const parkinsonVol20 = Number((Math.sqrt(parkinsonSum / (4 * Math.log(2) * window20.length)) * 100).toFixed(2));

  const bb = calculateBollingerBands(closePrices, 20, 2);
  const bollingerBandwidth = Number((((bb.upper[n - 1] - bb.lower[n - 1]) / bb.middle[n - 1]) * 100).toFixed(2));

  let volatilityState: PulseFeatureVector["volatility"]["volatilityState"] = "normal";
  if (bollingerBandwidth < 1.2) volatilityState = "contracting";
  else if (bollingerBandwidth > 5.5) volatilityState = "extreme";
  else if (currAtr > atr[Math.max(0, n - 10)] * 1.3) volatilityState = "expanding";

  const avgVol20 = bars.slice(-20).reduce((acc, b) => acc + b.volume, 0) / 20 || 1;
  const volumeRatio20 = Number((currentBar.volume / avgVol20).toFixed(2));

  // 5. Market Structure & Swings
  const pivots = identifySwingPivots(bars, 3, 3);
  const breaks = identifyBOSandCHoCH(bars, pivots);
  const fvgs = detectFairValueGaps(bars);

  const swingHighs = pivots.filter((p) => p.type === "HH" || p.type === "LH");
  const swingLows = pivots.filter((p) => p.type === "LL" || p.type === "HL");

  const nearestSwingHigh = swingHighs.length > 0 ? swingHighs[swingHighs.length - 1].price : high * 1.01;
  const nearestSwingLow = swingLows.length > 0 ? swingLows[swingLows.length - 1].price : low * 0.99;

  const distanceToNearestSwingHighPercent = Number((((nearestSwingHigh - close) / close) * 100).toFixed(2));
  const distanceToNearestSwingLowPercent = Number((((close - nearestSwingLow) / close) * 100).toFixed(2));

  const recentBreak = breaks.length > 0 ? breaks[breaks.length - 1] : null;
  const barsSinceLastBOS = recentBreak ? n - 1 - recentBreak.pivotIndex : 99;
  const recentCHoCH = recentBreak ? recentBreak.type.includes("CHOCH") : false;

  let structureState: PulseFeatureVector["structure"]["state"] = "consolidation";
  if (emaAlignmentScore >= 0.5 && distanceToNearestSwingHighPercent > 0) {
    structureState = recentCHoCH ? "bullish_reversal_choch" : "bullish_continuation";
  } else if (emaAlignmentScore <= -0.5 && distanceToNearestSwingLowPercent > 0) {
    structureState = recentCHoCH ? "bearish_reversal_choch" : "bearish_continuation";
  }

  // 6. Liquidity Context
  const overheadLiquidityPoolPips = Math.round(Math.abs(nearestSwingHigh - close) / asset.pipSize);
  const downsideLiquidityPoolPips = Math.round(Math.abs(close - nearestSwingLow) / asset.pipSize);
  const recentSweepDetected = currentBar.high > nearestSwingHigh && currentBar.close < nearestSwingHigh;
  const estimatedImbalanceRatio = Number((volumeRatio20 * (return1 >= 0 ? 1.1 : 0.9)).toFixed(2));

  return {
    timestamp: currentBar.time,
    timeframe,
    symbol: asset.symbol,
    returns: {
      return1: Number(return1.toFixed(2)),
      return5: Number(return5.toFixed(2)),
      return20: Number(return20.toFixed(2)),
      logReturn1: Number(logReturn1.toFixed(5)),
      momentum: Number(return1.toFixed(2)),
      acceleration: Number(acceleration.toFixed(2)),
      bodyToRangeRatio,
      upperWickRatio,
      lowerWickRatio,
    },
    trend: {
      ema20Slope,
      ema50Slope,
      emaAlignmentScore,
      priceVsEma20Percent,
      priceVsEma50Percent,
      priceVsEma200Percent,
      higherHighCount: swingHighs.filter((p) => p.type === "HH").length,
      lowerLowCount: swingLows.filter((p) => p.type === "LL").length,
    },
    momentum: {
      rsi14: Math.round(currRsi),
      rsiDelta3,
      macdLine: Number(macd.macdLine[n - 1].toFixed(4)),
      signalLine: Number(macd.signalLine[n - 1].toFixed(4)),
      macdHistogram: Number(currMacdHist.toFixed(4)),
      macdHistogramDelta,
    },
    volatility: {
      atr14: Number(currAtr.toFixed(4)),
      atrPercent,
      realizedVol20,
      parkinsonVol20,
      bollingerBandwidth,
      volatilityState,
      volumeRatio20,
    },
    structure: {
      state: structureState,
      distanceToNearestSwingHighPercent,
      distanceToNearestSwingLowPercent,
      barsSinceLastBOS,
      recentCHoCH,
      unfilledFVGCount: fvgs.filter((f) => !f.mitigated).length,
    },
    liquidity: {
      overheadLiquidityPoolPips,
      downsideLiquidityPoolPips,
      recentSweepDetected,
      estimatedImbalanceRatio,
    },
  };
}
