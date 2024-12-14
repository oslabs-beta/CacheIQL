import {
  setCacheQuery,
  getCachedQuery,
  invalidateCache,
} from '../src/cacheManager';
import {
  connectRedis,
  closeRedisConnection,
  getRedisClient,
} from '../src/redisClient';

// ----------------- Integration Tests -----------------
describe('Cache Manager Integration Tests', () => {
  const key = 'test:key';
  const value = { message: 'Hello, CacheIQL!' };

  beforeAll(async () => {
    await connectRedis();
  });

  afterAll(async () => {
    await closeRedisConnection();
  });

  it('should cache a query result', async () => {
    await setCacheQuery(key, value);
    const cachedData = await getCachedQuery(key);
    expect(cachedData).toEqual(value);
  });

  it('should return null for a non-existing cache key', async () => {
    const cachedData = await getCachedQuery('non-existing:key');
    expect(cachedData).toBeNull();
  });

  it('should invalidate a cached query', async () => {
    await invalidateCache(key);
    const cachedData = await getCachedQuery(key);
    expect(cachedData).toBeNull();
  });
});

// ----------------- Unit Tests with Mocking -----------------
jest.mock('../src/redisClient', () => {
  const originalModule = jest.requireActual('../src/redisClient');
  return {
    ...originalModule, // Keeps `connectRedis` and `closeRedisConnection` unchanged
    getRedisClient: jest.fn(), // Mock specific methods
  };
});

describe('Cache Manager Unit Tests with Mocking', () => {
  it('cacheQuery should cache data with the specified key', async () => {
    //ensures that when mockClient.set is called, it behaves like an async function (Promise) that resolves with 'OK'.
    const mockClient = {
      set: jest.fn().mockResolvedValue('OK'),
    };
    //Ensures cacheQuery interacts with the mocked Redis client instead of a real one.
    (getRedisClient as jest.Mock).mockReturnValue(mockClient);

    await setCacheQuery('testKey', { value: 42 });
    expect(mockClient.set).toHaveBeenCalledWith(
      'myApp:testKey',
      JSON.stringify({ value: 42 }),
      { EX: 3600 }
    );
  });

  it('getCachedQuery should return cached data if it exists', async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ value: 42 })),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockClient);

    const result = await getCachedQuery('testKey');
    expect(mockClient.get).toHaveBeenCalledWith('testKey');
    expect(result).toEqual({ value: 42 });
  });

  it('getCachedQuery should return null if data is not cached', async () => {
    const mockClient = {
      get: jest.fn().mockResolvedValue(null),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockClient);

    const result = await getCachedQuery('nonExistingKey');
    expect(mockClient.get).toHaveBeenCalledWith('nonExistingKey');
    expect(result).toBeNull();
  });

  it('invalidateCache should delete cached data for the specified key', async () => {
    const mockClient = {
      del: jest.fn().mockResolvedValue(1),
    };
    (getRedisClient as jest.Mock).mockReturnValue(mockClient);

    await invalidateCache('testKey');
    expect(mockClient.del).toHaveBeenCalledWith('testKey');
  });
});
