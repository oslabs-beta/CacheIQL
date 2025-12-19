/**
 * CacheIQL Server - Main Entry Point
 *
 * A server-side caching solution for GraphQL applications.
 */

// Export middleware
export { cacheMiddleware } from "./middleware/cacheMiddleware";

// Export cache management functions
export {
  setCacheQuery,
  getCachedQuery,
  invalidateCache,
  invalidateCacheForMutation,
  getData,
  trackCacheDependency,
  cacheHits,
  cacheMisses,
} from "./cache/cacheManager";

// Export Redis client functions
export {
  connectRedis,
  getRedisClient,
  closeRedisConnection,
} from "./cache/redisClient";

// Export configuration
export {
  setConfig,
  getConfig,
  getNamespace,
  type CacheIQLConfig,
} from "./cache/config";

// Export query utilities
export { parseQueryFields } from "./query/queryParser";
export { mergeCachedAndNewData } from "./query/mergeUtils";

// Export schema utilities
export {
  extractEntityRelationships,
  getSchemaIntrospection,
  entityRelationships,
} from "./schema/introspection";
