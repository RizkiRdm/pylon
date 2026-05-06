import { db } from '../index';
import { apiKeys } from '../schema';
import { eq, and } from 'drizzle-orm';

export class ApiKeyRepository {
  static async findByUserId(userId: string) {
    return db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, userId),
      columns: {
        id: true,
        provider: true,
        keyHint: true,
        createdAt: true,
      },
    });
  }

  static async create(data: typeof apiKeys.$inferInsert) {
    const [newKey] = await db.insert(apiKeys).values(data).returning({
      id: apiKeys.id,
      provider: apiKeys.provider,
      keyHint: apiKeys.keyHint,
      createdAt: apiKeys.createdAt,
    });
    return newKey;
  }

  static async delete(id: string, userId: string) {
    const [deletedKey] = await db.delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
      .returning();
    return deletedKey;
  }
}
