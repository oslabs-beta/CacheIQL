"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cacheManager_1 = require("../src/cacheManager");
const redisClient_1 = require("../src/redisClient");
// ----------------- Integration Tests -----------------
describe('Cache Manager Integration Tests', () => {
    const key = 'test:key';
    const value = { message: 'Hello, CacheIQL!' };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, redisClient_1.connectRedis)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, redisClient_1.closeRedisConnection)();
    }));
    it('should cache a query result', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, cacheManager_1.setCacheQuery)(key, value);
        const cachedData = yield (0, cacheManager_1.getCachedQuery)(key);
        expect(cachedData).toEqual(value);
    }));
    it('should return null for a non-existing cache key', () => __awaiter(void 0, void 0, void 0, function* () {
        const cachedData = yield (0, cacheManager_1.getCachedQuery)('non-existing:key');
        expect(cachedData).toBeNull();
    }));
    it('should invalidate a cached query', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, cacheManager_1.invalidateCache)(key);
        const cachedData = yield (0, cacheManager_1.getCachedQuery)(key);
        expect(cachedData).toBeNull();
    }));
});
// ----------------- Unit Tests with Mocking -----------------
jest.mock('../src/redisClient', () => {
    const originalModule = jest.requireActual('../src/redisClient');
    return Object.assign(Object.assign({}, originalModule), { getRedisClient: jest.fn() });
});
describe('Cache Manager Unit Tests with Mocking', () => {
    it('cacheQuery should cache data with the specified key', () => __awaiter(void 0, void 0, void 0, function* () {
        //ensures that when mockClient.set is called, it behaves like an async function (Promise) that resolves with 'OK'.
        const mockClient = {
            set: jest.fn().mockResolvedValue('OK'),
        };
        //Ensures cacheQuery interacts with the mocked Redis client instead of a real one.
        redisClient_1.getRedisClient.mockReturnValue(mockClient);
        yield (0, cacheManager_1.setCacheQuery)('testKey', { value: 42 });
        expect(mockClient.set).toHaveBeenCalledWith('myApp:testKey', JSON.stringify({ value: 42 }), { EX: 3600 });
    }));
    it('getCachedQuery should return cached data if it exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockClient = {
            get: jest.fn().mockResolvedValue(JSON.stringify({ value: 42 })),
        };
        redisClient_1.getRedisClient.mockReturnValue(mockClient);
        const result = yield (0, cacheManager_1.getCachedQuery)('testKey');
        expect(mockClient.get).toHaveBeenCalledWith('testKey');
        expect(result).toEqual({ value: 42 });
    }));
    it('getCachedQuery should return null if data is not cached', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockClient = {
            get: jest.fn().mockResolvedValue(null),
        };
        redisClient_1.getRedisClient.mockReturnValue(mockClient);
        const result = yield (0, cacheManager_1.getCachedQuery)('nonExistingKey');
        expect(mockClient.get).toHaveBeenCalledWith('nonExistingKey');
        expect(result).toBeNull();
    }));
    it('invalidateCache should delete cached data for the specified key', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockClient = {
            del: jest.fn().mockResolvedValue(1),
        };
        redisClient_1.getRedisClient.mockReturnValue(mockClient);
        yield (0, cacheManager_1.invalidateCache)('testKey');
        expect(mockClient.del).toHaveBeenCalledWith('testKey');
    }));
});
