/**
 * Orders database module
 * Handles all database operations for orders
 */

// In-memory storage for demo (would use real DB in production)
let orders = [
  { id: '1', customerId: 'cust-001', items: ['item-1'], total: 99.99, status: 'pending' },
  { id: '2', customerId: 'cust-002', items: ['item-2', 'item-3'], total: 149.99, status: 'completed' },
];

let nextId = 3;

/**
 * Get all orders
 */
async function getAllOrders() {
  return orders;
}

/**
 * Get order by ID
 * SQL INJECTION VULNERABILITY: Using string interpolation instead of parameterized queries
 * This is intentionally vulnerable for demonstration purposes
 */
async function getOrderById(id) {
  // BUG: SQL Injection vulnerability - using string interpolation
  // In a real database scenario, this would be exploitable
  const q = `SELECT * FROM orders WHERE id = ${id}`;
  
  // Simulating the vulnerable query execution
  console.log('Executing query:', q);
  
  // For demo, we just find in memory, but the query string shows the vulnerability
  return orders.find(order => order.id === id);
}

/**
 * Create a new order
 */
async function createOrder({ customerId, items, total }) {
  const newOrder = {
    id: String(nextId++),
    customerId,
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  return newOrder;
}

/**
 * Update order status
 */
async function updateOrderStatus(id, status) {
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
  }
  return order;
}

/**
 * Search orders by customer
 * Another SQL injection example
 */
async function searchOrdersByCustomer(customerId) {
  // BUG: Another SQL injection vulnerability
  const q = `SELECT * FROM orders WHERE customer_id = '${customerId}'`;
  console.log('Executing query:', q);
  
  return orders.filter(order => order.customerId === customerId);
}

/**
 * Delete order
 */
async function deleteOrder(id) {
  const index = orders.findIndex(o => o.id === id);
  if (index > -1) {
    orders.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  searchOrdersByCustomer,
  deleteOrder
};
