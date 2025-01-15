import { setCacheQuery, getCachedQuery, invalidateCache } from './cacheManager';
import { GraphQLResolveInfo } from 'graphql';

export const cacheMiddleware =
  (resolve: any) =>
  async (root: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const key = `${info.parentType.name}:${info.fieldName}:${JSON.stringify(
      args
    )}`;

    // Check the cache
    const cachedData = await getCachedQuery(key);
    if (cachedData) {
      console.log(`Cache hit for ${key}`);
      return cachedData;
    }

    // Execute resolver and cache the result
    const result = await resolve(root, args, context, info);
    await setCacheQuery(key, result);
    return result;
  };

export const invalidateCacheForMutation = async (
  mutationName: string,
  args: any
) => {
  // Invalidation logic based on your schema's mutation side effects
  console.log(`Invalidating cache for mutation: ${mutationName}`);
};
