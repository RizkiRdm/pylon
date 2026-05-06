import { Context, Next } from 'hono';
import { ratelimit } from '@pylon/queue';
import { logger } from '../logger';

export const rateLimiter = async (c: Context, next: Next) => {
  const userId = c.get('userId') || 'anonymous';
  
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(userId);

    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', reset.toString());

    if (!success) {
      return c.json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Try again later.',
          details: {
            reset,
          },
        }
      }, 429);
    }
  } catch (err) {
    // Fail open if Redis is down, but log the error
    logger.error({ err, userId }, 'Rate limiter failed');
  }

  await next();
};
