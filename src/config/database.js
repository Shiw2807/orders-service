/**
 * Database Configuration
 * 
 * ARCHITECTURAL CONCERN: Multiple database patterns in one codebase
 * - This file uses connection pooling
 * - db/orders.js uses in-memory storage
 * - models/Order.js uses Active Record pattern
 * 
 * INCONSISTENT: Configuration scattered across files
 */

// SECURITY ISSUE: Hardcoded database credentials
const DB_CONFIG = {
  host: 'prod-db.company.internal',
  port: 5432,
  database: 'orders_production',
  user: 'orders_admin',
  password: 'Pr0d_P@ssw0rd_2024!',  // CRITICAL: Hardcoded production password
  
  // INCONSISTENT: Mix of camelCase and snake_case
  max_connections: 20,
  idleTimeout: 30000,
  connection_timeout: 5000
};

// DUPLICATED: Same config structure in payments-service
const REDIS_CONFIG = {
  host: 'redis.company.internal',
  port: 6379,
  password: 'redis_secret_123',  // SECURITY ISSUE
  db: 0
};

// ARCHITECTURAL DRIFT: Direct database connection in config file
// Should be in a separate database module
let connectionPool = null;

async function getConnection() {
  if (!connectionPool) {
    // ISSUE: No actual implementation, just simulated
    connectionPool = {
      query: async (sql, params) => {
        // SQL INJECTION: If params not used properly
        console.log('Executing:', sql);
        return { rows: [] };
      },
      release: () => {}
    };
  }
  return connectionPool;
}

// INCONSISTENT: Some functions async, some sync
function getConfig(env = process.env.NODE_ENV) {
  // ISSUE: Falling back to production config by default
  const configs = {
    development: {
      ...DB_CONFIG,
      host: 'localhost',
      database: 'orders_dev'
    },
    test: {
      ...DB_CONFIG,
      host: 'localhost',
      database: 'orders_test'
    },
    production: DB_CONFIG
  };

  return configs[env] || configs.production;  // ISSUE: Defaults to prod
}

// BREAKING CHANGE: Changed export structure
// Old: module.exports = DB_CONFIG
// New: module.exports = { getConfig, getConnection, ... }
module.exports = {
  getConfig,
  getConnection,
  DB_CONFIG,      // SECURITY: Exposing raw config
  REDIS_CONFIG,   // SECURITY: Exposing redis config
  
  // DUPLICATED: These constants also defined elsewhere
  MAX_QUERY_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};
