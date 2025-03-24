/**
 * Portfolio model for NOVA Protocol
 * Represents a user's portfolio of crypto assets
 */

const joi = require('joi');
const Asset = require('./Asset');

/**
 * Portfolio class representing a collection of assets
 */
class Portfolio {
  /**
   * Constructor for the Portfolio class
   * @param {Object} data - Portfolio data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || 'My Portfolio';
    this.description = data.description || '';
    this.userId = data.userId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.holdings = data.holdings || [];
    this.isPublic = data.isPublic !== undefined ? data.isPublic : false;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
  }

  /**
   * Validation schema for portfolio data
   * @returns {Object} Joi validation schema
   */
  static get schema() {
    return joi.object({
      id: joi.string().allow(null),
      name: joi.string().required().max(100),
      description: joi.string().max(500).default(''),
      userId: joi.string().allow(null),
      createdAt: joi.date().default(Date.now),
      updatedAt: joi.date().default(Date.now),
      holdings: joi.array().items(joi.object({
        assetSymbol: joi.string().required().max(10).pattern(/^[A-Za-z0-9]+$/),
        amount: joi.number().required().min(0),
        costBasis: joi.number().min(0).allow(null),
        notes: joi.string().allow('').max(500),
        purchaseDate: joi.date().allow(null)
      })).default([]),
      isPublic: joi.boolean().default(false),
      tags: joi.array().items(joi.string().max(30)).default([]),
      metadata: joi.object().default({})
    });
  }

  /**
   * Validate portfolio data
   * @param {Object} data - Portfolio data to validate
   * @returns {Object} Validation result
   */
  static validate(data) {
    return this.schema.validate(data);
  }

  /**
   * Create a Portfolio instance from data, with validation
   * @param {Object} data - Portfolio data
   * @returns {Portfolio} Validated Portfolio instance
   * @throws {Error} Throws error if validation fails
   */
  static create(data) {
    const { error, value } = this.validate(data);
    if (error) {
      throw new Error(`Portfolio validation error: ${error.message}`);
    }
    return new Portfolio(value);
  }

  /**
   * Add an asset holding to the portfolio
   * @param {Object} holding - Asset holding data
   * @returns {Portfolio} Updated portfolio instance
   */
  addHolding(holding) {
    const { error } = joi.object({
      assetSymbol: joi.string().required().max(10).pattern(/^[A-Za-z0-9]+$/),
      amount: joi.number().required().min(0),
      costBasis: joi.number().min(0).allow(null),
      notes: joi.string().allow('').max(500),
      purchaseDate: joi.date().allow(null)
    }).validate(holding);

    if (error) {
      throw new Error(`Holding validation error: ${error.message}`);
    }

    // Check if asset already exists, if so update it
    const existingIndex = this.holdings.findIndex(h => 
      h.assetSymbol.toLowerCase() === holding.assetSymbol.toLowerCase()
    );

    if (existingIndex >= 0) {
      this.holdings[existingIndex] = {
        ...this.holdings[existingIndex],
        amount: this.holdings[existingIndex].amount + holding.amount,
        // Update other fields if provided
        costBasis: holding.costBasis !== undefined ? holding.costBasis : this.holdings[existingIndex].costBasis,
        notes: holding.notes || this.holdings[existingIndex].notes,
        purchaseDate: holding.purchaseDate || this.holdings[existingIndex].purchaseDate
      };
    } else {
      this.holdings.push(holding);
    }

    this.updatedAt = new Date();
    return this;
  }

  /**
   * Remove a holding from the portfolio
   * @param {string} assetSymbol - Symbol of the asset to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeHolding(assetSymbol) {
    const initialLength = this.holdings.length;
    this.holdings = this.holdings.filter(h => 
      h.assetSymbol.toLowerCase() !== assetSymbol.toLowerCase()
    );
    
    const wasRemoved = initialLength > this.holdings.length;
    if (wasRemoved) {
      this.updatedAt = new Date();
    }
    
    return wasRemoved;
  }

  /**
   * Calculate the current value of the portfolio
   * @param {Array} prices - Array of { symbol, price } objects
   * @returns {Object} Portfolio valuation
   */
  calculateValue(prices) {
    let totalValue = 0;
    let totalCost = 0;
    
    const holdingsWithValue = this.holdings.map(holding => {
      const price = prices.find(p => 
        p.symbol.toLowerCase() === holding.assetSymbol.toLowerCase()
      );
      
      const currentValue = price ? holding.amount * price.price : null;
      const cost = holding.costBasis ? holding.amount * holding.costBasis : null;
      
      if (currentValue !== null) {
        totalValue += currentValue;
      }
      
      if (cost !== null) {
        totalCost += cost;
      }
      
      return {
        ...holding,
        currentValue,
        currentPrice: price ? price.price : null
      };
    });
    
    const profitLoss = totalCost ? totalValue - totalCost : null;
    const profitLossPercentage = totalCost && totalCost > 0 ? (profitLoss / totalCost) * 100 : null;
    
    return {
      totalValue,
      totalCost,
      profitLoss,
      profitLossPercentage,
      holdings: holdingsWithValue,
      lastCalculated: new Date()
    };
  }

  /**
   * Get the distribution of assets in the portfolio
   * @param {Array} prices - Array of { symbol, price } objects
   * @returns {Array} Array of { symbol, percentage } objects
   */
  getDistribution(prices) {
    const valuation = this.calculateValue(prices);
    
    if (valuation.totalValue === 0) {
      return [];
    }
    
    return valuation.holdings
      .filter(h => h.currentValue !== null)
      .map(holding => ({
        symbol: holding.assetSymbol,
        percentage: (holding.currentValue / valuation.totalValue) * 100,
        value: holding.currentValue
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Convert Portfolio instance to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      holdings: this.holdings,
      isPublic: this.isPublic,
      tags: this.tags,
      metadata: this.metadata
    };
  }
}

module.exports = Portfolio; 