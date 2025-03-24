/**
 * Simple in-memory cache implementation with TTL support
 */

/**
 * Cache class providing time-based expiration and max size constraints
 */
class Cache {
  /**
   * Create a new cache instance
   * @param {Object} options - Cache configuration options
   * @param {number} [options.ttl=60000] - Default TTL in milliseconds (60 seconds default)
   * @param {number} [options.max=1000] - Maximum number of items to store in cache
   */
  constructor(options = {}) {
    this.store = new Map();
    this.ttl = options.ttl || 60 * 1000; // Default: 60 seconds
    this.max = options.max || 1000;      // Default: 1000 entries
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Optional TTL override in ms
   * @returns {boolean} True if successful
   */
  set(key, value, ttl) {
    // Check if cache is full and remove oldest item if needed
    if (this.store.size >= this.max) {
      // Find oldest entry
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [k, entry] of this.store.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
    
    // Set new cache entry
    this.store.set(key, {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + (ttl || this.ttl)
    });
    
    this.stats.sets++;
    
    return true;
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found/expired
   */
  get(key) {
    const entry = this.store.get(key);
    
    // If entry doesn't exist
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    // If entry has expired
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    // Valid cache hit
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key) {
    const entry = this.store.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a key from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if item was in the cache
   */
  del(key) {
    const result = this.store.delete(key);
    if (result) {
      this.stats.deletes++;
    }
    return result;
  }

  /**
   * Clear all data from the cache
   */
  clear() {
    this.store.clear();
    this.stats.deletes += this.store.size;
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  /**
   * Get all keys in the cache (even expired ones)
   * @returns {Array<string>} Array of keys
   */
  keys() {
    return [...this.store.keys()];
  }

  /**
   * Get all values from the cache (filtering out expired ones)
   * @returns {Array<*>} Array of values
   */
  values() {
    const result = [];
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (now <= entry.expiry) {
        result.push(entry.value);
      } else {
        this.store.delete(key);
      }
    }
    
    return result;
  }

  /**
   * Remove all expired entries from the cache
   * @returns {number} Number of entries removed
   */
  prune() {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      this.stats.deletes += count;
    }
    
    return count;
  }
}

module.exports = { Cache }; 