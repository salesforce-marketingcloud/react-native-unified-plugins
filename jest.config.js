/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
  },
  collectCoverageFrom: [
    'packages/*/src/*Module.ts',
    'packages/iam/src/types.ts',
    '!packages/*/src/Native*Module.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  clearMocks: true,
  resetModules: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'es2020',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          isolatedModules: true,
          jsx: 'react-native',
          types: ['jest', 'node'],
        },
      },
    ],
  },
};
