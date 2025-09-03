import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { signUpSchema, signInSchema } from '@experimentlab/shared';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/signup', async (request, reply) => {
    try {
      const data = signUpSchema.parse(request.body);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User already exists',
          },
        });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });

      const project = await prisma.project.create({
        data: {
          name: `${data.email}'s Project`,
          userId: user.id,
        },
      });

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
      });

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          project: {
            id: project.id,
            name: project.name,
            apiKey: project.apiKey,
          },
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

  fastify.post('/signin', async (request, reply) => {
    try {
      const data = signInSchema.parse(request.body);
      
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          projects: {
            take: 1,
          },
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);

      if (!validPassword) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
      });

      return {
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          project: user.projects[0] ? {
            id: user.projects[0].id,
            name: user.projects[0].name,
            apiKey: user.projects[0].apiKey,
          } : null,
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
};