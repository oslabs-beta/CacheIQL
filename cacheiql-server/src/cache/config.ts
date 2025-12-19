/**
 * Configuration options for CacheIQL
 */
export interface CacheIQLConfig {
  /**
   * Redis namespace prefix for cache keys
   * @default 'cacheiql'
   */
  namespace?: string;

  /**
   * Default TTL in seconds for cached entries
   * @default 60
   */
  defaultTTL?: number;

  /**
   * Redis connection URL
   * @default 'redis://localhost:6379'
   */
  redisUrl?: string;
}

let config: Required<CacheIQLConfig> = {
  namespace: process.env.CACHEIQL_NAMESPACE || "cacheiql",
  defaultTTL: parseInt(process.env.CACHEIQL_DEFAULT_TTL || "60", 10),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

/**
 * Sets the global configuration for CacheIQL
 * @param newConfig - Partial configuration to merge with existing config
 */
export const setConfig = (newConfig: Partial<CacheIQLConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Gets the current configuration
 * @returns The current configuration object
 */
export const getConfig = (): Required<CacheIQLConfig> => {
  return { ...config };
};

/**
 * Gets the namespace prefix for cache keys
 * @returns The namespace string
 */
export const getNamespace = (): string => {
  return config.namespace;
};
