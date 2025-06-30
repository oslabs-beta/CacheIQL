/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
    '^.+\\.ts$': 'ts-jest'
    }
};

