import { cacheManager, checkAndSaveToCache } from '../main/cacheManagement';
import { Query } from '../main/types';

// cacheManager --- needs to invoke a setTimeout; function clears local storage/it's empty (need fake/mock data in local storage of jest DOM)

// mock items for functionality related to local storage
const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();

describe('cacheManager', () => {
    // make mock data to be stored
    let mockStorage: { [key: string]: string } = {};
    
    beforeEach(() => {
        mockSetItem.mockClear();
        jest.clearAllTimers();
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');

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
    })

    it('when cacheManager is called, setTimeout is invoked', () => {
        const queryKey = `{ people { name id mass gender } }`;
        const time = 10;
        cacheManager(queryKey, time);

        // creates and types for a setTimeout mock
        const setTimeoutMock = setTimeout as jest.MockedFunction<typeof setTimeout>;
        // destructuring --- Jest setTimeout mocks store args from mock calls in an array of arrays
        // so, this is assigning each arg (the callback function and time delay) in a mock call of setTimeout to variables; for readability
        const [callback, delay] = setTimeoutMock.mock.calls[0];

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(typeof callback).toBe('function');
        expect(delay).toBe(time * 1000);
    });

    it('after time expires, item is removed from localStorage', () => {
        const queryKey = `{ people { name id mass gender } }`;
        const time = 10;
        cacheManager(queryKey, time);

        const setTimeoutMock = setTimeout as jest.MockedFunction<typeof setTimeout>;
        const [callback] = setTimeoutMock.mock.calls[0];
        callback();

        expect(mockRemoveItem).toHaveBeenCalledTimes(1);
        expect(mockRemoveItem).toHaveBeenCalledWith(queryKey);
        expect(mockStorage[queryKey]).toBe(undefined);
    });

    it('if cacheManager is called w/ a different key, existing cached items are not affected', () => {
        const cachedItemKey = `{ people { name id mass gender } }`;
        const newKey = `{ review { _id:ID! movie_id: Int! review:String! } }`;

        // clear all calls of mockRemoveItem (was affecting test execution with carry over from previous timeouts)
        mockRemoveItem.mockClear();

        // schedule the two timeouts, get both items in cache
        cacheManager(cachedItemKey, 10);
        cacheManager(newKey, 10);

        const setTimeoutMock = setTimeout as jest.MockedFunction<typeof setTimeout>;
        // assigns the variable callback the value of a mock call with the second args (newKey)
        const [callback1, delay1] = setTimeoutMock.mock.calls[0];
        const [callback2, delay2] = setTimeoutMock.mock.calls[1];
        // simulate the expiration of the newKey item to be deleted
        callback2();

        expect(mockRemoveItem).toHaveBeenCalledWith(newKey);
        expect(mockRemoveItem).not.toHaveBeenCalledWith(cachedItemKey);
        expect(mockStorage[cachedItemKey]).toBeDefined();
    });

})

// RE: checkAndSaveToCache
describe('checkAndSaveToCache', () => {
    // make mock data to be stored
    let mockStorage: { [key: string]: string } = {};

    beforeEach(() => {
        mockSetItem.mockClear();
        mockGetItem.mockClear();
        mockRemoveItem.mockClear();

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
    })

    // needs to check and fetch an existing query that is cached from local storage (see lines 29, 35), return true
    it('returns true if an item exists in local storage', () => {
        const queryKey = `{ people { name id mass gender } }`;
        const result = checkAndSaveToCache(queryKey);

        expect(mockGetItem).toHaveBeenCalledWith(queryKey);
        expect(result).toBe(true);
        expect(mockSetItem).not.toHaveBeenCalled();
    })
    
    // needs to test if there isn't a query stored in local storage but the function is passed a response (from a DB call in export.ts), then it creates and set a new item in local storage
    it('sets new item in local storage and returns true if item does not exist but DB response is passed in', () => {
        const queryKey = `{ planets { name id climate } }`;
        const response = { data: { planets: [{ name: 'Tatooine', id: 3, climate: 'arid' }] } };

        // double check that storage is clear of item before calling the function
        delete mockStorage[queryKey];

        // call function w/ passed in query and response
        const result = checkAndSaveToCache(queryKey, response);

        expect(mockGetItem).toHaveBeenCalledWith(queryKey);
        expect(mockSetItem).toHaveBeenCalledWith(queryKey, JSON.stringify(response));
        expect(result).toBe(true);
    })

    // needs to also cover when data doesn't exist (no query & its response) and return false
    it('returns false if item does not exist and there is no response passed in', () => {
        const queryKey = `{ starships { id name model } }`;

        delete mockStorage[queryKey];

        const result = checkAndSaveToCache(queryKey);

        expect(mockGetItem).toHaveBeenCalledWith(queryKey);
        expect(mockSetItem).not.toHaveBeenCalled();
        expect(result).toBe(false);
    })

    it('returns "query is null" if null query is passed in', () => {
        const result = checkAndSaveToCache(null as any);
        expect(result).toBe('query is null');
    })
})