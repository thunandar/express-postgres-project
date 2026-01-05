module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/seeders/**',
    '!src/config/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 15000,

  /**
   * TESTING CONFIGURATION
   *
   * maxWorkers controls parallel test execution:
   * - maxWorkers: 1 = Sequential (most reliable for shared database)
   * - maxWorkers: '50%' = Use half of CPU cores
   * - maxWorkers: '100%' = Use all CPU cores
   *
   * Current setup: Sequential execution to ensure 100% test reliability
   * with shared test database and TRUNCATE-based cleanup.
   *
   * For true parallel execution, consider:
   * - Separate database per worker (complex setup)
   * - Transaction rollback (requires CLS integration)
   * - In-memory SQLite for tests (fastest but different DB)
   */
  maxWorkers: 1 // Sequential for 100% reliability
};
