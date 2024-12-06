import {
  cacheQuery,
  getCachedQuery,
  invalidateCache,
} from "../src/cacheManager";
import { connectRedis, closeRedisConnection } from "../src/redisClient";

describe("Cache Manager", () => {
  const key = "test:key";
  const value = { message: "Hello, CacheIQL!" };

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  it("should cache a query result", async () => {
    await cacheQuery(key, value);
    const cachedData = await getCachedQuery(key);
    expect(cachedData).toEqual(value);
  });

  it("should return null for a non-existing cache key", async () => {
    const cachedData = await getCachedQuery("non-existing:key");
    expect(cachedData).toBeNull();
  });

  it("should invalidate a cached query", async () => {
    await invalidateCache(key);
    const cachedData = await getCachedQuery(key);
    expect(cachedData).toBeNull();
  });
});
