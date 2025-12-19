import {
  setCacheQuery,
  getCachedQuery,
  invalidateCache,
  trackCacheDependency,
  invalidateCacheForMutation,
  getData,
} from "../src/cache/cacheManager";
import { getRedisClient } from "../src/cache/redisClient";

// Create a mutable object for entityRelationships that can be modified in tests
// This must be declared before the mock so it's in scope
const mockEntityRelationships: Record<string, string[]> = {};

// ----------------- Unit Tests with Mocking -----------------
// Mock config FIRST before any other imports that use it
jest.mock("../src/cache/config", () => ({
  getNamespace: jest.fn(() => "cacheiql"),
  getConfig: jest.fn(() => ({
    namespace: "cacheiql",
    defaultTTL: 60,
    redisUrl: "redis://localhost:6379",
  })),
  setConfig: jest.fn(),
}));

jest.mock("../src/cache/redisClient", () => {
  const originalModule = jest.requireActual("../src/cache/redisClient");
  return {
    ...originalModule,
    getRedisClient: jest.fn(),
  };
});

// Mock introspection module - create a mutable object for entityRelationships
jest.mock("../src/schema/introspection", () => ({
  ...jest.requireActual("../src/schema/introspection"),
  get entityRelationships() {
    return mockEntityRelationships;
  },
  extractEntityRelationships: jest.fn(),
  getSchemaIntrospection: jest.fn(),
}));

describe("Cache Manager Unit Tests with Mocking", () => {
  it("setCacheQuery should cache data with the specified key", async () => {
    const mockClient = {
      set: jest.fn().mockResolvedValue("OK"),
      expire: jest.fn().mockResolvedValue(1),
      sAdd: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);

    await setCacheQuery("testKey", { value: 42 }, "TestEntity");
    expect(mockClient.set).toHaveBeenCalledWith(
      "cacheiql:testKey",
      JSON.stringify({ value: 42 })
    );
    expect(mockClient.expire).toHaveBeenCalledWith("cacheiql:testKey", 60);
  });

  it("getCachedQuery should return cached data if it exists", async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ value: 42 })),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);

    const result = await getCachedQuery("testKey");
    expect(mockClient.get).toHaveBeenCalledWith("cacheiql:testKey");
    expect(result).toEqual({ value: 42 });
  });

  it("getCachedQuery should return null if data is not cached", async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(null),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);

    const result = await getCachedQuery("nonExistingKey");
    expect(mockClient.get).toHaveBeenCalledWith("cacheiql:nonExistingKey");
    expect(result).toBeNull();
  });

  it("invalidateCache should delete cached data for the specified key", async () => {
    const mockClient = {
      del: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);

    await invalidateCache("testKey");
    expect(mockClient.del).toHaveBeenCalledWith("cacheiql:testKey");
  });

  it("setCacheQuery should throw error for invalid key", async () => {
    await expect(
      setCacheQuery("", { value: 42 }, "TestEntity")
    ).rejects.toThrow("Cache key must be a non-empty string");
    await expect(
      setCacheQuery(null as any, { value: 42 }, "TestEntity")
    ).rejects.toThrow("Cache key must be a non-empty string");
  });

  it("setCacheQuery should throw error for invalid entity", async () => {
    await expect(setCacheQuery("testKey", { value: 42 }, "")).rejects.toThrow(
      "Entity must be a non-empty string"
    );
    await expect(
      setCacheQuery("testKey", { value: 42 }, null as any)
    ).rejects.toThrow("Entity must be a non-empty string");
  });

  it("setCacheQuery should throw error for invalid TTL", async () => {
    await expect(
      setCacheQuery("testKey", { value: 42 }, "TestEntity", { ttl: -1 })
    ).rejects.toThrow("TTL must be a non-negative integer");
    await expect(
      setCacheQuery("testKey", { value: 42 }, "TestEntity", { ttl: 1.5 })
    ).rejects.toThrow("TTL must be a non-negative integer");
    await expect(
      setCacheQuery("testKey", { value: 42 }, "TestEntity", {
        ttl: "60" as any,
      })
    ).rejects.toThrow("TTL must be a non-negative integer");
  });

  it("getCachedQuery should return null for invalid key", async () => {
    const result1 = await getCachedQuery("");
    const result2 = await getCachedQuery(null as any);
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it("invalidateCache should throw error for invalid key", async () => {
    await expect(invalidateCache("")).rejects.toThrow(
      "Cache key must be a non-empty string"
    );
    await expect(invalidateCache(null as any)).rejects.toThrow(
      "Cache key must be a non-empty string"
    );
  });

  it("trackCacheDependency should track cache keys for entities", async () => {
    const mockClient = {
      sAdd: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    // Clear the mock relationships
    Object.keys(mockEntityRelationships).forEach(
      (key) => delete mockEntityRelationships[key]
    );

    await trackCacheDependency("cacheiql:testKey", "TestEntity");
    expect(mockClient.sAdd).toHaveBeenCalledWith(
      "cacheiql:dependencyKeys:TestEntity",
      "cacheiql:testKey"
    );
  });

  it("trackCacheDependency should track related entities", async () => {
    const mockClient = {
      sAdd: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    // Set up mock relationships
    Object.keys(mockEntityRelationships).forEach(
      (key) => delete mockEntityRelationships[key]
    );
    mockEntityRelationships["TestEntity"] = ["RelatedEntity"];

    await trackCacheDependency("cacheiql:testKey", "TestEntity");
    expect(mockClient.sAdd).toHaveBeenCalledTimes(2);
    expect(mockClient.sAdd).toHaveBeenCalledWith(
      "cacheiql:dependencyKeys:TestEntity",
      "cacheiql:testKey"
    );
    expect(mockClient.sAdd).toHaveBeenCalledWith(
      "cacheiql:dependencyKeys:RelatedEntity",
      "cacheiql:testKey"
    );
  });

  it("trackCacheDependency should handle invalid parameters gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    await trackCacheDependency("", "TestEntity");
    await trackCacheDependency("cacheiql:testKey", "");
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });

  it("invalidateCacheForMutation should invalidate cache for entity", async () => {
    const mockClient = {
      sMembers: jest.fn().mockResolvedValue(["cacheiql:key1", "cacheiql:key2"]),
      multi: jest.fn(() => ({
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 1],
        ]),
      })),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    // Clear the mock relationships
    Object.keys(mockEntityRelationships).forEach(
      (key) => delete mockEntityRelationships[key]
    );

    await invalidateCacheForMutation("TestEntity");
    expect(mockClient.sMembers).toHaveBeenCalledWith(
      "cacheiql:dependencyKeys:TestEntity"
    );
    expect(mockClient.multi).toHaveBeenCalled();
  });

  it("invalidateCacheForMutation should invalidate cache for related entities", async () => {
    const mockClient = {
      sMembers: jest
        .fn()
        .mockResolvedValueOnce(["cacheiql:key1"])
        .mockResolvedValueOnce(["cacheiql:key2"]),
      multi: jest.fn(() => ({
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 1],
        ]),
      })),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    // Set up mock relationships
    Object.keys(mockEntityRelationships).forEach(
      (key) => delete mockEntityRelationships[key]
    );
    mockEntityRelationships["TestEntity"] = ["RelatedEntity"];

    await invalidateCacheForMutation("TestEntity");
    expect(mockClient.sMembers).toHaveBeenCalledTimes(2);
    expect(mockClient.multi).toHaveBeenCalled();
  });

  it("invalidateCacheForMutation should handle invalid entity gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    await invalidateCacheForMutation("");
    await invalidateCacheForMutation(null as any);
    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });

  it("getData should return cached data if available", async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ cached: true })),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    const fetchFromDb = jest.fn();

    const result = await getData("testKey", "TestEntity", fetchFromDb);
    expect(result).toEqual({ cached: true });
    expect(fetchFromDb).not.toHaveBeenCalled();
  });

  it("getData should fetch from DB and cache if not in cache", async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue("OK"),
      expire: jest.fn().mockResolvedValue(1),
      sAdd: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    const fetchFromDb = jest.fn().mockResolvedValue({ fromDb: true });

    const result = await getData("testKey", "TestEntity", fetchFromDb);
    expect(result).toEqual({ fromDb: true });
    expect(fetchFromDb).toHaveBeenCalled();
    expect(mockClient.set).toHaveBeenCalled();
  });

  it("getData should throw error if fetchFromDb fails", async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(null),
    };
    (getRedisClient as jest.Mock).mockResolvedValue(mockClient);
    const fetchFromDb = jest.fn().mockRejectedValue(new Error("DB Error"));

    await expect(getData("testKey", "TestEntity", fetchFromDb)).rejects.toThrow(
      "DB Error"
    );
  });
});
