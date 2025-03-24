/**
 * Configuration utilities for NOVA Protocol
 * Centralizes configuration management for the application
 */

// In a production environment, these would be loaded from environment variables
// or a configuration file. For MVP, we're using defaults.

/**
 * Application configuration
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  // API configuration
  api: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // CORS configuration
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000']
    }
  },
  
  // Market data configuration
  marketData: {
    // Default assets to track
    defaultAssets: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'DOT', 'AVAX', 'MATIC'],
    
    // Default timeframe for market data
    defaultTimeframe: '1d',
    
    // Cache TTL in seconds
    cacheTTL: 60, // 1 minute
    
    // External API configuration (for future implementation)
    apis: {
      coinGecko: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        apiKey: process.env.COINGECKO_API_KEY || ''
      },
      binance: {
        baseUrl: 'https://api.binance.com/api/v3',
        apiKey: process.env.BINANCE_API_KEY || '',
        apiSecret: process.env.BINANCE_API_SECRET || ''
      }
    }
  },
  
  // AIDE configuration
  aide: {
    // Prediction confidence threshold (0-1)
    predictionConfidenceThreshold: 0.7,
    
    // Number of historical data points to use for predictions
    historicalDataPoints: 100,
    
    // Default timeframes for analysis
    analysisTimeframes: ['1d', '1w', '1M'],
    
    // Supported intent types
    supportedIntentTypes: [
      'INVESTMENT', 
      'DIVESTMENT', 
      'HEDGING', 
      'REBALANCING',
      'YIELD_GENERATION', 
      'OPTIMIZATION', 
      'ANALYSIS'
    ]
  }
};

/**
 * Get a configuration value
 * @param {string} path - Dot notation path to the configuration value
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Configuration value
 */
function get(path, defaultValue = null) {
  const keys = path.split('.');
  let current = config;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
}

module.exports = {
  get,
  config
}; 