/**
 * Data Display Components for NOVA Protocol
 * A collection of reusable components for displaying market data
 */

/**
 * Format a currency value with appropriate decimal places and symbol
 * @param {number} value - The value to format
 * @param {string} currency - Currency code (default: USD)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'USD', decimals = 2) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${value.toFixed(decimals)}`;
  }
}

/**
 * Format a number with appropriate decimal places and separators
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} compact - Whether to use compact notation (default: false)
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals = 2, compact = false) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  try {
    const options = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    };
    
    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
    }
    
    return new Intl.NumberFormat('en-US', options).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toFixed(decimals);
  }
}

/**
 * Format a percentage value
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value.toFixed(decimals)}%`;
  }
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('full', 'date', 'time', 'relative')
 * @returns {string} Formatted date string
 */
function formatDate(date, format = 'full') {
  if (!date) {
    return 'N/A';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    switch (format) {
      case 'full':
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'date':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'relative':
        return getRelativeTimeString(dateObj);
      default:
        return dateObj.toLocaleString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toString();
  }
}

/**
 * Get a relative time string (e.g., "5 minutes ago")
 * @param {Date} date - Date to get relative time for
 * @returns {string} Relative time string
 */
function getRelativeTimeString(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

/**
 * Format a crypto asset symbol with appropriate prefix/suffix
 * @param {string} symbol - Asset symbol
 * @returns {string} Formatted symbol
 */
function formatAssetSymbol(symbol) {
  if (!symbol) {
    return 'N/A';
  }
  
  return symbol.toUpperCase();
}

/**
 * Create an HTML element for a price change indicator with appropriate styling
 * @param {number} changePercentage - Percentage change value
 * @param {boolean} includeIcon - Whether to include up/down icon
 * @returns {string} HTML string
 */
function getPriceChangeIndicator(changePercentage, includeIcon = true) {
  if (changePercentage === null || changePercentage === undefined) {
    return '<span class="neutral">N/A</span>';
  }
  
  const formattedValue = formatPercentage(changePercentage);
  let cssClass, icon;
  
  if (changePercentage > 0) {
    cssClass = 'positive';
    icon = includeIcon ? '▲' : '';
  } else if (changePercentage < 0) {
    cssClass = 'negative';
    icon = includeIcon ? '▼' : '';
  } else {
    cssClass = 'neutral';
    icon = '';
  }
  
  return `<span class="${cssClass}">${icon} ${formattedValue}</span>`;
}

/**
 * Create an HTML string for an asset card display
 * @param {Object} asset - Asset data object
 * @returns {string} HTML string
 */
function createAssetCard(asset) {
  if (!asset) {
    return '<div class="asset-card empty">No data available</div>';
  }
  
  const priceFormatted = formatCurrency(asset.price);
  const change24h = getPriceChangeIndicator(asset.change24h);
  const marketCapFormatted = formatNumber(asset.marketCap, 0, true);
  const volumeFormatted = formatNumber(asset.volume24h, 0, true);
  
  return `
    <div class="asset-card">
      <div class="asset-header">
        <h3>${formatAssetSymbol(asset.symbol)}</h3>
        <span class="asset-name">${asset.name}</span>
      </div>
      <div class="asset-price">${priceFormatted}</div>
      <div class="asset-change">${change24h}</div>
      <div class="asset-details">
        <div class="detail-item">
          <span class="label">Market Cap</span>
          <span class="value">${marketCapFormatted}</span>
        </div>
        <div class="detail-item">
          <span class="label">Volume (24h)</span>
          <span class="value">${volumeFormatted}</span>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  getRelativeTimeString,
  formatAssetSymbol,
  getPriceChangeIndicator,
  createAssetCard
}; 