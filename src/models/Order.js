/**
 * Order Model
 * 
 * ARCHITECTURAL CONCERN: This is an anemic domain model mixed with
 * active record pattern. Inconsistent with the rest of the codebase
 * which uses plain objects.
 * 
 * ARCHITECTURAL DRIFT: Introducing OOP patterns in a functional codebase
 */

// DUPLICATED: Same status constants in routes/orders.js
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// DUPLICATED: Same priority logic in orderProcessor.js
const PRIORITY_THRESHOLDS = {
  HIGH: 500,
  MEDIUM: 100
};

class Order {
  constructor(data) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.customerEmail = data.customerEmail;
    this.items = data.items || [];
    this.total = data.total || 0;
    this.status = data.status || ORDER_STATUS.PENDING;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // INCONSISTENT: Some properties use camelCase, some don't
    this.payment_id = data.payment_id || null;
    this.shipping_address = data.shipping_address || null;
  }

  // DUPLICATED LOGIC: Same validation in validation.js and orderProcessor.js
  validate() {
    if (typeof this.total !== 'number' || this.total < 0) {
      throw new Error('Invalid order total');
    }
    if (!this.customerId) {
      throw new Error('Customer ID required');
    }
    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new Error('Order must have items');
    }
    return true;
  }

  // ARCHITECTURAL CONCERN: Business logic in model
  calculatePriority() {
    // DUPLICATED: Same logic in orderProcessor.js
    if (this.total > PRIORITY_THRESHOLDS.HIGH) {
      return 'high';
    } else if (this.total > PRIORITY_THRESHOLDS.MEDIUM) {
      return 'medium';
    }
    return 'low';
  }

  // DUPLICATED: Tax calculation in shared-utils and orderProcessor.js
  calculateTax(rate = 0.1) {
    return Math.round(this.total * rate * 100) / 100;
  }

  // BREAKING CHANGE: Method signature changed
  // Old: updateStatus(newStatus)
  // New: updateStatus(newStatus, reason, updatedBy)
  updateStatus(newStatus, reason, updatedBy) {
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    
    this.status = newStatus;
    this.updatedAt = new Date();
    this.statusReason = reason;
    this.statusUpdatedBy = updatedBy;
    
    return this;
  }

  // INCONSISTENT: Mixing instance methods with what should be static
  static fromDatabase(row) {
    return new Order({
      id: row.id,
      customerId: row.customer_id,
      customerEmail: row.customer_email,
      items: JSON.parse(row.items),
      total: row.total,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  // ARCHITECTURAL DRIFT: Database logic in model (Active Record pattern)
  // Rest of codebase uses repository pattern in db/orders.js
  async save(db) {
    // ISSUE: Direct database access in model
    const query = `
      INSERT INTO orders (id, customer_id, items, total, status)
      VALUES ('${this.id}', '${this.customerId}', '${JSON.stringify(this.items)}', ${this.total}, '${this.status}')
    `;
    // SQL INJECTION: String interpolation instead of parameterized query
    return db.run(query);
  }

  // DUPLICATED: Same formatting in orderProcessor.js
  formatTotal() {
    return '$' + this.total.toFixed(2);
  }

  toJSON() {
    return {
      id: this.id,
      customerId: this.customerId,
      items: this.items,
      total: this.total,
      formattedTotal: this.formatTotal(),
      status: this.status,
      priority: this.calculatePriority(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

// INCONSISTENT: Exporting both class and constants differently
module.exports = Order;
module.exports.ORDER_STATUS = ORDER_STATUS;
module.exports.PRIORITY_THRESHOLDS = PRIORITY_THRESHOLDS;
