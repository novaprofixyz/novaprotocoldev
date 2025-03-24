/**
 * Swagger Documentation Setup for NOVA Protocol
 */

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
const { createContextLogger } = require('../utils/logger');
const { get: getConfig } = require('../utils/config');

const swaggerLogger = createContextLogger('Swagger');

/**
 * Setup Swagger documentation for the application
 * 
 * @param {Express} app - Express application instance
 */
function setupSwagger(app) {
  swaggerLogger.info('Setting up Swagger API documentation');
  
  // Swagger definition
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'NOVA Protocol API',
      version: '1.0.0',
      description: 'Advanced DeFi Protocol with Integrated AI Decision Engine',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'NOVA Protocol Support',
        url: 'https://novaprotocol.io',
        email: 'support@novaprotocol.io'
      }
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      }
    }
  };
  
  // Options for swagger jsdoc
  const options = {
    swaggerDefinition,
    // Path to the API docs
    apis: [
      './src/routes/*.js'
    ],
  };
  
  // Initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options);
  
  // Try to load custom CSS
  let customCss = '';
  try {
    const cssPath = path.join(process.cwd(), 'public/css/swagger-theme.css');
    swaggerLogger.info(`Loading custom CSS from ${cssPath}`);
    customCss = fs.readFileSync(cssPath, 'utf8');
    swaggerLogger.info('Custom CSS loaded successfully');
  } catch (error) {
    swaggerLogger.warn(`Failed to load custom CSS: ${error.message}. Using default styling.`);
    // Fallback to inline CSS
    customCss = `
      .swagger-ui .topbar { background-color: #040B20 !important; border-bottom: 2px solid #5D00FF; }
      .swagger-ui .topbar-wrapper img { content: url("/static/images/swagger-logo.svg"); height: 50px; width: auto; }
      body { background-color: #0A1035; color: #F0F0F0; }
      .swagger-ui { background-color: #0A1035; color: #F0F0F0; }
      .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3, .swagger-ui .info h4 { color: #FFFFFF; }
      .swagger-ui .info a { color: #00FFFF; }
    `;
  }
  
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss,
    customSiteTitle: 'NOVA Protocol API Documentation',
    customfavIcon: '/static/images/favicon.svg',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    }
  }));
  
  // Serve swagger spec as JSON for programmatic access
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  swaggerLogger.info('Swagger API documentation initialized');
}

module.exports = { setupSwagger }; 