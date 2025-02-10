import { Query, Mutation } from './types';
import { generateKey } from './generatekey';
import { addItem, getItem, deleteItem, openDB } from './indexDB';
// cacheManager --- function for time-based cache management (removes cached data from local storage)
export const cacheManager = async (
  db: any,
  storeName: string,
  key: string,
  time: number = 60
) => {
  // the amount of time passed in is how long the cache will stay within local storage;

  setTimeout(() => {
    deleteItem(db, 'QueryStore', key);
  }, time * 1000);
};

// checkAndSaveToCache --- function that handles saving data to local storage
export const checkAndSaveToCache = (
  query: Query,
  response?: object,
  variables?: object
): string | void | boolean | object => {
  if (query === null) {
    return 'query is null';
  }

  const queryString = query;
  //console.log(queryString);

  // function to create key for caching (key will be query string, value is response)
  const key = generateKey(queryString, variables);

  // consider checking mutation vs query before checking storage etc
  const data = localStorage.getItem(queryString);

  if (data) {
    return true;
  }
  // if there was no data previously stored in cache,
  // add the query and the response to local storage
  else if (!data && response) {
    // invoke generate key to find the data type name to store as key
    // //generateKey(data);
    localStorage.setItem(queryString, JSON.stringify(response));
    return true;
  }
  // potentially add another else if to check if type is a mutation
  // if so, invoke mutation updater function
  else {
    return false;
  }
};

export const checkAndSaveToCache2 = async (
  db: any,

  storeName: string,
  itemKey: string,
  itemData?: any
): Promise<string | void | boolean | object> => {
  const item = await getItem(db, storeName, itemKey);
  if (item) {
    return true;
  } else if (!item && itemData) {
    await addItem(db, storeName, itemKey, itemData);
    return true;
  } else return false;
};
