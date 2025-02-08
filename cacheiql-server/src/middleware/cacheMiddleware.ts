
import {
  setCacheQuery,
  getCachedQuery,
  trackCacheDependency,
  invalidateCacheForMutation,
} from "../cache/cacheManager";
import {
  extractEntityRelationships,
  entityRelationships,
} from "../schema/introspection"; // Import entity extraction
import { GraphQLResolveInfo, GraphQLSchema } from "graphql";
import { hashKey } from "../cache/cacheUtils";

// Global variable to track whether introspection has been initialized
let introspectionInitialized = false;

// Middleware that automatically extracts entity relationships if not already initialized
export const cacheMiddleware = (
  rootValue: { [key: string]: Function },
  ttl: number = 60,
  schema?: GraphQLSchema
) => {
  if (!introspectionInitialized && schema) {
    console.log(
      "Running GraphQL Introspection to extract entity relationships..."
    );
    extractEntityRelationships(schema);
    introspectionInitialized = true;
  }

  const wrappedResolvers: { [key: string]: Function } = {};

  Object.keys(rootValue).forEach((key) => {
    const resolve = rootValue[key];

    wrappedResolvers[key] = async (
      parent: any,
      args: any,
      info?: GraphQLResolveInfo,
      context?: any
    ): Promise<any> => {
      if (!info) {
        console.error(
          "Missing GraphQLResolveInfo in cacheMiddleware. Skipping caching."
        );
        return await resolve(parent, args, info, context);
      }

      console.log(
        `cacheMiddleware triggered for: ${info.fieldName} (Type: ${info.operation?.operation})`
      );

  
    
      const entityType = info.returnType.toString().replace(/[[\]!]/g, ""); // Extract correct entity name
      const entity = entityType.charAt(0).toUpperCase() + entityType.slice(1); // Capitalize first letter

      const sortedArgs = JSON.stringify(args, Object.keys(args).sort()); // Ensure consistent key order
      const rawKey = `${entity}:${info.fieldName}:${sortedArgs}`;
      const cacheKey = hashKey(rawKey);

      // Handle Queries (Caching)
      if (info.operation?.operation === "query") {
        try {
          // Try to get cached data
          const cachedData = await getCachedQuery(cacheKey);
          if (cachedData) {
            console.log(`Cache HIT for ${cacheKey}`);
            return cachedData;
          }
          console.log(`Cache MISS for ${cacheKey}`);

          // Execute resolver and cache the result
          const result = await resolve(parent, args, context, info);
          await setCacheQuery(cacheKey, result, entity, { ttl });

          // Track dependencies for cache invalidation
          console.log(
            `Tracking dependency for ${entity}:`,
            entityRelationships[entity] || []
          );
          await trackCacheDependency(cacheKey, entity);

          return result;
        } catch (error) {
          console.error(`Error processing query ${info.fieldName}:`, error);
          throw new Error(
            `Failed to resolve ${info.fieldName}. See logs for details.`
          );
        }
      }

      // Handle Mutations (Cache Invalidation)
      if (info.operation?.operation === "mutation") {
        try {
          console.log(
            `Mutation detected: ${info.fieldName}. Invalidating cache for ${entity}`
          );

          // Execute mutation first
          const result = await resolve(parent, args, context, info);

          // Invalidate cache for the main entity and related entities
          console.log(
            `Invalidating cache for ${entity} and related entities:`,
            entityRelationships[entity] || []
          );
          await invalidateCacheForMutation(entity);

          return result;
        } catch (error) {
          console.error(
            `Error processing mutation "${info.fieldName}" for entity "${entity}":`,
            error
          );
          throw new Error(`Mutation failed for ${info.fieldName}. Check logs.`);
        }
      }

      // Default case: If the operation is not a query or mutation
      return await resolve(parent, args, context, info);
    };
  });

  return wrappedResolvers;
};


