/**
 * NOVA Protocol - Server Entry Point
 * Starts the express application and handles server lifecycle
 */

const app = require('./app');
const { createContextLogger } = require('./utils/logger');
const { get: getConfig } = require('./utils/config');

// Initialize logger
const serverLogger = createContextLogger('Server');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  serverLogger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

// Set port
const PORT = process.env.PORT || getConfig('server.port', 3000);

// Start server
const server = app.listen(PORT, () => {
  serverLogger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  serverLogger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  serverLogger.error('UNHANDLED REJECTION! Shutting down...', error);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  serverLogger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    serverLogger.info('Process terminated.');
  });
});

module.exports = server; 