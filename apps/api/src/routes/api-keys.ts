import { Hono } from 'hono';
import { ApiKeyRepository } from '@pylon/db';
import { encrypt } from '@pylon/crypto';
import { z } from 'zod';
import { validate } from '../middleware/validator';

const routes = new Hono();

const createKeySchema = z.object({
  provider: z.string().min(1),
  key: z.string().min(1),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

function generateHint(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// List API keys (hints only)
routes.get('/', async (c) => {
  const userId = c.get('userId');
  const keys = await ApiKeyRepository.findByUserId(userId);
  return c.json({ data: keys, meta: {} });
});

// Add API key
routes.post('/', validate('json', createKeySchema), async (c) => {
  const userId = c.get('userId');
  const { provider, key } = c.req.valid('json');

  const keyEncrypted = encrypt(key);
  const keyHint = generateHint(key);

  const newKey = await ApiKeyRepository.create({
    userId,
    provider,
    keyHint,
    keyEncrypted,
  });

  return c.json({ data: newKey, meta: {} });
});

// Delete API key
routes.delete('/:id', validate('param', idParamSchema), async (c) => {
  const userId = c.get('userId');
  const { id } = c.req.valid('param');

  const deletedKey = await ApiKeyRepository.delete(id, userId);

  if (!deletedKey) {
    return c.json({
      error: {
        code: 'NOT_FOUND',
        message: 'API key not found',
        details: {},
      }
    }, 404);
  }

  return c.json({ data: { success: true }, meta: {} });
});

export default routes;
