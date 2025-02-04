// Parses GraphQL queries into fields/subfields
// Extracts which entities (types) are being queried
// Stores these entities to track dependencies

import { GraphQLResolveInfo, getNamedType, isObjectType } from "graphql";

/**
 * Extracts the root-level GraphQL entity types from a query.
 * @param info - GraphQLResolveInfo object provided to the resolver.
 * @returns An array of entity names being queried.
 */
export function extractEntities(info: GraphQLResolveInfo): string[] {
  const entities: Set<string> = new Set();

  // Get the parent type (Query, Mutation)
  const operationType = info.parentType;

  // Get all requested fields from the query
  info.fieldNodes.forEach((field) => {
    const fieldDef = operationType.getFields()[field.name.value];

    if (fieldDef) {
      // Extract the base entity type
      const entityType = getNamedType(fieldDef.type);

      if (isObjectType(entityType)) {
        entities.add(entityType.name);
      }
    }
  });

  return Array.from(entities);
}
