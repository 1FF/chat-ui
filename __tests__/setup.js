import '@testing-library/jest-dom';
import 'jest-location-mock';

beforeAll(() => {
  process.env.HOST = 'https://usa.yourketo.test/';
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  localStorage.clear();
});

Object.defineProperty(document, 'fonts', {
  value: { check: () => true },
})