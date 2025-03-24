/**
 * Jest Setup File for NOVA Protocol
 * Configures the test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Use a different port for tests
process.env.DISABLE_AUTH = 'true'; // Disable authentication for tests
process.env.LOG_LEVEL = 'error'; // Minimize logging during tests

// Mock logger to avoid excessive console output during tests
jest.mock('../src/utils/logger', () => {
  const createLogger = () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  });
  
  return {
    createLogger,
    createContextLogger: (context) => createLogger()
  };
});

// Set longer timeout for tests
jest.setTimeout(10000);

// Global teardown
afterAll(async () => {
  // Clean up any resources after tests run
  console.log('Tests completed, cleaning up...');
}); 