// redisClient.ts
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

/**
 * Connects to the Redis server
 * @param url - The Redis server URL (default: redis://localhost:6379)
 */
export const connectRedis = async (
  url: string = "redis://localhost:6379"
): Promise<void> => {
  client = createClient({ url });

  client.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  await client.connect();
  console.log("Connected to Redis");
};

/**
 * Returns the Redis client instance
 * @throws Error if the client is not connected
 */
export const getRedisClient = (): RedisClientType => {
  if (!client || !client.isOpen) {
    throw new Error("Redis client is not connected");
  }
  return client;
};


/**
 * Disconnects the Redis client
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (client && client.isOpen) {
    await client.disconnect();
    console.log("Redis connection closed");
  }
};

