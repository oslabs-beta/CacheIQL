import gql from 'graphql-tag';
import { queryArray, mutationArray } from '../main/types';
import { visit } from 'graphql';
import { DocumentNode } from 'graphql';
import { createClientError } from '../main/errorhandling';
import { matchMQ, grabQueryName } from '../main/mutationHandler';

// mock items for functionality related to local storage
const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();
// mock fetch for the fetches used in functions
global.fetch = jest.fn();
// mock for createClientError (see grabQueryName test block, starts on line 220)
jest.mock('../main/errorhandling', () => ({
    createClientError: jest.fn((msg: string) => ({ error: msg })),
}));

/* matchMQ function */
describe('matchMQ', () => {
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

    // introspection fetch
    it('fetches mutation and query schemas and stores fields', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            mutationType: {
                                fields: [
                                    {
                                        name: 'addReview',
                                        type: {
                                            name: 'Review',
                                            kind: 'OBJECT',
                                            ofType: null,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                }),
            })
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            queryType: {
                                fields: [
                                    {
                                        name: 'review',
                                        type: {
                                            name: null,
                                            kind: 'OBJECT',
                                            ofType: {
                                                name: 'Review',
                                                kind: 'OBJECT',
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                }),
            });

        await matchMQ('http://mock-endpoint.com');
        expect(fetch).toHaveBeenCalledTimes(2);

        // fetches mutation and query scehma from the endpoint

        // properly parses and stores schema in the arrays

    });

    // matching functionality
    it('removes matching cache key from localStorage when mutation matches query return type', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            mutationType: {
                                fields: [
                                    {
                                        name: 'addReview',
                                        type: { name: 'Review', kind: 'OBJECT', ofType: null },
                                    },
                                ],
                            },
                        },
                    },
                }),
            })
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            queryType: {
                                fields: [
                                    {
                                        name: 'review',
                                        type: {
                                            name: null,
                                            kind: 'OBJECT',
                                            ofType: { name: 'Review', kind: 'OBJECT' },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                }),
            });

        await matchMQ('http://mock-endpoint.com');
        // when mutation and query types match: correct match is logged; removes associated key from localStorage (a call of mockRemoveItem is sufficient)
        expect(mockRemoveItem).toHaveBeenCalledWith('review');
        expect(Object.keys(mockStorage)).not.toContain('review');
    });

    // localStorage with mutations that have no matches in cache
    it('does not remove any cache keys when types do not match', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            mutationType: {
                                fields: [
                                    {
                                        name: 'addComment',
                                        type: { name: 'Comment', kind: 'OBJECT', ofType: null },
                                    },
                                ],
                            },
                        },
                    },
                }),
            })
            .mockResolvedValueOnce({
                json: async () => ({
                    data: {
                        __schema: {
                            queryType: {
                                fields: [
                                    {
                                        name: 'review',
                                        type: {
                                            name: null,
                                            kind: 'OBJECT',
                                            ofType: { name: 'Review', kind: 'OBJECT' },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                }),
            });

        await matchMQ('http://mock-endpoint.com');
        // when no types match: nothing is removed from localStorage (mockRemove method isn't called)
        expect(mockRemoveItem).not.toHaveBeenCalled();
    });

    // RE: ensuring inputs being well-formed, error handling, etc. --- export.ts ensures data and type safety (tests in corresponding test file)
    // this is a utility basically, functions in mutationHandler.ts will have sound inputs to work with by the time they're invoked in export.ts
})


/* grabQueryName */
describe('grabQueryName', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    // returns field name when given a mutation
    it('extracts field name from a simple mutation', () => {
        const mutation = `
        mutation {
            addReview(movie_id: 1, review: "Great movie!") {
                _id
            }
        }`;
        const result = grabQueryName(mutation);
        expect(result).toBe('addReview');
    });
    // field name is extracted from query
    it('extracts field name from a simple query', () => {
        const query = `
        query {
            people {
                name
                id
            }
        }`;
        const result = grabQueryName(query);
        expect(result).toBe('people');
    });
    // finds the field name (mutation's type)
    it('extracts field name from a named operation', () => {
        const mutation = `
        mutation AddAReview {
            addReview(movie_id: 1, review: "Good!") {
                _id
            }
        }`;
        const result = grabQueryName(mutation);
        expect(result).toBe('addReview');
    });
    // returns first field name in selection set (which is the mutation's type)
    it('returns the first field name when multiple fields exist', () => {
        const mutation = `
        mutation {
            addReview(movie_id: 1, review: "Great!") {
                _id
            }
            deleteReview(id: 2) {
                    success
            }
        }`;
        const result = grabQueryName(mutation);
        expect(result).toBe('addReview');
    });
    // creates client error for bad mutations
    it('handles malformed GraphQL input (syntax error)', () => {
        const badQuery = `
        mutation {
            addReview(
        `;
        const result = grabQueryName(badQuery);
        expect(createClientError).toHaveBeenCalled();
        expect(result).toHaveProperty('error');
    });
    // error handling for invalid GraphQL strings
    it('handles completely invalid GraphQL string', () => {
        const badString = `hello world`;
        const result = grabQueryName(badString);
        expect(createClientError).toHaveBeenCalled();
        expect(result).toHaveProperty('error');
    });
    // error handling / empty strings
    it('handles empty string input', () => {
        const result = grabQueryName('');
        expect(createClientError).toHaveBeenCalled();
        expect(result).toHaveProperty('error');
    });
});
