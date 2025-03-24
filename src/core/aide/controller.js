/**
 * AI Decision Engine (AIDE) Controller
 * Handles AI-powered financial decision making and analysis
 */

const { createContextLogger } = require('../../utils/logger');
const aideLogger = createContextLogger('AIDE');
const { analyzeMarketData } = require('./marketAnalyzer');
const { predictAssetPrice } = require('./pricePrediction');
const { processUserIntent } = require('./intentProcessor');
const { AppError } = require('../../utils/errors');

/**
 * Get comprehensive market analysis from AIDE
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getMarketAnalysis(req, res, next) {
  try {
    const { timeframe = '1d', assets = [], indicators = [] } = req.query;
    
    aideLogger.info(`Generating market analysis for timeframe: ${timeframe}`);
    
    // Perform market analysis using the AI engine
    const analysis = await analyzeMarketData({
      timeframe,
      assets: assets.length ? assets.split(',') : [],
      indicators: indicators.length ? indicators.split(',') : []
    });
    
    return res.status(200).json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    aideLogger.error(`Error in market analysis: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

/**
 * Get asset price prediction from AIDE
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getPrediction(req, res, next) {
  try {
    const { asset, timeframe, indicators } = req.body;
    
    aideLogger.info(`Generating price prediction for ${asset} on timeframe: ${timeframe}`);
    
    // Generate prediction using the AI model
    const prediction = await predictAssetPrice({
      asset,
      timeframe,
      indicators: indicators || []
    });
    
    return res.status(200).json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    aideLogger.error(`Error in price prediction: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

/**
 * Process natural language intent and convert it to actionable strategy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function processIntent(req, res, next) {
  try {
    const { intent, context } = req.body;
    
    aideLogger.info(`Processing user intent: "${intent.substring(0, 50)}..."`);
    
    // Process the intent using the AI engine
    const result = await processUserIntent(intent, context);
    
    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    aideLogger.error(`Error in intent processing: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

module.exports = {
  getMarketAnalysis,
  getPrediction,
  processIntent
}; 