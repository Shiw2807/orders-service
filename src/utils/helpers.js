/**
 * Helper Utilities
 * 
 * ARCHITECTURAL CONCERN: Catch-all utility file with unrelated functions
 * Should be split into focused modules
 * 
 * DUPLICATED LOGIC: Many functions duplicate shared-utils or other files
 */

// DUPLICATED: Same function in shared-utils
function generateOrderId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomPart}`.toUpperCase();
}

// DUPLICATED: Same function in shared-utils AND orderProcessor.js
function calculateTax(amount, rate = 0.1) {
  return Math.round(amount * rate * 100) / 100;
}

// DUPLICATED: Same validation in validation.js, orderProcessor.js, Order.js
function validateOrderTotal(total) {
  if (typeof total !== 'number') return false;
  if (isNaN(total)) return false;
  if (total < 0) return false;
  if (total > 1000000) return false;
  return true;
}

// DUPLICATED: Same formatting in orderProcessor.js, Order.js
function formatCurrency(amount) {
  // BREAKING CHANGE: Doesn't match shared-utils v2.0.0 signature
  return '$' + amount.toFixed(2);
}

// INCONSISTENT: Different date formatting approaches
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US');
}

function formatDateTime(date) {
  // INCONSISTENT: Different format than formatDate
  return new Date(date).toISOString();
}

function formatDateCustom(date, format) {
  // INCONSISTENT: Yet another date formatting approach
  const d = new Date(date);
  return format
    .replace('YYYY', d.getFullYear())
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'));
}

// DUPLICATED: Email validation in notificationService.js
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// DUPLICATED: Phone validation in notificationService.js
function validatePhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

// ARCHITECTURAL CONCERN: HTTP utility in a helpers file
// Should be in a dedicated HTTP client module
async function makeHttpRequest(url, options = {}) {
  const http = require('http');
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// INCONSISTENT: Mixing sync and async utilities
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepSync(ms) {
  // ISSUE: Blocking sync sleep - bad practice
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

// DUPLICATED: Same retry logic pattern in multiple places
async function retry(fn, attempts = 3, delay = 1000) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await sleep(delay);
    }
  }
}

// BREAKING CHANGE: Changed function signature
// Old: deepClone(obj)
// New: deepClone(obj, options)
function deepClone(obj, options = {}) {
  if (options.useStructuredClone && typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  // ISSUE: Doesn't handle circular references, dates, etc.
  return JSON.parse(JSON.stringify(obj));
}

// INCONSISTENT: Some functions use arrow syntax, some don't
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
};

const isNotEmpty = (value) => !isEmpty(value);

// DUPLICATED: Same slugify in payments-service
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ARCHITECTURAL CONCERN: Caching utility in helpers
// Should be in dedicated cache module
const cache = new Map();

function memoize(fn, keyFn = (...args) => JSON.stringify(args)) {
  return (...args) => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

module.exports = {
  generateOrderId,
  calculateTax,
  validateOrderTotal,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDateCustom,
  validateEmail,
  validatePhone,
  makeHttpRequest,
  sleep,
  sleepSync,
  retry,
  deepClone,
  isEmpty,
  isNotEmpty,
  slugify,
  memoize,
  // ISSUE: Exposing internal cache
  _cache: cache
};
