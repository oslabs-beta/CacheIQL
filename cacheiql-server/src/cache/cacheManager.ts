import { getRedisClient, connectRedis } from './redisClient';
import { entityRelationships } from "../schema/introspection";


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
    const namespacedKey = `myApp:${key}`;
    if (data !== undefined) {
      await client.set(namespacedKey, JSON.stringify(data));
      await client.expire(namespacedKey, options.ttl ?? 60);
      await trackCacheDependency(namespacedKey, entity);
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
    if (cachedData) {
      cacheHits++;
      try {
        return JSON.parse(cachedData);
      } catch (error) {
        console.error(`Error parsing cached data for key "${key}":`, error);
        return null; 
      }
    }
    cacheMisses++;
    return null;
  } catch (error) {
    console.error(`Error retrieving cache for key "${key}":`, error);
    return null; 
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


/**
 * Tracks cache dependencies per entity.
 * This ensures that when an entity changes, only affected fields are invalidated.
 *  Now also tracks relationships based on introspection.
 * @param cacheKey - The cache key to track.
 * @param entity - The entity name.
 */

export const trackCacheDependency = async (
  cacheKey: string,
  entity: string
) => {
  try {
    const client = await getRedisClient();
    const trackingKey = `dependencyKeys:${entity}`;
    await client.sAdd(trackingKey, cacheKey);
    const relatedEntities = entityRelationships[entity] || [];
    for (const relatedEntity of relatedEntities) {
      const relatedTrackingKey = `dependencyKeys:${relatedEntity}`;
      await client.sAdd(relatedTrackingKey, cacheKey);
      await client.sAdd(trackingKey, `dependencyKeys:${relatedEntity}`);
    }
  } catch (error) {
    console.error(
      `Error tracking cache dependency for entity "${entity}":`,
      error
    );
  }
};


/**
 * Invalidates cache entries for a specific entity after a mutation.
 * @param entity - The entity whose cache entries should be invalidated.
 */

export const invalidateCacheForMutation = async (entity: string) => {
  try {
    const client = await getRedisClient();
    const trackingKey = `dependencyKeys:${entity}`;
    let cacheKeys: string[] = await client.sMembers(trackingKey);
    const relatedEntities = entityRelationships[entity] || [];
    for (const relatedEntity of relatedEntities) {
      const relatedTrackingKey = `dependencyKeys:${relatedEntity}`;
      const relatedKeys: string[] = await client.sMembers(relatedTrackingKey);
      cacheKeys.push(...relatedKeys);
    }
    if (cacheKeys.length > 0) {
      await Promise.all(cacheKeys.map((key) => client.del(key)));
      console.log(
        `Invalidated ${cacheKeys.length} cache keys for ${entity} and related entities.`
      );
    } else {
      console.log(`No cache keys found for entity: ${entity}`);
    }
    await client.del(trackingKey); 
    for (const relatedEntity of relatedEntities) {
      const relatedTrackingKey = `dependencyKeys:${relatedEntity}`;
      await client.del(relatedTrackingKey);
    }
    console.log(
      `Dependency tracking removed for ${entity} and related entities.`
    );
  } catch (error) {
    console.error(`Error invalidating cache for entity "${entity}":`, error);
  }
};



