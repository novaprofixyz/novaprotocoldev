/**
 * NOVA Protocol - Main Application Entry Point
 * Setup Express server, middleware, and routes
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { createContextLogger } = require('./utils/logger');
const rateLimiter = require('./middleware/rateLimiter');
const { get: getConfig } = require('./utils/config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { setupSwagger } = require('./middleware/swagger');
const { authenticate } = require('./middleware/auth');
const corsMiddleware = require('./middleware/cors');
const staticServe = require('./middleware/staticServe');

// Initialize logger
const appLogger = createContextLogger('App');

// Create Express app
const app = express();

// Configure middleware
app.use(helmet()); // Security headers
app.use(corsMiddleware()); // Cross-origin resource sharing
app.use(express.json()); // Parse JSON request body
app.use(morgan('dev')); // HTTP request logging
app.use(rateLimiter()); // Rate limiting
app.use(requestLogger); // Request/response logging

// Serve static files from public directory
app.use('/static', staticServe({ 
  root: 'public',
  maxAge: 86400000 * 7, // 7 days
}));

// Setup Swagger API documentation
setupSwagger(app);

// Import routes
const marketRoutes = require('./routes/marketRoutes');
const aideRoutes = require('./routes/aideRoutes');
const systemRoutes = require('./routes/systemRoutes');

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'NOVA Protocol API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    logo: {
      standard: '/static/images/logo.svg',
      text: '/static/images/logo-text.svg',
      icon: '/static/images/logo-icon.svg'
    }
  });
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Apply authentication middleware conditionally based on environment
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTH === 'true') {
  appLogger.info('Authentication middleware enabled');
  app.use('/api/market', authenticate({ type: 'apiKey' }), marketRoutes);
  app.use('/api/aide', authenticate({ type: 'apiKey' }), aideRoutes);
  app.use('/api/system', authenticate({ type: 'apiKey' }), systemRoutes);
} else {
  appLogger.warn('Authentication disabled for development');
  app.use('/api/market', marketRoutes);
  app.use('/api/aide', aideRoutes);
  app.use('/api/system', systemRoutes);
}

// Add 404 handler
app.use(notFoundHandler);

// Add global error handler
app.use(errorHandler);

module.exports = app; 