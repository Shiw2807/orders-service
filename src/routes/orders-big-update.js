/**
 * Orders routes - feature/big-update branch version
 * 
 * THIS FILE SIMULATES THE CHANGES IN feature/big-update BRANCH
 * It contains multiple unrelated changes mixed together:
 * - Style changes (formatting, whitespace)
 * - Logic changes (new features, bug fixes)
 * - Documentation changes (comments, JSDoc)
 * 
 * This is an anti-pattern - changes should be in separate PRs
 */

const express = require('express');
const router = express.Router();
const ordersDb = require('../db/orders');
const { validateOrderTotal, validateOrderItems, validateCustomerId } = require('../utils/validation');

// STYLE CHANGE: Added more whitespace between sections


// DOCUMENTATION CHANGE: Added JSDoc
/**
 * Get all orders with optional filtering
 * @route GET /api/orders
 * @param {string} [status] - Filter by order status
 * @param {string} [customerId] - Filter by customer ID
 * @returns {Array} List of orders
 */
router.get('/', async (req, res) => {
    // STYLE CHANGE: Changed indentation from 2 to 4 spaces
    try {
        // LOGIC CHANGE: Added filtering support
        const { status, customerId } = req.query;
        let orders = await ordersDb.getAllOrders();
        
        if (status) {
            orders = orders.filter(o => o.status === status);
        }
        if (customerId) {
            orders = orders.filter(o => o.customerId === customerId);
        }
        
        res.json(orders);
    } catch (error) {
        // DOCUMENTATION CHANGE: Added comment
        // Log error for debugging
        console.error('Failed to fetch orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});


// DOCUMENTATION CHANGE: Added JSDoc
/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @param {string} id - Order ID
 * @returns {Object} Order details
 */
router.get('/:id', async (req, res) => {
    try {
        const order = await ordersDb.getOrderById(req.params.id);
        if (!order) {
            // BUG FIX: Changed error message (was "Not found")
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});


// DOCUMENTATION CHANGE: Added JSDoc
/**
 * Create a new order
 * @route POST /api/orders
 */
router.post('/', async (req, res) => {
    try {
        const { customerId, items, total } = req.body;

        // LOGIC CHANGE: Added customer ID validation
        if (!validateCustomerId(customerId)) {
            return res.status(400).json({ error: 'Invalid customer ID format' });
        }

        // LOGIC CHANGE: Added items validation
        if (!validateOrderItems(items)) {
            return res.status(400).json({ error: 'Invalid order items' });
        }

        // Existing validation
        if (!validateOrderTotal(total)) {
            return res.status(400).json({ error: 'Invalid order total' });
        }

        const order = await ordersDb.createOrder({ customerId, items, total });
        
        // STYLE CHANGE: Added blank line before response
        res.status(201).json(order);
    } catch (error) {
        console.error('Failed to create order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});


// STYLE CHANGE: Added section comment
// ============================================
// Order Status Management
// ============================================

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        // LOGIC CHANGE: Added status validation
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status',
                validStatuses 
            });
        }
        
        const order = await ordersDb.updateOrderStatus(req.params.id, status);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});


// NEW FEATURE: Search orders
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }
        
        const orders = await ordersDb.getAllOrders();
        const results = orders.filter(order => 
            order.id.includes(q) || 
            order.customerId.includes(q)
        );
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});


// NEW FEATURE: Bulk create orders
router.post('/bulk', async (req, res) => {
    try {
        const orders = req.body;
        
        if (!Array.isArray(orders)) {
            return res.status(400).json({ error: 'Expected array of orders' });
        }
        
        if (orders.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 orders per request' });
        }
        
        const results = [];
        const errors = [];
        
        for (let i = 0; i < orders.length; i++) {
            const { customerId, items, total } = orders[i];
            
            if (!validateOrderTotal(total)) {
                errors.push({ index: i, error: 'Invalid total' });
                continue;
            }
            
            const order = await ordersDb.createOrder({ customerId, items, total });
            results.push(order);
        }
        
        res.status(201).json({ 
            created: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ error: 'Bulk creation failed' });
    }
});


module.exports = router;
