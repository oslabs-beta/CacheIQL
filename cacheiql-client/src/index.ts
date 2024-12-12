import { ClientErrorType } from './types';
import gql from 'graphql-tag';
import { visit } from 'graphql';
import fs from 'fs';
import graphql from 'graphql';
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
  query: string,
  variables?: object,
): Promise<string | object | null | void> => {
  try {
    if(!checkAndSaveToCache(query)) {
      const response: Object = await fetch(endpoint, {
        method: "POST",
        headers: {
          // need to change this later to account for variables
          "Content-Type": "Application/JSON",
        },
        body: JSON.stringify({
          query
        })
      })
      checkAndSaveToCache(query, response);
      return response;
    } else{
      const response = localStorage.getItem(query);
      return response;
    }

  } catch (err) {
    if (err instanceof Error) {
      console.log('something wrong with fetching query!');
      return createClientError(err.message);
    }
  }
};

export const mutationTypes: object = {
  delete: ['delete', 'remove'],
  update: ['update', 'edit'],
  create: ['create', 'add', 'new', 'make']
}

// create function that handles saving data to local storage
export const checkAndSaveToCache = (
  // potentially add type parameter to check for mutations
  query: string,
  response?: object,
  variables?: object,
): string | void | boolean => {
  const key = generateKey(query, variables);
  const data = localStorage.getItem(query);

  // add checker to see if query type is a mutation
  try {
    // parse query using graphql-tag feature
    const parsedQuery: DocumentNode = gql`${query}`;
    // check if mutation is present in parsed query
    // check if any of the objects in definitions array has a mutation, return true if so
    const containsMutation: boolean = parsedQuery.definitions.some((definition) => 
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation'
    )

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
      }
    })

      // target first keyword in typeofmutation to determine type
      // check to see what type of mutation
      // invoke respective handler function
    }
  } catch (err) {
    console.log('something went wrong when checking for mutations!')
  }

  if (data) {
    console.log('found data!');
    return true;
  } 
  // potentially add another else if to check if type is a mutation
    // if so, invoke mutation updater function
  else if (!data && response) {
    localStorage.setItem(
      query,
      JSON.stringify(response)
    );
    return undefined;
  } 
  else {
    return false;
  }
};

// function to handle mutation change update query/response
export const mutationHandler = (key: string) => {
  if (localStorage.hasOwnProperty(key)) {

  }
}

