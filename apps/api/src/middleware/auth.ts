import { Context, Next } from 'hono';

export const auth = async (c: Context, next: Next) => {
  // Dummy auth for development
  // In real implementation, this will verify Supabase JWT
  c.set('userId', '00000000-0000-0000-0000-000000000000');
  await next();
};
