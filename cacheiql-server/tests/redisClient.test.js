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
const redisClient_1 = require("../src/redisClient");
describe("Redis Client", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, redisClient_1.connectRedis)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, redisClient_1.closeRedisConnection)();
    }));
    it("should connect to Redis and return a client instance", () => {
        const client = (0, redisClient_1.getRedisClient)();
        expect(client).toBeDefined();
    });
    it("should throw an error if Redis client is not connected", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, redisClient_1.closeRedisConnection)(); // Close the connection
        expect(() => (0, redisClient_1.getRedisClient)()).toThrowError("Redis client is not connected");
        // Reconnect for subsequent tests
        yield (0, redisClient_1.connectRedis)();
    }));
});
