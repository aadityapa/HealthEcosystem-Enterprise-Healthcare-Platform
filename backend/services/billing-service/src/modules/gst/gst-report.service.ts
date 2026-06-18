import { Inject, Injectable } from '@nestjs/common';
import { InvoiceStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber } from '@/common/utils/decimal.util';
import { GstCalculationService } from '@/services/gst-calculation.service';
import type { BillingRequestContext } from '@/common/context/billing-context';

@Injectable()
export class GstReportService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly gstService: GstCalculationService,
  ) {}

  async getReport(ctx: BillingRequestContext, period: string) {
    const [year, month] = period.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] },
        issuedAt: { gte: periodStart, lte: periodEnd },
      },
      include: { lines: true, gstLines: true },
    });

    const summary = {
      period,
      invoiceCount: invoices.length,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      totalValue: 0,
    };

    for (const inv of invoices) {
      summary.taxableValue += toNumber(inv.taxableAmount);
      summary.cgst += toNumber(inv.cgstAmount);
      summary.sgst += toNumber(inv.sgstAmount);
      summary.igst += toNumber(inv.igstAmount);
      summary.totalValue += toNumber(inv.totalAmount);
    }

    summary.totalTax = summary.cgst + summary.sgst + summary.igst;

    return { summary, invoices: invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      issuedAt: inv.issuedAt,
      taxableAmount: toNumber(inv.taxableAmount),
      cgst: toNumber(inv.cgstAmount),
      sgst: toNumber(inv.sgstAmount),
      igst: toNumber(inv.igstAmount),
      total: toNumber(inv.totalAmount),
    })) };
  }

  async exportGstr1(ctx: BillingRequestContext, period: string) {
    const [year, month] = period.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] },
        issuedAt: { gte: periodStart, lte: periodEnd },
      },
      include: { lines: true },
    });

    const org = await this.prisma.organization.findFirst({
      where: { id: ctx.organizationId },
    });

    const b2bEntries = invoices.map((inv) =>
      this.gstService.buildGstr1Entry({
        invoiceNumber: inv.invoiceNumber,
        issuedAt: inv.issuedAt,
        gstin: inv.gstin ?? org?.gstin ?? null,
        placeOfSupply: inv.placeOfSupply,
        taxableAmount: toNumber(inv.taxableAmount),
        cgstAmount: toNumber(inv.cgstAmount),
        sgstAmount: toNumber(inv.sgstAmount),
        igstAmount: toNumber(inv.igstAmount),
        lines: inv.lines.map((l) => ({
          hsnSacCode: l.hsnSacCode ?? '999799',
          taxableAmount: toNumber(l.taxableAmount),
          cgstRate: toNumber(l.cgstRate),
          sgstRate: toNumber(l.sgstRate),
          igstRate: toNumber(l.igstRate),
          cgstAmount: toNumber(l.cgstAmount),
          sgstAmount: toNumber(l.sgstAmount),
          igstAmount: toNumber(l.igstAmount),
        })),
      }),
    );

    return {
      gstin: org?.gstin ?? '',
      fp: `${String(month).padStart(2, '0')}${year}`,
      version: 'GST3.0.4',
      hash: 'hash',
      b2b: b2bEntries.flatMap((e) => e.inv),
    };
  }
}
