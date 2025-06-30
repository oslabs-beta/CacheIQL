import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/**/*.test.ts'],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    globals: {
    'ts-jest': {
        tsconfig: 'tsconfig.test.json'
        }
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

export default config;
