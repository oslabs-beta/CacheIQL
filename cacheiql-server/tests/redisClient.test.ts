
import {
  connectRedis,
  getRedisClient,
  closeRedisConnection,
} from "../src/redisClient";

describe("Redis Client", () => {
  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  it("should connect to Redis and return a client instance", () => {
    const client = getRedisClient();
    expect(client).toBeDefined();
  });

  it("should throw an error if Redis client is not connected", async () => {
    await closeRedisConnection(); // Close the connection
    expect(() => getRedisClient()).toThrowError(
      "Redis client is not connected"
    );

    // Reconnect for subsequent tests
    await connectRedis();
  });
});
