import { ClientErrorType, Query } from './types';
import gql from 'graphql-tag';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { MutationTypeSpecifier, mutationTypes} from './types'
// import client error type
// you want to import not export a type because it leads to more errors

// client error function//
const createClientError = (message: string): ClientErrorType => {
  return {
    log: message,
    status: 400,
    message: { err: 'Something went wrong in cacheqlIt fetch' },
  };
};

// Helper Function
// creates unique key for each query and response
const generateKey = (query: Query, variables?: object): string => {
  return `${query}_${JSON.stringify(variables)}`;
};

// cacheiqit function that makes fetch
export const cacheiqIt = async (
  endpoint: string,
  query: Query,
  variables?: object
): Promise<string | object | null | void | JSON> => {

  if (typeof query !== 'string' || typeof query !== 'object') {
    console.error(
      createClientError(
        'Query passed in is invalid. Please check to make sure its an object or string'
      )
    );
  }


// check if query is an object
  if (typeof query === 'object') {
    // if an object is passed, check the query property to see if type is string
    if (typeof query.query !== 'string') {
      console.error(createClientError('The value of query must be a string to make a proper GraphQL query.'));
    }
  }

// logic for querying DB for uncached queries, retrieving cached queries & responses from localStorage
  if (query !== null) {
    try {
      // if query is not cached, make fetch to DB
      if (!checkAndSaveToCache(query) && typeof query === 'object') {
        const response: any = await fetch(endpoint, {
          method: 'POST',
          headers: {
            // need to change this later to account for variables
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
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
            return data;
          });
        return response;
      } else {
        // variable to hold query string (either pulled from object or as is)
        const queryString = typeof query === 'object' ? query.query : query;
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
        console.log(`${err}, Something wrong with fetching query through GraphQL!`);
        return createClientError(err.message);
      }
    }
  }
};


// create function that handles saving data to local storage
export const checkAndSaveToCache = (
  // potentially add type parameter to check for mutations
  query: Query,
  response?: object,
  variables?: object
): string | void | boolean | object => {
  
  if (query === null) {
    return 'query is null';
  }
  const queryString = typeof query === 'object' ? query.query : query;

  const key = generateKey(queryString, variables);

  /// got to here on testing, consider checking mutation vs query before checking storage etc
  const data = localStorage.getItem(queryString);
  
  // add checker to see if query type is a mutation
  try {
    // parse query using graphql-tag feature (makes an AST)
    const parsedQuery: DocumentNode = gql`${query}`;
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
      let mutationName: string | null = null;
      // traverse through AST using graphql's visit function
      visit(parsedQuery, {
        // this should be invoked whenever the visit function encounters an operation defintion node
        // here, we create operation defintion key with associated method which is operationdefinition(node)
        OperationDefinition(node) {
          // if the node is a mutation and the value of the name property in node is defined
          if (node.operation === 'mutation' && node.name) {
            // set mutationName to the value of the name key in the node
            mutationName = node.name.value;
          }
        },
      });
      // target first keyword in typeofmutation to determine type
      // check to see what type of mutation
      // invoke respective handler function
      if (mutationName !== null) {
        // let mutationString: string | null = null;
        // go through mutationTypes object and store all keys as strings in an array
        const arrayOfMutationTypes: Array<string> = Object.keys(mutationTypes);
        // store first element in arrayOfMutationTypes that includes the action (CUD operation string)
        const mutationAction: string = arrayOfMutationTypes.find((action) =>
          // find value of action key in mutationTypes
          // see which value is included in the mutationName we took from mutation query
          mutationTypes[action as keyof MutationTypeSpecifier].some(
            (type: string) => mutationName?.includes(type)
          )
        ) as keyof MutationTypeSpecifier;

        if (mutationAction) {
          mutationHandler(mutationAction, queryString);
        }
      } else {
        console.log('mutation action type not found!')
        return 'mutation action type not found!';
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.log(`${err}, Something went wrong when checking for mutations!`);
      return createClientError(err.message);
    }
  }

  if (data) {
    return true;
  }
  // if there was no data previously stored in cache, 
  // add the query and the response to local storage
  else if (!data && response) {
    localStorage.setItem(queryString, JSON.stringify(response));
    return true;
  } 
  // potentially add another else if to check if type is a mutation
  // if so, invoke mutation updater function
  else {
    return false;
  }
};

// function to handle mutation change update query/response
export const mutationHandler = (mutationType: string, mutationInfo: string) => {
  if (localStorage.hasOwnProperty(mutationInfo)) {

  }
};

// this is what code would look like if you wanted to use one of our custom fetch functions
// write out code of implementation, use star wars api

// cacheiqIt(
//   'https://swapi.dev/api/people/1/',
//   `type Query {
//   name
// }`
// );
