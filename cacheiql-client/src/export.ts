import { cacheiqItType, queryArray, mutationArray } from './types';
import { createClientError } from './errorhandling';
import { checkAndSaveToCache, cacheManager } from './cacheManagement';
import gql from 'graphql-tag';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { MutationTypeSpecifier, mutationTypes } from './types';
import { promises } from 'dns';

// cacheiqIt --- function that makes fetch
const introspectMap = async (
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
        }
    }`,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      mutationArray = data.data.__schema.mutationType.fields;
    });
  const queryIntrospect = await fetch(endpoint, {
    method: 'POST',
    headers: {
      // need to change this later to account for variables
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
           __schema {
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
      queryArray = data.data.__schema.queryType.fields;
    });
  console.log(queryArray, mutationArray);
  for (let i = 0; i < queryArray.length; i++) {
    for (let k = 0; k < mutationArray.length; k++) {
      if (queryArray[i].type.ofType.name === mutationArray[k].type.name) {
        console.log('match found');
      }
    }
  }
};

export const cacheiqIt = async ({
  endpoint,
  query,
  mutation,
  time,
}: //variables,
cacheiqItType): Promise<string | object | null | void | JSON> => {
  introspectMap(endpoint);

  if (query) {
    if (typeof query !== 'string') {
      console.error(
        createClientError(
          'Query passed in is invalid. Please check to make sure its a string'
        )
      );
    }

    // logic for querying DB for uncached queries, retrieving cached queries & responses from localStorage
    if (query !== null) {
      try {
        // if query is not cached, make fetch to DB
        if (!checkAndSaveToCache(query) && typeof query === 'string') {
          const response: any = await fetch(endpoint, {
            method: 'POST',
            headers: {
              // need to change this later to account for variables
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: `query${query}` }),
          })
            .then((res) => res.json())
            .then((data) => {
              // error handling for if data contains an error
              if (data.errors) {
                console.error(data.errors[0]);
                return;
              }
              console.log(data);
              // cache newly fetched data
              checkAndSaveToCache(query, data);
              cacheManager(query, time);
              return data;
            });
          return response;
        } else {
          // variable to hold query string (either pulled from object or as is)
          const queryString = query;
          // instead of storing the error object, this returns early with the error
          // reassurance operator !
          if (JSON.parse(localStorage.getItem(queryString)!).errors) {
            console.error(
              JSON.parse(localStorage.getItem(queryString)!).errors[0]
            );
            return;
          }
          // console.log('query & response found in cache!');
          const response: any = JSON.parse(localStorage.getItem(queryString)!);
          return response;
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(
            `${err}, Something wrong with fetching query through GraphQL!`
          );
          return createClientError(err.message);
        }
      }
    }
  }

  if (mutation) {
    if (typeof mutation !== 'string') {
      console.error(
        createClientError(
          'Mutation passed in is invalid. Please check to make sure its a string'
        )
      );
    }

    if (mutation !== null) {
      try {
        // if query is not cached, make fetch to DB
        if (!checkAndSaveToCache(mutation) && typeof mutation === 'string') {
          const response: any = await fetch(endpoint, {
            method: 'POST',
            headers: {
              // need to change this later to account for variables
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: `mutation${mutation}` }),
          })
            .then((res) => res.json())
            .then((data) => {
              // error handling for if data contains an error
              if (data.errors) {
                console.error(data.errors[0]);
                return;
              }
              // cache newly fetched data
              checkAndSaveToCache(mutation, data);
              cacheManager(mutation, time);
              return data;
            });
          return response;
        } else {
          // variable to hold query string (either pulled from object or as is)
          const mutationString = mutation;
          // instead of storing the error object, this returns early with the error
          // reassurance operator !
          if (JSON.parse(localStorage.getItem(mutationString)!).errors) {
            console.error(
              JSON.parse(localStorage.getItem(mutationString)!).errors[0]
            );
            return;
          }
          // console.log('query & response found in cache!');
          const response: any = JSON.parse(
            localStorage.getItem(mutationString)!
          );
          return response;
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(
            `${err}, Something wrong with fetching query through GraphQL!`
          );
          return createClientError(err.message);
        }
      }
    }
  }
};

// function to handle mutation change update query/response
// potentially add parameters of query etc
// export const mutationHandler = (mutationType: string, mutationInfo: string) => {
// if (localStorage.hasOwnProperty(mutationInfo)) {
// }
// add checker to see if query type is a mutation
//     try {
//       // parse query using graphql-tag feature (makes an AST)
//       const parsedQuery: DocumentNode = gql`
//         ${query}
//       `;
//       // check if mutation is present in parsed query
//       // check if any of the objects in definitions array has a mutation, return true if so (some method returns a boolean)
//       const containsMutation: boolean = parsedQuery.definitions.some(
//         (definition) =>
//           definition.kind === 'OperationDefinition' &&
//           definition.operation === 'mutation'
//       );

//       // logic for checking what mutation is occurring and getting mutation type
//       if (containsMutation) {
//         // parse query to extract name
//         let mutationName: string | null = null;
//         // traverse through AST using graphql's visit function
//         visit(parsedQuery, {
//           // this should be invoked whenever the visit function encounters an operation defintion node
//           // here, we create operation defintion key with associated method which is operationdefinition(node)
//           OperationDefinition(node) {
//             // if the node is a mutation and the value of the name property in node is defined
//             if (node.operation === 'mutation' && node.name) {
//               // set mutationName to the value of the name key in the node
//               mutationName = node.name.value;
//             }
//           },
//         });
//         // target first keyword in typeofmutation to determine type
//         // check to see what type of mutation
//         // invoke respective handler function
//         if (mutationName !== null) {
//           // let mutationString: string | null = null;
//           // go through mutationTypes object and store all keys as strings in an array
//           const arrayOfMutationTypes: Array<string> = Object.keys(mutationTypes);
//           // store first element in arrayOfMutationTypes that includes the action (CUD operation string)
//           const mutationAction: string = arrayOfMutationTypes.find((action) =>
//             // find value of action key in mutationTypes
//             // see which value is included in the mutationName we took from mutation query
//             mutationTypes[action as keyof MutationTypeSpecifier].some(
//               (type: string) => mutationName?.includes(type)
//             )
//           ) as keyof MutationTypeSpecifier;

//           if (mutationAction) {
//             mutationHandler(mutationAction, queryString);
//           }
//         } else {
//           console.log('mutation action type not found!');
//           return 'mutation action type not found!';
//         }
//       }
//     } catch (err) {
//       if (err instanceof Error) {
//         console.log(`${err}, Something went wrong when checking for mutations!`);
//         return createClientError(err.message);
//       }
//     }
// };

// this is what code would look like if you wanted to use one of our custom fetch functions
// write out code of implementation, use star wars api

// cacheiqIt(
//   'https://swapi.dev/api/people/1/',
//   `type Query {
//   name
// }`
// );
