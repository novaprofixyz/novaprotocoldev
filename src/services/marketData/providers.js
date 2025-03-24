/**
 * Market Data Providers for NOVA Protocol
 * Defines interfaces to various external market data APIs
 */

const axios = require('axios');
const { createContextLogger } = require('../../utils/logger');
const { get: getConfig } = require('../../utils/config');
const { AppError } = require('../../utils/errors');

// Initialize logger
const providerLogger = createContextLogger('MarketDataProviders');

/**
 * CoinGecko API Provider
 * Documentation: https://www.coingecko.com/api/documentation
 */
class CoinGeckoProvider {
  constructor() {
    this.baseUrl = getConfig('marketData.apis.coinGecko.baseUrl');
    this.apiKey = getConfig('marketData.apis.coinGecko.apiKey');
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {}
    });
    
    providerLogger.info('CoinGecko provider initialized');
  }
  
  /**
   * Get current price for an asset
   * @param {string} symbol - Asset symbol (e.g. BTC)
   * @returns {Promise<number>} Current price in USD
   */
  async getCurrentPrice(symbol) {
    try {
      const id = this._mapSymbolToId(symbol);
      const response = await this.client.get(`/simple/price`, {
        params: {
          ids: id,
          vs_currencies: 'usd'
        }
      });
      
      if (!response.data || !response.data[id] || !response.data[id].usd) {
        throw new AppError(`Failed to get price for ${symbol}`, 404);
      }
      
      return response.data[id].usd;
    } catch (error) {
      providerLogger.error(`CoinGecko: Error fetching price for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get price for ${symbol}`, 500);
    }
  }
  
  /**
   * Get historical prices for an asset
   * @param {string} symbol - Asset symbol
   * @param {string} timeframe - Timeframe (1d, 7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalPrices(symbol, timeframe = '30d') {
    try {
      const id = this._mapSymbolToId(symbol);
      const days = this._mapTimeframeToDays(timeframe);
      
      const response = await this.client.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days > 90 ? 'daily' : 'hourly'
        }
      });
      
      if (!response.data || !response.data.prices || !Array.isArray(response.data.prices)) {
        throw new AppError(`Failed to get historical prices for ${symbol}`, 404);
      }
      
      return response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        price
      }));
    } catch (error) {
      providerLogger.error(`CoinGecko: Error fetching historical prices for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get historical prices for ${symbol}`, 500);
    }
  }
  
  /**
   * Get market data for an asset
   * @param {string} symbol - Asset symbol
   * @returns {Promise<Object>} Market data
   */
  async getMarketData(symbol) {
    try {
      const id = this._mapSymbolToId(symbol);
      const response = await this.client.get(`/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      });
      
      if (!response.data || !response.data.market_data) {
        throw new AppError(`Failed to get market data for ${symbol}`, 404);
      }
      
      return {
        price: response.data.market_data.current_price.usd,
        marketCap: response.data.market_data.market_cap.usd,
        volume: response.data.market_data.total_volume.usd,
        change24h: response.data.market_data.price_change_percentage_24h,
        change7d: response.data.market_data.price_change_percentage_7d,
        change30d: response.data.market_data.price_change_percentage_30d,
        allTimeHigh: {
          price: response.data.market_data.ath.usd,
          date: response.data.market_data.ath_date.usd,
          percentDown: response.data.market_data.ath_change_percentage.usd
        },
        supplyInfo: {
          circulating: response.data.market_data.circulating_supply,
          total: response.data.market_data.total_supply,
          maxSupply: response.data.market_data.max_supply
        }
      };
    } catch (error) {
      providerLogger.error(`CoinGecko: Error fetching market data for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get market data for ${symbol}`, 500);
    }
  }
  
  /**
   * Map asset symbol to CoinGecko ID
   * @private
   * @param {string} symbol - Asset symbol
   * @returns {string} CoinGecko ID
   */
  _mapSymbolToId(symbol) {
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'MATIC': 'matic-network',
      'LINK': 'chainlink',
      'UNI': 'uniswap'
    };
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }
  
  /**
   * Map timeframe to days for API
   * @private
   * @param {string} timeframe - Timeframe string
   * @returns {number} Number of days
   */
  _mapTimeframeToDays(timeframe) {
    const timeframeMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    return timeframeMap[timeframe] || 30;
  }
}

/**
 * Binance API Provider
 * Documentation: https://binance-docs.github.io/apidocs/
 */
class BinanceProvider {
  constructor() {
    this.baseUrl = getConfig('marketData.apis.binance.baseUrl');
    this.apiKey = getConfig('marketData.apis.binance.apiKey');
    this.apiSecret = getConfig('marketData.apis.binance.apiSecret');
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: this.apiKey ? { 'X-MBX-APIKEY': this.apiKey } : {}
    });
    
    providerLogger.info('Binance provider initialized');
  }
  
  /**
   * Get current price for an asset
   * @param {string} symbol - Asset symbol (e.g. BTC)
   * @returns {Promise<number>} Current price in USD
   */
  async getCurrentPrice(symbol) {
    try {
      const ticker = this._mapSymbolToTicker(symbol);
      const response = await this.client.get('/ticker/price', {
        params: {
          symbol: ticker
        }
      });
      
      if (!response.data || !response.data.price) {
        throw new AppError(`Failed to get price for ${symbol}`, 404);
      }
      
      return parseFloat(response.data.price);
    } catch (error) {
      providerLogger.error(`Binance: Error fetching price for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get price for ${symbol}`, 500);
    }
  }
  
  /**
   * Get historical prices for an asset
   * @param {string} symbol - Asset symbol
   * @param {string} timeframe - Timeframe (1d, 7d, 30d, 90d, 1y)
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalPrices(symbol, timeframe = '30d') {
    try {
      const ticker = this._mapSymbolToTicker(symbol);
      const interval = this._mapTimeframeToInterval(timeframe);
      const limit = 500; // Maximum allowed by Binance
      
      const response = await this.client.get('/klines', {
        params: {
          symbol: ticker,
          interval,
          limit
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new AppError(`Failed to get historical prices for ${symbol}`, 404);
      }
      
      return response.data.map(candle => ({
        timestamp: candle[0],
        price: parseFloat(candle[4]) // Close price
      }));
    } catch (error) {
      providerLogger.error(`Binance: Error fetching historical prices for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get historical prices for ${symbol}`, 500);
    }
  }
  
  /**
   * Get market data for an asset
   * @param {string} symbol - Asset symbol
   * @returns {Promise<Object>} Market data
   */
  async getMarketData(symbol) {
    try {
      const ticker = this._mapSymbolToTicker(symbol);
      const response = await this.client.get('/ticker/24hr', {
        params: {
          symbol: ticker
        }
      });
      
      if (!response.data) {
        throw new AppError(`Failed to get market data for ${symbol}`, 404);
      }
      
      return {
        price: parseFloat(response.data.lastPrice),
        volume: parseFloat(response.data.volume),
        change24h: parseFloat(response.data.priceChangePercent),
        high24h: parseFloat(response.data.highPrice),
        low24h: parseFloat(response.data.lowPrice)
      };
    } catch (error) {
      providerLogger.error(`Binance: Error fetching market data for ${symbol}: ${error.message}`);
      throw new AppError(`Failed to get market data for ${symbol}`, 500);
    }
  }
  
  /**
   * Map asset symbol to Binance ticker
   * @private
   * @param {string} symbol - Asset symbol
   * @returns {string} Binance ticker
   */
  _mapSymbolToTicker(symbol) {
    return `${symbol.toUpperCase()}USDT`;
  }
  
  /**
   * Map timeframe to Binance interval
   * @private
   * @param {string} timeframe - Timeframe string
   * @returns {string} Binance interval
   */
  _mapTimeframeToInterval(timeframe) {
    const timeframeMap = {
      '1d': '1d',
      '7d': '4h',
      '30d': '1d',
      '90d': '1d',
      '1y': '1w'
    };
    
    return timeframeMap[timeframe] || '1d';
  }
}

/**
 * Factory for creating market data providers
 */
class ProviderFactory {
  /**
   * Get a market data provider
   * @param {string} provider - Provider name
   * @returns {Object} Provider instance
   */
  static getProvider(provider = 'coinGecko') {
    switch (provider.toLowerCase()) {
      case 'coingecko':
        return new CoinGeckoProvider();
      case 'binance':
        return new BinanceProvider();
      default:
        providerLogger.warn(`Unknown provider: ${provider}, using CoinGecko`);
        return new CoinGeckoProvider();
    }
  }
}

module.exports = {
  ProviderFactory,
  CoinGeckoProvider,
  BinanceProvider
}; 