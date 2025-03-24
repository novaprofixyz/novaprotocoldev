/**
 * API Routes for NOVA Protocol
 * Defines all REST API endpoints for the application
 */

const express = require('express');
const router = express.Router();
const { createContextLogger } = require('../utils/logger');
const apiLogger = createContextLogger('API');
const { validateRequest } = require('../utils/validators');

// Import controllers
const aideController = require('../core/aide/controller');
const marketController = require('../core/market/controller');
const portfolioController = require('../core/portfolio/controller');
const reputationController = require('../core/reputation/controller');
const userController = require('../core/user/controller');

// Health check route
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0'
  });
});

// AI Decision Engine Routes
router.get('/aide/analysis', aideController.getMarketAnalysis);
router.post('/aide/predict', validateRequest('predictRequest'), aideController.getPrediction);
router.post('/aide/intent', validateRequest('intentRequest'), aideController.processIntent);

// Market Data Routes
router.get('/market/overview', marketController.getMarketOverview);
router.get('/market/assets', marketController.getAssets);
router.get('/market/asset/:symbol', marketController.getAssetDetails);
router.get('/market/trends', marketController.getMarketTrends);

// Portfolio Management Routes
router.get('/portfolio', userController.authenticate, portfolioController.getPortfolio);
router.post('/portfolio/optimize', userController.authenticate, validateRequest('portfolioOptimize'), portfolioController.optimizePortfolio);
router.post('/portfolio/rebalance', userController.authenticate, validateRequest('portfolioRebalance'), portfolioController.rebalancePortfolio);
router.get('/portfolio/performance', userController.authenticate, portfolioController.getPerformance);

// Reputation Routes
router.get('/reputation/score', userController.authenticate, reputationController.getReputationScore);
router.get('/reputation/history', userController.authenticate, reputationController.getReputationHistory);
router.get('/reputation/leaderboard', reputationController.getLeaderboard);

// User Routes
router.post('/user/register', validateRequest('userRegister'), userController.register);
router.post('/user/login', validateRequest('userLogin'), userController.login);
router.get('/user/profile', userController.authenticate, userController.getProfile);
router.put('/user/profile', userController.authenticate, validateRequest('userProfileUpdate'), userController.updateProfile);

// Error handler
router.use((err, req, res, next) => {
  apiLogger.error(`API Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

module.exports = router; 