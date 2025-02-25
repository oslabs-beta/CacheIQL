import { cacheiqItType } from "./types";
import { createClientError } from "./errorhandling";
import { checkAndSaveToCache, cacheManager } from "./cacheManagement";
import { matchMQ } from "./mutationHandler";
import { grabQueryName } from "./mutationHandler";

// cacheiqIt --- function that makes fetch
export const cacheiqIt = async ({
  endpoint,
  query,
  mutation,
  time,
}: cacheiqItType): Promise<string | object | null | void | JSON> => {
  if (query) {
    if (typeof query !== "string") {
      console.error(
        createClientError(
          "Query passed in is invalid. Please check to make sure its a string"
        )
      );
    }

    // logic for querying DB for uncached queries, retrieving cached queries & responses from localStorage
    if (query !== null) {
      try {
        const queryname: string = grabQueryName(query);
        // if query is not cached, make fetch to DB
        if (!checkAndSaveToCache(queryname) && typeof query === "string") {
          const response: Promise<object> = await fetch(endpoint, {
            method: "POST",
            headers: {
              // need to change this later to account for variables
              "Content-Type": "application/json",
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
              checkAndSaveToCache(queryname, data);
              cacheManager(queryname, time);
              return data;
            });
          return response;
        } else {
          // instead of storing the error object, this returns early with the error
          // reassurance operator !
          if (JSON.parse(localStorage.getItem(queryname)!).errors) {
            console.error(
              JSON.parse(localStorage.getItem(queryname)!).errors[0]
            );
            return;
          }
          const response: object = JSON.parse(localStorage.getItem(queryname)!);
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

  if (mutation) {
    if (typeof mutation !== "string") {
      console.error(
        createClientError(
          "Mutation passed in is invalid. Please check to make sure its a string."
        )
      );
    }

    if (mutation !== null) {
      try {
        // if query is not cached, make fetch to DB
        if (!checkAndSaveToCache(mutation) && typeof mutation === "string") {
          const response: Promise<object> = await fetch(endpoint, {
            method: "POST",
            headers: {
              // need to change this later to account for variables
              "Content-Type": "application/json",
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
              console.log('matchMQ func:',  matchMQ(endpoint));
              cacheManager(mutation, time);
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
          const response: object = JSON.parse(
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

