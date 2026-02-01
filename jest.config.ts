import type { Config } from 'jest';

const config: Config = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@core/(.*)$': '<rootDir>/src/app/core/$1',
        '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
        '^@features/(.*)$': '<rootDir>/src/app/features/$1',
        '^@environments/(.*)$': '<rootDir>/src/environments/$1'
    },
    transform: {
        '^.+\\.(ts|js|mjs|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.html$',
                isolatedModules: true
            }
        ]
    },
    transformIgnorePatterns: [
        'node_modules/(?!.*\\.mjs$)'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/**/*.d.ts',
        '!src/main.ts',
        '!src/main.server.ts',
        '!src/server.ts',
        '!src/**/*.routes.ts',
        '!src/**/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text-summary', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testMatch: [
        '<rootDir>/src/**/*.spec.ts'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/.angular/'
    ],
    verbose: true,
    clearMocks: true,
    restoreMocks: true
};

export default config;
