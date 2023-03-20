import { Jest } from 'skuba';

export default Jest.mergePreset({
  coveragePathIgnorePatterns: ['src/testing'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/test\\.ts'],
});
