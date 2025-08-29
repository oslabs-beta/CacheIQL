import {
  getCachedQuery,
  setCacheQuery,
  cacheHits,
  cacheMisses,
} from "../src/cache/cacheManager";

// Sample query keys and data
const sampleQueries = [
  { key: "user:1", data: { id: 1, name: "John Doe" } },
  { key: "user:2", data: { id: 2, name: "Jane Doe" } },
  { key: "post:1", data: { id: 1, title: "GraphQL Caching" } },
];

(async () => {
  console.log("Starting Cache Hit Rate Test...");

  // Populate cache with sample queries
  for (const query of sampleQueries) {
    await setCacheQuery(query.key, query.data, "User", { ttl: 60 });
  }

  // Retrieve cached queries multiple times
  for (let i = 0; i < 10; i++) {
    for (const query of sampleQueries) {
      await getCachedQuery(query.key);
    }
  }

  console.log(`Cache Hits: ${cacheHits}, Cache Misses: ${cacheMisses}`);

  const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;
  console.log(`Estimated Cache Hit Rate: ${hitRate.toFixed(2)}%`);
})();
