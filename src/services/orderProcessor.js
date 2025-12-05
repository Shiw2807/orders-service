/**
 * Order Processor Service
 * 
 * ARCHITECTURAL CONCERN: This service directly calls the payments-service
 * instead of using an event-driven architecture or message queue.
 * This creates tight coupling between services.
 * 
 * ARCHITECTURAL DRIFT: Mixing business logic with infrastructure concerns
 */

const http = require('http');

// ISSUE: Hardcoded service URL - should use service discovery
const PAYMENTS_SERVICE_URL = 'http://localhost:3002';

// DUPLICATED LOGIC: This validation exists in shared-utils AND in validation.js
function validateOrderTotal(total) {
  if (typeof total !== 'number') return false;
  if (isNaN(total)) return false;
  if (total < 0) return false;
  if (total > 1000000) return false;
  return true;
}

// DUPLICATED LOGIC: Same currency formatting exists in payments-service
function formatCurrency(amount) {
  // BREAKING CHANGE: Using old signature without locale
  // shared-utils v2.0.0 requires: formatCurrency(amount, locale)
  return '$' + amount.toFixed(2);
}

// ARCHITECTURAL CONCERN: Direct HTTP call to another service
// Should use: message queue, event bus, or at minimum a circuit breaker
async function processPayment(orderId, amount, customerId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      order_id: orderId,
      amount: amount,
      currency: 'USD',
      customer_id: customerId,
      payment_method: 'card'
    });

    // ISSUE: No retry logic, no circuit breaker, no timeout handling
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/payments/charge',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
      // SECURITY ISSUE: No authentication header sent!
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Payment failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ARCHITECTURAL DRIFT: Business logic mixed with data access
async function processOrder(order) {
  // Validate - DUPLICATED from validation.js
  if (!validateOrderTotal(order.total)) {
    throw new Error('Invalid order total');
  }

  // INCONSISTENT: Sometimes we use async/await, sometimes callbacks
  // ARCHITECTURAL CONCERN: Synchronous payment processing blocks the order flow
  const paymentResult = await processPayment(
    order.id,
    order.total,
    order.customerId
  );

  // ISSUE: No transaction handling - what if this fails after payment?
  order.status = 'paid';
  order.paymentId = paymentResult.id;
  
  // INCONSISTENT CODE QUALITY: Magic strings instead of constants
  if (order.total > 500) {
    order.priority = 'high';
  } else if (order.total > 100) {
    order.priority = 'medium';
  } else {
    order.priority = 'low';
  }

  return order;
}

// DUPLICATED LOGIC: Tax calculation also exists in shared-utils
function calculateTax(amount, rate = 0.1) {
  return Math.round(amount * rate * 100) / 100;
}

// INCONSISTENT: Different error handling patterns
function processOrderSync(order, callback) {
  try {
    if (!validateOrderTotal(order.total)) {
      callback(new Error('Invalid total'), null);
      return;
    }
    // ... sync processing
    callback(null, order);
  } catch (err) {
    callback(err, null);
  }
}

module.exports = {
  processOrder,
  processOrderSync,
  processPayment,
  validateOrderTotal,
  calculateTax,
  formatCurrency
};
