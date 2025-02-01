import { getRedisClient, connectRedis } from './redisClient';

// Ensures Redis is initialized before executing any caching operations.
(async () => {
  await connectRedis();
})();


interface CacheOptions {
  ttl?: number; // Time to live in seconds
}
export let cacheHits = 0;
export let cacheMisses = 0;

/**
 * Caches a query result in Redis.
 * @param key - The key under which the data will be stored.
 * @param data - The data to be cached.
 * @param entity - The GraphQL entity for cache tracking.
 * @param options - Cache options (e.g., TTL).
 */

export const setCacheQuery = async (
  key: string,
  data: any,
  entity: string,
  options: CacheOptions = { ttl: 60}
) => {
  try {
    const client =  await getRedisClient();
    // const ttl = options.ttl || 10; // Default TTL: 1 hour
    const namespacedKey = `myApp:${key}`;
    if (data !== undefined) {
      await client.set(namespacedKey, JSON.stringify(data));
      await client.expire(namespacedKey, options.ttl ?? 60);
      //Every time we cache a query result, we should track its key under the relevant entity.
      await trackCacheKey(entity, namespacedKey);
    } else {
       console.warn(`Skipping cache set for ${key} due to undefined data`);
    }   
  } catch (error) {
    console.error(`Error caching query for key "${key}":`, error);
    throw new Error(`Cache operation failed for key "${key}"`);
  }
};

/**
 * Retrieves a cached query result from Redis.
 * @param key - The key to retrieve.
 * @returns The cached data or null if not found.
 */
export const getCachedQuery = async (
  key: string
): Promise<any | null> => {
  try {
    const client = await getRedisClient();
    const cachedData = await client.get(`myApp:${key}`);

    //code below might not be necessary. This could extend TTL on every read.(removed it to prevents cache from being extended indefinitely)
    // client.expire(`myApp:${key}`, ttl);
    if (cachedData) {
      cacheHits++;
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.error(`Error parsing cached data for key "${key}":`, error);
        return null; // Return null instead of crashing
      }

    }
    cacheMisses++;
    return null;
  } catch (error) {
    console.error(`Error retrieving cache for key "${key}":`, error);
    return null; // Ensures request proceeds even if Redis fails
  }
};

/**
 * Invalidates a specific cache key.
 * @param key - The key to remove from cache.
 */
export const invalidateCache = async (key: string) => {
  try {
    const client = await getRedisClient();
    await client.del(`myApp:${key}`);
  } catch (error) {
    console.error(`Error invalidating cache for key "${key}":`, error);
    throw error;
  }
};


/**
 * Retrieves data from cache or fetches from the database.
 * @param key - The cache key.
 * @param entity - The entity name for cache tracking.
 * @param fetchFromDb - Function to fetch data from the database if not in cache.
 * @returns The data from cache or database.
 */
export const getData = async (
  key: string,
  entity: string,
  fetchFromDb: () => Promise<any>
) => {
  try {
    const cacheData = await getCachedQuery(key);
    if (cacheData) {
      console.log("returning data from cache");
      return cacheData;
    }
    const dbData = await fetchFromDb();
    await setCacheQuery(key, dbData, entity, {ttl:60});
    return dbData;
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
};
// Example function to fetch data from a database (you would replace this with your actual database query logic)
// async function fetchFromDb() {
//   // Simulating a database fetch (replace with actual DB query)
//   return { message: 'Data from database' };
// }

/**
 * Tracks cache keys for an entity.
 * Each GraphQL query stores its cache key under a Redis Set named after the entity (ex: trackedKeys:User).
 * @param entity - The GraphQL entity.
 * @param cacheKey - The cache key to track.
 */
const MAX_CACHE_KEYS_PER_ENTITY = 500; // Prevents Redis overflow
export const trackCacheKey = async (entity: string, cacheKey: string) => {
  try {
    const client = await getRedisClient();
    const trackingKey = `trackedKeys:${entity}`;
    await client.sAdd(trackingKey, cacheKey); // Add the cache key to the set
    console.log(
      `✅ Tracked cache key: ${cacheKey} under entity: ${trackingKey}`
    );
    // Trim the set if it exceeds the max limit
    const cacheSize = await client.sCard(trackingKey);
    if (cacheSize > MAX_CACHE_KEYS_PER_ENTITY) {
      const oldKeys = await client.sPop(
        trackingKey,
        cacheSize - MAX_CACHE_KEYS_PER_ENTITY
      );
      if (oldKeys) {
        await Promise.all(oldKeys.map((key) => client.del(key)));
      }
    }
  } catch (error) {
    console.error(`Error tracking cache key for entity "${entity}":`, error);
  }
};

/**
 * Invalidates cache entries for a specific entity after a mutation.
 * @param entity - The entity whose cache entries should be invalidated.
 */

export const invalidateCacheForMutation = async (entity: string) => {
  try {
    const client = await getRedisClient();
    const trackingKey = `trackedKeys:${entity}`;

    const cacheKeys: string[] = await client.sMembers(trackingKey);

    if (cacheKeys.length > 50) {
      // Auto-clean old entries if too many
      console.warn(`Too many cache keys for entity "${entity}". Cleaning up.`);
      const oldKeys = cacheKeys.slice(0, cacheKeys.length - 50);
      for (const key of oldKeys) {
        await client.expire(key, 5); // Allow short-lived access before expiry
      }
    }

    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((key) => client.del(key)));
      await client.del(trackingKey);
      console.log(`Invalidated cache for entity: ${entity}`);
      return cacheKeys;
    }

    return [];
  } catch (error) {
    console.error(`Error invalidating cache for entity "${entity}":`, error);
    return [];
  }
};


