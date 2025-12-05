/**
 * Authentication Middleware
 * 
 * ARCHITECTURAL CONCERN: Inconsistent auth implementation
 * Some routes use this, some don't (like public.js exposing API keys)
 * 
 * SECURITY ISSUES: Multiple vulnerabilities
 */

const crypto = require('crypto');

// SECURITY ISSUE: Hardcoded secrets
const JWT_SECRET = 'super-secret-key-do-not-share';
const API_KEYS = [
  'sk_live_orders_abc123',
  'sk_test_orders_xyz789',
  'admin_master_key_2024'  // ISSUE: Admin key mixed with regular keys
];

// DUPLICATED: Same JWT validation logic exists in payments-service
function validateJWT(token) {
  try {
    // SECURITY ISSUE: Not actually validating JWT properly
    // Just checking if it looks like a JWT
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // ISSUE: Base64 decode without verification
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // SECURITY ISSUE: Not checking expiration properly
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

// INCONSISTENT: Different auth methods in same file
function validateApiKey(key) {
  // SECURITY ISSUE: Timing attack vulnerable comparison
  return API_KEYS.includes(key);
}

// ARCHITECTURAL DRIFT: Mixing authentication with authorization
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // INCONSISTENT: Multiple auth methods without clear precedence
  if (apiKey) {
    if (validateApiKey(apiKey)) {
      req.authMethod = 'api_key';
      req.user = { type: 'service' };
      return next();
    }
  }

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const payload = validateJWT(token);
      if (payload) {
        req.authMethod = 'jwt';
        req.user = payload;
        return next();
      }
    }
    
    // INCONSISTENT: Also supporting Basic auth
    if (authHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
      const [username, password] = credentials.split(':');
      // SECURITY ISSUE: Hardcoded credentials
      if (username === 'admin' && password === 'admin123') {
        req.authMethod = 'basic';
        req.user = { username, role: 'admin' };
        return next();
      }
    }
  }

  // INCONSISTENT: Sometimes 401, sometimes 403
  res.status(401).json({ error: 'Unauthorized' });
}

// BREAKING CHANGE: Changed middleware signature
// Old: requireRole(role)
// New: requireRole(roles, options)
function requireRole(roles, options = {}) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // INCONSISTENT: Different user object shapes
    const userRole = req.user.role || req.user.type || 'user';
    
    if (!roleArray.includes(userRole)) {
      // BREAKING: Now returns different error format
      return res.status(403).json({ 
        error: 'Forbidden',
        required: roleArray,
        actual: userRole,
        // SECURITY ISSUE: Leaking internal info
        debug: options.debug ? req.user : undefined
      });
    }

    next();
  };
}

// DUPLICATED: Rate limiting logic also in payments-service
const rateLimitStore = new Map();

function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'];
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key);
    
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    record.count++;
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
  rateLimit,
  validateJWT,
  validateApiKey,
  // SECURITY ISSUE: Exposing secrets
  JWT_SECRET,
  API_KEYS
};
