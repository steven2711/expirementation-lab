import { z } from 'zod';

export const eventTypeSchema = z.enum(['assignment', 'conversion', 'pageview', 'custom']);

export const trackEventSchema = z.object({
  experimentId: z.string(),
  userId: z.string(),
  sessionId: z.string().optional(),
  eventType: eventTypeSchema,
  variant: z.string(),
  metadata: z.record(z.any()).optional(),
  properties: z.record(z.any()).optional()
});

export const eventBatchSchema = z.object({
  apiKey: z.string(),
  events: z.array(trackEventSchema)
});

export const getVariantSchema = z.object({
  experimentId: z.string(),
  userId: z.string()
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type EventBatchInput = z.infer<typeof eventBatchSchema>;
export type GetVariantInput = z.infer<typeof getVariantSchema>;