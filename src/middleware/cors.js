/**
 * Custom CORS Middleware for NOVA Protocol
 * Provides more control over CORS settings than the standard cors package
 */

const { createContextLogger } = require('../utils/logger');
const { get: getConfig } = require('../utils/config');

const corsLogger = createContextLogger('CORS');

/**
 * Custom CORS middleware factory
 * 
 * @param {Object} options - CORS options
 * @returns {Function} Express middleware function
 */
function corsMiddleware(options = {}) {
  // Get allowed origins from configuration
  const allowedOrigins = options.allowedOrigins || 
    getConfig('api.cors.allowedOrigins', ['http://localhost:3000']);
  
  // Determine if all origins should be allowed
  const allowAllOrigins = allowedOrigins.includes('*');
  
  // Convert allowedOrigins to a Set for faster lookups
  const originsSet = new Set(allowedOrigins);
  
  // Log configuration
  corsLogger.debug(`CORS configured with ${allowAllOrigins ? 'all origins allowed' : allowedOrigins.length + ' allowed origins'}`);
  
  // Return the middleware function
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    // Set CORS headers based on origin
    if (allowAllOrigins) {
      // Allow any origin
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (origin && (originsSet.has(origin) || originsSet.has('*'))) {
      // Allow specific origin
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    
    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', options.methods || 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', options.allowedHeaders || 'Content-Type,Authorization,X-API-KEY');
    
    // Allow credentials if specified
    if (options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Set max age for preflight requests
    if (options.maxAge) {
      res.setHeader('Access-Control-Max-Age', options.maxAge);
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    // Process the request
    next();
  };
}

module.exports = corsMiddleware; 