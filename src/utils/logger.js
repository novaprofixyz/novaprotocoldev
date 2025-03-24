/**
 * Logging utility for NOVA Protocol
 * Provides structured logging with contextual information
 */

// For MVP, we'll use simple console logging
// In production, this would use a more robust logging library like winston

/**
 * Creates a logger with a specific context
 * @param {string} context - The context name for the logger (e.g., component or module name)
 * @returns {Object} - Logger object with logging methods
 */
function createContextLogger(context) {
  return {
    /**
     * Log an info message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to include in log
     */
    info: (message, data) => {
      console.info(`[${new Date().toISOString()}] [INFO] [${context}] ${message}`, data ? data : '');
    },
    
    /**
     * Log a warning message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to include in log
     */
    warn: (message, data) => {
      console.warn(`[${new Date().toISOString()}] [WARN] [${context}] ${message}`, data ? data : '');
    },
    
    /**
     * Log an error message
     * @param {string} message - Message to log
     * @param {Error|Object} error - Optional error to include in log
     */
    error: (message, error) => {
      console.error(`[${new Date().toISOString()}] [ERROR] [${context}] ${message}`, error ? error : '');
    },
    
    /**
     * Log a debug message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to include in log
     */
    debug: (message, data) => {
      // Only log debug messages in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[${new Date().toISOString()}] [DEBUG] [${context}] ${message}`, data ? data : '');
      }
    },
    
    /**
     * Log a trace message with high verbosity
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to include in log
     */
    trace: (message, data) => {
      // Only log trace messages in development environment with TRACE flag
      if (process.env.NODE_ENV !== 'production' && process.env.LOG_TRACE === 'true') {
        console.debug(`[${new Date().toISOString()}] [TRACE] [${context}] ${message}`, data ? data : '');
      }
    }
  };
}

module.exports = {
  createContextLogger
}; 