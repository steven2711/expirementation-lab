import { z } from 'zod';

export const experimentStatusSchema = z.enum(['draft', 'running', 'stopped', 'completed']);

export const variantSchema = z.enum(['control', 'variant']);

export const trafficAllocationSchema = z.object({
  control: z.number().min(0).max(100),
  variant: z.number().min(0).max(100)
}).refine(data => data.control + data.variant === 100, {
  message: "Traffic allocation must sum to 100"
});

export const createExperimentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trafficAllocation: trafficAllocationSchema.default({ control: 50, variant: 50 })
});

export const updateExperimentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: experimentStatusSchema.optional()
});

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>;
export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>;