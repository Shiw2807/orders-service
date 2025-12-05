/**
 * Validation utilities for orders service
 * 
 * feature/big-update branch version
 * 
 * CHANGES IN THIS FILE:
 * - STYLE: Reformatted all functions
 * - LOGIC: Added new validation functions
 * - DOCS: Added JSDoc comments
 * - BUG FIX: Fixed edge case in validateOrderTotal
 * 
 * ISSUE: This is DUPLICATED LOGIC - the same validation exists in shared-utils
 */

/**
 * Validate an order total
 * @param {number} total - The order total to validate
 * @returns {boolean} true if valid, false otherwise
 */
function validateOrderTotal(total) {
    // STYLE CHANGE: 4-space indentation
    // BUG FIX: Added explicit undefined check
    if (total === undefined || total === null) {
        return false;
    }
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
    // BUG FIX: Added Infinity check
    if (!isFinite(total)) {
        return false;
    }
    return true;
}

/**
 * Validate customer ID format
 * @param {string} customerId - Customer ID to validate
 * @returns {boolean} true if valid
 */
function validateCustomerId(customerId) {
    // STYLE CHANGE: Reformatted
    if (typeof customerId !== 'string') {
        return false;
    }
    // LOGIC CHANGE: Updated regex to be more flexible
    return /^cust-[a-zA-Z0-9]{3,}$/.test(customerId);
}

/**
 * Validate order items
 * @param {Array} items - Array of item IDs
 * @returns {boolean} true if valid
 */
function validateOrderItems(items) {
    // STYLE CHANGE: Reformatted
    if (!Array.isArray(items)) {
        return false;
    }
    if (items.length === 0) {
        return false;
    }
    // LOGIC CHANGE: Added max items check
    if (items.length > 1000) {
        return false;
    }
    return items.every(item => typeof item === 'string' && item.length > 0);
}

// NEW FUNCTION: Validate order status
/**
 * Validate order status
 * @param {string} status - Order status
 * @returns {boolean} true if valid
 */
function validateOrderStatus(status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    return validStatuses.includes(status);
}

// NEW FUNCTION: Validate currency code
/**
 * Validate ISO 4217 currency code
 * @param {string} currency - Currency code
 * @returns {boolean} true if valid
 */
function validateCurrency(currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
    return validCurrencies.includes(currency);
}

// STYLE CHANGE: Grouped exports at end
module.exports = {
    validateOrderTotal,
    validateCustomerId,
    validateOrderItems,
    validateOrderStatus,
    validateCurrency
};
