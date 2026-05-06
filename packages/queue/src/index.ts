import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(100, '60s', 100),
  analytics: true,
  prefix: '@pylon/ratelimit',
});

export * from './job-queue';
