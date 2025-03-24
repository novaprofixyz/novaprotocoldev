/**
 * System routes for NOVA Protocol
 * Provides system status, monitoring, and diagnostics endpoints
 */

const express = require('express');
const router = express.Router();
const { createContextLogger } = require('../utils/logger');
const { AppError } = require('../utils/errors');
const cacheService = require('../services/cacheService');
const os = require('os');

const systemLogger = createContextLogger('SystemRoutes');

/**
 * @swagger
 * /api/system/status:
 *   get:
 *     summary: Get detailed system status
 *     tags: [System]
 *     description: Returns detailed information about the system's status, resources, and performance
 *     responses:
 *       200:
 *         description: System status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: object
 *                   properties:
 *                     system:
 *                       type: object
 *                     process:
 *                       type: object
 *                     cache:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/status', (req, res) => {
  try {
    const status = {
      system: {
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
        },
        cpu: {
          model: os.cpus()[0].model,
          cores: os.cpus().length,
          loadAvg: os.loadavg()
        },
        os: {
          platform: os.platform(),
          release: os.release(),
          type: os.type()
        }
      },
      process: {
        pid: process.pid,
        versions: {
          node: process.version,
          dependencies: {
            express: require('express/package.json').version,
            axios: require('axios/package.json').version
          }
        },
        env: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage()
      },
      cache: cacheService.getStats(),
      timestamp: new Date().toISOString()
    };
    
    return res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    systemLogger.error(`Error getting system status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching system status',
        details: error.message
      }
    });
  }
});

/**
 * @swagger
 * /api/system/cache/clear:
 *   post:
 *     summary: Clear the cache
 *     tags: [System]
 *     description: Clears all cached data to ensure fresh data retrieval
 *     responses:
 *       200:
 *         description: Cache clear result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.post('/cache/clear', (req, res, next) => {
  try {
    systemLogger.info('Clearing cache');
    
    const result = cacheService.clear();
    
    return res.status(200).json({
      success: result,
      message: result ? 'Cache cleared successfully' : 'Failed to clear cache',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    systemLogger.error(`Error clearing cache: ${error.message}`);
    next(new AppError('Failed to clear cache', 500));
  }
});

/**
 * @swagger
 * /api/system/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [System]
 *     description: Returns statistics about the cache including item count and memory usage
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     activeItems:
 *                       type: integer
 *                     expiredItems:
 *                       type: integer
 *                     memoryUsageEstimate:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/cache/stats', (req, res) => {
  try {
    const stats = cacheService.getStats();
    
    return res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    systemLogger.error(`Error getting cache stats: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching cache statistics',
        details: error.message
      }
    });
  }
});

module.exports = router; 