/**
 * Validation Utilities for NOVA Protocol
 * A collection of utility functions for validating data across the application
 */

const Joi = require('joi');

/**
 * Common validation schemas for reuse across the application
 */
const schemas = {
  /**
   * Asset symbol validation schema
   * Must be a non-empty string of 1-10 uppercase characters
   */
  assetSymbol: Joi.string().trim().pattern(/^[A-Z0-9]{1,10}$/).required()
    .messages({
      'string.pattern.base': 'Asset symbol must be 1-10 uppercase alphanumeric characters',
      'string.empty': 'Asset symbol is required'
    }),
  
  /**
   * Asset name validation schema
   * Must be a non-empty string of 1-100 characters
   */
  assetName: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.min': 'Asset name must be at least 1 character',
      'string.max': 'Asset name cannot exceed 100 characters',
      'string.empty': 'Asset name is required'
    }),
  
  /**
   * Price validation schema
   * Must be a number >= 0
   */
  price: Joi.number().min(0).required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  
  /**
   * Market cap validation schema
   * Must be a number >= 0
   */
  marketCap: Joi.number().min(0).required()
    .messages({
      'number.base': 'Market cap must be a number',
      'number.min': 'Market cap cannot be negative'
    }),
  
  /**
   * Volume validation schema
   * Must be a number >= 0
   */
  volume: Joi.number().min(0).required()
    .messages({
      'number.base': 'Volume must be a number',
      'number.min': 'Volume cannot be negative'
    }),
  
  /**
   * User ID validation schema
   * Must be a non-empty string
   */
  userId: Joi.string().trim().required()
    .messages({
      'string.empty': 'User ID is required'
    }),
  
  /**
   * Name validation schema
   * Must be a non-empty string of 1-100 characters
   */
  name: Joi.string().trim().min(1).max(100).required()
    .messages({
      'string.min': 'Name must be at least 1 character',
      'string.max': 'Name cannot exceed 100 characters',
      'string.empty': 'Name is required'
    }),
  
  /**
   * Description validation schema
   * Optional string of up to 1000 characters
   */
  description: Joi.string().trim().allow('').max(1000)
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  /**
   * Email validation schema
   * Must be a valid email address
   */
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Must be a valid email address',
      'string.empty': 'Email is required'
    }),
  
  /**
   * Password validation schema
   * Must be at least 8 characters with at least one uppercase, lowercase, number, and special character
   */
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.empty': 'Password is required'
    }),
  
  /**
   * URL validation schema
   * Must be a valid URL
   */
  url: Joi.string().uri().required()
    .messages({
      'string.uri': 'Must be a valid URL',
      'string.empty': 'URL is required'
    })
};

/**
 * Validate an asset symbol
 * @param {string} symbol - The asset symbol to validate
 * @returns {Object} Validation result with error and value properties
 */
function validateAssetSymbol(symbol) {
  return schemas.assetSymbol.validate(symbol);
}

/**
 * Validate an asset object
 * @param {Object} asset - The asset object to validate
 * @returns {Object} Validation result with error and value properties
 */
function validateAsset(asset) {
  const schema = Joi.object({
    symbol: schemas.assetSymbol,
    name: schemas.assetName,
    price: schemas.price,
    marketCap: schemas.marketCap.optional(),
    volume24h: schemas.volume.optional(),
    change24h: Joi.number().optional(),
    change7d: Joi.number().optional(),
    change30d: Joi.number().optional()
  });
  
  return schema.validate(asset);
}

/**
 * Validate a portfolio object
 * @param {Object} portfolio - The portfolio object to validate
 * @returns {Object} Validation result with error and value properties
 */
function validatePortfolio(portfolio) {
  const holdingSchema = Joi.object({
    assetSymbol: schemas.assetSymbol,
    quantity: Joi.number().min(0).required(),
    averagePurchasePrice: Joi.number().min(0).required(),
    purchaseDate: Joi.date().optional()
  });
  
  const schema = Joi.object({
    id: Joi.string().optional(),
    name: schemas.name,
    description: schemas.description,
    userId: schemas.userId,
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    holdings: Joi.array().items(holdingSchema).default([]),
    isPublic: Joi.boolean().default(false),
    tags: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional()
  });
  
  return schema.validate(portfolio);
}

/**
 * Validate a user object
 * @param {Object} user - The user object to validate
 * @returns {Object} Validation result with error and value properties
 */
function validateUser(user) {
  const schema = Joi.object({
    id: Joi.string().optional(),
    email: schemas.email,
    password: schemas.password,
    name: schemas.name.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    lastLogin: Joi.date().optional(),
    preferences: Joi.object().optional()
  });
  
  return schema.validate(user);
}

/**
 * Validate market data
 * @param {Object} marketData - The market data object to validate
 * @returns {Object} Validation result with error and value properties
 */
function validateMarketData(marketData) {
  const schema = Joi.object({
    symbol: schemas.assetSymbol,
    name: schemas.assetName,
    price: schemas.price,
    marketCap: schemas.marketCap.optional(),
    volume24h: schemas.volume.optional(),
    change24h: Joi.number().optional(),
    change7d: Joi.number().optional(),
    change30d: Joi.number().optional(),
    high24h: Joi.number().min(0).optional(),
    low24h: Joi.number().min(0).optional(),
    ath: Joi.number().min(0).optional(),
    athDate: Joi.date().optional(),
    atl: Joi.number().min(0).optional(),
    atlDate: Joi.date().optional(),
    supply: Joi.number().min(0).optional(),
    maxSupply: Joi.number().min(0).optional(),
    circulatingSupply: Joi.number().min(0).optional(),
    marketRank: Joi.number().integer().min(1).optional(),
    lastUpdated: Joi.date().optional(),
    priceHistory: Joi.object().optional(),
    source: Joi.string().optional(),
    metadata: Joi.object().optional()
  });
  
  return schema.validate(marketData);
}

/**
 * Validate API request parameters
 * @param {Object} params - The request parameters to validate
 * @param {Object} schema - The Joi schema to validate against
 * @returns {Object} Validation result with error and value properties
 */
function validateRequestParams(params, schema) {
  return schema.validate(params);
}

/**
 * Check if a wallet address is valid
 * @param {string} address - The wallet address to validate
 * @param {string} network - The blockchain network (e.g., 'ethereum', 'polygon')
 * @returns {boolean} Whether the address is valid
 */
function isValidWalletAddress(address, network = 'ethereum') {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Basic validation for different network address formats
  switch (network.toLowerCase()) {
    case 'ethereum':
    case 'polygon':
    case 'binance':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'bitcoin':
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(address);
    case 'solana':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default:
      return false;
  }
}

/**
 * Validate a transaction object
 * @param {Object} transaction - The transaction object to validate
 * @returns {Object} Validation result with error and value properties
 */
function validateTransaction(transaction) {
  const schema = Joi.object({
    id: Joi.string().optional(),
    fromAddress: Joi.string().required(),
    toAddress: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    assetSymbol: schemas.assetSymbol,
    network: Joi.string().required(),
    timestamp: Joi.date().default(Date.now),
    status: Joi.string().valid('pending', 'completed', 'failed').default('pending'),
    txHash: Joi.string().optional(),
    fee: Joi.number().min(0).optional(),
    blockNumber: Joi.number().integer().min(0).optional(),
    metadata: Joi.object().optional()
  });
  
  return schema.validate(transaction);
}

module.exports = {
  schemas,
  validateAssetSymbol,
  validateAsset,
  validatePortfolio,
  validateUser,
  validateMarketData,
  validateRequestParams,
  isValidWalletAddress,
  validateTransaction
};