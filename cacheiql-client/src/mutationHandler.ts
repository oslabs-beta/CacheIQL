import gql from 'graphql-tag';
import { queryArray, mutationArray } from './types';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { createClientError } from './errorhandling';

export const matchMQ = async (
  endpoint: string | URL,
  response?: any
): Promise<string | object | null | void> => {
  let mutationArray: readonly mutationArray[] = [];
  let queryArray: readonly queryArray[] = [];
  const mutationIntrospect = await fetch(endpoint, {
    method: 'POST',
    headers: {
      // need to change this later to account for variables
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
         __schema {
          mutationType{
              name
              fields{
                  name
                  type{
                      name
                      kind
                      ofType {
                            name
                            kind
                  }
                  }
              }
          }
              queryType{
                name
                fields{
                    name
                    type{
                        name
                        kind
                        ofType{
                        name
                        }
                    }
                }
            }
        }
    }`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      mutationArray = data.data.__schema.mutationType.fields;
      queryArray = data.data.__schema.queryType.fields;
    });

  console.log(queryArray, mutationArray);
  for (let i = 0; i < queryArray.length; i++) {
    for (let k = 0; k < mutationArray.length; k++) {
      if (queryArray[i].type.ofType.name === mutationArray[k].type.name) {
        console.log(queryArray[i], ' matches with ', mutationArray[k]);
        console.log('match found');
        localStorage.removeItem(queryArray[i].name);
        console.log('Data is invalid removed from cache');
      }
    }
  }
};
export const grabQueryName = (query: string): any => {
  // add checker to see if query type is a mutation
  try {
    // parses query using graphql-tag feature (makes an AST representation of the query)
    const parsedQuery: DocumentNode = gql`
      ${query}
    `;
    // check if mutation is present in parsed query
    // check if any of the objects in definitions array has a mutation, return true if so (some method returns a boolean)
    // parse query to extract name
    let NodeValue: string | null = null;
    // logic for checking what mutation is occurring and getting mutation type
    // traverse through AST using graphql's visit function
    visit(parsedQuery, {
      // this should be invoked whenever the visit function encounters an operation defintion node
      // here, we create operation defintion key with associated method which is operationdefinition(node)
      OperationDefinition(node) {
        // if the node is a mutation and the value of the name property in node is defined
        //console.log('Node', node)
        // if there is a mutation
        //if (node.operation === 'mutation') {
        // enter the selectionSet
        // access the selections arrays first element (which is an object)
        const firstSelection = node.selectionSet.selections[0];
        // if firstSelection exists and the kind value of that property is field (which it has to be in order to have a name property)
        if (firstSelection && firstSelection.kind === 'Field') {
          // set mutationNodeValue to the name keys associated value
          NodeValue = firstSelection.name.value;
          //console.log('mutation name:', mutationNodeValue);
        }
        //} else {
        //console.error('Node operation is not a mutation!')
        //}
      },
    });
    //};
    return NodeValue;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`${err}, Something went wrong when checking for mutations!`);
      return createClientError(err.message);
    }
  }
};
