const request = require('supertest');
const app = require('../src/index');

describe('Orders API', () => {
  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      const res = await request(app).get('/api/orders/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('1');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const newOrder = {
        customerId: 'cust-003',
        items: ['item-4'],
        total: 59.99
      };
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      expect(res.statusCode).toBe(201);
      expect(res.body.customerId).toBe('cust-003');
    });

    it('should reject invalid order total', async () => {
      const invalidOrder = {
        customerId: 'cust-003',
        items: ['item-4'],
        total: -10
      };
      const res = await request(app)
        .post('/api/orders')
        .send(invalidOrder);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });
});
