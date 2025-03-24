/**
 * Error Handler Middleware for NOVA Protocol
 * Provides centralized error handling for the application
 */

const { createContextLogger } = require('../utils/logger');
const errorLogger = createContextLogger('ErrorHandler');

/**
 * Central error handling middleware
 * Formats errors and sends appropriate responses
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'SERVER_ERROR';
  let details = err.details || undefined;
  let stack = undefined;
  
  // Log the error
  errorLogger.error(`${errorCode} (${statusCode}): ${message}`, err);
  
  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Handle Joi/Validation errors
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // Handle JSON parsing errors
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    // Handle MongoDB duplicate key errors (for future database integration)
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTITY';
    message = 'Entity already exists';
  }
  
  // Send the error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      status: statusCode,
      details,
      stack
    }
  });
}

/**
 * Not found error handler
 * Handles 404 errors for routes that don't exist
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function notFoundHandler(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
}

module.exports = {
  errorHandler,
  notFoundHandler
}; 