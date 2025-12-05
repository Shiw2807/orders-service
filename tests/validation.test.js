const { validateOrderTotal, validateCustomerId, validateOrderItems } = require('../src/utils/validation');

describe('Validation Utils', () => {
  describe('validateOrderTotal', () => {
    it('should return true for valid positive numbers', () => {
      expect(validateOrderTotal(100)).toBe(true);
      expect(validateOrderTotal(0)).toBe(true);
      expect(validateOrderTotal(999999)).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(validateOrderTotal(-1)).toBe(false);
    });

    it('should return false for numbers exceeding max', () => {
      expect(validateOrderTotal(1000001)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(validateOrderTotal('100')).toBe(false);
      expect(validateOrderTotal(null)).toBe(false);
      expect(validateOrderTotal(undefined)).toBe(false);
    });
  });

  describe('validateCustomerId', () => {
    it('should return true for valid customer IDs', () => {
      expect(validateCustomerId('cust-001')).toBe(true);
      expect(validateCustomerId('cust-12345')).toBe(true);
    });

    it('should return false for invalid customer IDs', () => {
      expect(validateCustomerId('invalid')).toBe(false);
      expect(validateCustomerId('cust-ab')).toBe(false);
      expect(validateCustomerId(123)).toBe(false);
    });
  });

  describe('validateOrderItems', () => {
    it('should return true for valid items array', () => {
      expect(validateOrderItems(['item-1', 'item-2'])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(validateOrderItems([])).toBe(false);
    });

    it('should return false for non-array', () => {
      expect(validateOrderItems('item')).toBe(false);
      expect(validateOrderItems(null)).toBe(false);
    });
  });
});
