// redisClient.ts
import { createClient, RedisClientType } from 'redis';

// The type ensures that TypeScript will enforce the correct methods and properties on this object (e.g., .set, .get, .del).
let client: RedisClientType;

/**
 * Connects to the Redis server
 * @param url - The Redis server URL (default: redis://localhost:6379)
 */
export const connectRedis = async (
  url: string = process.env.REDIS_URL || 'redis://localhost:6379'
): Promise<void> => {
  try {
    client = createClient({ url });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      setTimeout(() => connectRedis(url), 5000); // Retry after 5 seconds
    });

    client.on('ready', () => {
      console.log('Redis is ready and connected.');
    });
    
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw new Error('Could not establish a Redis connection.');
  }
};

/**
 * Returns the Redis client instance
 * @throws Error if the client is not connected
 */
//Makes sure that we use the set get del methods, basically a type that is from the typescript library just like string | num | boolean
//RedisClientType ensures type safety. If you attempt to call a method that doesn’t exist on the client or pass incorrect arguments, TypeScript will catch that during development.
export const getRedisClient = (): RedisClientType => {
  if (!client || !client.isOpen) {
    console.warn('Redis client not connected. Attempting to reconnect...');
    connectRedis();
  }
  return client;
};

/**
 * Disconnects the Redis client
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (client && client.isOpen) {
    await client.disconnect();
    console.log('Redis connection closed');
  }
};

