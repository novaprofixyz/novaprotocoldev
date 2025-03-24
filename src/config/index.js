/**
 * Configuration Module for NOVA Protocol
 * Centralizes all application configuration
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Server Configuration
 */
const server = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || '/api',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  cookieSecret: process.env.COOKIE_SECRET || 'nova-protocol-secret',
  trustProxy: process.env.TRUST_PROXY === 'true'
};

/**
 * Database Configuration
 */
const database = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-protocol',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: process.env.NODE_ENV !== 'production'
  },
  debug: process.env.DB_DEBUG === 'true'
};

/**
 * Cache Configuration
 */
const cache = {
  enabled: process.env.CACHE_ENABLED !== 'false',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  ttl: {
    default: parseInt(process.env.CACHE_TTL_DEFAULT || '300', 10), // 5 minutes
    marketData: parseInt(process.env.CACHE_TTL_MARKET_DATA || '60', 10), // 1 minute
    assets: parseInt(process.env.CACHE_TTL_ASSETS || '3600', 10), // 1 hour
    portfolios: parseInt(process.env.CACHE_TTL_PORTFOLIOS || '300', 10) // 5 minutes
  }
};

/**
 * Authentication Configuration
 */
const auth = {
  jwtSecret: process.env.JWT_SECRET || 'nova-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  refreshTokenExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '7', 10) * 24 * 60 * 60 * 1000, // 7 days in ms
  passwordResetExpiration: parseInt(process.env.PASSWORD_RESET_EXPIRATION || '1', 10) * 60 * 60 * 1000 // 1 hour in ms
};

/**
 * API Rate Limiting Configuration
 */
const rateLimits = {
  enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

/**
 * Market Data Configuration
 */
const marketData = {
  providers: {
    primary: process.env.PRIMARY_MARKET_DATA_PROVIDER || 'coinmarketcap',
    fallback: process.env.FALLBACK_MARKET_DATA_PROVIDER || 'coingecko'
  },
  apiKeys: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || '',
    coingecko: process.env.COINGECKO_API_KEY || '',
    cryptoCompare: process.env.CRYPTOCOMPARE_API_KEY || ''
  },
  updateInterval: parseInt(process.env.MARKET_DATA_UPDATE_INTERVAL || '300000', 10), // 5 minutes
  maxAssets: parseInt(process.env.MARKET_DATA_MAX_ASSETS || '1000', 10)
};

/**
 * Blockchain Configuration
 */
const blockchain = {
  providers: {
    ethereum: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    binance: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org'
  },
  apiKeys: {
    infura: process.env.INFURA_API_KEY || '',
    alchemy: process.env.ALCHEMY_API_KEY || '',
    etherscan: process.env.ETHERSCAN_API_KEY || ''
  },
  gasTracker: {
    enabled: process.env.GAS_TRACKER_ENABLED !== 'false',
    updateInterval: parseInt(process.env.GAS_TRACKER_UPDATE_INTERVAL || '60000', 10) // 1 minute
  }
};

/**
 * Logging Configuration
 */
const logging = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.LOG_FORMAT || 'json',
  colorize: process.env.LOG_COLORIZE !== 'false',
  filename: process.env.LOG_FILE || 'app.log',
  maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
};

/**
 * AI/ML Configuration
 */
const ai = {
  enabled: process.env.AI_ENABLED !== 'false',
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    huggingface: process.env.HUGGINGFACE_API_KEY || ''
  },
  models: {
    default: process.env.AI_DEFAULT_MODEL || 'gpt-3.5-turbo',
    sentimentAnalysis: process.env.AI_SENTIMENT_MODEL || 'distilbert-base-uncased-finetuned-sst-2-english'
  }
};

/**
 * Email Configuration
 */
const email = {
  from: process.env.EMAIL_FROM || 'noreply@novaprotocol.com',
  smtp: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  }
};

/**
 * Public Assets Configuration
 */
const assets = {
  baseUrl: process.env.ASSETS_BASE_URL || '',
  dir: process.env.ASSETS_DIR || path.join(process.cwd(), 'public')
};

/**
 * Security Configuration
 */
const security = {
  helmet: {
    contentSecurityPolicy: process.env.SECURITY_CSP !== 'false',
    xssFilter: true,
    noSniff: true,
    frameguard: true
  },
  cors: {
    allowCredentials: true,
    maxAge: 86400 // 1 day
  }
};

// Export all configuration sections
module.exports = {
  server,
  database,
  cache,
  auth,
  rateLimits,
  marketData,
  blockchain,
  logging,
  ai,
  email,
  assets,
  security,
  
  // Helper function to get nested config values
  get: function(path) {
    const parts = path.split('.');
    let result = this;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return undefined;
      }
    }
    return result;
  }
}; 