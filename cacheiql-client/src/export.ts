import { cacheiqItType, queryArray, mutationArray } from './types';
import { createClientError } from './errorhandling';
import {
  checkAndSaveToCache,
  cacheManager,
  checkAndSaveToCache2,
} from './cacheManagement';
import { matchMQ } from './mutationHandler';
import { grabQueryName } from './mutationHandler';
import { getItem, openDB } from './indexDB';

export const cacheiqIt = async ({
  endpoint,
  query,
  mutation,
  time,
}: cacheiqItType): Promise<string | object | null | void | JSON> => {
  if (query) {
    if (typeof query !== 'string') {
      //console.log(typeof query)
      console.error(
        createClientError(
          'Query passed in is invalid. Please check to make sure its a string'
        )
      );
    }

    // logic for querying DB for uncached queries, retrieving cached queries & responses from localStorage
    if (query !== null) {
      const dbName = 'Query';
      const storeName = 'QueryStore';
      const db = await openDB(dbName, storeName);

      try {
        const queryname = grabQueryName(query);
        const isCached = await checkAndSaveToCache2(db, storeName, queryname);
        if (!isCached) {
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
              // cache newly fetched data
              checkAndSaveToCache2(db, storeName, queryname, data);
              cacheManager(db, storeName, queryname, time);
              return data;
            });
          return response;
        } else {
          //       // variable to hold query string (either pulled from object or as is)

          console.log('query & response found in cache!');
          const response: any = await getItem(db, storeName, queryname);
          return response;

          // if query is not cached, make fetch to DB
          //     if (!checkAndSaveToCache(queryname) && typeof query === 'string') {
          //       const response: any = await fetch(endpoint, {
          //         method: 'POST',
          //         headers: {
          //           // need to change this later to account for variables
          //           'Content-Type': 'application/json',
          //         },
          //         body: JSON.stringify({ query: `query${query}` }),
          //       })
          //         .then((res) => res.json())
          //         .then((data) => {
          //           // error handling for if data contains an error
          //           if (data.errors) {
          //             console.error(data.errors[0]);
          //             return;
          //           }
          //           // cache newly fetched data
          //           checkAndSaveToCache(queryname, data);
          //           cacheManager(queryname, time);
          //           return data;
          //         });
          //       return response;
          //     } else {
          //       // variable to hold query string (either pulled from object or as is)
          //       const queryString = grabQueryName(query);
          //       // instead of storing the error object, this returns early with the error
          //       // reassurance operator !
          //       //console.log(queryString);
          //       if (JSON.parse(localStorage.getItem(queryname)!).errors) {
          //         console.error(
          //           JSON.parse(localStorage.getItem(queryname)!).errors[0]
          //         );
          //         return;
          //       }
          //       // console.log('query & response found in cache!');
          //       const response: any = JSON.parse(localStorage.getItem(queryname)!);
          //       return response;
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
              matchMQ(endpoint);
              //cacheManager(mutation, time);
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
