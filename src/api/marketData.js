/**
 * Market Data API Module for NOVA Protocol
 * Provides endpoints for retrieving market data for crypto assets
 */

const express = require('express');
const router = express.Router();
const { MarketData } = require('../models');
const { validateRequestParams } = require('../utils/validation');
const Joi = require('joi');
const { getCacheKey, getCache, setCache } = require('../services/cache');
const logger = require('../utils/logger');

// Cache TTL in seconds
const CACHE_TTL = {
  ASSET_PRICE: 60,         // 1 minute
  ASSET_DETAILS: 300,      // 5 minutes
  MARKET_OVERVIEW: 600,    // 10 minutes
  HISTORICAL_DATA: 3600    // 1 hour
};

/**
 * @route GET /api/market-data/assets
 * @description Get a list of all available assets
 * @access Public
 */
router.get('/assets', async (req, res) => {
  try {
    const cacheKey = getCacheKey('market-data:assets');
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Retrieve all available assets with basic market data
    const assets = await MarketData.find({}, {
      symbol: 1,
      name: 1,
      price: 1,
      marketCap: 1,
      volume24h: 1,
      change24h: 1,
      marketRank: 1
    }).sort({ marketRank: 1 });
    
    await setCache(cacheKey, JSON.stringify(assets), CACHE_TTL.MARKET_OVERVIEW);
    
    res.json(assets);
  } catch (error) {
    logger.error('Error retrieving assets:', error);
    res.status(500).json({ error: 'Failed to retrieve assets' });
  }
});

/**
 * @route GET /api/market-data/asset/:symbol
 * @description Get detailed market data for a specific asset
 * @access Public
 */
router.get('/asset/:symbol', async (req, res) => {
  try {
    const schema = Joi.object({
      symbol: Joi.string().trim().required()
    });
    
    const { error, value } = validateRequestParams(req.params, schema);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { symbol } = value;
    const cacheKey = getCacheKey(`market-data:asset:${symbol.toUpperCase()}`);
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Find the asset by symbol
    const assetData = await MarketData.findOne({ symbol: symbol.toUpperCase() });
    
    if (!assetData) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Calculate additional metrics
    const enrichedData = assetData.calculateMetrics();
    
    await setCache(cacheKey, JSON.stringify(enrichedData), CACHE_TTL.ASSET_DETAILS);
    
    res.json(enrichedData);
  } catch (error) {
    logger.error('Error retrieving asset data:', error);
    res.status(500).json({ error: 'Failed to retrieve asset data' });
  }
});

/**
 * @route GET /api/market-data/overview
 * @description Get market overview data (global metrics)
 * @access Public
 */
router.get('/overview', async (req, res) => {
  try {
    const cacheKey = getCacheKey('market-data:overview');
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Calculate global market data
    const [
      totalMarketCap,
      total24hVolume,
      btcDominance,
      topGainers,
      topLosers
    ] = await Promise.all([
      calculateTotalMarketCap(),
      calculateTotal24hVolume(),
      calculateBTCDominance(),
      getTopGainers(5),
      getTopLosers(5)
    ]);
    
    const overviewData = {
      totalMarketCap,
      total24hVolume,
      btcDominance,
      topGainers,
      topLosers,
      lastUpdated: new Date()
    };
    
    await setCache(cacheKey, JSON.stringify(overviewData), CACHE_TTL.MARKET_OVERVIEW);
    
    res.json(overviewData);
  } catch (error) {
    logger.error('Error retrieving market overview:', error);
    res.status(500).json({ error: 'Failed to retrieve market overview' });
  }
});

/**
 * @route GET /api/market-data/historical/:symbol
 * @description Get historical price data for a specific asset
 * @access Public
 */
router.get('/historical/:symbol', async (req, res) => {
  try {
    const paramSchema = Joi.object({
      symbol: Joi.string().trim().required()
    });
    
    const querySchema = Joi.object({
      timeframe: Joi.string().valid('1d', '7d', '30d', '90d', '1y', 'all').default('30d'),
      interval: Joi.string().valid('hourly', 'daily', 'weekly').default('daily')
    });
    
    const paramValidation = validateRequestParams(req.params, paramSchema);
    const queryValidation = validateRequestParams(req.query, querySchema);
    
    if (paramValidation.error) {
      return res.status(400).json({ error: paramValidation.error.details[0].message });
    }
    
    if (queryValidation.error) {
      return res.status(400).json({ error: queryValidation.error.details[0].message });
    }
    
    const { symbol } = paramValidation.value;
    const { timeframe, interval } = queryValidation.value;
    
    const cacheKey = getCacheKey(`market-data:historical:${symbol.toUpperCase()}:${timeframe}:${interval}`);
    const cachedData = await getCache(cacheKey);
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    
    // Find the asset by symbol
    const assetData = await MarketData.findOne({ symbol: symbol.toUpperCase() });
    
    if (!assetData) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Get historical price data
    const historicalData = assetData.getPriceHistory(timeframe);
    
    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({ error: 'Historical data not available for the requested timeframe' });
    }
    
    // Resample data based on requested interval if needed
    const resampledData = resampleHistoricalData(historicalData, interval);
    
    await setCache(cacheKey, JSON.stringify(resampledData), CACHE_TTL.HISTORICAL_DATA);
    
    res.json(resampledData);
  } catch (error) {
    logger.error('Error retrieving historical data:', error);
    res.status(500).json({ error: 'Failed to retrieve historical data' });
  }
});

/**
 * @route GET /api/market-data/search
 * @description Search for assets by name or symbol
 * @access Public
 */
router.get('/search', async (req, res) => {
  try {
    const schema = Joi.object({
      query: Joi.string().trim().required(),
      limit: Joi.number().integer().min(1).max(100).default(20)
    });
    
    const { error, value } = validateRequestParams(req.query, schema);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { query, limit } = value;
    
    // Search for assets that match the query
    const assets = await MarketData.find({
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }, {
      symbol: 1,
      name: 1,
      price: 1,
      marketCap: 1,
      change24h: 1,
      marketRank: 1
    }).limit(limit).sort({ marketRank: 1 });
    
    res.json(assets);
  } catch (error) {
    logger.error('Error searching assets:', error);
    res.status(500).json({ error: 'Failed to search assets' });
  }
});

/**
 * Helper function to calculate total market cap
 * @returns {Promise<number>} Total market cap value
 */
async function calculateTotalMarketCap() {
  const result = await MarketData.aggregate([
    {
      $group: {
        _id: null,
        totalMarketCap: { $sum: '$marketCap' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalMarketCap : 0;
}

/**
 * Helper function to calculate total 24h volume
 * @returns {Promise<number>} Total 24h volume value
 */
async function calculateTotal24hVolume() {
  const result = await MarketData.aggregate([
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$volume24h' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalVolume : 0;
}

/**
 * Helper function to calculate BTC dominance
 * @returns {Promise<number>} BTC dominance percentage
 */
async function calculateBTCDominance() {
  const [totalMarketCap, btcData] = await Promise.all([
    calculateTotalMarketCap(),
    MarketData.findOne({ symbol: 'BTC' })
  ]);
  
  if (!btcData || !totalMarketCap) {
    return 0;
  }
  
  return (btcData.marketCap / totalMarketCap) * 100;
}

/**
 * Helper function to get top gainers
 * @param {number} limit - Number of assets to return
 * @returns {Promise<Array>} Top gaining assets
 */
async function getTopGainers(limit = 5) {
  return await MarketData.find({
    change24h: { $exists: true, $ne: null }
  }, {
    symbol: 1,
    name: 1,
    price: 1,
    change24h: 1
  }).sort({ change24h: -1 }).limit(limit);
}

/**
 * Helper function to get top losers
 * @param {number} limit - Number of assets to return
 * @returns {Promise<Array>} Top losing assets
 */
async function getTopLosers(limit = 5) {
  return await MarketData.find({
    change24h: { $exists: true, $ne: null }
  }, {
    symbol: 1,
    name: 1,
    price: 1,
    change24h: 1
  }).sort({ change24h: 1 }).limit(limit);
}

/**
 * Helper function to resample historical data based on the requested interval
 * @param {Array} data - Historical price data
 * @param {string} interval - Requested interval (hourly, daily, weekly)
 * @returns {Array} Resampled data
 */
function resampleHistoricalData(data, interval) {
  if (!data || data.length === 0) {
    return [];
  }
  
  // If interval is hourly, return data as is (assuming it's already hourly)
  if (interval === 'hourly') {
    return data;
  }
  
  const resampledData = [];
  let currentGroup = [];
  let currentDate = new Date(data[0].timestamp);
  
  // Set the start of the current period
  if (interval === 'daily') {
    currentDate.setHours(0, 0, 0, 0);
  } else if (interval === 'weekly') {
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    currentDate.setHours(0, 0, 0, 0);
  }
  
  // Group data by interval
  for (const point of data) {
    const pointDate = new Date(point.timestamp);
    
    let isNewPeriod = false;
    if (interval === 'daily') {
      isNewPeriod = pointDate.getDate() !== currentDate.getDate() ||
                    pointDate.getMonth() !== currentDate.getMonth() ||
                    pointDate.getFullYear() !== currentDate.getFullYear();
    } else if (interval === 'weekly') {
      // Check if we crossed into a new week
      const weekStart = new Date(pointDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      isNewPeriod = weekStart.getTime() !== currentDate.getTime();
    }
    
    if (isNewPeriod && currentGroup.length > 0) {
      // Calculate OHLC for the current group
      resampledData.push(calculateOHLC(currentGroup, currentDate));
      currentGroup = [];
      
      // Update current date
      if (interval === 'daily') {
        currentDate = new Date(pointDate);
        currentDate.setHours(0, 0, 0, 0);
      } else if (interval === 'weekly') {
        currentDate = new Date(pointDate);
        currentDate.setDate(currentDate.getDate() - currentDate.getDay());
        currentDate.setHours(0, 0, 0, 0);
      }
    }
    
    currentGroup.push(point);
  }
  
  // Add the last group
  if (currentGroup.length > 0) {
    resampledData.push(calculateOHLC(currentGroup, currentDate));
  }
  
  return resampledData;
}

/**
 * Helper function to calculate OHLC (Open, High, Low, Close) for a group of data points
 * @param {Array} group - Group of data points
 * @param {Date} timestamp - Timestamp for the group
 * @returns {Object} OHLC data
 */
function calculateOHLC(group, timestamp) {
  if (!group || group.length === 0) {
    return null;
  }
  
  const open = group[0].price;
  const close = group[group.length - 1].price;
  const high = Math.max(...group.map(p => p.price));
  const low = Math.min(...group.map(p => p.price));
  const volume = group.reduce((sum, p) => sum + (p.volume || 0), 0);
  
  return {
    timestamp: timestamp.toISOString(),
    open,
    high,
    low,
    close,
    volume
  };
}

module.exports = router; 