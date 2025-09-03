import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db/prisma';

export interface AuthRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticate(request: AuthRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authorization token',
        },
      });
    }

    const decoded = await request.jwtVerify() as { id: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token',
        },
      });
    }

    request.user = {
      id: user.id,
      email: user.email,
    };
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      },
    });
  }
}