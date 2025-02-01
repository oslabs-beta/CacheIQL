import { Query } from './types';

// use introspection to match type of mutation to type of initial query to connect them
// this lets us grab tha query that returns that type (review query returns type review)
// use the query we got from matching the types to make a query to update cach

// Helper Function
// creates unique key for each query and response
export const generateKey = (query: Query, variables?: object): string => {
// iterate through passed in data to find first instance of data type name to store as key
    query += 'IQL'; // --> not working (?), verify
    return `${query}_${JSON.stringify(variables)}`;
  };
  


