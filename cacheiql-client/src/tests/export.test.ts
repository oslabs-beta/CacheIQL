import { cacheiqItType } from '../main/types';
import { createClientError } from '../main/errorhandling';
import { checkAndSaveToCache, cacheManager } from '../main/cacheManagement';
import { matchMQ, grabQueryName } from '../main/mutationHandler';
import { cacheiqIt } from '../main/export';

// cacheiqIt --- function that makes the fetch

// mocks for functions used within the cacheiqIt func
jest.mock('../main/cacheManagement', () => ({
    checkAndSaveToCache: jest.fn(),
    cacheManager: jest.fn()
}));
jest.mock('../main/mutationHandler', () => ({
    grabQueryName: jest.fn().mockReturnValue('testQuery'),
    matchMQ: jest.fn()
}));
// mock items for functionality related to local storage (to simulate what cache mgmt. funcs are doing)
const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();
// mock for fetch function (needed for the POSTs that are being tested)
global.fetch = jest.fn();

describe('cacheiqIt', () => {
    // mock data for tests
    let mockStorage: { [key: string]: string } = {};
    
    beforeEach(() => {
        mockStorage = {
        '{ people { name id mass gender } }': JSON.stringify({
            data: {
                    people: [
                        { name: 'Luke Skywalker', id: 1, mass: '75', gender: 'male' },
                        { name: 'Darth Vader', id: 2, mass: '136', gender: 'male' }
                    ]
                }
            }),
        '{ review { _id:ID! movie_id: Int! review:String! } }': JSON.stringify({
            data: {
                    review: [
                        { _id: '1', movie_id: 42, review: 'Great movie!' }
                    ]
                }
            }),
        };

        // mock local storage as a property on DOM window
        Object.defineProperty(window, 'localStorage', {
            value: {
                get length() {
                    return Object.keys(mockStorage).length;
                },
                key: (i: number) => Object.keys(mockStorage)[i],
                setItem: (key: string, value: string) => {
                    mockSetItem(key, value);
                    mockStorage[key] = value;
                },
                getItem: (key: string) => {
                    mockGetItem(key);
                    return mockStorage[key];
                },
                removeItem: (key: string) => {
                    mockRemoveItem(key);
                    delete mockStorage[key];
                },
            },
            configurable: true,
        });
        // clear before each describe block runs
        jest.clearAllMocks();
    });
    
    describe('Query logic', () => {
        it('fetches and caches uncached query', async () => {
            const mockResponse = { data: { test: 'value' }};
            
            (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(false);
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve(mockResponse)
            });
            
            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: '{ people { name id mass gender } }',
                mutation: undefined,
                time: 10
            });
            
            // if query is not in cache (checkAndSaveToCache returns falsy), a POST request is made to GraphQL endpoint, cacheManager stores item
            // recall testQuery is a string, and a mock return of grabQueryName function (see top of file)
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(checkAndSaveToCache).toHaveBeenCalledWith('testQuery');
            expect(cacheManager).toHaveBeenLastCalledWith('testQuery', 10);
            expect(result).toEqual(mockResponse);
        });

        it('returns cached query from localStorage', async () => {
            // making sure grabQueryName mock returns the key/value pair in mockStorage
            (grabQueryName as jest.Mock).mockReturnValueOnce('{ people { name id mass gender } }');
            // making sure cache exists
            (checkAndSaveToCache as jest.Mock).mockReturnValue(true);

            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: '{ people { name id mass gender } }',
                mutation: undefined,
                time: 10
            });
            // no fetch made, and invocation of cacheiqIt returns what's in mock storage
            expect(fetch).not.toHaveBeenCalled();
            expect(result).toEqual(JSON.parse(mockStorage['{ people { name id mass gender } }']))
        });

        it('logs error and returns undefined on query error response', async () => {
            const mockErrorResponse = { errors: [{message: 'Query failed'}]};
            console.error = jest.fn();

            (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(false);
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve(mockErrorResponse),
            });

            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: '{ badQuery }',
                mutation: undefined,
                time: 10,
            });

            expect(console.error).toHaveBeenCalledWith(mockErrorResponse.errors[0]);
            expect(result).toBeUndefined;
        });

        it('logs client error if query is not a string', async () => {
            console.error = jest.fn();

            await cacheiqIt({
                endpoint: '/graphql',
                query: {} as any,
                mutation: undefined,
                time: 10,
            });

            expect(console.error).toHaveBeenCalledWith(createClientError('Query passed in is invalid. Please check to make sure its a string'));
        });
    });

    describe('Mutation logic', () => {
        it('fetches and caches an uncached item', async () => {
            const mockResponse = { data: { success: true } };

            (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(false);
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve(mockResponse)
            });

            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: undefined,
                mutation: '{ addPerson(name: \'test\') { id } }',
                time: 10,
            });
            // if mutation is not cached (checkAndSaveToCache returns falsy), a POST request is made to GraphQL endpoint, cached in localStorage
                // if POST is successful, then matchMQ is invoked
                // mutation gets cached
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(matchMQ).toHaveBeenCalledWith('/graphql');
            expect(cacheManager).toHaveBeenCalledWith('{ addPerson(name: \'test\') { id } }', 10);
            expect(result).toEqual(mockResponse);
        })

        it('returns a cached mutation from localStorage', async () => {
            const mutation = '{ review { _id:ID! movie_id: Int! review:String! } }';
            (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(true);

            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: undefined,
                mutation,
                time: 10
            });

            // if mutation already exists in the cache, item is fetched from localStorage and returned
            expect(fetch).not.toHaveBeenCalled();
            expect(result).toEqual(JSON.parse(mockStorage[mutation]));
        })

        it('error is logged and returns undefined on mutation error response', async () => {
            const mockErrorResponse = { errors: [{message: 'Mutation failed'}]};
            console.error = jest.fn();

            (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(false);
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve(mockErrorResponse)
            })

            const result = await cacheiqIt({
                endpoint: '/graphql',
                query: undefined,
                mutation: '{ brokenMutation }',
                time: 10,
            });

            expect(console.error).toHaveBeenCalledWith(({ message: 'Mutation failed' }));
            expect(result).toBeUndefined();

        });

        it('logs client error if mutation is not a string', async () => {
            console.error = jest.fn();

            await cacheiqIt({
                endpoint: '/graphql',
                query: undefined,
                mutation: 456 as any,
                time: 10,
            });

            expect(console.error).toHaveBeenCalledWith(
                createClientError('Mutation passed in is invalid. Please check to make sure its a string.')
            );
    });

        describe('Error handling', () => {
            it('returns a client error when fetch throws error', async () => {
                const error = new Error('Network failure');
                (checkAndSaveToCache as jest.Mock).mockReturnValueOnce(false);
                (fetch as jest.Mock).mockRejectedValueOnce(error);
                console.log = jest.fn();

                const result = await cacheiqIt({
                    endpoint: '/graphql',
                    query: '{testQuery}',
                    mutation: undefined,
                    time: 10
                })

                expect(console.log).toHaveBeenLastCalledWith(`${error}, Something wrong with fetching query through GraphQL!`);
                expect(result).toEqual(createClientError('Network failure'));
            })
        })

    });
});
