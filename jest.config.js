module.exports = {
  rootDir: process.cwd(),
  verbose: true,
  moduleFileExtensions: ['ts', 'js'],
  globals: {
    window: {},
    'ts-jest': {
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'jsdom',

  setupFiles: ['jest-date-mock'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  collectCoverage: true,
  coverageReporters: ['json', 'json-summary', 'lcov', 'text', 'text-summary'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['**/*.ts', '!**/*.*.ts', '!**/index.ts', '!src/helpers.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
