/**
 * Performance Benchmark: Response Time Test
 * This file is for benchmarking purposes and is not part of the test suite.
 * Run with: npx ts-node tests/testResponseTime.ts
 */
import { getCachedQuery, setCacheQuery } from "../src/cache/cacheManager";

const testKey = "post:1";
const testEntity = "Post";

// Simulate a slow database query (e.g., 250ms delay)
const fakeDBQuery = async () => {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id: 1, title: "GraphQL Caching" }), 250)
  );
};

(async () => {
  console.log("Running Response Time Test...");

  // Measure database query time
  const dbStart = performance.now();
  const dbData = await fakeDBQuery();
  const dbEnd = performance.now();
  console.log(`Database Query Time: ${(dbEnd - dbStart).toFixed(2)}ms`);

  // Store data in cache
  await setCacheQuery(testKey, dbData, testEntity, { ttl: 60 });

  // Measure cache query time
  const cacheStart = performance.now();
  const cacheData = await getCachedQuery(testKey);
  const cacheEnd = performance.now();
  console.log(`Cache Query Time: ${(cacheEnd - cacheStart).toFixed(2)}ms`);

  // Calculate improvement percentage
  const improvement =
    ((dbEnd - dbStart - (cacheEnd - cacheStart)) / (dbEnd - dbStart)) * 100;
  console.log(`Performance Improvement: ${improvement.toFixed(2)}%`);
})();
