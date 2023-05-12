const { defaults } = require('jest-config');
module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ]
};