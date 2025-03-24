/**
 * Asset model for NOVA Protocol
 * Defines the structure and validation for cryptoassets
 */

const joi = require('joi');

/**
 * Asset class representing a crypto asset
 */
class Asset {
  /**
   * Constructor for the Asset class
   * @param {Object} data - Asset data
   */
  constructor(data = {}) {
    this.symbol = data.symbol || '';
    this.name = data.name || '';
    this.price = data.price || null;
    this.marketCap = data.marketCap || null;
    this.volume24h = data.volume24h || null;
    this.change24h = data.change24h || null;
    this.high24h = data.high24h || null;
    this.low24h = data.low24h || null;
    this.supply = data.supply || null;
    this.maxSupply = data.maxSupply || null;
    this.rank = data.rank || null;
    this.lastUpdated = data.lastUpdated || new Date();
    this.priceHistory = data.priceHistory || [];
    this.metadata = data.metadata || {};
  }

  /**
   * Validation schema for asset data
   * @returns {Object} Joi validation schema
   */
  static get schema() {
    return joi.object({
      symbol: joi.string().required().max(10).pattern(/^[A-Za-z0-9]+$/),
      name: joi.string().required().max(100),
      price: joi.number().min(0).allow(null),
      marketCap: joi.number().min(0).allow(null),
      volume24h: joi.number().min(0).allow(null),
      change24h: joi.number().allow(null),
      high24h: joi.number().min(0).allow(null),
      low24h: joi.number().min(0).allow(null),
      supply: joi.number().min(0).allow(null),
      maxSupply: joi.number().min(0).allow(null),
      rank: joi.number().integer().min(1).allow(null),
      lastUpdated: joi.date().default(Date.now),
      priceHistory: joi.array().items(joi.object({
        timestamp: joi.date().required(),
        price: joi.number().required().min(0)
      })),
      metadata: joi.object().default({})
    });
  }

  /**
   * Validate asset data
   * @param {Object} data - Asset data to validate
   * @returns {Object} Validation result
   */
  static validate(data) {
    return this.schema.validate(data);
  }

  /**
   * Create an Asset instance from data, with validation
   * @param {Object} data - Asset data
   * @returns {Asset} Validated Asset instance
   * @throws {Error} Throws error if validation fails
   */
  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(`Asset validation error: ${error.message}`);
    }
    return new Asset(value);
  }

  /**
   * Calculate the market value change over a period
   * @param {number} days - Number of days to look back
   * @returns {Object} Change data { absolute, percentage }
   */
  calculateChange(days = 1) {
    if (!this.priceHistory || this.priceHistory.length < 2) {
      return { absolute: null, percentage: null };
    }

    // Sort by timestamp descending
    const sortedHistory = [...this.priceHistory].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Get current price
    const currentPrice = sortedHistory[0].price;
    
    // Find comparison price (n days ago)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    
    // Find the closest price to the target date
    let comparisonPrice = null;
    for (let i = 1; i < sortedHistory.length; i++) {
      const entryDate = new Date(sortedHistory[i].timestamp);
      if (entryDate <= targetDate) {
        comparisonPrice = sortedHistory[i].price;
        break;
      }
    }
    
    // If no historical price found, return null
    if (comparisonPrice === null) {
      return { absolute: null, percentage: null };
    }
    
    // Calculate change
    const absoluteChange = currentPrice - comparisonPrice;
    const percentageChange = (absoluteChange / comparisonPrice) * 100;
    
    return {
      absolute: absoluteChange,
      percentage: percentageChange
    };
  }

  /**
   * Convert Asset instance to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      symbol: this.symbol,
      name: this.name,
      price: this.price,
      marketCap: this.marketCap,
      volume24h: this.volume24h,
      change24h: this.change24h,
      high24h: this.high24h,
      low24h: this.low24h,
      supply: this.supply,
      maxSupply: this.maxSupply,
      rank: this.rank,
      lastUpdated: this.lastUpdated,
      priceHistory: this.priceHistory,
      metadata: this.metadata
    };
  }
}

module.exports = Asset; 