import { ClientErrorType } from './types';
import gql from 'graphql-tag';
import { visit } from 'graphql';
//import fs from 'fs';
//import graphql from 'graphql';
import { DocumentNode } from 'graphql';

// import client error type
// you want to import not export a type because it leads to more errors
// const { ClientErrorType } = require('./types');

// client error function
export const createClientError = (message: string): ClientErrorType => {
  return {
    log: message,
    status: 400,
    message: { err: 'Something went wrong in cacheqlIt fetch' },
  };
};

// function that creates unique key for each query and response
export const generateKey = (query: string, variables?: object): string => {
  return `${query}_${JSON.stringify(variables)}`;
};

// function that makes fetch
export const cacheiqIt = async (
  endpoint: string,
  query: string | { query: string } | null,
  variables?: object
): Promise<string | object | null | void | JSON> => {
  if (query != null) {
    try {
      if (!checkAndSaveToCache(query)) {
        //console.log('making your initial query!');
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
            checkAndSaveToCache(query, data);
            return data;
          });
        return response;
      } else {
        const queryString = typeof query === 'object' ? query.query : query;
        // console.log('query & response found in cache!');

        const response: any = JSON.parse(localStorage.getItem(queryString)!);
        return response;
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log('something wrong with fetching query!');
        console.log(err);
        // return createClientError(err.message);
      }
    }
  }
};

// define an interface for the various mutation types
export interface MutationTypeSpecifier {
  delete: string[];
  update: string[];
  create: string[];
}

// mutationTypes must match setup of MutationTypeSpecifier
export const mutationTypes: MutationTypeSpecifier = {
  delete: ['delete', 'remove'],
  update: ['update', 'edit'],
  create: ['create', 'add', 'new', 'make'],
};

// create function that handles saving data to local storage
export const checkAndSaveToCache = (
  // potentially add type parameter to check for mutations
  query: string | { query: string } | null,
  response?: object,
  variables?: object
): string | void | boolean => {
  if (query === null) {
    return 'query is null';
  }
  const queryString = typeof query === 'object' ? query.query : query;

  const key = generateKey(queryString, variables);
  //console.log(key);

  /// got to here on testing, consider checking mutation vs query before checking storage etc
  const data = localStorage.getItem(queryString);
  // add checker to see if query type is a mutation
  try {
    // parse query using graphql-tag feature
    const parsedQuery: DocumentNode = gql`
      ${query}
    `;
    //console.log(parsedQuery);
    // check if mutation is present in parsed query
    // check if any of the objects in definitions array has a mutation, return true if so
    const containsMutation: boolean = parsedQuery.definitions.some(
      (definition) =>
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'mutation'
    );

    if (containsMutation) {
      // parse query to extract name
      let mutationName: string | null = null;
      // traverse through AST
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
        let mutationString: string | null = null;
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
        console.log(typeof mutationAction);

        if (mutationAction) {
          mutationHandler(mutationAction, queryString);
        }
        // if (mutationName.includes(mutationTypes[delete][0]))
      } else {
        return 'mutationName is not defined!';
      }
    }
  } catch (err) {
    console.log('something went wrong when checking for mutations!');
  }

  if (data) {
    //console.log('found data!');
    return true;
  }
  // potentially add another else if to check if type is a mutation
  // if so, invoke mutation updater function
  else if (!data && response) {
    localStorage.setItem(queryString, JSON.stringify(response));
    return undefined;
  } else {
    return false;
  }
};

// function to handle mutation change update query/response
export const mutationHandler = (mutationType: string, mutationInfo: string) => {
  if (localStorage.hasOwnProperty(mutationInfo)) {
  }
};

// this is what code would look liek if you wanted to use one of our custom fetch functions
// write out code of implementation, use star wars api

// cacheiqIt(
//   'https://swapi.dev/api/people/1/',
//   `type Query {
//   name
// }`
// );
