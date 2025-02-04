// Handles GraphQL introspection

import {
  getIntrospectionQuery,
  graphql,
  GraphQLSchema,
  getNamedType,
  isObjectType,
} from "graphql";

/**
 * Fetches and returns the GraphQL schema introspection result.
 * @param schema - The GraphQLSchema object.
 * @returns The introspection JSON result.
 */
export async function getSchemaIntrospection(schema: GraphQLSchema) {
  try {
    const result = await graphql({
      schema,
      source: getIntrospectionQuery(),
    });

    if (result.errors) {
      console.error("GraphQL Introspection Error:", result.errors);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch introspection data:", error);
    throw error;
  }
}

/**
 * Extracts entity relationships from a GraphQL schema.
 * @param schema - The GraphQLSchema object.
 * @returns A map of entity relationships.
 */
export function extractEntityRelationships(
  schema: GraphQLSchema
): Record<string, string[]> {
  const typeMap = schema.getTypeMap();
  const relationships: Record<string, string[]> = {};

  for (const typeName in typeMap) {
    const type = typeMap[typeName];

    if (isObjectType(type)) {
      const fields = type.getFields();
      relationships[typeName] = Object.values(fields)
        .map((field) => getNamedType(field.type).name)
        .filter((relatedType) => relatedType !== typeName); // Avoid self-referencing
    }
  }

  return relationships;
}
