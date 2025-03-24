/**
 * AIDE (Artificial Intelligence for Decentralized Economics)
 * Main entry point that exports all AIDE modules
 */

const { analyzeMarketData } = require('./marketAnalyzer');
const { predictAssetPrice } = require('./pricePrediction');
const { processUserIntent } = require('./intentProcessor');

/**
 * Process a complete financial request
 * Combines market analysis, price prediction, and intent processing
 * 
 * @param {Object} options - Processing options
 * @param {string} options.intent - User's natural language intent
 * @param {string[]} [options.assets] - Assets to consider
 * @param {string} [options.timeframe] - Timeframe to analyze
 * @returns {Object} - Processed result with strategy and supporting data
 */
async function processFinancialRequest(options) {
  try {
    const { intent, assets = ['BTC', 'ETH', 'BNB', 'SOL'], timeframe = '1d' } = options;
    
    // First, process the user's intent to understand what they want to achieve
    const intentResult = await processUserIntent(intent);
    
    // Get market analysis for the relevant assets
    const marketAnalysis = await analyzeMarketData({ 
      assets: intentResult.parameters.targetAssets || assets,
      timeframe
    });
    
    // For assets that need price prediction, get forecasts
    const predictions = {};
    for (const asset of intentResult.parameters.targetAssets || []) {
      if (intentResult.intentType !== 'ANALYSIS') {
        predictions[asset] = await predictAssetPrice({
          asset,
          timeframe
        });
      }
    }
    
    // Enhance the strategy with market analysis and predictions
    const enhancedStrategy = {
      ...intentResult,
      marketData: {
        analysis: marketAnalysis,
        predictions
      }
    };
    
    return {
      success: true,
      request: {
        intent,
        processedAt: new Date().toISOString()
      },
      result: enhancedStrategy
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      request: {
        intent: options.intent,
        processedAt: new Date().toISOString()
      }
    };
  }
}

module.exports = {
  analyzeMarketData,
  predictAssetPrice,
  processUserIntent,
  processFinancialRequest
}; 