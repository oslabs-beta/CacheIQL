import {
  createClientError,
  generateKey,
  cacheiqIt,
  checkAndSaveToCache,
} from './index';

const cacheIt = (query: string, variables: object): string | void => {
  return checkAndSaveToCache(query, variables);
};

module.exports = cacheIt;
