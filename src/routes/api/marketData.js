/**
 * Market Data API Routes
 * Exposes endpoints for retrieving market data
 */

const express = require('express');
const { marketDataService } = require('../../services/marketData');
const { asyncHandler } = require('../../utils/asyncHandler');
const { validateSymbol, validateTimeframe } = require('../../utils/validators');
const { AppError } = require('../../utils/errors');

const router = express.Router();

/**
 * @route GET /api/market-data/price/:symbol
 * @desc Get current price for a symbol
 * @access Public
 */
router.get('/price/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  // Validate input
  if (!validateSymbol(symbol)) {
    throw new AppError('Invalid symbol', 400);
  }
  
  const price = await marketDataService.getPrice(symbol);
  
  res.json({
    success: true,
    data: {
      symbol,
      price,
      timestamp: Date.now()
    }
  });
}));

/**
 * @route GET /api/market-data/prices
 * @desc Get prices for multiple symbols
 * @access Public
 */
router.get('/prices', asyncHandler(async (req, res) => {
  let { symbols } = req.query;
  
  if (!symbols) {
    throw new AppError('No symbols provided', 400);
  }
  
  // Parse symbols from comma-separated string or array
  const symbolsArray = Array.isArray(symbols) ? symbols : symbols.split(',');
  
  // Validate each symbol
  for (const symbol of symbolsArray) {
    if (!validateSymbol(symbol)) {
      throw new AppError(`Invalid symbol: ${symbol}`, 400);
    }
  }
  
  const prices = await marketDataService.getPrices(symbolsArray);
  
  const result = Object.entries(prices).map(([symbol, price]) => ({
    symbol,
    price,
    timestamp: Date.now()
  }));
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * @route GET /api/market-data/historical/:symbol
 * @desc Get historical price data for a symbol
 * @access Public
 */
router.get('/historical/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { timeframe = '30d' } = req.query;
  
  // Validate input
  if (!validateSymbol(symbol)) {
    throw new AppError('Invalid symbol', 400);
  }
  
  if (!validateTimeframe(timeframe)) {
    throw new AppError('Invalid timeframe. Valid options: 1d, 7d, 30d, 90d, 1y', 400);
  }
  
  const data = await marketDataService.getHistoricalPrices(symbol, timeframe);
  
  res.json({
    success: true,
    data: {
      symbol,
      timeframe,
      prices: data
    }
  });
}));

/**
 * @route GET /api/market-data/market/:symbol
 * @desc Get detailed market data for a symbol
 * @access Public
 */
router.get('/market/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  // Validate input
  if (!validateSymbol(symbol)) {
    throw new AppError('Invalid symbol', 400);
  }
  
  const data = await marketDataService.getMarketData(symbol);
  
  res.json({
    success: true,
    data: {
      symbol,
      ...data,
      timestamp: Date.now()
    }
  });
}));

/**
 * @route GET /api/market-data/markets
 * @desc Get market data for multiple symbols
 * @access Public
 */
router.get('/markets', asyncHandler(async (req, res) => {
  let { symbols } = req.query;
  
  if (!symbols) {
    throw new AppError('No symbols provided', 400);
  }
  
  // Parse symbols from comma-separated string or array
  const symbolsArray = Array.isArray(symbols) ? symbols : symbols.split(',');
  
  // Validate each symbol
  for (const symbol of symbolsArray) {
    if (!validateSymbol(symbol)) {
      throw new AppError(`Invalid symbol: ${symbol}`, 400);
    }
  }
  
  const data = await marketDataService.getMarketsData(symbolsArray);
  
  const result = Object.entries(data).map(([symbol, marketData]) => ({
    symbol,
    ...marketData,
    timestamp: Date.now()
  }));
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * @route POST /api/market-data/cache/invalidate/:symbol
 * @desc Invalidate cache for a symbol
 * @access Admin (should be protected in production)
 */
router.post('/cache/invalidate/:symbol', asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  // Validate input
  if (!validateSymbol(symbol)) {
    throw new AppError('Invalid symbol', 400);
  }
  
  marketDataService.invalidateCache(symbol);
  
  res.json({
    success: true,
    message: `Cache invalidated for ${symbol}`
  });
}));

/**
 * @route POST /api/market-data/cache/clear
 * @desc Clear all caches
 * @access Admin (should be protected in production)
 */
router.post('/cache/clear', asyncHandler(async (req, res) => {
  marketDataService.clearAllCaches();
  
  res.json({
    success: true,
    message: 'All market data caches cleared'
  });
}));

module.exports = router; 