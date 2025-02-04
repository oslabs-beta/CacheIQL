//Resolves partial queries for uncached data
import { GraphQLResolveInfo, graphql, GraphQLSchema } from "graphql";
import { extractEntities } from "../query/queryParser";
import { getNamedType, isObjectType } from "graphql";
import {
  setCacheQuery,
  getCachedQuery,
  invalidateCacheForMutation,
} from "../cache/cacheManager";


import { mergeCachedAndNewData } from "../query/mergeUtils";

/**
 * Resolves uncached fields by making a partial query.
 * @param schema - The GraphQL schema object.
 * @param info - GraphQLResolveInfo from the resolver.
 * @param cachedData - The cached result (if available).
 * @returns The merged response (cached + newly fetched).
 */
export async function resolvePartialQuery(
  schema: GraphQLSchema,
  info: GraphQLResolveInfo,
  cachedData: Record<string, any>
): Promise<Record<string, any>> {
  const missingFields: Set<string> = new Set();
  const rootType = info.parentType;

  // Step 1: Identify missing fields
  info.fieldNodes.forEach((field) => {
    const fieldDef = rootType.getFields()[field.name.value];

    if (fieldDef) {
      const entityType = getNamedType(fieldDef.type);
      if (isObjectType(entityType)) {
        const fieldName = field.name.value;
        if (!cachedData[fieldName]) {
          missingFields.add(fieldName);
        }
      }
    }
  });

  // Step 2: If all fields are cached, return cached data immediately
  if (missingFields.size === 0) {
    return cachedData;
  }

  // Step 3: Construct a new partial query for only missing fields
  const partialQuery = `
    {
      ${Array.from(missingFields).join("\n")}
    }
  `;

  // Step 4: Execute partial query
  const newData = await graphql({
    schema,
    source: partialQuery,
  });

  // Step 5: Merge cached + new data
  return mergeCachedAndNewData(cachedData, newData.data);
}
