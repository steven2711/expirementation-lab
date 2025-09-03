import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { redis } from '../db/redis';

export async function getVariant(experimentId: string, userId: string): Promise<string> {
  const cacheKey = `assignment:${experimentId}:${userId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }

  const experiment = await prisma.experiment.findUnique({
    where: { id: experimentId },
  });

  if (!experiment || experiment.status !== 'running') {
    return 'control';
  }

  const existingAssignment = await prisma.event.findFirst({
    where: {
      experimentId,
      userId,
      eventType: 'assignment',
    },
    orderBy: { timestamp: 'desc' },
  });

  if (existingAssignment) {
    await redis.set(cacheKey, existingAssignment.variant, 'EX', 3600);
    return existingAssignment.variant;
  }

  const hash = crypto
    .createHash('md5')
    .update(`${experimentId}-${userId}`)
    .digest('hex');
  
  const hashValue = parseInt(hash.substring(0, 8), 16);
  const bucket = (hashValue % 100) + 1;
  
  const allocation = experiment.trafficAllocation as { control: number; variant: number };
  const variant = bucket <= allocation.control ? 'control' : 'variant';

  await redis.set(cacheKey, variant, 'EX', 3600);

  return variant;
}