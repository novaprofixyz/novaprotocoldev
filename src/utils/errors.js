/**
 * Error handling utilities for NOVA Protocol
 * Provides standardized error classes and handling mechanisms
 */

/**
 * Custom application error class
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create a new application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code for client processing
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom validation error class
 * @extends AppError
 */
class ValidationError extends AppError {
  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {Object[]} details - Validation error details
   */
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Custom authentication error class
 * @extends AppError
 */
class AuthenticationError extends AppError {
  /**
   * Create an authentication error
   * @param {string} message - Error message
   */
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Custom authorization error class
 * @extends AppError
 */
class AuthorizationError extends AppError {
  /**
   * Create an authorization error
   * @param {string} message - Error message
   */
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Custom not found error class
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * Create a not found error
   * @param {string} entity - Entity that was not found
   */
  constructor(entity = 'Resource') {
    super(`${entity} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Custom blockchain interaction error
 * @extends AppError
 */
class BlockchainError extends AppError {
  /**
   * Create a blockchain error
   * @param {string} message - Error message
   * @param {Object} txDetails - Transaction details if available
   */
  constructor(message, txDetails = null) {
    super(message, 502, 'BLOCKCHAIN_ERROR');
    this.txDetails = txDetails;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BlockchainError
}; 