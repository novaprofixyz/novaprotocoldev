/**
 * Cache Service for NOVA Protocol
 * Provides in-memory caching capabilities to improve performance
 */

const { createContextLogger } = require('../utils/logger');
const { get: getConfig } = require('../utils/config');

const cacheLogger = createContextLogger('CacheService');

// Simple in-memory cache
const cache = {};

/**
 * Get a cached value
 * @param {string} key - Cache key
 * @returns {*} Cached value or null if not found or expired
 */
function get(key) {
  const cacheItem = cache[key];
  
  if (!cacheItem) {
    cacheLogger.debug(`Cache miss for key: ${key}`);
    return null;
  }
  
  // Check if expired
  if (cacheItem.expiresAt && cacheItem.expiresAt < Date.now()) {
    cacheLogger.debug(`Cache expired for key: ${key}`);
    delete cache[key];
    return null;
  }
  
  cacheLogger.debug(`Cache hit for key: ${key}`);
  return cacheItem.value;
}

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} [ttlSeconds] - Time to live in seconds
 * @returns {boolean} Success status
 */
function set(key, value, ttlSeconds = null) {
  try {
    // Get default TTL from config if not provided
    const ttl = ttlSeconds || getConfig('marketData.cacheTTL', 60);
    
    cache[key] = {
      value,
      expiresAt: ttl > 0 ? Date.now() + (ttl * 1000) : null
    };
    
    cacheLogger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
    return true;
  } catch (error) {
    cacheLogger.error(`Error setting cache for key ${key}: ${error.message}`);
    return false;
  }
}

/**
 * Check if a key exists in the cache and is not expired
 * @param {string} key - Cache key
 * @returns {boolean} Whether the key exists and is valid
 */
function has(key) {
  const cacheItem = cache[key];
  
  if (!cacheItem) {
    return false;
  }
  
  // Check if expired
  if (cacheItem.expiresAt && cacheItem.expiresAt < Date.now()) {
    delete cache[key];
    return false;
  }
  
  return true;
}

/**
 * Remove a key from the cache
 * @param {string} key - Cache key
 * @returns {boolean} Whether the key was removed
 */
function remove(key) {
  if (key in cache) {
    delete cache[key];
    cacheLogger.debug(`Cache removed for key: ${key}`);
    return true;
  }
  
  return false;
}

/**
 * Clear all items from the cache
 * @returns {boolean} Success status
 */
function clear() {
  try {
    Object.keys(cache).forEach(key => {
      delete cache[key];
    });
    
    cacheLogger.info('Cache cleared');
    return true;
  } catch (error) {
    cacheLogger.error(`Error clearing cache: ${error.message}`);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getStats() {
  try {
    const now = Date.now();
    let totalItems = 0;
    let expiredItems = 0;
    let activeItems = 0;
    
    Object.keys(cache).forEach(key => {
      totalItems++;
      
      if (cache[key].expiresAt && cache[key].expiresAt < now) {
        expiredItems++;
      } else {
        activeItems++;
      }
    });
    
    return {
      totalItems,
      activeItems,
      expiredItems,
      memoryUsageEstimate: JSON.stringify(cache).length
    };
  } catch (error) {
    cacheLogger.error(`Error getting cache stats: ${error.message}`);
    return {
      error: error.message
    };
  }
}

/**
 * Get or set a value with auto function execution
 * If the key exists in the cache, return the cached value
 * If not, execute the provided function and cache its result
 * 
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} [ttlSeconds] - Time to live in seconds
 * @returns {Promise<*>} Cached value or function result
 */
async function getOrSet(key, fn, ttlSeconds = null) {
  // Check cache first
  const cachedValue = get(key);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  try {
    // Execute the function
    const result = await fn();
    
    // Cache the result
    set(key, result, ttlSeconds);
    
    return result;
  } catch (error) {
    cacheLogger.error(`Error in getOrSet for key ${key}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  get,
  set,
  has,
  remove,
  clear,
  getStats,
  getOrSet
}; 