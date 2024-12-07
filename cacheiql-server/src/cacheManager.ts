import { getRedisClient } from './redisClient';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export const cacheQuery = async (
  key: string,
  data: any,
  options: CacheOptions = {}
) => {
  const client = getRedisClient();
  const ttl = options.ttl || 3600; // Default TTL: 1 hour
  await client.set(key, JSON.stringify(data), { EX: ttl });
};

export const getCachedQuery = async (key: string): Promise<any | null> => {
  const client = getRedisClient();
  const cachedData = await client.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

export const invalidateCache = async (key: string) => {
  const client = getRedisClient();
  await client.del(key);
};
