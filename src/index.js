/**
 * NOVA Protocol - Main Application Entry Point
 * AI-driven Intelligent Financial Ecosystem
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { logger } = require('./utils/logger');
const { initializeBlockchainConnection } = require('./services/blockchain');
const apiRoutes = require('./interfaces/api');

// Initialize application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize blockchain connection
initializeBlockchainConnection()
  .then(() => {
    // Start server
    app.listen(PORT, () => {
      logger.info(`NOVA Protocol server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(error => {
    logger.error('Failed to initialize blockchain connection:', error);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 