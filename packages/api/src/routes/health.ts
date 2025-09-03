import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/ready', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      
      await redis.ping();
      
      return {
        status: 'ready',
        services: {
          database: 'connected',
          redis: 'connected',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'not ready',
        services: {
          database: 'disconnected',
          redis: 'disconnected',
        },
        timestamp: new Date().toISOString(),
      };
    }
  });
};