// Entry point for client-side caching
import { cacheiqIt } from './export';
import { cacheiqItType, queryArray, mutationArray } from './types';

//indexedDB.deleteDatabase('Schema');
export const cacheIt = ({
  endpoint,
  query,
  mutation,
  time,
}: cacheiqItType): any => {
  return cacheiqIt({ endpoint, query, mutation, time });
};
