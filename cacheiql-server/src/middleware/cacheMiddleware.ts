import {
  setCacheQuery,
  getCachedQuery,
  trackCacheKey,
  invalidateCacheForMutation,
} from "../cache/cacheManager";
import { GraphQLResolveInfo } from 'graphql';
import { hashKey } from "../cache/cacheUtils";


//takes the rootValue as input to wrap each resolver in caching logic
export const cacheMiddleware = (
  rootValue: { [key: string]: Function },
  ttl: number = 60
) => {
  //creates an empty object to store the modified resolver functions
  const wrappedResolvers: { [key: string]: Function } = {};

  //loops through all of the keys in rootValue
  Object.keys(rootValue).forEach((key) => {
    //console.log(`wrapping resolver for ${key}`);

    //stores the origional function
    const resolve = rootValue[key];

    //creates a new wrapped version of the resolver
    wrappedResolvers[key] = async (
      parent: any,
      args: any,
      info?: GraphQLResolveInfo,
      context?: any,
    ): Promise<any> => {
      if (!info) {
          console.error(
            "Missing GraphQlResolveInfo in cacheMiddleware. Bypassing cache."
          );
        // console.error(
        //   `Missing GraphQlResolveInfo in cacheMiddleware for resolver ${key}.`,
        //   { args, conext }
        // );
        
         return await resolve(parent, args, info, context);
          // return resolve(parent, args, context, {} as GraphQLResolveInfo);
        // return await resolve(parent, args, context, info as GraphQLResolveInfo);
      }
      // const parentType = info.parentType.name
      //   ? info.parentType.name
      //   : info.parentType;


      const entity = info.parentType.name; // Entity name (e.g., "User")
      const sortedArgs = JSON.stringify(args, Object.keys(args).sort()); // Ensures consistent key order
      const rawKey = `${entity}:${info.fieldName}:${sortedArgs}`;
      const cacheKey = hashKey(rawKey)

      // const cacheKey = hashKey(
      //   `${entity}:${info.fieldName}:${JSON.stringify(args)}`
      // );

      try {
        const cachedData = await getCachedQuery(cacheKey);
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          return cachedData;
        }
        console.log(`Cache miss for ${cacheKey}`);
        const result = await resolve(parent, args, context, info);
        await setCacheQuery(cacheKey, result, entity, { ttl });
        console.log(entity)
        await trackCacheKey(entity, cacheKey); // Track for invalidation
        return result;
      } catch (error) {
        console.error(`Error processing query ${info.fieldName}:`, error);
        throw new Error(
          `Failed to resolve ${info.fieldName}. See logs for details.`
        );
      }
    };
  });

  //returns the object with all of the resolvers wrapped and ready
  return wrappedResolvers;
};


export const cacheMutationMiddleware = (rootValue: {
  [key: string]: Function;
}) => {
  const wrappedResolvers: { [key: string]: Function } = {};

  Object.keys(rootValue).forEach((key) => {
    const resolve = rootValue[key];

    wrappedResolvers[key] = async (
      parent: any,
      args: any,
      info?: GraphQLResolveInfo,
      context?: any,
    ): Promise<any> => {
      if (!info) {
        console.error("Missing GraphQLResolveInfo in cacheMiddleware");
        // return await resolve(parent, args, context, info);
        return await resolve(parent, args, info, context);
      }
      
      const entity = info.parentType.name; // GET ENTITY TYPE

      try {
        console.log(
          `Mutation detected: ${info.fieldName}. Invalidating cache for ${entity}`
        );
        // EXECUTE MUTATION
        const result = await resolve(parent, args, context, info);

        const affectedKeys: string[] = await invalidateCacheForMutation(entity);

        if (affectedKeys.length > 0) {
          console.log(
            `Cache invalidated for entity "${entity}":`,
            affectedKeys
          );
        } else {
          console.log(`No matching cache keys found for entity "${entity}".`);
        }
        return result;
      } catch (error) {
        console.error(
          `Error processing mutation "${info.fieldName}" for entity "${entity}":`,
          error
        );
        throw new Error(`Mutation failed for ${info.fieldName}. Check logs.`);
        // return null //Ensures GraphQL still returns a response
      }
    };
  });

  return wrappedResolvers;
};
