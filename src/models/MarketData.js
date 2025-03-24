/**
 * MarketData model for NOVA Protocol
 * Defines the structure for market data
 */

const joi = require('joi');

/**
 * MarketData class representing market data for an asset
 */
class MarketData {
  /**
   * Constructor for the MarketData class
   * @param {Object} data - MarketData data
   */
  constructor(data = {}) {
    this.symbol = data.symbol || '';
    this.name = data.name || '';
    this.price = data.price || null;
    this.marketCap = data.marketCap || null;
    this.volume24h = data.volume24h || null;
    this.change24h = data.change24h || null;
    this.change7d = data.change7d || null;
    this.change30d = data.change30d || null;
    this.high24h = data.high24h || null;
    this.low24h = data.low24h || null;
    this.ath = data.ath || null;
    this.athDate = data.athDate || null;
    this.atl = data.atl || null;
    this.atlDate = data.atlDate || null;
    this.supply = data.supply || null;
    this.maxSupply = data.maxSupply || null;
    this.circulatingSupply = data.circulatingSupply || null;
    this.marketRank = data.marketRank || null;
    this.lastUpdated = data.lastUpdated || new Date();
    this.priceHistory = data.priceHistory || [];
    this.source = data.source || 'unknown';
    this.metadata = data.metadata || {};
  }

  /**
   * Validation schema for market data
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
      change7d: joi.number().allow(null),
      change30d: joi.number().allow(null),
      high24h: joi.number().min(0).allow(null),
      low24h: joi.number().min(0).allow(null),
      ath: joi.number().min(0).allow(null),
      athDate: joi.date().allow(null),
      atl: joi.number().min(0).allow(null),
      atlDate: joi.date().allow(null),
      supply: joi.number().min(0).allow(null),
      maxSupply: joi.number().min(0).allow(null),
      circulatingSupply: joi.number().min(0).allow(null),
      marketRank: joi.number().integer().min(1).allow(null),
      lastUpdated: joi.date().default(Date.now),
      priceHistory: joi.array().items(joi.object({
        timestamp: joi.date().required(),
        price: joi.number().required().min(0)
      })),
      source: joi.string().default('unknown'),
      metadata: joi.object().default({})
    });
  }

  /**
   * Validate market data
   * @param {Object} data - Market data to validate
   * @returns {Object} Validation result
   */
  static validate(data) {
    return this.schema.validate(data);
  }

  /**
   * Create a MarketData instance from data, with validation
   * @param {Object} data - Market data
   * @returns {MarketData} Validated MarketData instance
   * @throws {Error} Throws error if validation fails
   */
  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(`MarketData validation error: ${error.message}`);
    }
    return new MarketData(value);
  }

  /**
   * Calculate metrics based on the market data
   * @returns {Object} Calculated metrics
   */
  calculateMetrics() {
    // Calculate market cap to volume ratio
    const mcapToVolumeRatio = this.marketCap && this.volume24h && this.volume24h > 0 
      ? this.marketCap / this.volume24h 
      : null;
    
    // Calculate fully diluted valuation
    const fullyDilutedValuation = this.price && this.maxSupply 
      ? this.price * this.maxSupply 
      : null;
    
    // Calculate price volatility (if price history is available)
    let volatility = null;
    if (this.priceHistory && this.priceHistory.length > 1) {
      const prices = this.priceHistory.map(entry => entry.price);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const sumSquaredDiff = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0);
      const variance = sumSquaredDiff / prices.length;
      volatility = Math.sqrt(variance) / avgPrice * 100; // Volatility as a percentage
    }
    
    // Calculate price-to-ATH ratio
    const priceToAthRatio = this.price && this.ath && this.ath > 0 
      ? this.price / this.ath 
      : null;
    
    // Calculate days since ATH
    const daysSinceAth = this.athDate 
      ? Math.floor((new Date() - new Date(this.athDate)) / (1000 * 60 * 60 * 24)) 
      : null;
    
    return {
      mcapToVolumeRatio,
      fullyDilutedValuation,
      volatility,
      priceToAthRatio,
      daysSinceAth,
      currentPrice: this.price,
      calculatedAt: new Date()
    };
  }

  /**
   * Get the price history for a specific timeframe
   * @param {string} timeframe - Timeframe (1d, 7d, 30d, 90d, 1y)
   * @returns {Array} Filtered price history
   */
  getPriceHistory(timeframe = '30d') {
    if (!this.priceHistory || this.priceHistory.length === 0) {
      return [];
    }
    
    const now = new Date();
    let lookbackDate;
    
    switch (timeframe) {
      case '1d':
        lookbackDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case '7d':
        lookbackDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        lookbackDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        lookbackDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        lookbackDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        lookbackDate = new Date(now.setDate(now.getDate() - 30));
    }
    
    return this.priceHistory
      .filter(entry => new Date(entry.timestamp) >= lookbackDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Convert MarketData instance to a plain object
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
      change7d: this.change7d,
      change30d: this.change30d,
      high24h: this.high24h,
      low24h: this.low24h,
      ath: this.ath,
      athDate: this.athDate,
      atl: this.atl,
      atlDate: this.atlDate,
      supply: this.supply,
      maxSupply: this.maxSupply,
      circulatingSupply: this.circulatingSupply,
      marketRank: this.marketRank,
      lastUpdated: this.lastUpdated,
      source: this.source,
      metadata: this.metadata
    };
  }
}

module.exports = MarketData; 