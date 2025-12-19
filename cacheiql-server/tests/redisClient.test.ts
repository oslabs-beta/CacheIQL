import {
  connectRedis,
  getRedisClient,
  closeRedisConnection,
} from "../src/cache/redisClient";

describe("Redis Client", () => {
  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  it("should connect to Redis and return a client instance", async () => {
    const client = await getRedisClient();
    expect(client).toBeDefined();
  });

  it("should reconnect if Redis client is not connected", async () => {
    await closeRedisConnection(); // Close the connection
    // getRedisClient should automatically reconnect
    const client = await getRedisClient();
    expect(client).toBeDefined();
    expect(client.isOpen).toBe(true);
  });
});
