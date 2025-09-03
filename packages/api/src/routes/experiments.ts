import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createExperimentSchema, updateExperimentSchema } from '@experimentlab/shared';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';
import { authenticate, AuthRequest } from '../middleware/auth';
import { calculateResults } from '../services/statistics';

export const experimentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', async (request: AuthRequest, reply) => {
    const { projectId } = request.query as { projectId?: string };

    const experiments = await prisma.experiment.findMany({
      where: {
        project: {
          userId: request.user!.id,
          ...(projectId && { id: projectId }),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: experiments,
    };
  });

  fastify.get('/:id', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const experiment = await prisma.experiment.findFirst({
      where: {
        id,
        project: {
          userId: request.user!.id,
        },
      },
      include: {
        project: true,
        _count: {
          select: { events: true },
        },
      },
    });

    if (!experiment) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
        },
      });
    }

    return {
      success: true,
      data: experiment,
    };
  });

  fastify.post('/', async (request: AuthRequest, reply) => {
    try {
      const { projectId, ...data } = z.object({
        projectId: z.string(),
        ...createExperimentSchema.shape,
      }).parse(request.body);

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: request.user!.id,
        },
      });

      if (!project) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      const experiment = await prisma.experiment.create({
        data: {
          ...data,
          projectId,
          trafficAllocation: data.trafficAllocation || { control: 50, variant: 50 },
        },
      });

      await redis.del(`experiments:${projectId}`);

      return {
        success: true,
        data: experiment,
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

  fastify.patch('/:id', async (request: AuthRequest, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateExperimentSchema.parse(request.body);

      const experiment = await prisma.experiment.findFirst({
        where: {
          id,
          project: {
            userId: request.user!.id,
          },
        },
      });

      if (!experiment) {
        return reply.status(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Experiment not found',
          },
        });
      }

      const updated = await prisma.experiment.update({
        where: { id },
        data,
      });

      await redis.del(`experiments:${experiment.projectId}`);
      await redis.del(`experiment:${id}`);

      return {
        success: true,
        data: updated,
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

  fastify.post('/:id/start', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const experiment = await prisma.experiment.findFirst({
      where: {
        id,
        project: {
          userId: request.user!.id,
        },
      },
    });

    if (!experiment) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
        },
      });
    }

    if (experiment.status === 'running') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'ALREADY_RUNNING',
          message: 'Experiment is already running',
        },
      });
    }

    const updated = await prisma.experiment.update({
      where: { id },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

    await redis.del(`experiments:${experiment.projectId}`);
    await redis.del(`experiment:${id}`);

    return {
      success: true,
      data: updated,
    };
  });

  fastify.post('/:id/stop', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const experiment = await prisma.experiment.findFirst({
      where: {
        id,
        project: {
          userId: request.user!.id,
        },
      },
    });

    if (!experiment) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
        },
      });
    }

    if (experiment.status !== 'running') {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'NOT_RUNNING',
          message: 'Experiment is not running',
        },
      });
    }

    const updated = await prisma.experiment.update({
      where: { id },
      data: {
        status: 'stopped',
        stoppedAt: new Date(),
      },
    });

    await redis.del(`experiments:${experiment.projectId}`);
    await redis.del(`experiment:${id}`);

    return {
      success: true,
      data: updated,
    };
  });

  fastify.get('/:id/results', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const experiment = await prisma.experiment.findFirst({
      where: {
        id,
        project: {
          userId: request.user!.id,
        },
      },
    });

    if (!experiment) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Experiment not found',
        },
      });
    }

    const results = await calculateResults(id);

    return {
      success: true,
      data: results,
    };
  });
};