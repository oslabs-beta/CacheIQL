/**
 * Performance Benchmark: Database Load Reduction Test
 * This file is for benchmarking purposes and is not part of the test suite.
 * Run with: npx ts-node tests/testDBLoadReduction.ts
 */
import { getCachedQuery, setCacheQuery } from "../src/cache/cacheManager";

// Simulated database call counter
let dbQueryCount = 0;

// Simulate a slow database query (e.g., 250ms delay)
const fakeDBQuery = async () => {
  dbQueryCount++; // Track actual database calls
  return new Promise((resolve) =>
    setTimeout(() => resolve({ id: 1, title: "GraphQL Caching" }), 250)
  );
};

(async () => {
  console.log("Running Database Load Reduction Test...");

  const testKey = "post:1";
  const testEntity = "Post";

  // Populate cache with the result of a DB query
  await setCacheQuery(testKey, await fakeDBQuery(), testEntity, { ttl: 60 });

  // Perform 100 queries
  let cacheServed = 0;
  for (let i = 0; i < 100; i++) {
    const cachedData = await getCachedQuery(testKey);
    if (cachedData) {
      cacheServed++;
    } else {
      await setCacheQuery(testKey, await fakeDBQuery(), testEntity, {
        ttl: 60,
      });
    }
  }

  console.log(`Database Queries Executed: ${dbQueryCount}`);
  console.log(`Queries Served from Cache: ${cacheServed}`);
  console.log(
    `Cache Effectiveness: ${((cacheServed / 100) * 100).toFixed(2)}%`
  );
})();
