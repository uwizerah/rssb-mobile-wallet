import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '(/__tests__/.*|(\\.|/)(spec|e2e-spec))\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Only collect coverage from source files and ignore dist, node_modules, and test directories
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!**/dist/**',
    '!**/node_modules/**',
    '!**/test/**',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
