import { GraphQLResolveInfo, SelectionNode, FieldNode, FragmentSpreadNode, InlineFragmentNode } from "graphql";

/**
 * Parses a GraphQL query and extracts fields and subfields.
 * @param info GraphQLResolveInfo from the resolver.
 * @returns A structured representation of the query fields.
 */
export const parseQueryFields = (info: GraphQLResolveInfo): Record<string, any> => {
  return collectFields(info, info.fieldNodes);
};

/**
 * Recursively collects fields from the GraphQLResolveInfo object.
 * @param info GraphQLResolveInfo
 * @param nodes Array of selection nodes
 * @param path Path of the current field (for nested structures)
 * @returns A structured object representing the fields and subfields.
 */
const collectFields = (info: GraphQLResolveInfo, nodes: readonly SelectionNode[], path: string = ""): Record<string, any> => {
  const fields: Record<string, any> = {};

  for (const node of nodes) {
    if (node.kind === "Field") {
      const fieldNode = node as FieldNode;
      const fieldName = fieldNode.name.value;

      if (fieldNode.selectionSet) {
        fields[fieldName] = collectFields(info, fieldNode.selectionSet.selections, path + "." + fieldName);
      } else {
        fields[fieldName] = true;
      }
    } else if (node.kind === "FragmentSpread") {
      const fragmentNode = info.fragments[(node as FragmentSpreadNode).name.value];
      if (fragmentNode) {
        Object.assign(fields, collectFields(info, fragmentNode.selectionSet.selections, path));
      }
    } else if (node.kind === "InlineFragment") {
      Object.assign(fields, collectFields(info, (node as InlineFragmentNode).selectionSet.selections, path));
    }
  }

  return fields;
};
