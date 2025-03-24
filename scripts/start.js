/**
 * NOVA Protocol Start Script
 * Starts the application with proper environment setup
 * 
 * The console logo is a styled version of logo-text.svg
 */

const path = require('path');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`Warning: ${result.error.message}`);
  console.info('Using default environment variables');
}

// Define color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

// Print banner with stylized logo art
console.log(`
${colors.bright}${colors.blue}=====================================
${colors.cyan} _   _  ______      __  _____ 
| \\ | |/ __ \\ \\    / / / ____|
|  \\| | |  | \\ \\  / / | (___  
| . \` | |  | |\\ \\/ /   \\___ \\ 
| |\\  | |__| | \\  /    ____) |
|_| \\_|\\____/   \\/    |_____/ 
${colors.reset}
${colors.bright}${colors.blue}        P R O T O C O L
=====================================${colors.reset}

${colors.white}○──────○${colors.reset}     ${colors.bright}${colors.blue}Node.js Backend API${colors.reset}
${colors.cyan}|      |${colors.reset}     ${colors.bright}Market Data & AI Analytics${colors.reset}
${colors.cyan}|      |${colors.reset}
${colors.white}○      ○${colors.reset}

${colors.bright}${colors.blue}Starting NOVA Protocol API...${colors.reset}
`);

console.log(`${colors.yellow}⚙️  Environment: ${process.env.NODE_ENV || 'development'}${colors.reset}`);
console.log(`${colors.yellow}🔐 Authentication: ${process.env.ENABLE_AUTH === 'true' ? 'Enabled' : 'Disabled'}${colors.reset}`);
console.log(`${colors.yellow}🚪 Port: ${process.env.PORT || 3000}${colors.reset}`);
console.log(`${colors.yellow}📝 Log Level: ${process.env.LOG_LEVEL || 'info'}${colors.reset}`);
console.log('\n');

// Start the server
const serverProcess = spawn('node', ['src/server.js'], { 
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error(`${colors.red}Failed to start server:${colors.reset}`, error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down gracefully...${colors.reset}`);
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}Terminating...${colors.reset}`);
  serverProcess.kill('SIGTERM');
}); 