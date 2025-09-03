import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { authRoutes } from './routes/auth';
import { projectRoutes } from './routes/projects';
import { experimentRoutes } from './routes/experiments';
import { eventRoutes } from './routes/events';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/error-handler';

const server = fastify({
  logger: logger,
  trustProxy: true,
});

async function start() {
  try {
    await server.register(cors, {
      origin: config.cors.origin,
      credentials: true,
    });

    await server.register(jwt, {
      secret: config.jwt.secret,
    });

    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    server.setErrorHandler(errorHandler);

    server.register(healthRoutes, { prefix: '/health' });
    server.register(authRoutes, { prefix: '/api/auth' });
    server.register(projectRoutes, { prefix: '/api/projects' });
    server.register(experimentRoutes, { prefix: '/api/experiments' });
    server.register(eventRoutes, { prefix: '/api/events' });

    await server.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

start();