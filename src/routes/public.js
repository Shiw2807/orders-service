const express = require('express');
const router = express.Router();

/**
 * Public API routes
 * These endpoints are accessible without authentication
 */

// SECURITY ISSUE: Exposing sensitive environment variables in public response
// This is a critical security vulnerability - API keys should never be exposed
router.get('/config', (req, res) => {
  res.json({
    serviceName: 'orders-service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    // BUG: Exposing API_KEY in public response - SECURITY VULNERABILITY
    apiKey: process.env.API_KEY,
    endpoints: {
      orders: '/api/orders',
      health: '/health'
    },
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    maxOrderAmount: 1000000
  });
});

// Get service status
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get API documentation
router.get('/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'Orders Service API',
      version: '1.0.0'
    },
    paths: {
      '/api/orders': {
        get: { summary: 'List all orders' },
        post: { summary: 'Create a new order' }
      },
      '/api/orders/{id}': {
        get: { summary: 'Get order by ID' }
      }
    }
  });
});

module.exports = router;
