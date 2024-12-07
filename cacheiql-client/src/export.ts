import {
  createClientError,
  generateKey,
  cacheiqIt,
  checkAndSaveToCache,
} from './index';

const cacheIt = (testie: string): string => {
  return testie;
};

module.exports = cacheIt;
