import { createClient, RedisClientType } from 'redis';
let client: RedisClientType | undefined

/**
 * Connects to the Redis server
 * @param url - The Redis server URL (default: redis://localhost:6379)
 */
export const connectRedis = async (
  url: string = process.env.REDIS_URL || 'redis://localhost:6379'
): Promise<void> => {
  if (client && client.isOpen) return; 
  try {
    client = createClient({ url });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      client = undefined; 
      setTimeout(() => connectRedis(url), 5000); 
    });
    client.on("ready", () => {
      console.log("Redis is ready and connected.");
    });
    await client.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    client = undefined
  }
};

/**
 * Returns the Redis client instance
 * @throws Error if the client is not connected
 */
export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!client || !client.isOpen) {
    console.warn("Redis client not connected. Attempting to reconnect...");
    await connectRedis(); // Ensure connection is complete before returning
  }
  if (!client) throw new Error("Redis client is not available.");
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

