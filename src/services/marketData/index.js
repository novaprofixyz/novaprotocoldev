/**
 * Market Data Service for NOVA Protocol
 * Provides unified access to market data from various providers
 */

const { ProviderFactory } = require('./providers');
const { createContextLogger } = require('../../utils/logger');
const { get: getConfig } = require('../../utils/config');
const { AppError } = require('../../utils/errors');
const { Cache } = require('../../utils/cache');

// Initialize logger
const logger = createContextLogger('MarketDataService');

// Initialize cache
const priceCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  max: 100
});

const marketDataCache = new Cache({
  ttl: 15 * 60 * 1000, // 15 minutes
  max: 50
});

const historicalDataCache = new Cache({
  ttl: 60 * 60 * 1000, // 1 hour
  max: 30
});

/**
 * Market Data Service
 * Central service for retrieving market data from configured providers
 */
class MarketDataService {
  constructor() {
    this.defaultProvider = getConfig('marketData.defaultProvider', 'coinGecko');
    this.fallbackProvider = getConfig('marketData.fallbackProvider', 'binance');
    this.primaryProvider = ProviderFactory.getProvider(this.defaultProvider);
    this.fallbackProviderInstance = this.fallbackProvider ? 
      ProviderFactory.getProvider(this.fallbackProvider) : null;
    
    logger.info(`Market Data Service initialized with ${this.defaultProvider} as primary provider`);
    if (this.fallbackProviderInstance) {
      logger.info(`Fallback provider set to ${this.fallbackProvider}`);
    }
  }
  
  /**
   * Get current price for an asset
   * @param {string} symbol - Asset symbol (e.g. BTC)
   * @returns {Promise<number>} Current price in USD
   */
  async getPrice(symbol) {
    const cacheKey = `price:${symbol.toLowerCase()}`;
    
    // Check cache first
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice) {
      logger.debug(`Using cached price for ${symbol}`);
      return cachedPrice;
    }
    
    try {
      // Try primary provider
      const price = await this.primaryProvider.getCurrentPrice(symbol);
      
      // Cache the result
      priceCache.set(cacheKey, price);
      
      return price;
    } catch (error) {
      logger.warn(`Primary provider failed for ${symbol} price: ${error.message}`);
      
      // Try fallback if available
      if (this.fallbackProviderInstance) {
        try {
          const price = await this.fallbackProviderInstance.getCurrentPrice(symbol);
          
          // Cache the result
          priceCache.set(cacheKey, price);
          
          return price;
        } catch (fallbackError) {
          logger.error(`Fallback provider also failed for ${symbol} price: ${fallbackError.message}`);
          throw new AppError(`Failed to get price for ${symbol} from any provider`, 500);
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get prices for multiple assets at once
   * @param {Array<string>} symbols - Array of asset symbols
   * @returns {Promise<Object>} Map of symbols to prices
   */
  async getPrices(symbols) {
    const results = {};
    const promises = symbols.map(async (symbol) => {
      try {
        results[symbol] = await this.getPrice(symbol);
      } catch (error) {
        logger.error(`Failed to get price for ${symbol}: ${error.message}`);
        results[symbol] = null;
      }
    });
    
    await Promise.all(promises);
    return results;
  }
  
  /**
   * Get historical prices for an asset
   * @param {string} symbol - Asset symbol
   * @param {string} timeframe - Timeframe (1d, 7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalPrices(symbol, timeframe = '30d') {
    const cacheKey = `historical:${symbol.toLowerCase()}:${timeframe}`;
    
    // Check cache first
    const cachedData = historicalDataCache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Using cached historical data for ${symbol} (${timeframe})`);
      return cachedData;
    }
    
    try {
      // Try primary provider
      const data = await this.primaryProvider.getHistoricalPrices(symbol, timeframe);
      
      // Cache the result
      historicalDataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logger.warn(`Primary provider failed for ${symbol} historical data: ${error.message}`);
      
      // Try fallback if available
      if (this.fallbackProviderInstance) {
        try {
          const data = await this.fallbackProviderInstance.getHistoricalPrices(symbol, timeframe);
          
          // Cache the result
          historicalDataCache.set(cacheKey, data);
          
          return data;
        } catch (fallbackError) {
          logger.error(`Fallback provider also failed for ${symbol} historical data: ${fallbackError.message}`);
          throw new AppError(`Failed to get historical data for ${symbol} from any provider`, 500);
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get detailed market data for an asset
   * @param {string} symbol - Asset symbol
   * @returns {Promise<Object>} Market data
   */
  async getMarketData(symbol) {
    const cacheKey = `marketData:${symbol.toLowerCase()}`;
    
    // Check cache first
    const cachedData = marketDataCache.get(cacheKey);
    if (cachedData) {
      logger.debug(`Using cached market data for ${symbol}`);
      return cachedData;
    }
    
    try {
      // Try primary provider
      const data = await this.primaryProvider.getMarketData(symbol);
      
      // Cache the result
      marketDataCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      logger.warn(`Primary provider failed for ${symbol} market data: ${error.message}`);
      
      // Try fallback if available
      if (this.fallbackProviderInstance) {
        try {
          const data = await this.fallbackProviderInstance.getMarketData(symbol);
          
          // Cache the result
          marketDataCache.set(cacheKey, data);
          
          return data;
        } catch (fallbackError) {
          logger.error(`Fallback provider also failed for ${symbol} market data: ${fallbackError.message}`);
          throw new AppError(`Failed to get market data for ${symbol} from any provider`, 500);
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get market data for multiple assets
   * @param {Array<string>} symbols - Array of asset symbols
   * @returns {Promise<Object>} Map of symbols to market data
   */
  async getMarketsData(symbols) {
    const results = {};
    const promises = symbols.map(async (symbol) => {
      try {
        results[symbol] = await this.getMarketData(symbol);
      } catch (error) {
        logger.error(`Failed to get market data for ${symbol}: ${error.message}`);
        results[symbol] = null;
      }
    });
    
    await Promise.all(promises);
    return results;
  }
  
  /**
   * Invalidate cache for a specific asset
   * @param {string} symbol - Asset symbol
   */
  invalidateCache(symbol) {
    const symbolLower = symbol.toLowerCase();
    priceCache.del(`price:${symbolLower}`);
    marketDataCache.del(`marketData:${symbolLower}`);
    
    // Clear all timeframes for historical data
    ['1d', '7d', '30d', '90d', '1y'].forEach(timeframe => {
      historicalDataCache.del(`historical:${symbolLower}:${timeframe}`);
    });
    
    logger.debug(`Cache invalidated for ${symbol}`);
  }
  
  /**
   * Clear all caches
   */
  clearAllCaches() {
    priceCache.clear();
    marketDataCache.clear();
    historicalDataCache.clear();
    logger.debug('All market data caches cleared');
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

module.exports = {
  marketDataService,
  MarketDataService
}; 