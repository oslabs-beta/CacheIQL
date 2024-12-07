import { ClientErrorType } from './types';
import fs from 'fs';
import graphql from 'graphql';

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
      return err.message;
    }
  }
};

// create function that handles saving data to local storage
export const checkAndSaveToCache = (
  query: string,
  response?: object,
  variables?: object,
): string | void | boolean => {
  const key = generateKey(query, variables);
  const data = localStorage.getItem(query);
  if (data) {
    console.log('found data!');
    return true;
  } else if (!data && response) {
    localStorage.setItem(
      query,
      JSON.stringify(response)
    );
    return undefined;
  } else {
    return false;
  }
};
