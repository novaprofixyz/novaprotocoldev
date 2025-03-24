/**
 * Rate Limiter Middleware for NOVA Protocol
 * Provides basic rate limiting to prevent API abuse
 */

const { createContextLogger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { get: getConfig } = require('../utils/config');

const rateLogger = createContextLogger('RateLimiter');

// Simple in-memory store for rate limiting
// In production, this would use Redis or similar distributed store
const ipRequests = {};

/**
 * Rate limiter middleware
 * Limits the number of requests per IP address within a time window
 * 
 * @param {Object} options - Rate limiter options
 * @param {number} [options.windowMs] - Time window in milliseconds
 * @param {number} [options.max] - Maximum number of requests within the window
 * @param {string} [options.message] - Error message when limit is exceeded
 * @returns {Function} Express middleware function
 */
function rateLimiter(options = {}) {
  const windowMs = options.windowMs || getConfig('api.rateLimit.windowMs', 15 * 60 * 1000); // 15 minutes default
  const max = options.max || getConfig('api.rateLimit.max', 100); // 100 requests default
  const message = options.message || 'Too many requests, please try again later.';
  
  // Cleanup function to remove old records
  const cleanup = () => {
    const now = Date.now();
    Object.keys(ipRequests).forEach(ip => {
      ipRequests[ip] = ipRequests[ip].filter(timestamp => now - timestamp < windowMs);
      
      // Remove IP if no requests in window
      if (ipRequests[ip].length === 0) {
        delete ipRequests[ip];
      }
    });
  };
  
  // Run cleanup every minute
  setInterval(cleanup, 60 * 1000);
  
  // Return middleware function
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    // Initialize array for this IP if it doesn't exist
    if (!ipRequests[ip]) {
      ipRequests[ip] = [];
    }
    
    // Get request count in the current window
    const now = Date.now();
    const requestsInWindow = ipRequests[ip].filter(timestamp => now - timestamp < windowMs);
    
    // Check if limit is exceeded
    if (requestsInWindow.length >= max) {
      rateLogger.warn(`Rate limit exceeded for IP: ${ip}`);
      
      // Set rate limit headers
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'));
    }
    
    // Add current request timestamp
    ipRequests[ip].push(now);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - requestsInWindow.length - 1);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
    
    next();
  };
}

module.exports = rateLimiter; 