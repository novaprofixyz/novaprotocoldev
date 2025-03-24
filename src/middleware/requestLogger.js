/**
 * Request Logger Middleware for NOVA Protocol
 * Provides detailed request logging for debugging and monitoring
 */

const { createContextLogger } = require('../utils/logger');
const requestLogger = createContextLogger('RequestLogger');

/**
 * Request logging middleware
 * Logs details about incoming requests and their responses
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function logRequest(req, res, next) {
  // Get start time
  const startTime = Date.now();
  
  // Generate a request ID
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Add request ID to request object for use in other middleware
  req.requestId = requestId;
  
  // Basic request details
  const logData = {
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };
  
  // Log the request in debug mode
  requestLogger.debug(`Request [${requestId}]: ${req.method} ${req.originalUrl}`, logData);
  
  // Capture original end method
  const originalEnd = res.end;
  
  // Override end method to log response
  res.end = function(...args) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Restore original end method
    res.end = originalEnd;
    
    // Add response details to log data
    const responseData = {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    };
    
    // Log based on status code
    if (res.statusCode >= 500) {
      requestLogger.error(`Response [${requestId}]: ${res.statusCode} (${duration}ms)`, responseData);
    } else if (res.statusCode >= 400) {
      requestLogger.warn(`Response [${requestId}]: ${res.statusCode} (${duration}ms)`, responseData);
    } else {
      requestLogger.info(`Response [${requestId}]: ${res.statusCode} (${duration}ms)`, responseData);
    }
    
    // Call original end method
    return originalEnd.apply(res, args);
  };
  
  next();
}

module.exports = logRequest; 