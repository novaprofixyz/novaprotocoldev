/**
 * Models Index for NOVA Protocol
 * Exports all models from a single entry point
 */

const Asset = require('./Asset');
const Portfolio = require('./Portfolio');
const MarketData = require('./MarketData');

module.exports = {
  Asset,
  Portfolio,
  MarketData
}; 