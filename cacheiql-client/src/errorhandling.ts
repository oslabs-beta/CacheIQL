import { ClientErrorType } from './types';

// client error function//
export const createClientError = (message: string): ClientErrorType => {
    return {
      log: message,
      status: 400,
      message: { err: 'Something went wrong in cacheqlIt fetch' },
    };
  };