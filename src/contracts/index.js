/**
 * Blockchain Contracts Module for NOVA Protocol
 * This module provides interfaces for interacting with blockchain smart contracts
 */

const { ethers } = require('ethers');
const { createContextLogger } = require('../utils/logger');

// Initialize logger
const logger = createContextLogger('Contracts');

/**
 * Contract connection configurations
 */
const SUPPORTED_NETWORKS = {
  ETH_MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETH_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key',
    blockExplorer: 'https://etherscan.io'
  },
  ETH_GOERLI: {
    chainId: 5,
    name: 'Goerli Testnet',
    rpcUrl: process.env.ETH_GOERLI_RPC_URL || 'https://goerli.infura.io/v3/your-infura-key',
    blockExplorer: 'https://goerli.etherscan.io'
  },
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_MAINNET_RPC_URL || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  BSC_MAINNET: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org',
    blockExplorer: 'https://bscscan.com'
  }
};

/**
 * Contract interfaces and ABIs
 * Note: These are simplified ABIs for common interfaces
 */
const CONTRACT_INTERFACES = {
  ERC20: [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 amount)',
    'event Approval(address indexed owner, address indexed spender, uint256 amount)'
  ],
  DEX_PAIR: [
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function price0CumulativeLast() view returns (uint256)',
    'function price1CumulativeLast() view returns (uint256)'
  ]
};

/**
 * Provider cache to avoid creating multiple instances
 */
const providerCache = new Map();

/**
 * Get a provider for the specified network
 * @param {string} networkKey - Key of the network in SUPPORTED_NETWORKS
 * @returns {ethers.providers.JsonRpcProvider} Provider instance
 */
function getProvider(networkKey) {
  if (!SUPPORTED_NETWORKS[networkKey]) {
    throw new Error(`Unsupported network: ${networkKey}`);
  }
  
  if (!providerCache.has(networkKey)) {
    const network = SUPPORTED_NETWORKS[networkKey];
    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
    providerCache.set(networkKey, provider);
    
    logger.debug(`Created provider for ${network.name}`);
  }
  
  return providerCache.get(networkKey);
}

/**
 * Get contract instance
 * @param {string} contractAddress - Address of the contract
 * @param {Array|string} abi - Contract ABI or interface name (e.g., 'ERC20')
 * @param {string} networkKey - Network key (e.g., 'ETH_MAINNET')
 * @returns {ethers.Contract} Contract instance
 */
function getContract(contractAddress, abi, networkKey = 'ETH_MAINNET') {
  try {
    const provider = getProvider(networkKey);
    const contractAbi = Array.isArray(abi) ? abi : CONTRACT_INTERFACES[abi];
    
    if (!contractAbi) {
      throw new Error(`Unsupported contract interface: ${abi}`);
    }
    
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    return contract;
  } catch (error) {
    logger.error(`Error getting contract at ${contractAddress}: ${error.message}`);
    throw error;
  }
}

/**
 * Get ERC20 token information
 * @param {string} tokenAddress - Token contract address
 * @param {string} networkKey - Network key
 * @returns {Promise<Object>} Token information
 */
async function getTokenInfo(tokenAddress, networkKey = 'ETH_MAINNET') {
  try {
    const contract = getContract(tokenAddress, 'ERC20', networkKey);
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      network: SUPPORTED_NETWORKS[networkKey].name
    };
  } catch (error) {
    logger.error(`Error getting token info for ${tokenAddress}: ${error.message}`);
    throw error;
  }
}

module.exports = {
  SUPPORTED_NETWORKS,
  CONTRACT_INTERFACES,
  getProvider,
  getContract,
  getTokenInfo
}; 