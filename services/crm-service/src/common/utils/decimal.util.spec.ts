import { calculateCommission, round2, toNumber } from './decimal.util';

describe('decimal.util', () => {
  describe('toNumber', () => {
    it('converts Prisma Decimal-like values', () => {
      expect(toNumber({ toString: () => '12.5' })).toBe(12.5);
      expect(toNumber(null)).toBe(0);
    });
  });

  describe('calculateCommission', () => {
    it('calculates commission from order amount and percentage', () => {
      expect(calculateCommission(1000, 10)).toBe(100);
      expect(calculateCommission(1500, 7.5)).toBe(112.5);
    });

    it('rounds to two decimal places', () => {
      expect(calculateCommission(999.99, 3.33)).toBe(round2((999.99 * 3.33) / 100));
    });
  });
});
