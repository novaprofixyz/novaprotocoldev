/**
 * Static Files Serving Middleware for NOVA Protocol
 * Serves static files with proper cache control
 */

const express = require('express');
const path = require('path');
const { createContextLogger } = require('../utils/logger');

const staticLogger = createContextLogger('StaticServe');

/**
 * Configure static file serving middleware
 * 
 * @param {Object} options - Options for static file serving
 * @returns {Function} Express middleware
 */
function staticServe(options = {}) {
  const { 
    maxAge = 86400000, // Default: 1 day
    immutable = false,
    etag = true,
    root = 'public'
  } = options;
  
  // Log static file serving configuration
  staticLogger.info(`Configuring static file serving from '${root}' with ${maxAge / 1000}s max-age`);
  
  // Use express.static with cache control
  const middleware = express.static(path.resolve(process.cwd(), root), {
    maxAge,
    immutable,
    etag,
    index: false, // Disable directory indexing
    setHeaders: (res, filePath) => {
      // Set appropriate cache headers
      if (filePath.endsWith('.svg') || filePath.endsWith('.png') || filePath.endsWith('.jpg')) {
        // Cache images longer
        res.setHeader('Cache-Control', `public, max-age=${maxAge / 1000}, immutable`);
      } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
        // Cache CSS/JS with cache busting
        res.setHeader('Cache-Control', `public, max-age=${maxAge / 1000}`);
      } else {
        // Default cache policy
        res.setHeader('Cache-Control', `public, max-age=${maxAge / 2000}`);
      }
      
      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  });
  
  return (req, res, next) => {
    // Log static file requests for debugging
    if (process.env.NODE_ENV === 'development') {
      staticLogger.debug(`Static file request: ${req.path}`);
    }
    
    middleware(req, res, next);
  };
}

module.exports = staticServe; 