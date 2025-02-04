import gql from 'graphql-tag';
import { cacheiqItType, queryArray, mutationArray } from './types';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { MutationTypeSpecifier, mutationTypes } from './types';
import { createClientError } from './errorhandling';

// function to handle mutation change update query/response
// potentially add parameters of query etc
// const matchMQ = async (
//   endpoint: string | URL,
//   mutation
// ): Promise<string | object | null | void> => {
//   let mutationArray: readonly mutationArray[] = [];
//   let queryArray: readonly queryArray[] = [];
//   const mutationIntrospect = await fetch(endpoint, {
//     method: 'POST',
//     headers: {
//       // need to change this later to account for variables
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       query: `{
//          __schema {
//           mutationType{
//               name
//               fields{
//                   name
//                   type{
//                       name
//                       kind
//                       ofType {
//                             name
//                             kind
//                   }
//                   }
//               }
//           }
//         }
//     }`,
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       mutationArray = data.data.__schema.mutationType.fields;
//     });
//   const queryIntrospect = await fetch(endpoint, {
//     method: 'POST',
//     headers: {
//       // need to change this later to account for variables
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       query: `{
//            __schema {
//             queryType{
//                 name
//                 fields{
//                     name
//                     type{
//                         name
//                         kind
//                         ofType{
//                         name
//                         }
//                     }
//                 }
//             }
//           }
//       }`,
//     }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       queryArray = data.data.__schema.queryType.fields;
//     });
//   console.log(queryArray, mutationArray);
//   for (let i = 0; i < queryArray.length; i++) {
//     for (let k = 0; k < mutationArray.length; k++) {
//       if (queryArray[i].type.ofType.name === mutationArray[k].type.name) {

//         console.log('match found');
//       }
//     }
//   }
// };


export const mutationValidator = (query: string, mutationType?: string) => {

  if (localStorage.hasOwnProperty(query)) {
    // console.log(query);
    // add checker to see if query type is a mutation
    try {
      // parses query using graphql-tag feature (makes an AST representation of the query)
      const parsedQuery: DocumentNode = gql`
        ${query}
      `;
      // check if mutation is present in parsed query
      // check if any of the objects in definitions array has a mutation, return true if so (some method returns a boolean)
      const containsMutation: boolean = parsedQuery.definitions.some(
        (definition) =>
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'mutation'
      );
      console.log('ParsedQuery: ',parsedQuery)
      console.log("containsMutation: ",containsMutation);
      // parse query to extract name
      let mutationNodeValue: string | null = null;
      // logic for checking what mutation is occurring and getting mutation type
      if (containsMutation) {
        // traverse through AST using graphql's visit function
        visit(parsedQuery, {
          // this should be invoked whenever the visit function encounters an operation defintion node
          // here, we create operation defintion key with associated method which is operationdefinition(node)
          OperationDefinition(node) {
            // if the node is a mutation and the value of the name property in node is defined
            console.log('Node',node)
            // if there is a mutation
            if (node.operation === 'mutation') {
              // enter the selectionSet
              // access the selections arrays first element (which is an object)
              const firstSelection = node.selectionSet.selections[0];
              // if firstSelection exists and the kind value of that property is field (which it has to be in order to have a name property)
              if (firstSelection && firstSelection.kind === 'Field') {
                // set mutationNodeValue to the name keys associated value
                mutationNodeValue = firstSelection.name.value
                console.log('mutation name:', mutationNodeValue);
              }
            } else {
              console.error('Node operation is not a mutation!')
            }
          },
            })
        };
        // target first keyword in typeofmutation to determine type
        // check to see what type of mutation
        // invoke respective handler function
        if (mutationNodeValue !== null) {
          // let mutationString: string | null = null;
          // arrayOfMutationTypes contains CRUD action keys (delete, create, update).
          const arrayOfMutationTypes: Array<string> = Object.keys(mutationTypes); // [delete, create, update]
          // store first element in arrayOfMutationTypes that includes the action (CUD operation string)
          const CrudMutationAction: string | undefined = arrayOfMutationTypes.find((action) =>
            // find value of action key in mutationTypes
            // see which value is included in the mutationNodeValue we took from mutation query
            // CrudMutationAction is set to the first action whose keywords match the mutation name.
            // Example: If the mutation is CreateUser, it matches create in mutationTypes, and CrudMutationAction is set to "create".
            mutationTypes[action as keyof MutationTypeSpecifier].some(
              (type: string) => mutationNodeValue?.includes(type)
            )
          ) as keyof MutationTypeSpecifier;
  
          // if we get here, invoke a function to update the cache with the new value of the query
          if (CrudMutationAction !== undefined) {
            mutationHandler(CrudMutationAction, query)
          }
        }
      } catch (err) {
      if (err instanceof Error) {
        console.log(`${err}, Something went wrong when checking for mutations!`);
        return createClientError(err.message);
      }
    }
  }
};

// mutationHandler function --- updates cached data
export const mutationHandler = (CrudMutationAction: string, query: string) => {
  // introspect (__schema introspection) to see what mutations are in schema; access fields array, grab type of name (e.g., "createReview" : review --> review is the type)
  /**
           * {
         __schema {
          mutationType{
              name
              fields{
                  name
                  type{
                      name : <-- tells you the type that the data is being sent as
                      kind
                      ofType {
                            name
                            kind
                  }
                  }
              }
          }
        }
}
  */
  // introspect (queryType introspection) again to see all queries (e.g., people: [person], person: person!, review: [review])
  /**
             * {
           __schema {
            queryType{
                name
                fields{
                    name
                    type{
                        name
                        kind
                        ofType {
                              name : <-- this is what you're looking to match, this is what type is returned if you make this query (i.e., what kinds of query returns this type)
                              kind
                    }
                    }
                }
            }
          }
          }
   */
  
  // do this to match mutation with the type of query

  // find all queries that return that type (we'll then know which ones to update)

  // cache invalidation --- delete old/stale(?) query?

  // then, re-fetch new data from DB using the query 

  // update the cache with newly fetched data

}


// look into accessing specific data through introspection to store it as a key
// is it specific enough?

// 'query: CreateGabyData'

// {GabyData: 'age: 25'}

// 'mutation: UpdateGabyData'
