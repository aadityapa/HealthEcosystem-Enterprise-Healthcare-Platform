import { GstType } from '@health/db';
import { GstCalculationService } from './gst-calculation.service';

describe('GstCalculationService', () => {
  let service: GstCalculationService;

  beforeEach(() => {
    service = new GstCalculationService();
  });

  describe('determineGstType', () => {
    it('returns CGST_SGST for intra-state (same GSTIN state codes)', () => {
      expect(service.determineGstType('27AABCU9603R1ZM', '27')).toBe(GstType.CGST_SGST);
    });

    it('returns IGST for inter-state (different state codes)', () => {
      expect(service.determineGstType('27AABCU9603R1ZM', '09')).toBe(GstType.IGST);
    });

    it('defaults to CGST_SGST when supplier GSTIN is missing', () => {
      expect(service.determineGstType(null, '27')).toBe(GstType.CGST_SGST);
    });

    it('defaults to CGST_SGST when place of supply is missing', () => {
      expect(service.determineGstType('27AABCU9603R1ZM', null)).toBe(GstType.CGST_SGST);
    });

    it('extracts state from full GSTIN as place of supply', () => {
      expect(service.determineGstType('09AABCU9603R1ZM', '09AABCU9603R1ZX')).toBe(
        GstType.CGST_SGST,
      );
    });
  });

  describe('calculateLineTax - CGST/SGST', () => {
    const taxRates = { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false };

    it('calculates CGST and SGST for intra-state supply', () => {
      const result = service.calculateLineTax(
        { taxableAmount: 1000, taxRates },
        GstType.CGST_SGST,
      );
      expect(result.cgstAmount).toBe(90);
      expect(result.sgstAmount).toBe(90);
      expect(result.igstAmount).toBe(0);
      expect(result.totalTax).toBe(180);
      expect(result.gstType).toBe(GstType.CGST_SGST);
    });

    it('handles zero taxable amount', () => {
      const result = service.calculateLineTax(
        { taxableAmount: 0, taxRates },
        GstType.CGST_SGST,
      );
      expect(result.totalTax).toBe(0);
    });

    it('rounds tax to 2 decimal places', () => {
      const result = service.calculateLineTax(
        { taxableAmount: 333.33, taxRates },
        GstType.CGST_SGST,
      );
      expect(result.cgstAmount).toBe(30);
      expect(result.sgstAmount).toBe(30);
    });
  });

  describe('calculateLineTax - IGST', () => {
    const taxRates = { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false };

    it('calculates IGST for inter-state supply', () => {
      const result = service.calculateLineTax(
        { taxableAmount: 1000, taxRates },
        GstType.IGST,
      );
      expect(result.igstAmount).toBe(180);
      expect(result.cgstAmount).toBe(0);
      expect(result.sgstAmount).toBe(0);
      expect(result.totalTax).toBe(180);
      expect(result.gstType).toBe(GstType.IGST);
    });

    it('uses igstRate not combined cgst+sgst for IGST', () => {
      const result = service.calculateLineTax(
        { taxableAmount: 500, taxRates: { cgstRate: 6, sgstRate: 6, igstRate: 12, isExempt: false } },
        GstType.IGST,
      );
      expect(result.igstAmount).toBe(60);
    });
  });

  describe('calculateLineTax - exempt', () => {
    it('returns zero tax for exempt items', () => {
      const result = service.calculateLineTax(
        {
          taxableAmount: 1000,
          taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: true },
        },
        GstType.CGST_SGST,
      );
      expect(result.gstType).toBe(GstType.EXEMPT);
      expect(result.totalTax).toBe(0);
    });
  });

  describe('aggregateLines', () => {
    it('aggregates multiple line taxes', () => {
      const lines = [
        service.calculateLineTax(
          { taxableAmount: 1000, taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false } },
          GstType.CGST_SGST,
        ),
        service.calculateLineTax(
          { taxableAmount: 500, taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false } },
          GstType.CGST_SGST,
        ),
      ];
      const summary = service.aggregateLines(lines);
      expect(summary.cgstAmount).toBe(135);
      expect(summary.sgstAmount).toBe(135);
      expect(summary.totalTax).toBe(270);
    });

    it('detects IGST in mixed aggregation', () => {
      const lines = [
        service.calculateLineTax(
          { taxableAmount: 1000, taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false } },
          GstType.IGST,
        ),
      ];
      const summary = service.aggregateLines(lines);
      expect(summary.gstType).toBe(GstType.IGST);
      expect(summary.igstAmount).toBe(180);
    });
  });

  describe('buildGstr1Entry', () => {
    it('builds GSTR-1 invoice entry structure', () => {
      const entry = service.buildGstr1Entry({
        invoiceNumber: 'INV-001',
        issuedAt: new Date('2026-01-15'),
        gstin: '27AABCU9603R1ZM',
        placeOfSupply: '27',
        taxableAmount: 1000,
        cgstAmount: 90,
        sgstAmount: 90,
        igstAmount: 0,
        lines: [{
          hsnSacCode: '999799',
          taxableAmount: 1000,
          cgstRate: 9,
          sgstRate: 9,
          igstRate: 0,
          cgstAmount: 90,
          sgstAmount: 90,
          igstAmount: 0,
        }],
      });

      expect(entry.inv).toHaveLength(1);
      expect(entry.inv[0].inum).toBe('INV-001');
      expect(entry.inv[0].itms[0].itm_det.txval).toBe(1000);
    });
  });
});
