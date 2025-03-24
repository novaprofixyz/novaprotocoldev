/**
 * AIDE routes for NOVA Protocol
 * Defines API endpoints for AI-driven financial services
 */

const express = require('express');
const router = express.Router();
const { createContextLogger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { validateBody, validateParams, validateQuery } = require('../middleware/validator');
const {
  analyzeMarketData,
  predictAssetPrice,
  processUserIntent,
  processFinancialRequest
} = require('../core/aide');

const aideLogger = createContextLogger('AideRoutes');

// Validation schemas
const intentSchema = {
  intent: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 1000
  }
};

const assetPredictionSchema = {
  asset: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 10
  }
};

const predictionQuerySchema = {
  timeframe: {
    type: 'string',
    enum: ['1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  }
};

const analyzeQuerySchema = {
  assets: {
    type: 'string'
  },
  timeframe: {
    type: 'string',
    enum: ['1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  }
};

const processRequestSchema = {
  intent: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 1000
  },
  assets: {
    type: 'array'
  },
  timeframe: {
    type: 'string',
    enum: ['1h', '4h', '1d', '1w', '1M']
  }
};

/**
 * @swagger
 * /api/aide/intent:
 *   post:
 *     summary: Process a natural language financial intent
 *     tags: [AIDE]
 *     description: Processes a user's natural language financial intent and generates an actionable strategy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - intent
 *             properties:
 *               intent:
 *                 type: string
 *                 description: User's natural language financial intent
 *                 example: "I want to invest $1000 in Bitcoin and Ethereum with a medium risk profile"
 *     responses:
 *       200:
 *         description: Processed intent with strategy
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
 *                 result:
 *                   type: object
 *                   properties:
 *                     intentType:
 *                       type: string
 *                       example: "INVESTMENT"
 *                     parameters:
 *                       type: object
 *                     strategy:
 *                       type: object
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/intent', validateBody(intentSchema), async (req, res, next) => {
  try {
    const { intent } = req.body;
    
    aideLogger.info(`Processing intent: ${intent.substring(0, 50)}...`);
    
    const result = await processUserIntent(intent);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    aideLogger.error(`Error processing intent: ${error.message}`);
    next(new AppError(error.message, 500));
  }
});

/**
 * @swagger
 * /api/aide/predict/{asset}:
 *   get:
 *     summary: Get price prediction for an asset
 *     tags: [AIDE]
 *     description: Returns price predictions for a specific asset with confidence levels
 *     parameters:
 *       - in: path
 *         name: asset
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset symbol (e.g. BTC, ETH)
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: 1d
 *           enum: [1h, 4h, 1d, 1w, 1M]
 *         description: Timeframe for the prediction
 *     responses:
 *       200:
 *         description: Price prediction data
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
 *                   type: string
 *                   example: "BTC"
 *                 timeframe:
 *                   type: string
 *                   example: "1d"
 *                 prediction:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get('/predict/:asset', 
  validateParams(assetPredictionSchema),
  validateQuery(predictionQuerySchema),
  async (req, res, next) => {
    try {
      const { asset } = req.params;
      const { timeframe = '1d' } = req.query;
      
      aideLogger.info(`Predicting price for ${asset} on ${timeframe} timeframe`);
      
      const prediction = await predictAssetPrice({
        asset: asset.toUpperCase(),
        timeframe
      });
      
      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        asset: asset.toUpperCase(),
        timeframe,
        prediction
      });
    } catch (error) {
      aideLogger.error(`Error predicting price: ${error.message}`);
      next(new AppError(error.message, 500));
    }
});

/**
 * @swagger
 * /api/aide/analyze:
 *   get:
 *     summary: Analyze market data
 *     tags: [AIDE]
 *     description: Analyzes market data for specified assets and returns insights
 *     parameters:
 *       - in: query
 *         name: assets
 *         schema:
 *           type: string
 *         description: Comma-separated list of asset symbols to analyze (e.g. BTC,ETH,SOL)
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: 1d
 *           enum: [1h, 4h, 1d, 1w, 1M]
 *         description: Timeframe for the analysis
 *     responses:
 *       200:
 *         description: Market analysis data
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
 *                   example: "1d"
 *                 assets:
 *                   type: array
 *                 analysis:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/analyze', validateQuery(analyzeQuerySchema), async (req, res, next) => {
  try {
    const { assets, timeframe = '1d' } = req.query;
    
    const assetsList = assets ? assets.split(',') : ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];
    
    aideLogger.info(`Analyzing market data for ${assetsList.join(', ')} on ${timeframe} timeframe`);
    
    const analysis = await analyzeMarketData({
      assets: assetsList,
      timeframe
    });
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      timeframe,
      assets: assetsList,
      analysis
    });
  } catch (error) {
    aideLogger.error(`Error analyzing market data: ${error.message}`);
    next(new AppError(error.message, 500));
  }
});

/**
 * @swagger
 * /api/aide/process:
 *   post:
 *     summary: Process a complete financial request
 *     tags: [AIDE]
 *     description: Processes a financial request combining intent processing, market analysis, and price prediction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - intent
 *             properties:
 *               intent:
 *                 type: string
 *                 description: User's natural language financial intent
 *                 example: "I want to diversify my portfolio with low-risk assets"
 *               assets:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of assets to consider
 *               timeframe:
 *                 type: string
 *                 description: Timeframe for analysis
 *                 default: "1d"
 *     responses:
 *       200:
 *         description: Processed financial request with comprehensive strategy
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
 *                 request:
 *                   type: object
 *                 result:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/process', validateBody(processRequestSchema), async (req, res, next) => {
  try {
    const { intent, assets, timeframe } = req.body;
    
    aideLogger.info(`Processing financial request: ${intent.substring(0, 50)}...`);
    
    const result = await processFinancialRequest({
      intent,
      assets,
      timeframe
    });
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error) {
    aideLogger.error(`Error processing financial request: ${error.message}`);
    next(new AppError(error.message, 500));
  }
});

module.exports = router; 