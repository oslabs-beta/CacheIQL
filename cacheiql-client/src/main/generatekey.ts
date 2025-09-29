import { Query } from './types';


// Helper Function
// creates unique key for each query and response
export const generateKey = (query: Query, variables?: object): string => {
// iterate through passed in data to find first instance of data type name to store as key
    return `${query}_${JSON.stringify(variables)}`;
  };
  


