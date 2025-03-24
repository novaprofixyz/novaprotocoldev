/**
 * Request Validator Middleware for NOVA Protocol
 * Provides validation for API request parameters
 */

const { ValidationError } = require('../utils/errors');
const { createContextLogger } = require('../utils/logger');
const validators = require('../utils/validators');

const validatorLogger = createContextLogger('Validator');

/**
 * Creates a validation middleware for a specific schema
 * 
 * @param {string} type - Type of validation to perform (body, params, query)
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function createValidator(type, schema) {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (type) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        default:
          return next(new Error('Invalid validation type'));
      }
      
      validatorLogger.debug(`Validating ${type}: ${JSON.stringify(dataToValidate)}`);
      
      // Simple validation based on schema keys and their expected types
      const errors = [];
      
      for (const [key, config] of Object.entries(schema)) {
        const value = dataToValidate[key];
        
        // Check required fields
        if (config.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field: key,
            message: `${key} is required`,
            code: 'REQUIRED'
          });
          continue;
        }
        
        // Skip validation if value is not provided and not required
        if (value === undefined || value === null) {
          continue;
        }
        
        // Type validation
        if (config.type && !validateType(value, config.type)) {
          errors.push({
            field: key,
            message: `${key} must be of type ${config.type}`,
            code: 'INVALID_TYPE'
          });
          continue;
        }
        
        // Custom validators
        if (config.validator && typeof config.validator === 'function') {
          const isValid = config.validator(value);
          if (!isValid) {
            errors.push({
              field: key,
              message: config.message || `${key} is invalid`,
              code: config.code || 'INVALID_VALUE'
            });
          }
        }
        
        // Use shared validators if specified
        if (config.validate && typeof config.validate === 'string' && validators[config.validate]) {
          const isValid = validators[config.validate](value);
          if (!isValid) {
            errors.push({
              field: key,
              message: config.message || `${key} is invalid`,
              code: config.code || 'INVALID_VALUE'
            });
          }
        }
        
        // Check enum values
        if (config.enum && Array.isArray(config.enum) && !config.enum.includes(value)) {
          errors.push({
            field: key,
            message: `${key} must be one of: ${config.enum.join(', ')}`,
            code: 'INVALID_ENUM'
          });
        }
        
        // Check min/max for numbers
        if (config.type === 'number' || config.type === 'integer') {
          if (config.min !== undefined && value < config.min) {
            errors.push({
              field: key,
              message: `${key} must be at least ${config.min}`,
              code: 'MIN_VALUE'
            });
          }
          
          if (config.max !== undefined && value > config.max) {
            errors.push({
              field: key,
              message: `${key} must be at most ${config.max}`,
              code: 'MAX_VALUE'
            });
          }
        }
        
        // Check min/max length for strings
        if (config.type === 'string') {
          if (config.minLength !== undefined && value.length < config.minLength) {
            errors.push({
              field: key,
              message: `${key} must be at least ${config.minLength} characters`,
              code: 'MIN_LENGTH'
            });
          }
          
          if (config.maxLength !== undefined && value.length > config.maxLength) {
            errors.push({
              field: key,
              message: `${key} must be at most ${config.maxLength} characters`,
              code: 'MAX_LENGTH'
            });
          }
        }
      }
      
      if (errors.length > 0) {
        validatorLogger.warn(`Validation failed: ${JSON.stringify(errors)}`);
        return next(new ValidationError(
          `Validation failed: ${errors.map(e => e.message).join(', ')}`,
          errors
        ));
      }
      
      // If validation passes, proceed to the next middleware
      next();
    } catch (error) {
      validatorLogger.error(`Validation error: ${error.message}`);
      next(new ValidationError(
        `Validation error: ${error.message}`,
        [{
          field: 'unknown',
          message: error.message,
          code: 'VALIDATION_ERROR'
        }]
      ));
    }
  };
}

/**
 * Validate that a value matches the expected type
 * 
 * @param {*} value - Value to validate
 * @param {string} type - Expected type
 * @returns {boolean} Whether the value matches the type
 */
function validateType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

/**
 * Create a validator for request body
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function validateBody(schema) {
  return createValidator('body', schema);
}

/**
 * Create a validator for request parameters
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function validateParams(schema) {
  return createValidator('params', schema);
}

/**
 * Create a validator for query parameters
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function validateQuery(schema) {
  return createValidator('query', schema);
}

module.exports = {
  validateBody,
  validateParams,
  validateQuery
}; 