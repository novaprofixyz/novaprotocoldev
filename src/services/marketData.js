/**
 * Market Data Service for NOVA Protocol
 * Handles fetching and processing market data from various sources
 */

const axios = require('axios');
const { createContextLogger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const cacheService = require('./cacheService');
const { get: getConfig } = require('../utils/config');

const marketDataLogger = createContextLogger('MarketDataService');

/**
 * Fetch market data for specified assets
 * @param {Array} assets - Array of asset symbols to fetch data for
 * @param {string} timeframe - Timeframe for the data (e.g., '1h', '1d', '1w')
 * @returns {Object} Market data for the specified assets
 */
async function fetchMarketData(assets = [], timeframe = '1d') {
  try {
    // Use default assets from config if none provided
    const assetsToFetch = assets.length > 0 ? 
      assets : 
      getConfig('marketData.defaultAssets', ['BTC', 'ETH', 'BNB', 'SOL']);
    
    marketDataLogger.info(`Fetching market data for ${assetsToFetch.join(', ')} on ${timeframe} timeframe`);
    
    // Generate cache key
    const cacheKey = `marketData:${assetsToFetch.join(',')}_${timeframe}`;
    
    // Try to get from cache first
    return await cacheService.getOrSet(cacheKey, async () => {
      // Cache miss, fetch fresh data
      const marketData = {};
      
      for (const asset of assetsToFetch) {
        marketData[asset] = await mockFetchAssetData(asset, timeframe);
      }
      
      return marketData;
    }, getConfig('marketData.cacheTTL', 60));
  } catch (error) {
    marketDataLogger.error(`Error fetching market data: ${error.message}`);
    throw new AppError(`Failed to fetch market data: ${error.message}`, 500);
  }
}

/**
 * Mock function to generate asset data
 * @param {string} asset - Asset symbol
 * @param {string} timeframe - Timeframe for the data
 * @returns {Object} Mock market data for the asset
 */
async function mockFetchAssetData(asset, timeframe) {
  // Get number of intervals and hours per interval based on timeframe
  const { intervals, hoursPerInterval } = getTimeframeDetails(timeframe);
  
  // Generate mock candle data
  const candles = [];
  const basePrice = getBasePrice(asset);
  let lastPrice = basePrice;
  
  const now = Date.now();
  for (let i = intervals - 1; i >= 0; i--) {
    // Generate a price with some randomness but trending realistically
    const changePercent = (Math.random() * 2 - 1) * 0.02; // -1% to +1%
    const price = lastPrice * (1 + changePercent);
    lastPrice = price;
    
    // Generate a timestamp for this interval
    const timestamp = now - (i * hoursPerInterval * 60 * 60 * 1000);
    
    // Generate high and low prices
    const highPercent = Math.random() * 0.02; // 0% to 2%
    const lowPercent = Math.random() * 0.02; // 0% to 2%
    const high = price * (1 + highPercent);
    const low = price * (1 - lowPercent);
    
    // Generate volume
    const volume = basePrice * (10000 + Math.random() * 90000);
    
    candles.push({
      timestamp: new Date(timestamp).toISOString(),
      open: lastPrice,
      high,
      low,
      close: price,
      volume
    });
  }
  
  return {
    symbol: asset,
    timeframe,
    lastUpdated: new Date().toISOString(),
    candles
  };
}

/**
 * Get timeframe details
 * @param {string} timeframe - Timeframe string (e.g., '1h', '1d', '1w')
 * @returns {Object} Number of intervals and hours per interval
 */
function getTimeframeDetails(timeframe) {
  // Default to returning 100 intervals
  switch (timeframe) {
    case '5m':
      return { intervals: 100, hoursPerInterval: 5/60 };
    case '15m':
      return { intervals: 100, hoursPerInterval: 15/60 };
    case '30m':
      return { intervals: 100, hoursPerInterval: 30/60 };
    case '1h':
      return { intervals: 100, hoursPerInterval: 1 };
    case '4h':
      return { intervals: 100, hoursPerInterval: 4 };
    case '1d':
      return { intervals: 100, hoursPerInterval: 24 };
    case '1w':
      return { intervals: 100, hoursPerInterval: 24 * 7 };
    case '1M':
      return { intervals: 100, hoursPerInterval: 24 * 30 };
    default:
      return { intervals: 100, hoursPerInterval: 24 }; // Default to daily
  }
}

/**
 * Get the number of hours in a timeframe
 * @param {string} timeframe - Timeframe string
 * @returns {number} Number of hours
 */
function getTimeframeHours(timeframe) {
  switch (timeframe) {
    case '1h':
      return 1;
    case '4h':
      return 4;
    case '1d':
      return 24;
    case '1w':
      return 24 * 7;
    case '1m':
      return 24 * 30;
    default:
      return 1;
  }
}

/**
 * Get the base price for an asset
 * @param {string} asset - Asset symbol
 * @returns {number} Base price
 */
function getBasePrice(asset) {
  // Mock current prices for popular assets
  const prices = {
    BTC: 30000 + Math.random() * 5000,
    ETH: 2000 + Math.random() * 300,
    BNB: 200 + Math.random() * 50,
    SOL: 100 + Math.random() * 30,
    ADA: 0.30 + Math.random() * 0.1,
    DOT: 5 + Math.random() * 2,
    AVAX: 20 + Math.random() * 5,
    MATIC: 0.8 + Math.random() * 0.3,
    LINK: 10 + Math.random() * 3,
    UNI: 5 + Math.random() * 2
  };
  
  return prices[asset] || 10 + Math.random() * 5; // Default price for unknown assets
}

/**
 * Get the latest price for an asset
 * @param {string} asset - Asset symbol
 * @returns {number} Current price
 */
async function getLatestPrice(asset) {
  // For MVP, return a mock price
  // In production, this would call external APIs
  try {
    const cacheKey = `latestPrice:${asset}`;
    
    return await cacheService.getOrSet(cacheKey, async () => {
      marketDataLogger.debug(`Getting latest price for ${asset}`);
      return getBasePrice(asset);
    }, 30); // Cache for 30 seconds
  } catch (error) {
    marketDataLogger.error(`Error getting latest price for ${asset}: ${error.message}`);
    throw new AppError(`Failed to get latest price for ${asset}`, 500);
  }
}

/**
 * Get historical price data for an asset
 * @param {string} asset - Asset symbol
 * @param {string} timeframe - Timeframe for the data
 * @param {number} limit - Number of data points to return
 * @returns {Array} Historical price data
 */
async function getHistoricalPrices(asset, timeframe = '1d', limit = 30) {
  // For MVP, return mock data
  // In production, this would call external APIs
  try {
    const cacheKey = `historicalPrices:${asset}_${timeframe}_${limit}`;
    
    return await cacheService.getOrSet(cacheKey, async () => {
      marketDataLogger.debug(`Getting historical prices for ${asset} on ${timeframe} timeframe`);
      const data = await mockFetchAssetData(asset, timeframe);
      return data.candles.slice(-limit);
    }, 300); // Cache for 5 minutes
  } catch (error) {
    marketDataLogger.error(`Error getting historical prices for ${asset}: ${error.message}`);
    throw new AppError(`Failed to get historical prices for ${asset}`, 500);
  }
}

module.exports = {
  fetchMarketData,
  getLatestPrice,
  getHistoricalPrices
}; 