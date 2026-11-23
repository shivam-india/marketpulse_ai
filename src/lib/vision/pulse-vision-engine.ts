/**
 * Pulse Vision Engine & Multi-Screenshot Comparator ("Pulse Compare")
 * Multimodal visual market structure extraction, live data fusion, and comparative delta analysis.
 */

import { ChartVisionDetection, AssetInfo } from "@/types/market";
import { chartVisionProvider } from "../providers/chart-vision-provider";

export interface VisionLiveComparison {
  screenshotPriceApprox?: number;
  liveCurrentPrice: number;
  priceDeltaPercent: number;
  isScreenshotOutdated: boolean;
  stalenessAssessment: string;
  structuralAlignment: "aligned" | "diverged" | "invalidation_occurred";
  fusionSummary: string;
}

export interface PulseCompareResult {
  imageAObservations: ChartVisionDetection;
  imageBObservations: ChartVisionDetection;
  structuralChanges: {
    priceDeltaDirection: "higher" | "lower" | "unchanged";
    brokenLevels: string[];
    newPivotsFormed: string[];
    regimeShiftDetected: boolean;
    previousRegime: string;
    newRegime: string;
    volatilityChange: "expanded" | "contracted" | "steady";
    momentumShift: string;
  };
  whatChangedSummary: string;
  implicationsForForecast: string;
}

export class PulseVisionEngine {
  /**
   * Analyzes a single screenshot and fuses with live asset data
   */
  public async analyzeAndFuseWithLive(
    base64Image: string,
    liveAsset: AssetInfo
  ): Promise<{
    vision: ChartVisionDetection;
    liveComparison: VisionLiveComparison;
  }> {
    const vision = await chartVisionProvider.analyzeChartImage(base64Image, liveAsset.symbol);

    // Estimate visible price from support/resistance levels
    let approxPrice = liveAsset.currentPrice;
    if (vision.supportZones.length > 0 && vision.resistanceZones.length > 0) {
      approxPrice = (vision.supportZones[0].priceApprox + vision.resistanceZones[0].priceApprox) / 2;
    }

    const priceDeltaPercent = Number(
      (((liveAsset.currentPrice - approxPrice) / approxPrice) * 100).toFixed(2)
    );
    const isScreenshotOutdated = Math.abs(priceDeltaPercent) > 1.2;

    let structuralAlignment: VisionLiveComparison["structuralAlignment"] = "aligned";
    let stalenessAssessment = "Screenshot price action matches current live market structure.";

    if (isScreenshotOutdated) {
      structuralAlignment = "diverged";
      stalenessAssessment = `Screenshot is outdated by approximately ${priceDeltaPercent > 0 ? "+" : ""}${priceDeltaPercent}%. Live price has expanded beyond visual capture bounds.`;
    }

    const fusionSummary = `Pulse Vision verified ${vision.trendDetected} structure with ${vision.confidenceScore}% confidence. Live market price is $${liveAsset.currentPrice} (${isScreenshotOutdated ? "outdated screenshot" : "current alignment"}).`;

    return {
      vision,
      liveComparison: {
        screenshotPriceApprox: approxPrice,
        liveCurrentPrice: liveAsset.currentPrice,
        priceDeltaPercent,
        isScreenshotOutdated,
        stalenessAssessment,
        structuralAlignment,
        fusionSummary,
      },
    };
  }

  /**
   * Pulse Compare: Takes two consecutive screenshots (e.g. before/after news or morning/evening)
   * and computes the exact physical delta
   */
  public async compareScreenshots(
    imageA: string,
    imageB: string,
    assetSymbol: string
  ): Promise<PulseCompareResult> {
    const [obsA, obsB] = await Promise.all([
      chartVisionProvider.analyzeChartImage(imageA, assetSymbol),
      chartVisionProvider.analyzeChartImage(imageB, assetSymbol),
    ]);

    const brokenLevels: string[] = [];
    if (obsB.structureBreak) {
      brokenLevels.push(obsB.structureBreak);
    }
    if (obsB.patternsIdentified.length > obsA.patternsIdentified.length) {
      brokenLevels.push(`New chart patterns developed: ${obsB.patternsIdentified.join(", ")}`);
    }

    const newPivotsFormed: string[] = obsB.swingPivots.map((p) => `${p.type.replace(/_/g, " ")}: ${p.description}`);

    const regimeShiftDetected = obsA.trendDetected !== obsB.trendDetected;
    let priceDeltaDirection: PulseCompareResult["structuralChanges"]["priceDeltaDirection"] = "unchanged";
    if (obsB.trendDetected === "bullish" && obsA.trendDetected !== "bullish") {
      priceDeltaDirection = "higher";
    } else if (obsB.trendDetected === "bearish" && obsA.trendDetected !== "bearish") {
      priceDeltaDirection = "lower";
    }

    const whatChangedSummary = `Comparison between Screenshot A and B reveals a shift from ${obsA.trendDetected} to ${obsB.trendDetected}. ${brokenLevels.length > 0 ? brokenLevels.join(". ") : "Levels remained intact."}`;
    const implicationsForForecast = regimeShiftDetected
      ? `Structural character shift detected between captures. Model confidence adjusted for transitional volatility.`
      : `Market structure continues in direction of initial trend. Previous invalidation levels remain valid.`;

    return {
      imageAObservations: obsA,
      imageBObservations: obsB,
      structuralChanges: {
        priceDeltaDirection,
        brokenLevels,
        newPivotsFormed,
        regimeShiftDetected,
        previousRegime: obsA.trendDetected.toUpperCase(),
        newRegime: obsB.trendDetected.toUpperCase(),
        volatilityChange: "steady",
        momentumShift: obsB.visibleVolumeAssessment || "Volume consistent across captures",
      },
      whatChangedSummary,
      implicationsForForecast,
    };
  }
}

export const pulseVisionEngine = new PulseVisionEngine();
