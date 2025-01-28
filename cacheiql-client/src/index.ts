// Entry point for client-side caching
import { cacheiqIt } from './export';

export const cacheIt = (
  endpoint: string,
  query: any,
  time?: number,
  variables?: object
): any => {
  return cacheiqIt(endpoint, query, time, variables);
};
