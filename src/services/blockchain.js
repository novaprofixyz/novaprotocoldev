/**
 * Blockchain Service for NOVA Protocol
 * Handles blockchain interactions and connections
 */

const { ethers } = require('ethers');
const { logger, createContextLogger } = require('../utils/logger');
const blockchainLogger = createContextLogger('Blockchain');

// Provider and wallet instances
let provider;
let wallet;
let network;

/**
 * Initialize connection to the blockchain network
 * @returns {Promise<void>}
 */
async function initializeBlockchainConnection() {
  try {
    const providerUrl = process.env.NODE_ENV === 'production' 
      ? process.env.ETH_PROVIDER_URL
      : process.env.ETH_TESTNET_PROVIDER_URL || process.env.ETH_PROVIDER_URL;
    
    if (!providerUrl) {
      throw new Error('No provider URL specified in environment variables');
    }
    
    // Initialize provider
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
    blockchainLogger.info('Provider initialized');
    
    // Get network information
    network = await provider.getNetwork();
    blockchainLogger.info(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Initialize wallet if private key is provided
    if (process.env.PRIVATE_KEY) {
      wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const address = await wallet.getAddress();
      blockchainLogger.info(`Wallet initialized: ${address.substring(0, 6)}...${address.substring(38)}`);
      
      // Check wallet balance
      const balance = await wallet.getBalance();
      blockchainLogger.info(`Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
    } else {
      blockchainLogger.warn('No private key provided, operating in read-only mode');
    }
    
    return { provider, wallet, network };
  } catch (error) {
    blockchainLogger.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
}

/**
 * Get current provider instance
 * @returns {ethers.providers.Provider}
 */
function getProvider() {
  if (!provider) {
    throw new Error('Blockchain provider not initialized');
  }
  return provider;
}

/**
 * Get current wallet instance
 * @returns {ethers.Wallet}
 */
function getWallet() {
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }
  return wallet;
}

/**
 * Get current network information
 * @returns {Network}
 */
function getNetwork() {
  if (!network) {
    throw new Error('Network information not available');
  }
  return network;
}

/**
 * Create a contract instance for interaction
 * @param {string} address - Contract address
 * @param {Array} abi - Contract ABI
 * @param {boolean} useWallet - Whether to use wallet for signing transactions
 * @returns {ethers.Contract} Contract instance
 */
function getContract(address, abi, useWallet = false) {
  if (!address || !abi) {
    throw new Error('Contract address and ABI are required');
  }
  
  const signerOrProvider = useWallet ? getWallet() : getProvider();
  return new ethers.Contract(address, abi, signerOrProvider);
}

module.exports = {
  initializeBlockchainConnection,
  getProvider,
  getWallet,
  getNetwork,
  getContract
}; 