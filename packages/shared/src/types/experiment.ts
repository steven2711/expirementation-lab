export type ExperimentStatus = 'draft' | 'running' | 'stopped' | 'completed';

export type Variant = 'control' | 'variant';

export interface TrafficAllocation {
  control: number;
  variant: number;
}

export interface Experiment {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  trafficAllocation: TrafficAllocation;
  createdAt: Date;
  startedAt?: Date;
  stoppedAt?: Date;
  updatedAt: Date;
}

export interface ExperimentResults {
  experimentId: string;
  control: VariantResults;
  variant: VariantResults;
  statisticalSignificance: boolean;
  confidenceLevel: number;
  pValue: number;
  sampleSizeRecommendation?: number;
}

export interface VariantResults {
  visitors: number;
  conversions: number;
  conversionRate: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}