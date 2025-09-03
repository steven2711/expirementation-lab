export type Variant = 'control' | 'variant';

export interface ExperimentLabConfig {
  apiKey: string;
  apiUrl?: string;
  debug?: boolean;
  flushInterval?: number;
  batchSize?: number;
  enableLocalStorage?: boolean;
}

export interface EventData {
  experimentId: string;
  userId: string;
  eventType: 'assignment' | 'conversion' | 'pageview' | 'custom';
  variant?: Variant;
  sessionId?: string;
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface VariantAssignment {
  experimentId: string;
  userId: string;
  variant: Variant;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}