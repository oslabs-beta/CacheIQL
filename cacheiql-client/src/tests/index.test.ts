// imports from index.ts
import { cacheiqIt } from '../main/export';
import { cacheIt } from '../main/index';
import { cacheiqItType, queryArray, mutationArray } from '../main/types';

// mock of cacheiqIt w/ fake data (give cacheIt )
jest.mock('../main/export', () => {
    return {
        cacheiqIt: jest.fn()
    };
})

describe('cacheIt', () => {
    const testArgs: cacheiqItType  = {
        endpoint: 'http://localhost:3000/graphql',
        query: `
            {
            people {
            name
            mass
            gender
            }
        }`,
        time: 5
    };

    it('calls cacheiqIt with correct arguments and returns result', () => {
    const testReturnValue = {
        data: {
        people: [
            { name: 'Luke Skywalker', mass: '75', gender: 'male' },
            { name: 'Darth Vader', mass: '136', gender: 'male' }
        ]
        }
    };

    // mocks up a return of cacheiqIt (function that cacheIt delegates to)
    (cacheiqIt as jest.Mock).mockReturnValue(testReturnValue);
    // calls cacheIt as a test
    const result = cacheIt(testArgs);

    // check if cacheiqIt was called and if cacheIt (entry point) returns what cacheiqIt returns
    // (i.e., did cacheIt execute properly as the entry point by returning the evaluated result of cacheiqIt)
    expect(cacheiqIt).toHaveBeenCalledWith(testArgs);
    expect(result).toEqual(testReturnValue);
    });
});