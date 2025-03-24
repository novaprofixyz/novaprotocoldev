/**
 * Request Validators for NOVA Protocol
 * Validates incoming API requests against predefined schemas
 */

const Joi = require('joi');
const { createContextLogger } = require('./logger');
const validatorLogger = createContextLogger('Validator');

// Validation schemas
const schemas = {
  // User-related schemas
  userRegister: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  }),
  
  userLogin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  userProfileUpdate: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    riskTolerance: Joi.number().min(1).max(10),
    investmentGoals: Joi.array().items(Joi.string().valid(
      'GROWTH', 'INCOME', 'PRESERVATION', 'SPECULATION'
    )),
    preferredAssets: Joi.array().items(Joi.string())
  }),
  
  // AIDE-related schemas
  predictRequest: Joi.object({
    asset: Joi.string().required(),
    timeframe: Joi.string().valid('1h', '4h', '1d', '1w', '1m').required(),
    indicators: Joi.array().items(Joi.string())
  }),
  
  intentRequest: Joi.object({
    intent: Joi.string().required().min(5).max(500),
    context: Joi.object({
      riskLevel: Joi.string().valid('LOW', 'MEDIUM', 'HIGH'),
      timeHorizon: Joi.string().valid('SHORT', 'MEDIUM', 'LONG'),
      preferredAssets: Joi.array().items(Joi.string()),
      excludedAssets: Joi.array().items(Joi.string())
    })
  }),
  
  // Portfolio-related schemas
  portfolioOptimize: Joi.object({
    riskTolerance: Joi.number().min(1).max(10).required(),
    timeHorizon: Joi.string().valid('SHORT', 'MEDIUM', 'LONG').required(),
    goals: Joi.array().items(Joi.string()).required(),
    constraints: Joi.object({
      minAllocation: Joi.number().min(0).max(100),
      maxAllocation: Joi.number().min(0).max(100),
      excludedAssets: Joi.array().items(Joi.string())
    })
  }),
  
  portfolioRebalance: Joi.object({
    strategy: Joi.string().valid('THRESHOLD', 'CALENDAR', 'SMART').required(),
    threshold: Joi.when('strategy', {
      is: 'THRESHOLD',
      then: Joi.number().min(1).max(20).required(),
      otherwise: Joi.number().min(1).max(20)
    })
  })
};

/**
 * Middleware to validate request body against a schema
 * @param {string} schemaName - Name of the schema to validate against
 * @returns {Function} - Express middleware function
 */
function validateRequest(schemaName) {
  return (req, res, next) => {
    if (!schemas[schemaName]) {
      validatorLogger.error(`Schema not found: ${schemaName}`);
      return res.status(500).json({ error: true, message: 'Internal validation error' });
    }
    
    const { error, value } = schemas[schemaName].validate(req.body, { 
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      validatorLogger.debug(`Validation failed for ${schemaName}: ${errorMessage}`);
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.context.key,
          message: detail.message
        }))
      });
    }
    
    // Replace request body with validated value
    req.body = value;
    next();
  };
}

/**
 * Validation utilities for NOVA Protocol
 * Contains functions for input validation
 */

/**
 * Validates if a symbol is in correct format
 * @param {string} symbol - Asset symbol to validate
 * @returns {boolean} True if valid
 */
function validateSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }
  
  // Basic validation - alphanumeric, 1-10 characters
  return /^[A-Za-z0-9]{1,10}$/.test(symbol);
}

/**
 * Validates if a timeframe string is valid
 * @param {string} timeframe - Timeframe to validate (1d, 7d, 30d, 90d, 1y)
 * @returns {boolean} True if valid
 */
function validateTimeframe(timeframe) {
  if (!timeframe || typeof timeframe !== 'string') {
    return false;
  }
  
  const validTimeframes = ['1d', '7d', '30d', '90d', '1y'];
  return validTimeframes.includes(timeframe);
}

/**
 * Validates if a price value is valid
 * @param {number|string} price - Price to validate
 * @returns {boolean} True if valid
 */
function validatePrice(price) {
  if (price === undefined || price === null) {
    return false;
  }
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number
  if (typeof numPrice !== 'number' || isNaN(numPrice)) {
    return false;
  }
  
  // Price must be positive
  return numPrice >= 0;
}

/**
 * Validates if a date string or timestamp is valid
 * @param {string|number} date - Date to validate
 * @returns {boolean} True if valid
 */
function validateDate(date) {
  if (!date) {
    return false;
  }
  
  // If it's a number (timestamp)
  if (typeof date === 'number') {
    // Basic validation for timestamp (should be reasonable)
    const now = Date.now();
    return date > 0 && date <= now;
  }
  
  // If it's a string (ISO date)
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  
  return false;
}

/**
 * Validates if an amount is valid
 * @param {number|string} amount - Amount to validate
 * @returns {boolean} True if valid
 */
function validateAmount(amount) {
  if (amount === undefined || amount === null) {
    return false;
  }
  
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (typeof numAmount !== 'number' || isNaN(numAmount)) {
    return false;
  }
  
  // Amount must be positive
  return numAmount > 0;
}

/**
 * Validates if an API key has correct format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Basic validation - at least 16 characters, alphanumeric with possible special chars
  return /^[A-Za-z0-9\-_.]{16,}$/.test(apiKey);
}

/**
 * Validates if an email address is valid
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email);
}

/**
 * Validates if a URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

module.exports = {
  validateRequest,
  validateSymbol,
  validateTimeframe,
  validatePrice,
  validateDate,
  validateAmount,
  validateApiKey,
  validateEmail,
  validateUrl
}; 