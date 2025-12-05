/**
 * Validation utilities for orders service
 * 
 * ISSUE: This is DUPLICATED LOGIC - the same validation exists in shared-utils
 * Both services implement their own version instead of using the shared library
 */

/**
 * Validate an order total
 * This is duplicated from shared-utils/src/index.ts
 * @param {number} total - The order total to validate
 * @returns {boolean} true if valid, false otherwise
 */
function validateOrderTotal(total) {
  // Duplicated validation logic - should use shared-utils instead
  if (typeof total !== 'number') {
    return false;
  }
  if (isNaN(total)) {
    return false;
  }
  if (total < 0) {
    return false;
  }
  if (total > 1000000) {
    return false;
  }
  return true;
}

/**
 * Validate customer ID format
 * @param {string} customerId 
 * @returns {boolean}
 */
function validateCustomerId(customerId) {
  if (typeof customerId !== 'string') {
    return false;
  }
  return /^cust-\d{3,}$/.test(customerId);
}

/**
 * Validate order items
 * @param {Array} items 
 * @returns {boolean}
 */
function validateOrderItems(items) {
  if (!Array.isArray(items)) {
    return false;
  }
  if (items.length === 0) {
    return false;
  }
  return items.every(item => typeof item === 'string' && item.length > 0);
}

module.exports = {
  validateOrderTotal,
  validateCustomerId,
  validateOrderItems
};
