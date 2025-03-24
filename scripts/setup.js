#!/usr/bin/env node

/**
 * NOVA Protocol - Setup Script
 * Initializes the project environment, creates necessary directories and installs dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const dirs = [
  'public/images/icons',
  'public/js',
  'src/models',
  'src/routes',
  'src/routes/api',
  'src/middleware',
  'src/services',
  'src/utils',
  'src/config',
  'src/core',
  'src/core/aide',
  'src/core/market',
  'src/contracts',
  'src/components',
  'src/interfaces',
  'tests/models',
  'tests/routes',
  'tests/services'
];

const logSuccess = (message) => console.log(chalk.green(`✓ ${message}`));
const logError = (message) => console.log(chalk.red(`✗ ${message}`));
const logInfo = (message) => console.log(chalk.blue(`ℹ ${message}`));

/**
 * Ensures all required directories exist
 */
function createDirectories() {
  logInfo('Creating project directories...');
  
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logSuccess(`Created directory: ${dir}`);
    } else {
      logInfo(`Directory already exists: ${dir}`);
    }
  });
}

/**
 * Initializes environment variables
 */
function setupEnvironment() {
  logInfo('Setting up environment variables...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    logSuccess('Created .env file from .env.example');
  } else if (!fs.existsSync(envPath)) {
    // Create a basic .env file
    const envContent = `NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nova-protocol
JWT_SECRET=change-this-to-a-secure-secret
LOG_LEVEL=debug`;
    
    fs.writeFileSync(envPath, envContent);
    logSuccess('Created default .env file');
  } else {
    logInfo('.env file already exists');
  }
}

/**
 * Installs or updates npm dependencies
 */
function installDependencies() {
  logInfo('Checking and installing dependencies...');
  
  try {
    // Install production dependencies
    execSync('npm install --production', { stdio: 'inherit' });
    logSuccess('Installed production dependencies');
    
    // Install development dependencies
    execSync('npm install --save-dev', { stdio: 'inherit' });
    logSuccess('Installed development dependencies');
  } catch (error) {
    logError(`Failed to install dependencies: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Creates placeholder files if they don't exist
 */
function createPlaceholderFiles() {
  logInfo('Creating placeholder files...');
  
  const placeholders = {
    'public/js/main.js': `/**
 * NOVA Protocol - Main JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('NOVA Protocol application initialized');
});`,

    'public/js/market-data.js': `/**
 * NOVA Protocol - Market Data JavaScript
 * Handles fetching and displaying market data on the frontend
 */
document.addEventListener('DOMContentLoaded', () => {
  // Placeholder for market data initialization
  console.log('Market data module initialized');
  
  // In a real implementation, this would fetch data from the API
  // and populate the market data tables and charts
});`
  };
  
  Object.entries(placeholders).forEach(([filePath, content]) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      logSuccess(`Created file: ${filePath}`);
    } else {
      logInfo(`File already exists: ${filePath}`);
    }
  });
}

/**
 * Run initialization checks
 */
function checkSystem() {
  logInfo('Performing system checks...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const requiredVersion = 'v14.0.0';
  
  if (compareVersions(nodeVersion, requiredVersion) < 0) {
    logError(`Node.js version ${nodeVersion} is below the required version ${requiredVersion}`);
    logInfo('Please upgrade Node.js to continue');
    process.exit(1);
  }
  
  logSuccess(`Node.js version ${nodeVersion} is compatible`);
}

/**
 * Compare semver versions
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const v1Parts = v1.replace('v', '').split('.').map(Number);
  const v2Parts = v2.replace('v', '').split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
}

// Main execution
function main() {
  console.log(chalk.bold.cyan('\n=== NOVA Protocol Setup ===\n'));
  
  try {
    checkSystem();
    createDirectories();
    setupEnvironment();
    createPlaceholderFiles();
    installDependencies();
    
    console.log(chalk.bold.green('\n✓ Setup completed successfully!\n'));
    console.log(chalk.cyan('To start the development server:'));
    console.log(chalk.white('  npm run dev\n'));
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the setup
main(); 