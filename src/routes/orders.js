const express = require('express');
const router = express.Router();
const ordersDb = require('../db/orders');
const { validateOrderTotal } = require('../utils/validation');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await ordersDb.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await ordersDb.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customerId, items, total } = req.body;

    // Validate order total using local validation (DUPLICATED LOGIC - should use shared-utils)
    if (!validateOrderTotal(total)) {
      return res.status(400).json({ error: 'Invalid order total' });
    }

    const order = await ordersDb.createOrder({ customerId, items, total });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await ordersDb.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = router;
