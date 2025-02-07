import {
  setCacheQuery,
  getCachedQuery,
  trackCacheDependency,
  invalidateCacheForMutation,
} from "../cache/cacheManager";
import { GraphQLResolveInfo } from "graphql";
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
      context?: any
    ): Promise<any> => {
      if (!info) {
        console.error(
          "Missing GraphQlResolveInfo in cacheMiddleware. Bypassing cache."
        );

        return await resolve(parent, args, info, context);
      }
      console.log(
        `cacheMiddleware triggered for operation: ${info.operation?.operation}`
      );


      // Ensure only queries are cached
      if (info.operation?.operation !== "query") {
        console.log(`Skipping cache for mutation: ${info.fieldName}`);
        return await resolve(parent, args, info, context);
      }

      // Fix: Remove brackets [] and capitalize first letter
      const entityType = info.returnType.toString().replace(/[[\]]/g, ""); // Extracts "Person" instead of "[Person]"
      const entity = entityType.charAt(0).toUpperCase() + entityType.slice(1);
      const sortedArgs = JSON.stringify(args, Object.keys(args).sort()); // Ensures consistent key order
      const rawKey = `${entity}:${info.fieldName}:${sortedArgs}`;
      const cacheKey = hashKey(rawKey);

      try {
        const cachedData = await getCachedQuery(cacheKey);
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`);
          return cachedData;
        }
        console.log(`Cache miss for ${cacheKey}`);
        const result = await resolve(parent, args, context, info);
        await setCacheQuery(cacheKey, result, entity, { ttl });
        console.log(entity);
        await trackCacheDependency(cacheKey, entity); // Track key dependency
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
      context?: any
    ): Promise<any> => {
      if (!info) {
        console.error("Missing GraphQLResolveInfo in cacheMiddleware");
        // return await resolve(parent, args, context, info);
        return await resolve(parent, args, info, context);
      }
      console.log(
        `cacheMutationMiddleware triggered for operation: ${info.operation?.operation}`
      );
      // Ensure only mutations are processed
      if (info.operation?.operation !== "mutation") {
        console.log(`Skipping cache invalidation for query: ${info.fieldName}`);
        return await resolve(parent, args, info, context);
      }

      // const entity = info.parentType?.name || "UnknownEntity"; // GET ENTITY TYPE
      const entityType = info.returnType.toString().replace(/[[\]]/g, "");
      const entity = entityType.charAt(0).toUpperCase() + entityType.slice(1);

      try {
        console.log(
          `Mutation detected: ${info.fieldName}. Invalidating cache for ${entity}`
        );
        // EXECUTE MUTATION
        const result = await resolve(parent, args, context, info);
        console.log(
          `🚨 Calling invalidateCacheForMutation for entity: ${entity}`
        );
        await invalidateCacheForMutation(entity);

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
