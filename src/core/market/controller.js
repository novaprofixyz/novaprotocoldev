/**
 * Market Controller for NOVA Protocol
 * Handles market data and analysis endpoints
 */

const { createContextLogger } = require('../../utils/logger');
const marketLogger = createContextLogger('MarketController');
const { fetchMarketData, getLatestPrice } = require('../../services/marketData');
const { analyzeMarketData } = require('../aide/marketAnalyzer');
const { AppError } = require('../../utils/errors');

// Default list of assets to include in market overview
const DEFAULT_ASSETS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC'];

/**
 * Get market overview data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getMarketOverview(req, res, next) {
  try {
    marketLogger.info('Generating market overview');
    
    // Get assets to include in overview
    const assets = req.query.assets ? 
      req.query.assets.split(',') : 
      DEFAULT_ASSETS;
    
    // Get latest prices for all assets
    const assetData = await Promise.all(
      assets.map(async (asset) => {
        try {
          const price = await getLatestPrice(asset);
          // For MVP, generate random change values
          // In production, we'd calculate actual changes
          const change24h = parseFloat((Math.random() * 20 - 10).toFixed(2)); // -10% to +10%
          const change7d = parseFloat((Math.random() * 30 - 15).toFixed(2)); // -15% to +15%
          
          return {
            symbol: asset,
            name: getAssetName(asset),
            price,
            change24h,
            change7d,
            marketCap: calculateMarketCap(asset, price),
            volume24h: calculateVolume(asset, price)
          };
        } catch (error) {
          marketLogger.error(`Error fetching data for ${asset}: ${error.message}`);
          return {
            symbol: asset,
            name: getAssetName(asset),
            error: 'Failed to fetch data'
          };
        }
      })
    );
    
    // Get overall market metrics
    const marketMetrics = generateMarketMetrics();
    
    // Generate trending assets
    const trendingAssets = generateTrendingAssets();
    
    // Generate market sentiment
    const marketSentiment = {
      overall: Math.random() > 0.5 ? 'bullish' : 'bearish',
      score: parseFloat((Math.random() * 100).toFixed(2)),
      change24h: parseFloat((Math.random() * 10 - 5).toFixed(2))
    };
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      marketMetrics,
      assets: assetData,
      trendingAssets,
      marketSentiment
    });
  } catch (error) {
    marketLogger.error(`Error in market overview: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

/**
 * Get list of available assets
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAssets(req, res, next) {
  try {
    marketLogger.info('Fetching asset list');
    
    // For MVP, return a hardcoded list of assets
    // In production, this would come from a database or external API
    const { category, limit = 50, offset = 0 } = req.query;
    
    // Get all supported assets
    const allAssets = getSupportedAssets();
    
    // Filter by category if specified
    let filteredAssets = allAssets;
    if (category) {
      filteredAssets = allAssets.filter(asset => asset.categories.includes(category));
    }
    
    // Apply pagination
    const paginatedAssets = filteredAssets.slice(offset, offset + limit);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      assets: paginatedAssets,
      pagination: {
        total: filteredAssets.length,
        offset: parseInt(offset),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    marketLogger.error(`Error fetching assets: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

/**
 * Get detailed information about a specific asset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getAssetDetails(req, res, next) {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return next(new AppError('Asset symbol is required', 400));
    }
    
    marketLogger.info(`Fetching details for asset: ${symbol}`);
    
    // Get basic asset info
    const asset = getSupportedAssets().find(a => a.symbol === symbol.toUpperCase());
    
    if (!asset) {
      return next(new AppError(`Asset not found: ${symbol}`, 404));
    }
    
    // Get current price and market data
    const price = await getLatestPrice(symbol);
    
    // For MVP, generate mock data
    // In production, this would come from real data sources
    const assetDetails = {
      ...asset,
      price,
      marketCap: calculateMarketCap(symbol, price),
      volume24h: calculateVolume(symbol, price),
      allTimeHigh: {
        price: price * (1.5 + Math.random()),
        date: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Random date within last year
        percentDown: parseFloat((Math.random() * 30).toFixed(2))
      },
      change: {
        '1h': parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
        '24h': parseFloat((Math.random() * 10 - 5).toFixed(2)),
        '7d': parseFloat((Math.random() * 20 - 10).toFixed(2)),
        '30d': parseFloat((Math.random() * 30 - 15).toFixed(2)),
        '90d': parseFloat((Math.random() * 50 - 25).toFixed(2))
      },
      supplyInfo: {
        circulating: Math.floor(Math.random() * 100000000),
        total: Math.floor(Math.random() * 1000000000),
        maxSupply: symbol === 'BTC' ? 21000000 : null
      },
      description: asset.description || `${asset.name} is a digital asset on the ${asset.blockchain} blockchain.`
    };
    
    // Get mock social metrics
    assetDetails.socialMetrics = {
      twitterFollowers: Math.floor(Math.random() * 1000000),
      redditSubscribers: Math.floor(Math.random() * 500000),
      telegramMembers: Math.floor(Math.random() * 200000),
      githubCommits: Math.floor(Math.random() * 10000),
      sentiment: parseFloat((Math.random()).toFixed(2))
    };
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      asset: assetDetails
    });
  } catch (error) {
    marketLogger.error(`Error fetching asset details: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

/**
 * Get market trends and patterns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getMarketTrends(req, res, next) {
  try {
    marketLogger.info('Generating market trends');
    
    const { timeframe = '1d', limit = 5 } = req.query;
    
    // For MVP, use the market analyzer module to get trend data
    const analysis = await analyzeMarketData({
      timeframe,
      assets: DEFAULT_ASSETS
    });
    
    // Extract and organize trend data
    const trendingBullish = Object.entries(analysis.trends)
      .filter(([asset, trend]) => trend.shortTerm.direction === 'bullish')
      .sort((a, b) => b[1].shortTerm.strength - a[1].shortTerm.strength)
      .slice(0, limit)
      .map(([asset, trend]) => ({
        symbol: asset,
        name: getAssetName(asset),
        price: analysis.assets.find(a => a.symbol === asset)?.price || 0,
        change24h: analysis.assets.find(a => a.symbol === asset)?.change24h || 0,
        strength: trend.shortTerm.strength,
        description: trend.shortTerm.description
      }));
      
    const trendingBearish = Object.entries(analysis.trends)
      .filter(([asset, trend]) => trend.shortTerm.direction === 'bearish')
      .sort((a, b) => b[1].shortTerm.strength - a[1].shortTerm.strength)
      .slice(0, limit)
      .map(([asset, trend]) => ({
        symbol: asset,
        name: getAssetName(asset),
        price: analysis.assets.find(a => a.symbol === asset)?.price || 0,
        change24h: analysis.assets.find(a => a.symbol === asset)?.change24h || 0,
        strength: trend.shortTerm.strength,
        description: trend.shortTerm.description
      }));
    
    // Get potential breakouts
    const potentialBreakouts = Object.entries(analysis.trends)
      .filter(([asset, trend]) => trend.breakouts.detected)
      .sort((a, b) => b[1].breakouts.strength - a[1].breakouts.strength)
      .slice(0, limit)
      .map(([asset, trend]) => ({
        symbol: asset,
        name: getAssetName(asset),
        price: analysis.assets.find(a => a.symbol === asset)?.price || 0,
        type: trend.breakouts.type,
        level: trend.breakouts.level,
        strength: trend.breakouts.strength
      }));
    
    // Get market correlations
    const correlations = analysis.correlations;
    
    // Get market recommendations
    const recommendations = analysis.recommendations;
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      timeframe,
      marketSentiment: analysis.marketSentiment,
      trends: {
        bullish: trendingBullish,
        bearish: trendingBearish,
        breakouts: potentialBreakouts
      },
      correlations: {
        highestCorrelated: getHighestCorrelatedPairs(correlations, 5),
        lowestCorrelated: getLowestCorrelatedPairs(correlations, 5)
      },
      recommendations
    });
  } catch (error) {
    marketLogger.error(`Error generating market trends: ${error.message}`);
    next(new AppError(error.message, 500));
  }
}

// Helper functions

/**
 * Get user-friendly name for an asset symbol
 * @param {string} symbol - Asset symbol
 * @returns {string} Asset name
 */
function getAssetName(symbol) {
  const assetNames = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    BNB: 'Binance Coin',
    SOL: 'Solana',
    ADA: 'Cardano',
    DOT: 'Polkadot',
    AVAX: 'Avalanche',
    MATIC: 'Polygon',
    LINK: 'Chainlink',
    UNI: 'Uniswap',
    XRP: 'XRP',
    DOGE: 'Dogecoin',
    SHIB: 'Shiba Inu',
    LTC: 'Litecoin',
    ATOM: 'Cosmos'
  };
  
  return assetNames[symbol] || symbol;
}

/**
 * Calculate approximate market cap for an asset
 * @param {string} symbol - Asset symbol
 * @param {number} price - Current price
 * @returns {number} Approximate market cap
 */
function calculateMarketCap(symbol, price) {
  // Mock circulating supply data
  const circulatingSupply = {
    BTC: 19000000,
    ETH: 120000000,
    BNB: 150000000,
    SOL: 350000000,
    ADA: 35000000000,
    DOT: 1000000000,
    AVAX: 300000000,
    MATIC: 9000000000
  };
  
  const supply = circulatingSupply[symbol] || 1000000000;
  return price * supply;
}

/**
 * Calculate approximate 24h trading volume
 * @param {string} symbol - Asset symbol
 * @param {number} price - Current price
 * @returns {number} Approximate 24h volume
 */
function calculateVolume(symbol, price) {
  // Generate realistic volume (typically a percentage of market cap)
  const volumeFactors = {
    BTC: 0.05,
    ETH: 0.07,
    BNB: 0.06,
    SOL: 0.08,
    ADA: 0.04,
    DOT: 0.05,
    AVAX: 0.07,
    MATIC: 0.09
  };
  
  const factor = volumeFactors[symbol] || 0.05;
  const marketCap = calculateMarketCap(symbol, price);
  return marketCap * factor;
}

/**
 * Generate overall market metrics
 * @returns {Object} Market metrics
 */
function generateMarketMetrics() {
  return {
    totalMarketCap: 1.5e12 + (Math.random() * 5e11), // $1.5-2T
    totalVolume24h: 5e10 + (Math.random() * 5e10), // $50-100B
    btcDominance: 40 + (Math.random() * 10), // 40-50%
    ethDominance: 15 + (Math.random() * 5), // 15-20%
    totalCryptoAssets: 5000 + Math.floor(Math.random() * 3000), // 5000-8000
    activeMarkets: 25000 + Math.floor(Math.random() * 5000) // 25000-30000
  };
}

/**
 * Generate trending assets list
 * @returns {Array} Trending assets
 */
function generateTrendingAssets() {
  // For MVP, generate a mock list of trending assets
  // In production, this would be based on social media mentions, search volume, etc.
  const trendingPool = [
    { symbol: 'BTC', name: 'Bitcoin', score: 95 + Math.random() * 5 },
    { symbol: 'ETH', name: 'Ethereum', score: 90 + Math.random() * 10 },
    { symbol: 'SOL', name: 'Solana', score: 85 + Math.random() * 15 },
    { symbol: 'MATIC', name: 'Polygon', score: 80 + Math.random() * 15 },
    { symbol: 'AVAX', name: 'Avalanche', score: 75 + Math.random() * 20 },
    { symbol: 'DOT', name: 'Polkadot', score: 70 + Math.random() * 20 },
    { symbol: 'LINK', name: 'Chainlink', score: 65 + Math.random() * 20 },
    { symbol: 'ADA', name: 'Cardano', score: 60 + Math.random() * 20 },
    { symbol: 'UNI', name: 'Uniswap', score: 55 + Math.random() * 20 },
    { symbol: 'DOGE', name: 'Dogecoin', score: 50 + Math.random() * 30 }
  ];
  
  // Sort by score and return top 5
  return trendingPool
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(asset => ({
      ...asset,
      change24h: parseFloat((Math.random() * 20 - 5).toFixed(2)) // Trending assets more likely to be up
    }));
}

/**
 * Get list of supported assets
 * @returns {Array} List of supported assets
 */
function getSupportedAssets() {
  // For MVP, return a hardcoded list
  return [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      logo: '/static/images/assets/btc.svg',
      blockchain: 'Bitcoin',
      categories: ['CRYPTO', 'STORE_OF_VALUE', 'CURRENCY'],
      description: 'Bitcoin is the first decentralized cryptocurrency.'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: '/static/images/assets/eth.svg',
      blockchain: 'Ethereum',
      categories: ['CRYPTO', 'SMART_CONTRACT_PLATFORM', 'LAYER_1'],
      description: 'Ethereum is a decentralized platform that runs smart contracts.'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      logo: '/static/images/assets/bnb.svg',
      blockchain: 'Binance Chain',
      categories: ['CRYPTO', 'EXCHANGE_TOKEN', 'SMART_CONTRACT_PLATFORM', 'LAYER_1'],
      description: 'Binance Coin is the native token of the Binance ecosystem.'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      logo: '/static/images/assets/sol.svg',
      blockchain: 'Solana',
      categories: ['CRYPTO', 'SMART_CONTRACT_PLATFORM', 'LAYER_1'],
      description: 'Solana is a high-performance blockchain supporting builders around the world.'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      logo: '/static/images/assets/ada.svg',
      blockchain: 'Cardano',
      categories: ['CRYPTO', 'SMART_CONTRACT_PLATFORM', 'LAYER_1'],
      description: 'Cardano is a proof-of-stake blockchain platform.'
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      logo: '/static/images/assets/dot.svg',
      blockchain: 'Polkadot',
      categories: ['CRYPTO', 'INTEROPERABILITY', 'LAYER_0'],
      description: 'Polkadot is a platform that allows diverse blockchains to transfer messages and value.'
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      logo: '/static/images/assets/avax.svg',
      blockchain: 'Avalanche',
      categories: ['CRYPTO', 'SMART_CONTRACT_PLATFORM', 'LAYER_1'],
      description: 'Avalanche is a layer one blockchain that functions as a platform for decentralized applications.'
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      logo: '/static/images/assets/matic.svg',
      blockchain: 'Polygon',
      categories: ['CRYPTO', 'SCALING_SOLUTION', 'LAYER_2'],
      description: 'Polygon is a protocol and a framework for building and connecting Ethereum-compatible blockchain networks.'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      logo: '/static/images/assets/link.svg',
      blockchain: 'Ethereum',
      categories: ['CRYPTO', 'ORACLE', 'DEFI'],
      description: 'Chainlink is a decentralized oracle network that provides real-world data to smart contracts.'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      logo: '/static/images/assets/uni.svg',
      blockchain: 'Ethereum',
      categories: ['CRYPTO', 'DEX', 'DEFI'],
      description: 'Uniswap is a decentralized protocol for automated liquidity provision on Ethereum.'
    }
  ];
}

/**
 * Get highest correlated asset pairs
 * @param {Object} correlations - Correlation matrix
 * @param {number} limit - Number of pairs to return
 * @returns {Array} Highest correlated pairs
 */
function getHighestCorrelatedPairs(correlations, limit) {
  const pairs = [];
  
  // Extract all unique pairs
  const assets = Object.keys(correlations);
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const asset1 = assets[i];
      const asset2 = assets[j];
      
      pairs.push({
        pair: `${asset1}/${asset2}`,
        asset1,
        asset2,
        correlation: correlations[asset1][asset2]
      });
    }
  }
  
  // Sort by correlation (highest first) and return the top pairs
  return pairs
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
}

/**
 * Get lowest correlated asset pairs
 * @param {Object} correlations - Correlation matrix
 * @param {number} limit - Number of pairs to return
 * @returns {Array} Lowest correlated pairs
 */
function getLowestCorrelatedPairs(correlations, limit) {
  const pairs = [];
  
  // Extract all unique pairs
  const assets = Object.keys(correlations);
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const asset1 = assets[i];
      const asset2 = assets[j];
      
      pairs.push({
        pair: `${asset1}/${asset2}`,
        asset1,
        asset2,
        correlation: correlations[asset1][asset2]
      });
    }
  }
  
  // Sort by correlation (lowest first) and return the bottom pairs
  return pairs
    .sort((a, b) => a.correlation - b.correlation)
    .slice(0, limit);
}

module.exports = {
  getMarketOverview,
  getAssets,
  getAssetDetails,
  getMarketTrends
}; 