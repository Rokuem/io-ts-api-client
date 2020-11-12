/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  testPathIgnorePatterns: ['__tests__/__helpers__/*', 'e2e'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: [path.join(__dirname, '*/**/*.@(spec|test).@(js|ts)?(x)')],
};
