/**
 * Validator Middleware Tests
 * Tests the validation middleware functionality
 */

const { validateBody, validateParams, validateQuery } = require('../../src/middleware/validator');

describe('Validator Middleware', () => {
  let req, res, next;
  
  // Setup mock Express objects before each test
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  // Body validation tests
  describe('validateBody', () => {
    it('should pass validation when schema matches body', () => {
      const schema = {
        name: { type: 'string', required: true },
        age: { type: 'number', min: 18 }
      };
      
      req.body = { name: 'John', age: 25 };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should fail validation when required field is missing', () => {
      const schema = {
        name: { type: 'string', required: true },
        age: { type: 'number' }
      };
      
      req.body = { age: 25 };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('Validation failed');
    });
    
    it('should fail validation when type is incorrect', () => {
      const schema = {
        name: { type: 'string' },
        age: { type: 'number' }
      };
      
      req.body = { name: 'John', age: 'twenty-five' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be of type');
    });
    
    it('should fail validation when number is below minimum', () => {
      const schema = {
        age: { type: 'number', min: 18 }
      };
      
      req.body = { age: 16 };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be at least');
    });
    
    it('should fail validation when number is above maximum', () => {
      const schema = {
        age: { type: 'number', max: 65 }
      };
      
      req.body = { age: 70 };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be at most');
    });
    
    it('should fail validation when string is too short', () => {
      const schema = {
        name: { type: 'string', minLength: 3 }
      };
      
      req.body = { name: 'Jo' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be at least');
    });
    
    it('should fail validation when string is too long', () => {
      const schema = {
        name: { type: 'string', maxLength: 10 }
      };
      
      req.body = { name: 'John Doe Smith' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be at most');
    });
    
    it('should fail validation when value is not in enum', () => {
      const schema = {
        role: { type: 'string', enum: ['admin', 'user', 'guest'] }
      };
      
      req.body = { role: 'superuser' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toContain('must be one of');
    });
  });
  
  // Params validation tests
  describe('validateParams', () => {
    it('should pass validation when schema matches params', () => {
      const schema = {
        id: { type: 'string', required: true }
      };
      
      req.params = { id: '123' };
      
      validateParams(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should fail validation when required param is missing', () => {
      const schema = {
        id: { type: 'string', required: true }
      };
      
      req.params = {};
      
      validateParams(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
  
  // Query validation tests
  describe('validateQuery', () => {
    it('should pass validation when schema matches query', () => {
      const schema = {
        page: { type: 'integer', min: 1 },
        limit: { type: 'integer', min: 1, max: 100 }
      };
      
      req.query = { page: '2', limit: '50' };
      
      validateQuery(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });
    
    it('should fail validation when query param is invalid', () => {
      const schema = {
        page: { type: 'integer', min: 1 }
      };
      
      req.query = { page: 'invalid' };
      
      validateQuery(schema)(req, res, next);
      
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
}); 