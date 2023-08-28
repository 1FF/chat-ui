module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js', '@testing-library/jest-dom/extend-expect'],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  preset: 'ts-jest',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)', '<rootDir>/__tests__/**/*.spec.js?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '\\.[j]sx?$': 'babel-jest',
  },
};
