import { Query } from "./types";
import { generateKey } from './generatekey';

export const cacheManager = (key: Query, time: number = 60) => {
    // the number of time passed in is how long the cache will stay within local storage;
    setTimeout(() => {
      const query = typeof key === 'object' ? key.query : key;
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) === query) {
          console.log('1 second has passed');
          localStorage.removeItem(query);
          return;
        }
      }
    }, time * 1000);
    // deletes only cacheiql-client items from the local storage

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
  
    // call mutationHandler here to check for mutation(s) on query
    // if mutation exists, update query keys value in localstorage instead of storing result as a new key value pair
  
    // {query, changeData} : 'pears, bananas'
  
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
  