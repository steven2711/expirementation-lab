import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createProjectSchema, updateProjectSchema } from '@experimentlab/shared';
import { prisma } from '../db/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', async (request: AuthRequest, reply) => {
    const projects = await prisma.project.findMany({
      where: { userId: request.user!.id },
      include: {
        _count: {
          select: { experiments: true },
        },
      },
    });

    return {
      success: true,
      data: projects,
    };
  });

  fastify.get('/:id', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
      include: {
        experiments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { experiments: true },
        },
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

    return {
      success: true,
      data: project,
    };
  });

  fastify.post('/', async (request: AuthRequest, reply) => {
    try {
      const data = createProjectSchema.parse(request.body);

      const project = await prisma.project.create({
        data: {
          ...data,
          userId: request.user!.id,
        },
      });

      return {
        success: true,
        data: project,
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
      const data = updateProjectSchema.parse(request.body);

      const project = await prisma.project.findFirst({
        where: {
          id,
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

      const updated = await prisma.project.update({
        where: { id },
        data,
      });

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

  fastify.post('/:id/regenerate-key', async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const project = await prisma.project.findFirst({
      where: {
        id,
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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        apiKey: crypto.randomUUID(),
      },
    });

    return {
      success: true,
      data: {
        apiKey: updated.apiKey,
      },
    };
  });
};