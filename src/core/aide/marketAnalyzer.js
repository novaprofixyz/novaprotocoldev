/**
 * Market Analyzer Module for AIDE
 * Analyzes market data and provides insights
 */

const { createContextLogger } = require('../../utils/logger');
const marketLogger = createContextLogger('MarketAnalyzer');
const { fetchMarketData } = require('../../services/marketData');
const { AppError } = require('../../utils/errors');

// Default indicators to calculate if none specified
const DEFAULT_INDICATORS = ['rsi', 'macd', 'bollinger_bands', 'volume_profile'];

// Default assets to analyze if none specified
const DEFAULT_ASSETS = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT'];

/**
 * Analyze market data and return insights
 * @param {Object} options - Analysis options
 * @param {string} options.timeframe - Time frame for the analysis (e.g., '1h', '1d')
 * @param {string[]} options.assets - Assets to analyze
 * @param {string[]} options.indicators - Technical indicators to calculate
 * @returns {Promise<Object>} Market analysis results
 */
async function analyzeMarketData(options) {
  try {
    const { 
      timeframe = '1d',
      assets = DEFAULT_ASSETS,
      indicators = DEFAULT_INDICATORS
    } = options;

    marketLogger.info(`Analyzing ${assets.length} assets on ${timeframe} timeframe`);
    
    // Fetch market data for the specified assets
    const marketData = await fetchMarketData(assets, timeframe);
    
    // Calculate technical indicators
    const technicalAnalysis = calculateIndicators(marketData, indicators);
    
    // Identify market trends
    const trends = identifyMarketTrends(marketData, technicalAnalysis);
    
    // Generate market sentiment
    const sentiment = generateMarketSentiment(trends);
    
    // Identify correlations between assets
    const correlations = calculateCorrelations(marketData);
    
    // Generate market recommendations
    const recommendations = generateRecommendations(trends, sentiment, technicalAnalysis);
    
    return {
      timestamp: new Date().toISOString(),
      timeframe,
      assets: assets.map(asset => ({
        symbol: asset,
        price: mockGetLatestPrice(asset), // Mock function for demo
        change24h: mockGetPriceChange(asset), // Mock function for demo
        technicalAnalysis: technicalAnalysis[asset],
        trends: trends[asset]
      })),
      marketSentiment: sentiment,
      correlations,
      recommendations
    };
  } catch (error) {
    marketLogger.error(`Error in market analysis: ${error.message}`);
    throw new AppError(`Failed to analyze market data: ${error.message}`, 500);
  }
}

/**
 * Calculate technical indicators for market data
 * @param {Object} marketData - Market data for multiple assets
 * @param {string[]} indicators - Technical indicators to calculate
 * @returns {Object} Technical analysis results
 */
function calculateIndicators(marketData, indicators) {
  marketLogger.debug(`Calculating ${indicators.length} indicators`);
  
  const result = {};
  
  // For each asset, calculate the requested indicators
  Object.keys(marketData).forEach(asset => {
    result[asset] = {};
    
    indicators.forEach(indicator => {
      switch (indicator.toLowerCase()) {
        case 'rsi':
          result[asset].rsi = calculateRSI(marketData[asset]);
          break;
        case 'macd':
          result[asset].macd = calculateMACD(marketData[asset]);
          break;
        case 'bollinger_bands':
          result[asset].bollingerBands = calculateBollingerBands(marketData[asset]);
          break;
        case 'volume_profile':
          result[asset].volumeProfile = calculateVolumeProfile(marketData[asset]);
          break;
        default:
          marketLogger.warn(`Unknown indicator: ${indicator}`);
      }
    });
  });
  
  return result;
}

/**
 * Identify market trends for assets
 * @param {Object} marketData - Market data for multiple assets
 * @param {Object} technicalAnalysis - Technical analysis results
 * @returns {Object} Market trends
 */
function identifyMarketTrends(marketData, technicalAnalysis) {
  marketLogger.debug('Identifying market trends');
  
  const trends = {};
  
  Object.keys(marketData).forEach(asset => {
    const data = marketData[asset];
    const analysis = technicalAnalysis[asset];
    
    // For demo purposes, generate mock trends
    trends[asset] = {
      shortTerm: mockTrendAnalysis(asset, 'short'),
      mediumTerm: mockTrendAnalysis(asset, 'medium'),
      longTerm: mockTrendAnalysis(asset, 'long'),
      breakouts: mockBreakoutPoints(asset),
      support: mockSupportLevel(asset),
      resistance: mockResistanceLevel(asset)
    };
  });
  
  return trends;
}

/**
 * Generate market sentiment based on trends
 * @param {Object} trends - Market trends for assets
 * @returns {Object} Market sentiment analysis
 */
function generateMarketSentiment(trends) {
  marketLogger.debug('Generating market sentiment');
  
  // Count the number of bullish, bearish, and neutral trends
  let bullishCount = 0;
  let bearishCount = 0;
  let neutralCount = 0;
  
  Object.values(trends).forEach(assetTrend => {
    if (assetTrend.shortTerm.direction === 'bullish') bullishCount++;
    else if (assetTrend.shortTerm.direction === 'bearish') bearishCount++;
    else neutralCount++;
  });
  
  const totalAssets = Object.keys(trends).length;
  
  // Calculate sentiment scores
  const bullishScore = bullishCount / totalAssets;
  const bearishScore = bearishCount / totalAssets;
  const neutralScore = neutralCount / totalAssets;
  
  // Determine overall sentiment
  let overallSentiment;
  if (bullishScore > bearishScore && bullishScore > neutralScore) {
    overallSentiment = 'bullish';
  } else if (bearishScore > bullishScore && bearishScore > neutralScore) {
    overallSentiment = 'bearish';
  } else {
    overallSentiment = 'neutral';
  }
  
  return {
    overall: overallSentiment,
    bullishScore: parseFloat((bullishScore * 100).toFixed(2)),
    bearishScore: parseFloat((bearishScore * 100).toFixed(2)),
    neutralScore: parseFloat((neutralScore * 100).toFixed(2)),
    strength: calculateSentimentStrength(bullishScore, bearishScore)
  };
}

/**
 * Calculate correlations between assets
 * @param {Object} marketData - Market data for multiple assets
 * @returns {Object} Correlation matrix
 */
function calculateCorrelations(marketData) {
  marketLogger.debug('Calculating asset correlations');
  
  const assets = Object.keys(marketData);
  const correlations = {};
  
  // Create an empty correlation matrix
  assets.forEach(asset1 => {
    correlations[asset1] = {};
    assets.forEach(asset2 => {
      // For demo purposes, generate mock correlations
      if (asset1 === asset2) {
        correlations[asset1][asset2] = 1.0;
      } else if (correlations[asset2] && correlations[asset2][asset1] !== undefined) {
        correlations[asset1][asset2] = correlations[asset2][asset1];
      } else {
        correlations[asset1][asset2] = parseFloat((Math.random() * 2 - 1).toFixed(2));
      }
    });
  });
  
  return correlations;
}

/**
 * Generate market recommendations based on analysis
 * @param {Object} trends - Market trends
 * @param {Object} sentiment - Market sentiment
 * @param {Object} technicalAnalysis - Technical analysis
 * @returns {Object} Market recommendations
 */
function generateRecommendations(trends, sentiment, technicalAnalysis) {
  marketLogger.debug('Generating market recommendations');
  
  const recommendations = {
    strongBuy: [],
    buy: [],
    hold: [],
    sell: [],
    strongSell: []
  };
  
  // Generate recommendations for each asset
  Object.keys(trends).forEach(asset => {
    const assetTrend = trends[asset];
    const analysis = technicalAnalysis[asset];
    
    // Make recommendations based on trends and technical analysis
    // This is a simplified mock implementation
    if (assetTrend.shortTerm.direction === 'bullish' && assetTrend.mediumTerm.direction === 'bullish') {
      if (assetTrend.longTerm.direction === 'bullish') {
        recommendations.strongBuy.push(asset);
      } else {
        recommendations.buy.push(asset);
      }
    } else if (assetTrend.shortTerm.direction === 'bearish' && assetTrend.mediumTerm.direction === 'bearish') {
      if (assetTrend.longTerm.direction === 'bearish') {
        recommendations.strongSell.push(asset);
      } else {
        recommendations.sell.push(asset);
      }
    } else {
      recommendations.hold.push(asset);
    }
  });
  
  // Add a brief analysis for each recommendation type
  return {
    recommendations,
    analysis: {
      strongBuy: recommendations.strongBuy.length ? 
        `Strong buying opportunity for ${recommendations.strongBuy.join(', ')} based on positive momentum across all timeframes` : 
        'No strong buying opportunities identified',
      buy: recommendations.buy.length ? 
        `Consider buying ${recommendations.buy.join(', ')} on short to medium-term strength` : 
        'No buying opportunities identified',
      hold: recommendations.hold.length ? 
        `Hold position on ${recommendations.hold.join(', ')} as market direction is unclear` : 
        'No holding recommendations',
      sell: recommendations.sell.length ? 
        `Consider selling ${recommendations.sell.join(', ')} on short to medium-term weakness` : 
        'No selling opportunities identified',
      strongSell: recommendations.strongSell.length ? 
        `Strong selling signals for ${recommendations.strongSell.join(', ')} based on negative momentum across all timeframes` : 
        'No strong selling opportunities identified'
    }
  };
}

/**
 * Calculate sentiment strength
 * @param {number} bullishScore - Bullish sentiment score
 * @param {number} bearishScore - Bearish sentiment score
 * @returns {number} Sentiment strength (0-100)
 */
function calculateSentimentStrength(bullishScore, bearishScore) {
  // Calculate the absolute difference between bullish and bearish scores
  const difference = Math.abs(bullishScore - bearishScore);
  
  // Map to a 0-100 scale
  return parseFloat((difference * 100).toFixed(2));
}

// Mock implementations of indicator calculations for MVP demo
function calculateRSI(data) {
  return {
    value: Math.floor(Math.random() * 100),
    signal: Math.random() > 0.5 ? 'overbought' : 'oversold'
  };
}

function calculateMACD(data) {
  return {
    line: (Math.random() * 2 - 1).toFixed(2),
    signal: (Math.random() * 2 - 1).toFixed(2),
    histogram: (Math.random() * 2 - 1).toFixed(2),
    trend: Math.random() > 0.5 ? 'bullish' : 'bearish'
  };
}

function calculateBollingerBands(data) {
  const middle = 100 + Math.random() * 10;
  const band = 5 + Math.random() * 5;
  
  return {
    upper: middle + band,
    middle: middle,
    lower: middle - band,
    width: band * 2,
    signal: Math.random() > 0.5 ? 'squeeze' : 'expansion'
  };
}

function calculateVolumeProfile(data) {
  return {
    valueArea: {
      high: 105 + Math.random() * 5,
      low: 95 - Math.random() * 5
    },
    poc: 100 + Math.random() * 2 - 1
  };
}

// Mock functions for price data in MVP demo
function mockGetLatestPrice(asset) {
  const basePrices = {
    BTC: 50000,
    ETH: 3000,
    BNB: 400,
    ADA: 1.5,
    SOL: 150,
    DOT: 30
  };
  
  const price = basePrices[asset] || 100;
  return price * (0.95 + Math.random() * 0.1); // Fluctuate by ±5%
}

function mockGetPriceChange(asset) {
  return parseFloat((Math.random() * 20 - 10).toFixed(2)); // -10% to +10%
}

function mockTrendAnalysis(asset, timeframe) {
  const directions = ['bullish', 'bearish', 'neutral'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  
  const strength = {
    bullish: 0.6 + Math.random() * 0.4,
    bearish: 0.6 + Math.random() * 0.4,
    neutral: 0.3 + Math.random() * 0.4
  };
  
  return {
    direction,
    strength: parseFloat(strength[direction].toFixed(2)),
    description: `${direction.charAt(0).toUpperCase() + direction.slice(1)} trend with ${Math.round(strength[direction] * 100)}% confidence`
  };
}

function mockBreakoutPoints(asset) {
  const breakoutTypes = ['resistance', 'support', 'none'];
  const type = breakoutTypes[Math.floor(Math.random() * breakoutTypes.length)];
  
  if (type === 'none') {
    return { detected: false };
  }
  
  return {
    detected: true,
    type,
    level: mockGetLatestPrice(asset) * (type === 'resistance' ? 1.05 : 0.95),
    strength: parseFloat((0.6 + Math.random() * 0.4).toFixed(2))
  };
}

function mockSupportLevel(asset) {
  const basePrice = mockGetLatestPrice(asset);
  return parseFloat((basePrice * (0.9 - Math.random() * 0.05)).toFixed(2));
}

function mockResistanceLevel(asset) {
  const basePrice = mockGetLatestPrice(asset);
  return parseFloat((basePrice * (1.1 + Math.random() * 0.05)).toFixed(2));
}

module.exports = {
  analyzeMarketData
}; 