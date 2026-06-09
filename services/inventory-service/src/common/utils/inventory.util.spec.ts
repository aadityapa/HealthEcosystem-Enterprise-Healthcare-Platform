import { LotStatus } from '@health/db';
import {
  formatSequenceNumber,
  nextPoNumber,
  resolveLotStatus,
} from './inventory.util';

describe('inventory.util', () => {
  describe('resolveLotStatus', () => {
    it('marks lot EXPIRED when expiresAt is in the past', () => {
      const yesterday = new Date('2020-01-01');
      expect(resolveLotStatus(100, 10, yesterday, new Date('2025-01-01'))).toBe(
        LotStatus.EXPIRED,
      );
    });

    it('marks lot LOW_STOCK when availableQty <= reorderLevel', () => {
      expect(resolveLotStatus(5, 10, null)).toBe(LotStatus.LOW_STOCK);
      expect(resolveLotStatus(10, 10, null)).toBe(LotStatus.LOW_STOCK);
    });

    it('marks lot AVAILABLE when stock is healthy and not expired', () => {
      const future = new Date('2099-01-01');
      expect(resolveLotStatus(50, 10, future)).toBe(LotStatus.AVAILABLE);
    });
  });

  describe('nextPoNumber', () => {
    it('generates INV-PO-{seq} format', async () => {
      const poNumber = await nextPoNumber(async () => 4);
      expect(poNumber).toBe('INV-PO-00005');
    });

    it('formats sequence numbers with padding', () => {
      expect(formatSequenceNumber('INV-PO-', 1)).toBe('INV-PO-00001');
    });
  });
});
