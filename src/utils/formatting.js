/**
 * Formatting utilities for orders service
 */

// Import from shared-utils - but using OLD signature (will fail at runtime)
const { formatCurrency } = require('shared-utils');

/**
 * Format order total for display
 * BUG: Using old formatCurrency signature - missing locale parameter
 * This will throw an error at runtime with shared-utils v2.0.0
 * 
 * @param {number} amount 
 * @returns {string}
 */
function formatOrderTotal(amount) {
  // BUG: Missing required 'locale' parameter in v2.0.0
  return formatCurrency(amount);
}

/**
 * Format order date
 * @param {string|Date} date 
 * @returns {string}
 */
function formatOrderDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

module.exports = {
  formatOrderTotal,
  formatOrderDate
};
