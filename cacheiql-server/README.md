# CacheIQL Server

CacheIQL is a server-side caching solution for GraphQL applications designed to enhance performance by reducing redundant query executions. It integrates seamlessly into your GraphQL server, leveraging Redis to cache responses and intelligently manage cache invalidation.

## Features

- **Server-Side Caching**: Cache GraphQL query results in Redis to reduce database load
- **Intelligent Cache Invalidation**: Automatically invalidate cache entries for mutations and related entities
- **Middleware Integration**: Easy-to-use middleware for GraphQL resolvers
- **Customizable TTL**: Configure time-to-live (TTL) for cached entries
- **Relationship-Aware**: Tracks entity relationships for smart cache invalidation
- **Configurable**: Customize namespace, TTL, and Redis connection via environment variables or API

## Installation

```bash
npm install cacheiql-server
```

## Prerequisites

- Node.js 14+
- Redis server running (default: `redis://localhost:6379`)
- GraphQL server (Apollo, Express GraphQL, etc.)

## Quick Start

### Basic Usage

```typescript
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { cacheMiddleware } from "cacheiql-server";
import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Query {
    user(id: ID!): User
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
  }
`);

const rootValue = {
  user: async (args: any) => {
    // Your resolver logic
    return { id: args.id, name: "John Doe", email: "john@example.com" };
  },
};

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: cacheMiddleware(rootValue, 60, schema), // TTL: 60 seconds
    graphiql: true,
  })
);

app.listen(3000);
```

### Configuration

CacheIQL can be configured via environment variables or programmatically:

#### Environment Variables

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379

# Cache namespace (default: 'cacheiql')
CACHEIQL_NAMESPACE=myapp

# Default TTL in seconds (default: 60)
CACHEIQL_DEFAULT_TTL=120
```

#### Programmatic Configuration

```typescript
import { setConfig, connectRedis } from "cacheiql-server";

// Configure before connecting to Redis
setConfig({
  namespace: "myapp",
  defaultTTL: 120,
  redisUrl: "redis://localhost:6379",
});

// Connect to Redis
await connectRedis();
```

## API Reference

### `cacheMiddleware(rootValue, ttl?, schema?)`

Wraps GraphQL resolvers with caching logic.

**Parameters:**

- `rootValue`: Object containing your GraphQL resolvers
- `ttl`: Time-to-live in seconds (default: 60)
- `schema`: GraphQL schema for relationship introspection (optional but recommended)

**Returns:** Wrapped resolvers with caching enabled

**Example:**

```typescript
const wrappedResolvers = cacheMiddleware(rootValue, 60, schema);
```

### `setCacheQuery(key, data, entity, options?)`

Manually cache a query result.

**Parameters:**

- `key`: Cache key (string)
- `data`: Data to cache (any)
- `entity`: Entity name for dependency tracking (string)
- `options`: Optional cache options
  - `ttl`: Time-to-live in seconds (default: 60)

**Example:**

```typescript
import { setCacheQuery } from "cacheiql-server";

await setCacheQuery("user:123", userData, "User", { ttl: 300 });
```

### `getCachedQuery(key)`

Retrieve cached data.

**Parameters:**

- `key`: Cache key (string)

**Returns:** Cached data or `null` if not found

**Example:**

```typescript
import { getCachedQuery } from "cacheiql-server";

const cached = await getCachedQuery("user:123");
```

### `invalidateCache(key)`

Invalidate a specific cache key.

**Parameters:**

- `key`: Cache key to invalidate (string)

**Example:**

```typescript
import { invalidateCache } from "cacheiql-server";

await invalidateCache("user:123");
```

### `invalidateCacheForMutation(entity)`

Invalidate all cache entries for an entity and related entities.

**Parameters:**

- `entity`: Entity name (string)

**Example:**

```typescript
import { invalidateCacheForMutation } from "cacheiql-server";

// After a mutation that updates a User
await invalidateCacheForMutation("User");
```

### `getData(key, entity, fetchFromDb)`

Get data from cache or fetch from database if not cached.

**Parameters:**

- `key`: Cache key (string)
- `entity`: Entity name (string)
- `fetchFromDb`: Function that returns a Promise with the data

**Returns:** Cached data or data from database

**Example:**

```typescript
import { getData } from "cacheiql-server";

const user = await getData("user:123", "User", async () => {
  return await db.getUser(123);
});
```

### `setConfig(config)`

Configure CacheIQL settings.

**Parameters:**

- `config`: Partial configuration object
  - `namespace?: string` - Cache key namespace
  - `defaultTTL?: number` - Default TTL in seconds
  - `redisUrl?: string` - Redis connection URL

**Example:**

```typescript
import { setConfig } from "cacheiql-server";

setConfig({
  namespace: "myapp",
  defaultTTL: 120,
  redisUrl: "redis://localhost:6379",
});
```

### `connectRedis(url?)`

Connect to Redis server.

**Parameters:**

- `url`: Optional Redis URL (uses config if not provided)

**Example:**

```typescript
import { connectRedis } from "cacheiql-server";

await connectRedis();
```

### Cache Statistics

```typescript
import { cacheHits, cacheMisses } from "cacheiql-server";

console.log(`Cache hits: ${cacheHits}`);
console.log(`Cache misses: ${cacheMisses}`);
```

## How It Works

### Query Caching

1. When a GraphQL query is executed, CacheIQL generates a unique cache key based on:

   - Entity type
   - Field name
   - Arguments
   - Requested fields

2. The cache key is checked in Redis
3. If found, cached data is returned immediately
4. If not found, the resolver executes and the result is cached

### Mutation Invalidation

1. When a mutation is executed, CacheIQL identifies the affected entity
2. All cache entries for that entity are invalidated
3. Related entities (discovered via schema introspection) are also invalidated
4. This ensures data consistency across your application

### Relationship Tracking

CacheIQL uses GraphQL schema introspection to discover entity relationships. When an entity is updated, related entities' caches are automatically invalidated.

## Advanced Usage

### Custom Cache Key Generation

The middleware automatically generates cache keys, but you can also use the utility functions:

```typescript
import { hashKey, parseQueryFields } from "cacheiql-server";
import { GraphQLResolveInfo } from "graphql";

// Parse query fields
const fields = parseQueryFields(info);

// Generate hash key
const key = hashKey(`${entity}:${fieldName}:${JSON.stringify(args)}`);
```

### Manual Cache Management

```typescript
import {
  setCacheQuery,
  getCachedQuery,
  invalidateCache,
  trackCacheDependency,
} from "cacheiql-server";

// Cache data manually
await setCacheQuery("custom:key", data, "Entity", { ttl: 300 });

// Track dependencies
await trackCacheDependency("cacheiql:custom:key", "Entity");

// Invalidate manually
await invalidateCache("custom:key");
```

## Error Handling

CacheIQL handles errors gracefully:

- Cache misses return `null` (not an error)
- Redis connection errors are logged and operations fail gracefully
- Invalid inputs throw descriptive errors
- Mutations complete even if cache invalidation fails (errors are logged)

## Testing

```bash
npm test
```

The test suite includes:

- Integration tests with a real Redis instance
- Unit tests with mocked Redis client
- Error handling tests
- Input validation tests

## Troubleshooting

### Redis Connection Issues

If you see connection errors, ensure:

1. Redis server is running
2. `REDIS_URL` environment variable is set correctly
3. Network connectivity to Redis server

### Cache Not Working

1. Check that `cacheMiddleware` is wrapping your resolvers
2. Verify Redis connection is established
3. Check cache keys in Redis: `redis-cli KEYS cacheiql:*`
4. Review logs for error messages

### High Memory Usage

1. Reduce TTL values for less frequently accessed data
2. Use more specific cache keys to avoid caching large datasets
3. Monitor Redis memory usage: `redis-cli INFO memory`

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors

Vasean Annin, George German, Gabriella Davoudpour, Pedram Kashani, Chris Matzen
