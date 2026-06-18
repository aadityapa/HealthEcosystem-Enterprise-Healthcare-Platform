import { Injectable } from '@nestjs/common';
import { GstType } from '@health/db';
import { extractStateCode, round2 } from '@/common/utils/decimal.util';

export interface TaxRates {
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isExempt: boolean;
}

export interface GstLineInput {
  taxableAmount: number;
  taxRates: TaxRates;
}

export interface GstLineResult {
  gstType: GstType;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

export interface InvoiceGstSummary {
  gstType: GstType;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
}

@Injectable()
export class GstCalculationService {
  determineGstType(supplierGstin: string | null, placeOfSupply: string | null): GstType {
    const supplierState = extractStateCode(supplierGstin);
    const posState = placeOfSupply?.length === 2 ? placeOfSupply : extractStateCode(placeOfSupply);

    if (!supplierState || !posState) {
      return GstType.CGST_SGST;
    }

    return supplierState === posState ? GstType.CGST_SGST : GstType.IGST;
  }

  calculateLineTax(input: GstLineInput, gstType: GstType): GstLineResult {
    const { taxableAmount, taxRates } = input;

    if (taxRates.isExempt || taxableAmount <= 0) {
      return {
        gstType: GstType.EXEMPT,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
      };
    }

    if (gstType === GstType.IGST) {
      const igstAmount = round2((taxableAmount * taxRates.igstRate) / 100);
      return {
        gstType,
        cgstRate: 0,
        sgstRate: 0,
        igstRate: taxRates.igstRate,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount,
        totalTax: igstAmount,
      };
    }

    const cgstAmount = round2((taxableAmount * taxRates.cgstRate) / 100);
    const sgstAmount = round2((taxableAmount * taxRates.sgstRate) / 100);

    return {
      gstType: GstType.CGST_SGST,
      cgstRate: taxRates.cgstRate,
      sgstRate: taxRates.sgstRate,
      igstRate: 0,
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      totalTax: round2(cgstAmount + sgstAmount),
    };
  }

  aggregateLines(lines: GstLineResult[]): InvoiceGstSummary {
    const cgstAmount = round2(lines.reduce((s, l) => s + l.cgstAmount, 0));
    const sgstAmount = round2(lines.reduce((s, l) => s + l.sgstAmount, 0));
    const igstAmount = round2(lines.reduce((s, l) => s + l.igstAmount, 0));
    const totalTax = round2(cgstAmount + sgstAmount + igstAmount);

    const hasIgst = igstAmount > 0;
    const gstType = totalTax === 0 ? GstType.EXEMPT : hasIgst ? GstType.IGST : GstType.CGST_SGST;

    return {
      gstType,
      taxableAmount: 0,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTax,
    };
  }

  buildGstr1Entry(invoice: {
    invoiceNumber: string;
    issuedAt: Date | null;
    gstin: string | null;
    placeOfSupply: string | null;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    lines: Array<{
      hsnSacCode: string;
      taxableAmount: number;
      cgstRate: number;
      sgstRate: number;
      igstRate: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
    }>;
  }) {
    return {
      inv: [
        {
          inum: invoice.invoiceNumber,
          idt: invoice.issuedAt?.toISOString().slice(0, 10) ?? '',
          val: round2(invoice.taxableAmount + invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount),
          pos: invoice.placeOfSupply ?? '',
          rchrg: 'N',
          inv_typ: 'R',
          itms: invoice.lines.map((line, idx) => ({
            num: idx + 1,
            itm_det: {
              txval: line.taxableAmount,
              rt: line.igstRate > 0 ? line.igstRate : line.cgstRate + line.sgstRate,
              iamt: line.igstAmount,
              camt: line.cgstAmount,
              samt: line.sgstAmount,
              hsncd: line.hsnSacCode,
            },
          })),
        },
      ],
    };
  }
}
