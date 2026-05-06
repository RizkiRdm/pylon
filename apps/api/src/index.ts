import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { logger } from './logger';
import { auth } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limiter';
import apiKeysRoutes from './routes/api-keys';

const app = new Hono().basePath('/api/v1');

// Global Middlewares
app.use('*', honoLogger());
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Public Routes
app.get('/health', (c) => {
  return c.json({
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    meta: {}
  });
});

// Protected Routes - Apply Auth and Rate Limiting
app.use('*', async (c, next) => {
  if (c.req.path === '/api/v1/health') return await next();
  return auth(c, next);
});
app.use('*', async (c, next) => {
  if (c.req.path === '/api/v1/health') return await next();
  return rateLimiter(c, next);
});

// Routes
app.route('/api-keys', apiKeysRoutes);

// Error handling
app.onError((err, c) => {
  logger.error(err);
  
  return c.json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : {},
    }
  }, 500);
});

// Not found handling
app.notFound((c) => {
  return c.json({
    error: {
      code: 'NOT_FOUND',
      message: `Resource not found: ${c.req.url}`,
      details: {},
    }
  }, 404);
});

export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
};

logger.info(`API server started on port ${process.env.PORT || 3001}`);
