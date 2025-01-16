import { setCacheQuery, getCachedQuery, invalidateCache } from './cacheManager';
import { GraphQLResolveInfo } from 'graphql';

export const cacheMiddleware =
  (
    resolve: (
      parent: any,
      args: any,
      info: GraphQLResolveInfo,
      context?: any
    ) => Promise<any>
  ) =>
  async (
    parent: any,
    args: any,
    info: GraphQLResolveInfo,
    context?: any
  ): Promise<any> => {
    if (!info) {
      console.error('Missing GraphQlResolveInfo in cacheMiddleware');

      return await resolve(parent, args, context, info as GraphQLResolveInfo);
    }
    const parentType = info.parentType.name
      ? info.parentType.name
      : info.parentType;
    // Check the cache
    // if (info.parentType.name) {
    //   const parentType = info.parentType.name;
    // } else {
    //   const parentType = info.parentType;
    // }
    const key = `${info.parentType.name}:${info.fieldName}:${args}`;

    try {
      const cachedData = await getCachedQuery(key);
      if (cachedData) {
        console.log(`Cache hit for ${key}`);

        return cachedData;
      }
      console.log(`Cache miss for ${key}`);
      const result = await resolve(parent, args, context, info);
      await setCacheQuery(key, result);
      return result;
    } catch (error) {
      console.error(error);
    }
  };

export const invalidateCacheForMutation = async (
  mutationName: string,
  args: any
) => {
  // Invalidation logic based on your schema's mutation side effects
  console.log(`Invalidating cache for mutation: ${mutationName}`);
};
