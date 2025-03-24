/**
 * Tests for Asset model
 */

const { expect } = require('chai');
const Asset = require('../../src/models/Asset');

describe('Asset Model', () => {
  describe('Constructor', () => {
    it('should create an asset with default values when no data is provided', () => {
      const asset = new Asset();
      expect(asset.symbol).to.equal('');
      expect(asset.name).to.equal('');
      expect(asset.price).to.be.null;
      expect(asset.marketCap).to.be.null;
      expect(asset.priceHistory).to.be.an('array').that.is.empty;
    });

    it('should create an asset with provided values', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        marketCap: 1000000000000,
        volume24h: 30000000000,
        change24h: 2.5,
        priceHistory: [
          { timestamp: new Date('2023-01-01'), price: 45000 },
          { timestamp: new Date('2023-01-02'), price: 46000 }
        ]
      };
      
      const asset = new Asset(data);
      expect(asset.symbol).to.equal('BTC');
      expect(asset.name).to.equal('Bitcoin');
      expect(asset.price).to.equal(50000);
      expect(asset.marketCap).to.equal(1000000000000);
      expect(asset.volume24h).to.equal(30000000000);
      expect(asset.change24h).to.equal(2.5);
      expect(asset.priceHistory).to.have.lengthOf(2);
    });
  });

  describe('Validation', () => {
    it('should validate a correct asset', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000
      };
      
      const { error } = Asset.validate(data);
      expect(error).to.be.undefined;
    });

    it('should reject an asset with missing symbol', () => {
      const data = {
        name: 'Bitcoin',
        price: 50000
      };
      
      const { error } = Asset.validate(data);
      expect(error).to.exist;
      expect(error.message).to.include('symbol');
    });

    it('should reject an asset with invalid symbol format', () => {
      const data = {
        symbol: 'BTC-USD', // Invalid format
        name: 'Bitcoin',
        price: 50000
      };
      
      const { error } = Asset.validate(data);
      expect(error).to.exist;
      expect(error.message).to.include('symbol');
    });

    it('should reject an asset with negative price', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: -50000
      };
      
      const { error } = Asset.validate(data);
      expect(error).to.exist;
      expect(error.message).to.include('price');
    });
  });

  describe('create() static method', () => {
    it('should create a valid asset instance', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000
      };
      
      const asset = Asset.create(data);
      expect(asset).to.be.an.instanceOf(Asset);
      expect(asset.symbol).to.equal('BTC');
    });

    it('should throw an error for invalid data', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: -50000 // Invalid price
      };
      
      expect(() => Asset.create(data)).to.throw();
    });
  });

  describe('calculateChange() method', () => {
    it('should calculate change correctly', () => {
      const asset = new Asset({
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        priceHistory: [
          { timestamp: new Date(Date.now() - 86400000 * 2), price: 45000 }, // 2 days ago
          { timestamp: new Date(Date.now() - 86400000), price: 48000 },     // 1 day ago
          { timestamp: new Date(), price: 50000 }                          // Today
        ]
      });
      
      const change = asset.calculateChange(1);
      expect(change.absolute).to.equal(2000);
      expect(change.percentage).to.be.closeTo(4.17, 0.01); // 4.17% change
    });

    it('should return null values if insufficient price history', () => {
      const asset = new Asset({
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        priceHistory: [
          { timestamp: new Date(), price: 50000 } // Only one data point
        ]
      });
      
      const change = asset.calculateChange(1);
      expect(change.absolute).to.be.null;
      expect(change.percentage).to.be.null;
    });

    it('should return null values if no price history', () => {
      const asset = new Asset({
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000
      });
      
      const change = asset.calculateChange(1);
      expect(change.absolute).to.be.null;
      expect(change.percentage).to.be.null;
    });
  });

  describe('toJSON() method', () => {
    it('should return a plain object representation', () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        marketCap: 1000000000000,
        lastUpdated: new Date('2023-03-01')
      };
      
      const asset = new Asset(data);
      const json = asset.toJSON();
      
      expect(json).to.be.an('object');
      expect(json.symbol).to.equal('BTC');
      expect(json.name).to.equal('Bitcoin');
      expect(json.price).to.equal(50000);
      expect(json.marketCap).to.equal(1000000000000);
      expect(json.lastUpdated).to.deep.equal(data.lastUpdated);
    });
  });
}); 