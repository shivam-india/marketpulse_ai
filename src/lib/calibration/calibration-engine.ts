/**
 * Calibration & Model Performance Intelligence
 * Probability calibration, Brier score tracking, log loss, and accuracy metrics.
 */

export interface EvaluationItem {
  id: string;
  predictedProbability: number; // 0.0 to 1.0 (e.g. 0.72)
  actualOutcome: 0 | 1;         // 1 if realized direction matched forecast, 0 if not
  predictedReturn: number;      // %
  actualReturn: number;         // %
  predictedVolatility: number;
  actualVolatility: number;
}

export interface CalibrationReport {
  brierScore: number;           // Lower is better (0.0 = perfect, 0.25 = uninformative coin toss)
  logLoss: number;              // Cross-entropy loss
  directionalHitRatePercent: number; // e.g. 68.4%
  expectedReturnMAE: number;    // Mean absolute error in %
  volatilityMAE: number;
  sampleSize: number;
  calibrationReliability: "well_calibrated" | "overconfident" | "underconfident" | "insufficient_data";
  calibrationCurve: { binCenter: number; empiricalAccuracy: number; count: number }[];
}

export function computeModelCalibration(items: EvaluationItem[]): CalibrationReport {
  if (!items || items.length === 0) {
    return {
      brierScore: 0.25,
      logLoss: 0.693,
      directionalHitRatePercent: 50.0,
      expectedReturnMAE: 0.0,
      volatilityMAE: 0.0,
      sampleSize: 0,
      calibrationReliability: "insufficient_data",
      calibrationCurve: [],
    };
  }

  const n = items.length;

  // 1. Brier Score = (1/N) * sum((p - o)^2)
  const brierSum = items.reduce((acc, item) => {
    return acc + Math.pow(item.predictedProbability - item.actualOutcome, 2);
  }, 0);
  const brierScore = Number((brierSum / n).toFixed(4));

  // 2. Log Loss = -(1/N) * sum(o*log(p) + (1-o)*log(1-p)) with epsilon clipping
  const eps = 1e-15;
  const logLossSum = items.reduce((acc, item) => {
    const p = Math.max(eps, Math.min(1 - eps, item.predictedProbability));
    return acc - (item.actualOutcome * Math.log(p) + (1 - item.actualOutcome) * Math.log(1 - p));
  }, 0);
  const logLoss = Number((logLossSum / n).toFixed(4));

  // 3. Directional Hit Rate %
  const correctCount = items.filter((item) => {
    return (item.predictedProbability >= 0.5 && item.actualOutcome === 1) ||
           (item.predictedProbability < 0.5 && item.actualOutcome === 0);
  }).length;
  const directionalHitRatePercent = Number(((correctCount / n) * 100).toFixed(1));

  // 4. Return MAE
  const returnErrorSum = items.reduce((acc, item) => acc + Math.abs(item.predictedReturn - item.actualReturn), 0);
  const expectedReturnMAE = Number((returnErrorSum / n).toFixed(3));

  // 5. Volatility MAE
  const volErrorSum = items.reduce((acc, item) => acc + Math.abs(item.predictedVolatility - item.actualVolatility), 0);
  const volatilityMAE = Number((volErrorSum / n).toFixed(3));

  // 6. Reliability curve (grouped into 5 probability bins: 0.5-0.6, 0.6-0.7, 0.7-0.8, 0.8-0.9, 0.9-1.0)
  const bins = [
    { min: 0.5, max: 0.6, center: 0.55 },
    { min: 0.6, max: 0.7, center: 0.65 },
    { min: 0.7, max: 0.8, center: 0.75 },
    { min: 0.8, max: 0.9, center: 0.85 },
    { min: 0.9, max: 1.0, center: 0.95 },
  ];

  const calibrationCurve = bins.map((bin) => {
    const inBin = items.filter((item) => {
      const p = item.predictedProbability >= 0.5 ? item.predictedProbability : 1 - item.predictedProbability;
      return p >= bin.min && p < bin.max;
    });

    const wins = inBin.filter((i) => i.actualOutcome === 1).length;
    const empiricalAccuracy = inBin.length > 0 ? Number(((wins / inBin.length) * 100).toFixed(1)) : 0;

    return {
      binCenter: bin.center * 100,
      empiricalAccuracy,
      count: inBin.length,
    };
  });

  // Assess reliability
  let calibrationReliability: CalibrationReport["calibrationReliability"] = "well_calibrated";
  if (n < 10) {
    calibrationReliability = "insufficient_data";
  } else if (brierScore > 0.23 || directionalHitRatePercent < 52) {
    calibrationReliability = "overconfident";
  } else if (brierScore < 0.16 && directionalHitRatePercent > 65) {
    calibrationReliability = "well_calibrated";
  }

  return {
    brierScore,
    logLoss,
    directionalHitRatePercent,
    expectedReturnMAE,
    volatilityMAE,
    sampleSize: n,
    calibrationReliability,
    calibrationCurve,
  };
}
