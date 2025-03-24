/**
 * Market routes for NOVA Protocol
 * Defines API endpoints for market data and analysis
 */

const express = require('express');
const router = express.Router();
const marketController = require('../core/market/controller');
const { validateQuery, validateParams } = require('../middleware/validator');

// Validation schemas
const marketOverviewSchema = {
  assets: {
    type: 'string'
  }
};

const assetsListSchema = {
  category: {
    type: 'string'
  },
  limit: {
    type: 'integer',
    min: 1,
    max: 100,
    default: 50
  },
  offset: {
    type: 'integer',
    min: 0,
    default: 0
  }
};

const assetDetailsSchema = {
  symbol: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 10
  }
};

const marketTrendsSchema = {
  timeframe: {
    type: 'string',
    enum: ['1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  },
  limit: {
    type: 'integer',
    min: 1,
    max: 20,
    default: 5
  }
};

/**
 * @swagger
 * /api/market/overview:
 *   get:
 *     summary: Get market overview
 *     tags: [Market]
 *     description: Returns an overview of the market including asset prices, trends, and metrics
 *     parameters:
 *       - in: query
 *         name: assets
 *         schema:
 *           type: string
 *         description: Comma-separated list of asset symbols to include (e.g. BTC,ETH,SOL)
 *     responses:
 *       200:
 *         description: Market overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 marketMetrics:
 *                   type: object
 *                 assets:
 *                   type: array
 *                 trendingAssets:
 *                   type: array
 *                 marketSentiment:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/overview', validateQuery(marketOverviewSchema), marketController.getMarketOverview);

/**
 * @swagger
 * /api/market/assets:
 *   get:
 *     summary: Get list of supported assets
 *     tags: [Market]
 *     description: Returns a paginated list of supported assets with optional category filtering
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter assets by category (e.g. CRYPTO, DEFI, LAYER_1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of assets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of assets to skip for pagination
 *     responses:
 *       200:
 *         description: List of assets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 assets:
 *                   type: array
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/assets', validateQuery(assetsListSchema), marketController.getAssets);

/**
 * @swagger
 * /api/market/assets/{symbol}:
 *   get:
 *     summary: Get detailed information about a specific asset
 *     tags: [Market]
 *     description: Returns detailed information about a specific asset including price, market data, and metrics
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset symbol (e.g. BTC, ETH)
 *     responses:
 *       200:
 *         description: Asset details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 asset:
 *                   type: object
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.get('/assets/:symbol', validateParams(assetDetailsSchema), marketController.getAssetDetails);

/**
 * @swagger
 * /api/market/trends:
 *   get:
 *     summary: Get market trends and patterns
 *     tags: [Market]
 *     description: Returns market trends, patterns, correlations, and recommendations
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: 1d
 *           enum: [1h, 4h, 1d, 1w, 1M]
 *         description: Timeframe for the trend analysis
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of results to return for each trend type
 *     responses:
 *       200:
 *         description: Market trends data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 timeframe:
 *                   type: string
 *                 marketSentiment:
 *                   type: object
 *                 trends:
 *                   type: object
 *                 correlations:
 *                   type: object
 *                 recommendations:
 *                   type: array
 *       500:
 *         description: Server error
 */
router.get('/trends', validateQuery(marketTrendsSchema), marketController.getMarketTrends);

module.exports = router; 