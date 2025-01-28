import { Query } from './types';


// Helper Function
// creates unique key for each query and response
export const generateKey = (query: Query, variables?: object): string => {
    query += 'IQL';
    return `${query}_${JSON.stringify(variables)}`;
  };
  