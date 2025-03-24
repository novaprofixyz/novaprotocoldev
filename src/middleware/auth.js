/**
 * Authentication Middleware for NOVA Protocol
 * Provides basic API key authentication and authorization
 */

const { createContextLogger } = require('../utils/logger');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const { get: getConfig } = require('../utils/config');

const authLogger = createContextLogger('Auth');

/**
 * API key authentication middleware
 * Validates the X-API-KEY header against configured API keys
 * 
 * @returns {Function} Express middleware function
 */
function apiKeyAuth() {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    // Skip auth for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Skip auth if we're in development mode without security
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      authLogger.warn('Authentication disabled in development mode');
      return next();
    }
    
    // Check if API key is provided
    if (!apiKey) {
      authLogger.warn('API key missing');
      return next(new AuthenticationError('API key is required'));
    }
    
    // In production, this would validate against a database or secure store
    // For MVP, we'll use a simple check against environment variables
    const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['dev-key'];
    
    if (!validApiKeys.includes(apiKey)) {
      authLogger.warn(`Invalid API key: ${apiKey.substring(0, 4)}...`);
      return next(new AuthenticationError('Invalid API key'));
    }
    
    // API key is valid, proceed
    authLogger.debug(`Authenticated request with API key: ${apiKey.substring(0, 4)}...`);
    
    // Store authentication info in request for later use
    req.auth = {
      apiKey,
      authenticated: true,
      // In a real implementation, this would include user info, roles, etc.
      userInfo: {
        id: 'demo-user',
        roles: ['user']
      }
    };
    
    next();
  };
}

/**
 * Role-based authorization middleware
 * Requires the user to have one of the specified roles
 * 
 * @param {string[]} roles - Array of required roles
 * @returns {Function} Express middleware function
 */
function requireRoles(roles = []) {
  return (req, res, next) => {
    // Skip if auth is disabled in development
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      return next();
    }
    
    // Ensure authentication middleware ran first
    if (!req.auth || !req.auth.authenticated) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    // Check if user has required role
    const userRoles = req.auth.userInfo.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      authLogger.warn(`Unauthorized access attempt: missing required role(s) [${roles.join(', ')}]`);
      return next(new AuthorizationError('You do not have permission to perform this action'));
    }
    
    // User has required role, proceed
    next();
  };
}

/**
 * Authentication middleware (factory function)
 * Creates middleware functions based on authentication options
 * 
 * @param {Object} options - Authentication options
 * @returns {Function} Express middleware function
 */
function authenticate(options = {}) {
  const authType = options.type || 'apiKey';
  
  switch (authType) {
    case 'apiKey':
      return apiKeyAuth();
    case 'jwt':
      // Future implementation could include JWT authentication
      throw new Error('JWT authentication not implemented yet');
    case 'oauth':
      // Future implementation could include OAuth authentication
      throw new Error('OAuth authentication not implemented yet');
    default:
      throw new Error(`Unsupported authentication type: ${authType}`);
  }
}

module.exports = {
  authenticate,
  requireRoles
}; 