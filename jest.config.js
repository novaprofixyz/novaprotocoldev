/**
 * Jest configuration for NOVA Protocol
 */

module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  // before executing the test
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/'
  ],
  
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],
  
  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',
  
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // A list of paths to modules that run some code to configure the testing framework
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // The test timeout in milliseconds
  testTimeout: 10000
}; 