import { setCacheQuery, getCachedQuery, invalidateCache } from '../cache/cacheManager';
import { GraphQLResolveInfo } from 'graphql';

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

      const key = hashKey(`${info.parentType.name}:${info.fieldName}:${args}`);

      try {
        const cachedData = await getCachedQuery(key, ttl);
        if (cachedData) {
          //console.log(`Cache hit for ${key}`);

          return cachedData;
        }
        //console.log(`Cache miss for ${key}`);
        const result = await resolve(parent, args, context, info);
        await setCacheQuery(key, result, ttl);
        return result;
      } catch (error) {
        console.error(error);
      }
    };
  });

  //returns the object with all of the resolvers wrapped and ready
  return wrappedResolvers;
};
//hashing the function to make the key more secure by making it binary
const hashKey = (string: string): string => {
  let hash = 0;

  if (string.length === 0) return hash.toString();

  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    //shifts the hash position by 5 "<<" the same as x*(2^y)
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString();
};

export const invalidateCacheForMutation = async (
  mutationName: string,
  args: any
) => {
  // Invalidation logic based on your schema's mutation side effects
  console.log(`Invalidating cache for mutation: ${mutationName}`);
};
