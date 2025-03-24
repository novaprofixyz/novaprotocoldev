/**
 * Intent Processor Module for AIDE
 * Processes natural language financial intents and converts them to actionable strategies
 */

const { createContextLogger } = require('../../utils/logger');
const intentLogger = createContextLogger('IntentProcessor');
const { AppError } = require('../../utils/errors');
const axios = require('axios');

/**
 * Process a natural language intent and convert it to an actionable financial strategy
 * @param {string} intent - The user's natural language intent
 * @param {Object} context - Additional context for processing the intent
 * @returns {Promise<Object>} Processed intent with actionable strategy
 */
async function processUserIntent(intent, context = {}) {
  intentLogger.info(`Processing intent: "${intent.substring(0, 50)}..."`);
  
  try {
    // For MVP, we'll use a rule-based system with predefined patterns
    // In a production version, this would use a proper NLP model or LLM
    
    // Detect intent type
    const intentType = detectIntentType(intent);
    
    // Extract parameters from the intent
    const parameters = extractParameters(intent, intentType);
    
    // Combine with provided context
    const enrichedParameters = {
      ...parameters,
      ...context
    };
    
    // Generate strategy based on intent type and parameters
    const strategy = await generateStrategy(intentType, enrichedParameters);
    
    // Return processed intent
    return {
      originalIntent: intent,
      type: intentType,
      parameters: enrichedParameters,
      strategy,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    intentLogger.error(`Error processing intent: ${error.message}`);
    throw new AppError(`Failed to process intent: ${error.message}`, 500);
  }
}

/**
 * Detect the type of financial intent from natural language
 * @param {string} intent - The user's natural language intent
 * @returns {string} Detected intent type
 */
function detectIntentType(intent) {
  const intentLower = intent.toLowerCase();
  
  // Check for various intent types using simple pattern matching
  if (intentLower.includes('invest') || intentLower.includes('buy') || intentLower.includes('long')) {
    return 'INVESTMENT';
  } else if (intentLower.includes('sell') || intentLower.includes('exit') || intentLower.includes('short')) {
    return 'DIVESTMENT';
  } else if (intentLower.includes('hedge') || intentLower.includes('protect')) {
    return 'HEDGING';
  } else if (intentLower.includes('rebalance') || intentLower.includes('adjust')) {
    return 'REBALANCING';
  } else if (intentLower.includes('yield') || intentLower.includes('income') || intentLower.includes('dividend')) {
    return 'YIELD_GENERATION';
  } else if (intentLower.includes('maximize') || intentLower.includes('optimize')) {
    return 'OPTIMIZATION';
  } else if (intentLower.includes('analyze') || intentLower.includes('research')) {
    return 'ANALYSIS';
  }
  
  // Default to generic investment if type cannot be determined
  return 'GENERIC_INVESTMENT';
}

/**
 * Extract parameters from the natural language intent
 * @param {string} intent - The user's natural language intent
 * @param {string} intentType - The detected intent type
 * @returns {Object} Extracted parameters
 */
function extractParameters(intent, intentType) {
  const intentLower = intent.toLowerCase();
  const parameters = {
    // Default parameters
    riskLevel: detectRiskLevel(intentLower),
    timeHorizon: detectTimeHorizon(intentLower),
    assetClasses: detectAssetClasses(intentLower),
    targetAssets: detectTargetAssets(intentLower)
  };
  
  // Add intent-specific parameters
  switch (intentType) {
    case 'INVESTMENT':
      parameters.targetAllocation = detectTargetAllocation(intentLower);
      break;
    case 'DIVESTMENT':
      parameters.sellPercentage = detectSellPercentage(intentLower);
      break;
    case 'HEDGING':
      parameters.hedgingInstruments = detectHedgingInstruments(intentLower);
      break;
    case 'REBALANCING':
      parameters.rebalancingThreshold = detectRebalancingThreshold(intentLower);
      break;
    case 'YIELD_GENERATION':
      parameters.yieldTarget = detectYieldTarget(intentLower);
      break;
    case 'OPTIMIZATION':
      parameters.optimizationGoal = detectOptimizationGoal(intentLower);
      break;
  }
  
  return parameters;
}

/**
 * Generate an actionable financial strategy based on intent and parameters
 * @param {string} intentType - The detected intent type
 * @param {Object} parameters - Extracted and enriched parameters
 * @returns {Promise<Object>} Actionable strategy
 */
async function generateStrategy(intentType, parameters) {
  intentLogger.debug(`Generating strategy for ${intentType} intent`);
  
  // In a production version, this would use more sophisticated financial models
  // For MVP, we'll use predefined templates
  
  switch (intentType) {
    case 'INVESTMENT':
      return generateInvestmentStrategy(parameters);
    case 'DIVESTMENT':
      return generateDivestmentStrategy(parameters);
    case 'HEDGING':
      return generateHedgingStrategy(parameters);
    case 'REBALANCING':
      return generateRebalancingStrategy(parameters);
    case 'YIELD_GENERATION':
      return generateYieldStrategy(parameters);
    case 'OPTIMIZATION':
      return generateOptimizationStrategy(parameters);
    case 'ANALYSIS':
      return generateAnalysisStrategy(parameters);
    default:
      return generateGenericStrategy(parameters);
  }
}

// Helper functions for detecting various parameters

function detectRiskLevel(intent) {
  if (intent.includes('conservative') || intent.includes('low risk') || intent.includes('safe')) {
    return 'LOW';
  } else if (intent.includes('aggressive') || intent.includes('high risk') || intent.includes('risky')) {
    return 'HIGH';
  } else {
    return 'MEDIUM';
  }
}

function detectTimeHorizon(intent) {
  if (intent.includes('short term') || intent.includes('quick') || intent.includes('day') || intent.includes('week')) {
    return 'SHORT';
  } else if (intent.includes('long term') || intent.includes('year') || intent.includes('decade')) {
    return 'LONG';
  } else {
    return 'MEDIUM';
  }
}

function detectAssetClasses(intent) {
  const assetClasses = [];
  
  if (intent.includes('crypto') || intent.includes('bitcoin') || intent.includes('ethereum')) {
    assetClasses.push('CRYPTO');
  }
  if (intent.includes('stock') || intent.includes('equity') || intent.includes('shares')) {
    assetClasses.push('STOCKS');
  }
  if (intent.includes('bond') || intent.includes('fixed income')) {
    assetClasses.push('BONDS');
  }
  if (intent.includes('commodity') || intent.includes('gold') || intent.includes('silver')) {
    assetClasses.push('COMMODITIES');
  }
  if (intent.includes('real estate') || intent.includes('property')) {
    assetClasses.push('REAL_ESTATE');
  }
  if (intent.includes('defi') || intent.includes('yield farming')) {
    assetClasses.push('DEFI');
  }
  
  return assetClasses.length > 0 ? assetClasses : ['CRYPTO']; // Default to crypto if no asset class detected
}

function detectTargetAssets(intent) {
  const targetAssets = [];
  
  // Common crypto assets
  const cryptoAssets = [
    { symbol: 'BTC', keywords: ['bitcoin', 'btc'] },
    { symbol: 'ETH', keywords: ['ethereum', 'eth'] },
    { symbol: 'BNB', keywords: ['bnb', 'binance'] },
    { symbol: 'SOL', keywords: ['solana', 'sol'] },
    { symbol: 'ADA', keywords: ['cardano', 'ada'] },
    { symbol: 'DOT', keywords: ['polkadot', 'dot'] },
    { symbol: 'AVAX', keywords: ['avalanche', 'avax'] },
    { symbol: 'MATIC', keywords: ['polygon', 'matic'] }
  ];
  
  // Check for each asset
  cryptoAssets.forEach(asset => {
    if (asset.keywords.some(keyword => intent.includes(keyword))) {
      targetAssets.push(asset.symbol);
    }
  });
  
  return targetAssets;
}

function detectTargetAllocation(intent) {
  // Extract percentages from text
  const percentageMatch = intent.match(/(\d+)(%|\spercent)/);
  if (percentageMatch) {
    return parseInt(percentageMatch[1], 10);
  }
  
  return null; // No specific allocation detected
}

function detectSellPercentage(intent) {
  const percentageMatch = intent.match(/(\d+)(%|\spercent)/);
  if (percentageMatch) {
    return parseInt(percentageMatch[1], 10);
  }
  
  // If "all" or "everything" is mentioned, return 100%
  if (intent.includes('all') || intent.includes('everything')) {
    return 100;
  }
  
  return 100; // Default to 100% if no percentage specified
}

function detectHedgingInstruments(intent) {
  const instruments = [];
  
  if (intent.includes('option') || intent.includes('put')) {
    instruments.push('OPTIONS');
  }
  if (intent.includes('futures')) {
    instruments.push('FUTURES');
  }
  if (intent.includes('stablecoin') || intent.includes('usdc') || intent.includes('usdt')) {
    instruments.push('STABLECOINS');
  }
  if (intent.includes('inverse')) {
    instruments.push('INVERSE_ASSETS');
  }
  
  return instruments.length > 0 ? instruments : ['STABLECOINS']; // Default to stablecoins
}

function detectRebalancingThreshold(intent) {
  const percentageMatch = intent.match(/(\d+)(%|\spercent)/);
  if (percentageMatch) {
    return parseInt(percentageMatch[1], 10);
  }
  
  return 5; // Default 5% threshold
}

function detectYieldTarget(intent) {
  const percentageMatch = intent.match(/(\d+)(%|\spercent)/);
  if (percentageMatch) {
    return parseInt(percentageMatch[1], 10);
  }
  
  return null; // No specific yield target detected
}

function detectOptimizationGoal(intent) {
  if (intent.includes('returns') || intent.includes('profit')) {
    return 'MAXIMIZE_RETURNS';
  } else if (intent.includes('risk') || intent.includes('volatility')) {
    return 'MINIMIZE_RISK';
  } else if (intent.includes('sharpe') || intent.includes('risk-adjusted')) {
    return 'OPTIMIZE_SHARPE_RATIO';
  }
  
  return 'BALANCED'; // Default to balanced optimization
}

// Strategy generation functions

function generateInvestmentStrategy(parameters) {
  const { riskLevel, timeHorizon, assetClasses, targetAssets } = parameters;
  
  // Default asset allocation based on risk and time horizon
  let allocation = {};
  
  if (targetAssets && targetAssets.length > 0) {
    // If specific assets are requested, allocate evenly among them
    const assetCount = targetAssets.length;
    const percentPerAsset = Math.floor(100 / assetCount);
    
    targetAssets.forEach(asset => {
      allocation[asset] = percentPerAsset;
    });
  } else {
    // Otherwise, allocate based on asset classes and risk profile
    if (assetClasses.includes('CRYPTO')) {
      if (riskLevel === 'LOW') {
        allocation = {
          BTC: 50,
          ETH: 30,
          USDC: 20
        };
      } else if (riskLevel === 'MEDIUM') {
        allocation = {
          BTC: 40,
          ETH: 30,
          SOL: 15,
          DOT: 15
        };
      } else { // HIGH
        allocation = {
          BTC: 30,
          ETH: 20,
          SOL: 15,
          AVAX: 15,
          DOT: 10,
          ADA: 10
        };
      }
    }
  }
  
  // Generate steps to execute the strategy
  const executionSteps = [
    {
      type: 'PORTFOLIO_ALLOCATION',
      description: `Allocate portfolio according to the defined strategy`,
      allocation
    }
  ];
  
  // Add time-based review step
  const reviewPeriod = timeHorizon === 'SHORT' ? '1 week' : (timeHorizon === 'MEDIUM' ? '1 month' : '3 months');
  executionSteps.push({
    type: 'SCHEDULED_REVIEW',
    description: `Review portfolio performance every ${reviewPeriod}`,
    period: reviewPeriod
  });
  
  return {
    name: `${riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} Risk ${timeHorizon.charAt(0) + timeHorizon.slice(1).toLowerCase()} Term Investment`,
    description: `A ${riskLevel.toLowerCase()} risk strategy focused on ${assetClasses.join(', ')} for ${timeHorizon.toLowerCase()} term horizon`,
    allocation,
    executionSteps,
    expectedOutcomes: {
      returns: riskLevel === 'HIGH' ? 'High potential returns with significant volatility' : 
              (riskLevel === 'MEDIUM' ? 'Moderate returns with managed volatility' : 'Conservative returns with minimal volatility'),
      timeframe: timeHorizon === 'LONG' ? 'Long-term growth over years' :
               (timeHorizon === 'MEDIUM' ? 'Medium-term appreciation over months' : 'Short-term gains over weeks')
    }
  };
}

function generateDivestmentStrategy(parameters) {
  const { sellPercentage, targetAssets, riskLevel } = parameters;
  
  const percentage = sellPercentage || 100;
  
  // If specific assets are targeted, sell those; otherwise, sell proportionally
  let sellAllocation = {};
  
  if (targetAssets && targetAssets.length > 0) {
    targetAssets.forEach(asset => {
      sellAllocation[asset] = percentage;
    });
  } else {
    // Default to selling based on risk profile (sell higher risk assets first)
    if (riskLevel === 'LOW') {
      sellAllocation = {
        BTC: 25,
        ETH: 25,
        ALTCOINS: 50  // Sell altcoins first
      };
    } else if (riskLevel === 'MEDIUM') {
      sellAllocation = {
        ALL: percentage  // Sell everything proportionally
      };
    } else { // HIGH
      sellAllocation = {
        STABLECOINS: 0,  // Keep stablecoins
        ALL_OTHERS: percentage  // Sell everything else
      };
    }
  }
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'MARKET_SELL',
      description: `Sell assets according to the defined strategy`,
      allocation: sellAllocation
    }
  ];
  
  // If not selling everything, add a step to allocate the remaining portfolio
  if (percentage < 100) {
    executionSteps.push({
      type: 'PORTFOLIO_REALLOCATION',
      description: `Reallocate remaining assets to preserve capital`,
      allocation: {
        STABLECOINS: 100  // Default to stablecoins for the remainder
      }
    });
  }
  
  return {
    name: `${percentage}% Portfolio Divestment`,
    description: `Strategic exit from ${targetAssets && targetAssets.length > 0 ? 
      targetAssets.join(', ') : 'selected assets'} at ${percentage}%`,
    sellAllocation,
    executionSteps,
    expectedOutcomes: {
      capital: `Recovery of ${percentage}% of invested capital from target assets`,
      timing: 'Immediate execution at market prices'
    }
  };
}

function generateHedgingStrategy(parameters) {
  const { riskLevel, hedgingInstruments, assetClasses } = parameters;
  
  // Determine hedging percentage based on risk level
  const hedgePercentage = riskLevel === 'LOW' ? 75 : (riskLevel === 'MEDIUM' ? 50 : 25);
  
  // Determine hedging instruments
  let instruments = hedgingInstruments || ['STABLECOINS'];
  let hedgingAllocation = {};
  
  // Allocate hedging based on selected instruments
  if (instruments.includes('STABLECOINS')) {
    hedgingAllocation.USDC = hedgePercentage / 2;
    hedgingAllocation.USDT = hedgePercentage / 2;
  } else if (instruments.includes('OPTIONS')) {
    hedgingAllocation['PUT_OPTIONS'] = hedgePercentage;
  } else if (instruments.includes('INVERSE_ASSETS')) {
    hedgingAllocation['INVERSE_ETF'] = hedgePercentage;
  }
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'HEDGE_POSITION',
      description: `Allocate ${hedgePercentage}% of portfolio to hedging instruments`,
      allocation: hedgingAllocation
    },
    {
      type: 'STOP_LOSS',
      description: 'Set up stop-loss orders for remaining risk assets',
      stopLossPercentage: 15  // Default 15% stop loss
    }
  ];
  
  return {
    name: `${hedgePercentage}% Portfolio Hedge`,
    description: `Risk mitigation strategy using ${instruments.join(', ')} to protect against market downturns`,
    hedgingAllocation,
    executionSteps,
    expectedOutcomes: {
      protection: `${hedgePercentage}% portfolio value protected against market decline`,
      cost: `Potential opportunity cost on hedged portion during market uptrends`
    }
  };
}

function generateRebalancingStrategy(parameters) {
  const { rebalancingThreshold, targetAssets, riskLevel } = parameters;
  
  // Determine target allocation based on risk level and target assets
  let targetAllocation = {};
  
  if (targetAssets && targetAssets.length > 0) {
    // If specific assets are targeted, rebalance those
    const assetCount = targetAssets.length;
    const percentPerAsset = Math.floor(100 / assetCount);
    
    targetAssets.forEach(asset => {
      targetAllocation[asset] = percentPerAsset;
    });
  } else {
    // Default allocations based on risk profile
    if (riskLevel === 'LOW') {
      targetAllocation = {
        BTC: 40,
        ETH: 30,
        STABLECOINS: 30
      };
    } else if (riskLevel === 'MEDIUM') {
      targetAllocation = {
        BTC: 35,
        ETH: 25,
        LARGE_CAP_ALTS: 20,
        MID_CAP_ALTS: 10,
        STABLECOINS: 10
      };
    } else { // HIGH
      targetAllocation = {
        BTC: 30,
        ETH: 20,
        LARGE_CAP_ALTS: 20,
        MID_CAP_ALTS: 20,
        SMALL_CAP_ALTS: 10
      };
    }
  }
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'PORTFOLIO_ANALYSIS',
      description: 'Analyze current portfolio allocation and deviation from target'
    },
    {
      type: 'THRESHOLD_REBALANCE',
      description: `Rebalance assets that deviate more than ${rebalancingThreshold}% from target allocation`,
      threshold: rebalancingThreshold || 5,
      targetAllocation
    }
  ];
  
  return {
    name: `Portfolio Rebalancing (${rebalancingThreshold || 5}% Threshold)`,
    description: `Realign portfolio to target allocation when assets deviate by ${rebalancingThreshold || 5}%`,
    targetAllocation,
    executionSteps,
    expectedOutcomes: {
      balance: 'Maintain strategic asset allocation and risk profile',
      discipline: 'Enforce buy-low, sell-high discipline through systematic rebalancing'
    }
  };
}

function generateYieldStrategy(parameters) {
  const { yieldTarget, riskLevel, assetClasses } = parameters;
  
  // Determine yield sources based on risk tolerance
  let yieldSources = {};
  let expectedYield = 0;
  
  if (riskLevel === 'LOW') {
    yieldSources = {
      STAKING: 50,
      LENDING: 50
    };
    expectedYield = 5;
  } else if (riskLevel === 'MEDIUM') {
    yieldSources = {
      STAKING: 40,
      LENDING: 30,
      LIQUIDITY_PROVISION: 30
    };
    expectedYield = 10;
  } else { // HIGH
    yieldSources = {
      STAKING: 20,
      LENDING: 20,
      LIQUIDITY_PROVISION: 30,
      YIELD_FARMING: 30
    };
    expectedYield = 15;
  }
  
  // Adjust if there's a specific yield target
  if (yieldTarget && yieldTarget > expectedYield) {
    // Increase allocation to higher yield but riskier sources
    if (yieldSources.YIELD_FARMING) {
      yieldSources.YIELD_FARMING += 10;
      yieldSources.STAKING -= 10;
    } else if (yieldSources.LIQUIDITY_PROVISION) {
      yieldSources.LIQUIDITY_PROVISION += 10;
      yieldSources.STAKING -= 10;
    }
    expectedYield = Math.min(yieldTarget, expectedYield * 1.2);
  }
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'YIELD_ALLOCATION',
      description: 'Allocate assets to different yield-generating activities',
      allocation: yieldSources
    },
    {
      type: 'YIELD_MONITORING',
      description: 'Set up monitoring for yield rates and protocol risks',
      frequency: 'Daily'
    },
    {
      type: 'COMPOUNDING',
      description: 'Enable automatic compounding of yields where available',
      compoundingFrequency: 'Maximum available'
    }
  ];
  
  return {
    name: `${expectedYield}% Yield Generation Strategy`,
    description: `Income-focused strategy targeting approximately ${expectedYield}% annual yield`,
    yieldSources,
    executionSteps,
    expectedOutcomes: {
      income: `Approximately ${expectedYield}% annual yield paid in native tokens`,
      risk: riskLevel === 'HIGH' ? 'Significant smart contract and protocol risk' :
           (riskLevel === 'MEDIUM' ? 'Moderate protocol risk with established platforms' : 'Lower risk using blue-chip protocols only')
    }
  };
}

function generateOptimizationStrategy(parameters) {
  const { optimizationGoal, riskLevel, assetClasses } = parameters;
  
  let strategyName, strategyDescription;
  let optimizationCriteria = {};
  
  switch (optimizationGoal) {
    case 'MAXIMIZE_RETURNS':
      strategyName = 'Maximum Returns Strategy';
      strategyDescription = 'Portfolio optimization focused on maximizing total returns';
      optimizationCriteria = {
        returns: 0.8,
        risk: 0.1,
        liquidity: 0.1
      };
      break;
    case 'MINIMIZE_RISK':
      strategyName = 'Risk Minimization Strategy';
      strategyDescription = 'Portfolio optimization focused on minimizing volatility and drawdowns';
      optimizationCriteria = {
        returns: 0.3,
        risk: 0.6,
        liquidity: 0.1
      };
      break;
    case 'OPTIMIZE_SHARPE_RATIO':
      strategyName = 'Risk-Adjusted Returns Strategy';
      strategyDescription = 'Portfolio optimization focused on maximizing Sharpe ratio';
      optimizationCriteria = {
        returns: 0.5,
        risk: 0.4,
        liquidity: 0.1
      };
      break;
    default:
      strategyName = 'Balanced Optimization Strategy';
      strategyDescription = 'Balanced portfolio optimization considering multiple factors';
      optimizationCriteria = {
        returns: 0.4,
        risk: 0.4,
        liquidity: 0.2
      };
  }
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'PORTFOLIO_ANALYSIS',
      description: 'Analyze current portfolio performance against optimization criteria'
    },
    {
      type: 'OPTIMIZATION_MODELING',
      description: 'Run portfolio optimization models based on historical data',
      criteria: optimizationCriteria
    },
    {
      type: 'PORTFOLIO_REALLOCATION',
      description: 'Reallocate portfolio according to optimization results',
      frequency: 'Monthly'
    }
  ];
  
  return {
    name: strategyName,
    description: strategyDescription,
    optimizationCriteria,
    executionSteps,
    expectedOutcomes: {
      optimization: `Portfolio aligned to ${optimizationGoal.replace(/_/g, ' ').toLowerCase()}`,
      adaptability: 'Regular reoptimization as market conditions change'
    }
  };
}

function generateAnalysisStrategy(parameters) {
  const { targetAssets, assetClasses } = parameters;
  
  // Determine analysis targets
  const analysisTargets = targetAssets && targetAssets.length > 0 ? 
    targetAssets : 
    (assetClasses && assetClasses.length > 0 ? assetClasses : ['CRYPTO_MARKET']);
  
  // Generate execution steps
  const executionSteps = [
    {
      type: 'TECHNICAL_ANALYSIS',
      description: 'Perform technical analysis on target assets or markets',
      indicators: ['RSI', 'MACD', 'Moving Averages', 'Volume Profile']
    },
    {
      type: 'FUNDAMENTAL_ANALYSIS',
      description: 'Evaluate fundamental factors and on-chain metrics',
      metrics: ['Network Activity', 'Development Activity', 'Adoption Metrics']
    },
    {
      type: 'SENTIMENT_ANALYSIS',
      description: 'Analyze market sentiment and social metrics',
      sources: ['Social Media', 'News Sentiment', 'Developer Communities']
    }
  ];
  
  return {
    name: 'Comprehensive Market Analysis',
    description: `In-depth analysis of ${analysisTargets.join(', ')} using multiple analytical approaches`,
    analysisTargets,
    executionSteps,
    expectedOutcomes: {
      insights: 'Actionable insights based on multi-factor analysis',
      decisions: 'Data-driven investment decision framework'
    }
  };
}

function generateGenericStrategy(parameters) {
  return generateInvestmentStrategy({
    ...parameters,
    riskLevel: parameters.riskLevel || 'MEDIUM',
    timeHorizon: parameters.timeHorizon || 'MEDIUM',
    assetClasses: parameters.assetClasses || ['CRYPTO'],
    targetAssets: parameters.targetAssets || []
  });
}

module.exports = {
  processUserIntent
}; 