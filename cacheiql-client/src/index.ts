import { ClientErrorType } from './types';
import fs from 'fs';
const graphql = require('graphql');

// import client error type
//you want to import not export a type because it leads to more errors
//const { ClientErrorType } = require('./types');

// client error function
export const createClientError = (message: string): ClientErrorType => {
  return {
    log: message,
    status: 400,
    message: { err: 'Something went wrong in cacheqlIt fetch' },
  };
};

// function that creates unique key for each query and response
export const generateKey = (query: string, variables: object): string => {
  return `${query}_${JSON.stringify(variables)}`;
};

// function that makes fetch
export const cacheiqIt = async (
  endpoint: string,
  query: string,
  variables?: object
): Promise<string> => {
  try {
    // FINISH THIS PART
  } catch (err) {
    if (err instanceof Error) {
      console.log('something wrong with fetching query!');
      return err.message;
    }
  }
  // FIX THIS!!!!
  return 'temp';
};

// create function that handles saving data to local storage
export const checkAndSaveToCache = (
  query: string,
  variables: object
): string | void => {
  const key = generateKey(query, variables);
  const data = localStorage.getItem(query);
  if (data) {
    console.log('found data!');
    return;
  } else {
    // invoke function that makes graphql query
    localStorage.setItem(
      query,
      'data was succesfully stored within local storage'
    );
    return undefined;
  }
};

// function that checks if query is stored in local storage
// if so, grab that response and return it
