import gql from 'graphql-tag';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { MutationTypeSpecifier, mutationTypes } from './types';
import { createClientError } from './errorhandling';

// function to handle mutation change update query/response
// potentially add parameters of query etc
export const mutationValidator = (mutationType: string, query: string) => {
  if (localStorage.hasOwnProperty(query)) {
  
    // add checker to see if query type is a mutation
    try {
      // parse query using graphql-tag feature (makes an AST)
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
  
      // logic for checking what mutation is occurring and getting mutation type
      if (containsMutation) {
        // parse query to extract name
        let mutationNodeValue: string | null = null;
        // traverse through AST using graphql's visit function
        visit(parsedQuery, {
          // this should be invoked whenever the visit function encounters an operation defintion node
          // here, we create operation defintion key with associated method which is operationdefinition(node)
          OperationDefinition(node) {
            // if the node is a mutation and the value of the name property in node is defined
            if (node.operation === 'mutation' && node.name) {
              // set mutationName to the value of the name key in the node
              mutationNodeValue = node.name.value;
            }
          },
        });
        // target first keyword in typeofmutation to determine type
        // check to see what type of mutation
        // invoke respective handler function
        if (mutationNodeValue!== null) {
          // let mutationString: string | null = null;
          // go through mutationTypes object and store all keys as strings in an array
          const arrayOfMutationTypes: Array<string> = Object.keys(mutationTypes); // [delete, create, update]
          // store first element in arrayOfMutationTypes that includes the action (CUD operation string)
          const CrudMutationAction: string | undefined = arrayOfMutationTypes.find((action) =>
            // find value of action key in mutationTypes
            // see which value is included in the mutationName we took from mutation query
            mutationTypes[action as keyof MutationTypeSpecifier].some(
              (type: string) => mutationNodeValue?.includes(type)
            )
          ) as keyof MutationTypeSpecifier;
  
          // if we get here, invoke a function to update the cache with the new value of the query
          if (CrudMutationAction !== undefined) {
            mutationHandler(CrudMutationAction, query)
          }
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
