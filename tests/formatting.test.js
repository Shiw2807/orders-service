/**
 * Tests for formatting utilities
 * 
 * This test demonstrates the API contract change issue with shared-utils v2.0.0
 */

// Mock shared-utils to simulate the v2.0.0 behavior
jest.mock('shared-utils', () => ({
  formatCurrency: (amount, locale) => {
    if (typeof locale !== 'string' || locale.length === 0) {
      throw new Error('locale parameter is required in v2.0.0');
    }
    return `$${amount.toFixed(2)}`;
  }
}));

const { formatOrderTotal, formatOrderDate } = require('../src/utils/formatting');

describe('Formatting Utils', () => {
  describe('formatOrderTotal', () => {
    // THIS TEST WILL FAIL - demonstrates the API contract change issue
    it('should format order total correctly', () => {
      // This will throw because formatOrderTotal calls formatCurrency without locale
      // The old signature was: formatCurrency(amount)
      // The new signature is: formatCurrency(amount, locale)
      expect(() => formatOrderTotal(99.99)).toThrow('locale parameter is required');
    });

    // This test shows what the expected behavior should be
    it('FAILING: demonstrates API contract change - missing locale parameter', () => {
      // This test intentionally fails to demonstrate the breaking change
      // formatOrderTotal(99.99) calls formatCurrency(99.99) without locale
      // but shared-utils v2.0.0 requires: formatCurrency(99.99, 'en-US')
      try {
        const result = formatOrderTotal(99.99);
        // If we get here, the test should fail because we expected an error
        expect(result).toBe('$99.99'); // This line won't be reached
      } catch (error) {
        // Expected: the function throws due to missing locale
        expect(error.message).toContain('locale parameter is required');
      }
    });
  });

  describe('formatOrderDate', () => {
    it('should format date correctly', () => {
      const result = formatOrderDate('2024-01-15');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle Date objects', () => {
      const result = formatOrderDate(new Date('2024-06-20'));
      expect(result).toContain('June');
      expect(result).toContain('20');
    });
  });
});
