import { getRedisClient, connectRedis } from './redisClient';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}
let cacheHits = 0;
let cacheMisses = 0;
/**
 * Caches a query result in Redis.
 * @param key - The key under which the data will be stored.
 * @param data - The data to be cached.
 * @param options - Cache options (e.g., TTL).
 */
export const setCacheQuery = async (
  key: string,
  data: any,
  options: CacheOptions = {}
) => {
  try {
    const client = getRedisClient();
    const ttl = options.ttl || 3600; // Default TTL: 1 hour
    const namespacedKey = `myApp:${key}`;
    await client.set(namespacedKey, JSON.stringify(data), { EX: ttl });
  } catch (error) {
    console.error(`Error caching query for key "${key}":`, error);
    throw new Error(`Cache operation failed for key "${key}"`);
  }
};

export const getCachedQuery = async (key: string): Promise<any | null> => {
  try {
    const client = getRedisClient();
    const cachedData = await client.get(`myApp:${key}`);
    if (cachedData) {
      cacheHits++;
      return JSON.parse(cachedData)
    }
    cacheMisses++;
    return null;
    
  } catch (error) {
    console.error(`Error retrieving cache for key "${key}":`, error);
    throw error;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error(`Error invalidating cache for key "${key}":`, error);
    throw error;
  }
};

export const getData = async (key: string, fetchFromDb: () => Promise<any>) => {
  try {
    const cacheData = await getCachedQuery(key)
    if (cacheData) {
      console.log('returning data from cache')
      return cacheData
    }
    const dbData = await fetchFromDb()
    await setCacheQuery(key,dbData)
    return dbData
  } catch (error) {
    console.error('Error fetching data', error)
    throw error 
  }
}
// Example function to fetch data from a database (you would replace this with your actual database query logic)
async function fetchFromDb() {
  // Simulating a database fetch (replace with actual DB query)
  return { message: 'Data from database' };
}
