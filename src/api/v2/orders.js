/**
 * Orders API v2
 * 
 * ARCHITECTURAL CONCERN: API versioning done incorrectly
 * - v1 and v2 have different response formats (breaking change)
 * - No deprecation strategy
 * - Duplicates most of v1 code
 * 
 * BREAKING CHANGE: Response format differs from v1
 */

const express = require('express');
const router = express.Router();
const ordersDb = require('../../db/orders');
const Order = require('../../models/Order');
const { validateOrderTotal } = require('../../utils/validation');
const { authMiddleware } = require('../../middleware/auth');

// INCONSISTENT: v2 requires auth, v1 doesn't
router.use(authMiddleware);

// BREAKING CHANGE: Different response format than v1
// v1: { id, customerId, items, total, status }
// v2: { data: { order: {...} }, meta: {...} }
router.get('/', async (req, res) => {
  try {
    const orders = await ordersDb.getAllOrders();
    
    // BREAKING: Wrapped response format
    res.json({
      data: {
        orders: orders.map(o => new Order(o).toJSON())
      },
      meta: {
        total: orders.length,
        page: 1,
        perPage: orders.length,
        // INCONSISTENT: camelCase vs snake_case
        api_version: 'v2',
        requestId: `req_${Date.now()}`
      }
    });
  } catch (error) {
    // BREAKING: Different error format than v1
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders',
        // SECURITY: Exposing stack trace
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// DUPLICATED: Same logic as v1 with different response format
router.get('/:id', async (req, res) => {
  try {
    const order = await ordersDb.getOrderById(req.params.id);
    if (!order) {
      // BREAKING: Different error format
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Order ${req.params.id} not found`
        }
      });
    }
    
    res.json({
      data: {
        order: new Order(order).toJSON()
      },
      meta: {
        api_version: 'v2'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// BREAKING CHANGE: Different request body format
// v1: { customerId, items, total }
// v2: { data: { order: { customerId, items, total } } }
router.post('/', async (req, res) => {
  try {
    // BREAKING: Expects nested structure
    const orderData = req.body.data?.order || req.body;
    const { customerId, items, total } = orderData;

    // DUPLICATED: Same validation as v1
    if (!validateOrderTotal(total)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid order total',
          field: 'total'
        }
      });
    }

    const order = await ordersDb.createOrder({ customerId, items, total });
    
    res.status(201).json({
      data: {
        order: new Order(order).toJSON()
      },
      meta: {
        api_version: 'v2',
        created: true
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create order'
      }
    });
  }
});

// BREAKING CHANGE: Different endpoint structure
// v1: PATCH /orders/:id/status
// v2: PUT /orders/:id (full update)
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body.data?.order || req.body;
    
    // ARCHITECTURAL CONCERN: Full replacement vs partial update
    // This is a PUT but acts like PATCH
    const order = await ordersDb.updateOrderStatus(
      req.params.id, 
      updateData.status
    );
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    res.json({
      data: {
        order: new Order(order).toJSON()
      },
      meta: {
        api_version: 'v2',
        updated: true
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR', 
        message: 'Failed to update order'
      }
    });
  }
});

// NEW in v2: Batch operations
// ARCHITECTURAL CONCERN: Batch endpoint with no size limits
router.post('/batch', async (req, res) => {
  try {
    const operations = req.body.data?.operations || [];
    
    // ISSUE: No limit on batch size
    const results = [];
    
    for (const op of operations) {
      // ISSUE: Sequential processing, should be parallel
      if (op.action === 'create') {
        const order = await ordersDb.createOrder(op.order);
        results.push({ success: true, order });
      } else if (op.action === 'update') {
        const order = await ordersDb.updateOrderStatus(op.id, op.status);
        results.push({ success: !!order, order });
      }
    }

    res.json({
      data: { results },
      meta: {
        api_version: 'v2',
        processed: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'BATCH_ERROR',
        message: 'Batch operation failed'
      }
    });
  }
});

module.exports = router;
