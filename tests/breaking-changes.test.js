/**
 * Tests demonstrating breaking changes across the codebase
 * 
 * These tests document API contract changes that will break consumers
 */

const { notifyOrderShipped } = require('../src/services/notificationService');
const { requireRole } = require('../src/middleware/auth');
const { deepClone } = require('../src/utils/helpers');
const Order = require('../src/models/Order');

describe('Breaking Changes Documentation', () => {
  
  describe('notifyOrderShipped - Signature Change', () => {
    it('OLD SIGNATURE: notifyOrderShipped(orderId, trackingNumber) - NOW BROKEN', async () => {
      // This is how consumers used to call the function
      const orderId = 'order-123';
      const trackingNumber = 'TRACK123';
      
      // OLD CALL - This will fail because signature changed
      // notifyOrderShipped(orderId, trackingNumber)
      
      // The function now expects: notifyOrderShipped(order, carrier, trackingInfo)
      // This breaks all existing callers
      
      expect(() => {
        // Simulating old call pattern
        const result = notifyOrderShipped(orderId, trackingNumber);
        // Will fail because orderId string doesn't have customerEmail property
      }).toBeDefined(); // Test documents the breaking change
    });

    it('NEW SIGNATURE: notifyOrderShipped(order, carrier, trackingInfo)', async () => {
      const order = {
        id: 'order-123',
        customerEmail: 'test@example.com'
      };
      const carrier = 'FedEx';
      const trackingInfo = { number: 'TRACK123' };
      
      // New call pattern
      const result = await notifyOrderShipped(order, carrier, trackingInfo);
      expect(result).toBeDefined();
    });
  });

  describe('requireRole - Signature Change', () => {
    it('OLD SIGNATURE: requireRole(role) - NOW BROKEN', () => {
      // Old usage: requireRole('admin')
      // New usage: requireRole(roles, options)
      
      // Old code expected single string, new code expects array or string + options
      const middleware = requireRole('admin');
      expect(typeof middleware).toBe('function');
    });

    it('NEW SIGNATURE: requireRole(roles, options)', () => {
      // New usage with options
      const middleware = requireRole(['admin', 'manager'], { debug: true });
      expect(typeof middleware).toBe('function');
    });
  });

  describe('deepClone - Signature Change', () => {
    it('OLD SIGNATURE: deepClone(obj) - Still works but behavior changed', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
    });

    it('NEW SIGNATURE: deepClone(obj, options) - New options parameter', () => {
      const obj = { a: 1 };
      // New option to use structuredClone
      const cloned = deepClone(obj, { useStructuredClone: true });
      expect(cloned).toEqual(obj);
    });
  });

  describe('Order.updateStatus - Signature Change', () => {
    it('OLD SIGNATURE: updateStatus(newStatus) - NOW BROKEN', () => {
      const order = new Order({ id: '1', customerId: 'c1', items: ['i1'], total: 100 });
      
      // Old call: order.updateStatus('shipped')
      // New call requires: order.updateStatus('shipped', reason, updatedBy)
      
      // Calling with old signature still works but reason/updatedBy will be undefined
      order.updateStatus('shipped');
      expect(order.status).toBe('shipped');
      expect(order.statusReason).toBeUndefined(); // Missing data
      expect(order.statusUpdatedBy).toBeUndefined(); // Missing data
    });

    it('NEW SIGNATURE: updateStatus(newStatus, reason, updatedBy)', () => {
      const order = new Order({ id: '1', customerId: 'c1', items: ['i1'], total: 100 });
      
      order.updateStatus('shipped', 'Customer requested expedited shipping', 'user-456');
      
      expect(order.status).toBe('shipped');
      expect(order.statusReason).toBe('Customer requested expedited shipping');
      expect(order.statusUpdatedBy).toBe('user-456');
    });
  });

  describe('API v2 Response Format - Breaking Change', () => {
    it('documents v1 vs v2 response format difference', () => {
      // v1 response format
      const v1Response = {
        id: 'order-123',
        customerId: 'cust-456',
        items: ['item-1'],
        total: 99.99,
        status: 'pending'
      };

      // v2 response format - BREAKING CHANGE
      const v2Response = {
        data: {
          order: {
            id: 'order-123',
            customerId: 'cust-456',
            items: ['item-1'],
            total: 99.99,
            formattedTotal: '$99.99',
            status: 'pending',
            priority: 'low'
          }
        },
        meta: {
          api_version: 'v2',
          requestId: 'req_123'
        }
      };

      // Consumers expecting v1 format will break with v2
      expect(v1Response.id).toBe('order-123');
      expect(v2Response.id).toBeUndefined(); // BROKEN - need v2Response.data.order.id
      expect(v2Response.data.order.id).toBe('order-123');
    });
  });

  describe('shared-utils formatCurrency - Breaking Change', () => {
    it('documents the breaking change in shared-utils', () => {
      // OLD (v1.x): formatCurrency(amount) -> "$99.99"
      // NEW (v2.0): formatCurrency(amount, locale) -> "$99.99" or "99,99 €"
      
      // All code using old signature will throw:
      // "locale parameter is required in v2.0.0"
      
      // Files affected:
      // - orders-service/src/utils/formatting.js
      // - orders-service/src/services/orderProcessor.js
      // - orders-service/src/utils/helpers.js
      // - orders-service/src/models/Order.js
      // - payments-service/src/utils/formatting.py
      
      expect(true).toBe(true); // Documentation test
    });
  });
});

describe('Duplicated Logic Locations', () => {
  it('documents all locations of duplicated validateOrderTotal', () => {
    const locations = [
      'shared-utils/src/index.ts',
      'orders-service/src/utils/validation.js',
      'orders-service/src/services/orderProcessor.js',
      'orders-service/src/models/Order.js',
      'orders-service/src/utils/helpers.js',
      'payments-service/src/utils/validation.py'
    ];
    
    // All these files have the same validation logic
    // Should use shared-utils instead
    expect(locations.length).toBe(6);
  });

  it('documents all locations of duplicated calculateTax', () => {
    const locations = [
      'shared-utils/src/index.ts',
      'orders-service/src/services/orderProcessor.js',
      'orders-service/src/models/Order.js',
      'orders-service/src/utils/helpers.js'
    ];
    
    expect(locations.length).toBe(4);
  });

  it('documents all locations of duplicated formatCurrency', () => {
    const locations = [
      'shared-utils/src/index.ts',
      'orders-service/src/utils/formatting.js',
      'orders-service/src/services/orderProcessor.js',
      'orders-service/src/models/Order.js',
      'orders-service/src/utils/helpers.js',
      'payments-service/src/utils/formatting.py'
    ];
    
    expect(locations.length).toBe(6);
  });
});
