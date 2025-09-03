import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { ExperimentResults, VariantResults } from '@experimentlab/shared';

export async function calculateResults(experimentId: string): Promise<ExperimentResults> {
  const cacheKey = `results:${experimentId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const events = await prisma.event.findMany({
    where: { experimentId },
  });

  const controlAssignments = new Set<string>();
  const variantAssignments = new Set<string>();
  const controlConversions = new Set<string>();
  const variantConversions = new Set<string>();

  for (const event of events) {
    if (event.eventType === 'assignment') {
      if (event.variant === 'control') {
        controlAssignments.add(event.userId);
      } else {
        variantAssignments.add(event.userId);
      }
    } else if (event.eventType === 'conversion') {
      if (event.variant === 'control') {
        controlConversions.add(event.userId);
      } else {
        variantConversions.add(event.userId);
      }
    }
  }

  const controlVisitors = controlAssignments.size;
  const variantVisitors = variantAssignments.size;
  const controlConversionCount = controlConversions.size;
  const variantConversionCount = variantConversions.size;

  const controlRate = controlVisitors > 0 ? controlConversionCount / controlVisitors : 0;
  const variantRate = variantVisitors > 0 ? variantConversionCount / variantVisitors : 0;

  const controlCI = calculateConfidenceInterval(controlRate, controlVisitors);
  const variantCI = calculateConfidenceInterval(variantRate, variantVisitors);

  const { pValue, isSignificant } = calculateSignificance(
    controlConversionCount,
    controlVisitors,
    variantConversionCount,
    variantVisitors
  );

  const sampleSize = calculateSampleSize(controlRate, variantRate);

  const results: ExperimentResults = {
    experimentId,
    control: {
      visitors: controlVisitors,
      conversions: controlConversionCount,
      conversionRate: controlRate,
      confidenceInterval: controlCI,
    },
    variant: {
      visitors: variantVisitors,
      conversions: variantConversionCount,
      conversionRate: variantRate,
      confidenceInterval: variantCI,
    },
    statisticalSignificance: isSignificant,
    confidenceLevel: 0.95,
    pValue,
    sampleSizeRecommendation: sampleSize,
  };

  await redis.set(cacheKey, JSON.stringify(results), 'EX', 60);

  return results;
}

function calculateConfidenceInterval(rate: number, n: number): { lower: number; upper: number } {
  if (n === 0) {
    return { lower: 0, upper: 0 };
  }

  const z = 1.96;
  const se = Math.sqrt((rate * (1 - rate)) / n);
  const margin = z * se;

  return {
    lower: Math.max(0, rate - margin),
    upper: Math.min(1, rate + margin),
  };
}

function calculateSignificance(
  controlConversions: number,
  controlTotal: number,
  variantConversions: number,
  variantTotal: number
): { pValue: number; isSignificant: boolean } {
  if (controlTotal < 30 || variantTotal < 30) {
    return { pValue: 1, isSignificant: false };
  }

  const p1 = controlConversions / controlTotal;
  const p2 = variantConversions / variantTotal;
  const pPooled = (controlConversions + variantConversions) / (controlTotal + variantTotal);

  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / controlTotal + 1 / variantTotal));
  
  if (se === 0) {
    return { pValue: 1, isSignificant: false };
  }

  const z = (p1 - p2) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  return {
    pValue,
    isSignificant: pValue < 0.05,
  };
}

function calculateSampleSize(p1: number, p2: number): number {
  const alpha = 0.05;
  const power = 0.8;
  const zAlpha = 1.96;
  const zBeta = 0.84;

  const p = (p1 + p2) / 2;
  const d = Math.abs(p1 - p2);

  if (d === 0) {
    return 10000;
  }

  const n = (2 * p * (1 - p) * Math.pow(zAlpha + zBeta, 2)) / Math.pow(d, 2);

  return Math.ceil(n);
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return z > 0 ? 1 - prob : prob;
}