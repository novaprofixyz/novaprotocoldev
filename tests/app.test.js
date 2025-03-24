/**
 * NOVA Protocol API Tests
 * Tests the core functionality of the API
 */

const request = require('supertest');
const app = require('../src/app');

// Mock environment for testing
process.env.NODE_ENV = 'test';
process.env.DISABLE_AUTH = 'true';

describe('Application Tests', () => {
  // Root endpoint test
  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'NOVA Protocol API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('documentation', '/api-docs');
    });
  });
  
  // Health check endpoint test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  // 404 handler test
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
  
  // Market routes test
  describe('Market Routes', () => {
    it('should return market overview', async () => {
      const response = await request(app).get('/api/market/overview');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('marketMetrics');
      expect(response.body).toHaveProperty('assets');
      expect(response.body).toHaveProperty('trendingAssets');
      expect(response.body).toHaveProperty('marketSentiment');
    });
    
    it('should return asset list', async () => {
      const response = await request(app).get('/api/market/assets');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('assets');
      expect(Array.isArray(response.body.assets)).toBeTruthy();
    });
    
    it('should return asset details', async () => {
      const response = await request(app).get('/api/market/assets/BTC');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('asset');
      expect(response.body.asset).toHaveProperty('symbol', 'BTC');
    });
  });
  
  // AIDE routes test
  describe('AIDE Routes', () => {
    it('should process financial intent', async () => {
      const response = await request(app)
        .post('/api/aide/intent')
        .send({ intent: 'Invest $1000 in Bitcoin and Ethereum with low risk' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('intentType');
      expect(response.body.result).toHaveProperty('strategy');
    });
    
    it('should validate intent input', async () => {
      const response = await request(app)
        .post('/api/aide/intent')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });
  
  // System routes test
  describe('System Routes', () => {
    it('should return system status', async () => {
      const response = await request(app).get('/api/system/status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toHaveProperty('system');
      expect(response.body.status).toHaveProperty('process');
      expect(response.body.status).toHaveProperty('cache');
    });
    
    it('should return cache stats', async () => {
      const response = await request(app).get('/api/system/cache/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalItems');
    });
  });
}); 