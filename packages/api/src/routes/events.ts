import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { trackEventSchema, eventBatchSchema, getVariantSchema } from '@experimentlab/shared';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { getVariant } from '../services/assignment';

export const eventRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/track', async (request, reply) => {
    try {
      const { apiKey, ...eventData } = z.object({
        apiKey: z.string(),
        ...trackEventSchema.shape,
      }).parse(request.body);

      const project = await prisma.project.findUnique({
        where: { apiKey },
      });

      if (!project) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
          },
        });
      }

      const experiment = await prisma.experiment.findFirst({
        where: {
          id: eventData.experimentId,
          projectId: project.id,
          status: 'running',
        },
      });

      if (!experiment) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'EXPERIMENT_NOT_FOUND',
            message: 'Experiment not found or not running',
          },
        });
      }

      const event = await prisma.event.create({
        data: eventData,
      });

      await redis.del(`results:${eventData.experimentId}`);

      return {
        success: true,
        data: { id: event.id },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  fastify.post('/batch', async (request, reply) => {
    try {
      const { apiKey, events } = eventBatchSchema.parse(request.body);

      const project = await prisma.project.findUnique({
        where: { apiKey },
      });

      if (!project) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
          },
        });
      }

      const experimentIds = [...new Set(events.map(e => e.experimentId))];
      
      const experiments = await prisma.experiment.findMany({
        where: {
          id: { in: experimentIds },
          projectId: project.id,
          status: 'running',
        },
      });

      const validExperimentIds = new Set(experiments.map(e => e.id));
      const validEvents = events.filter(e => validExperimentIds.has(e.experimentId));

      if (validEvents.length === 0) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'NO_VALID_EVENTS',
            message: 'No valid events to track',
          },
        });
      }

      await prisma.event.createMany({
        data: validEvents,
      });

      for (const expId of validExperimentIds) {
        await redis.del(`results:${expId}`);
      }

      return {
        success: true,
        data: {
          processed: validEvents.length,
          skipped: events.length - validEvents.length,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });

  fastify.post('/variant', async (request, reply) => {
    try {
      const { apiKey, ...data } = z.object({
        apiKey: z.string(),
        ...getVariantSchema.shape,
      }).parse(request.body);

      const project = await prisma.project.findUnique({
        where: { apiKey },
      });

      if (!project) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_API_KEY',
            message: 'Invalid API key',
          },
        });
      }

      const experiment = await prisma.experiment.findFirst({
        where: {
          id: data.experimentId,
          projectId: project.id,
          status: 'running',
        },
      });

      if (!experiment) {
        return {
          success: true,
          data: { variant: 'control' },
        };
      }

      const variant = await getVariant(data.experimentId, data.userId);

      await prisma.event.create({
        data: {
          experimentId: data.experimentId,
          userId: data.userId,
          eventType: 'assignment',
          variant,
        },
      });

      return {
        success: true,
        data: { variant },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }
      throw error;
    }
  });
};