import { zValidator } from '@hono/zod-validator';
import { Context } from 'hono';
import { ZodSchema } from 'zod';

export const validate = (target: 'json' | 'query' | 'param', schema: ZodSchema) => {
  return zValidator(target, schema, (result, c: Context) => {
    if (!result.success) {
      return c.json({
        error: {
          code: 'UNPROCESSABLE_ENTITY',
          message: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        }
      }, 422);
    }
  });
};
