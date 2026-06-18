import { BadRequestException } from '@nestjs/common';
import { InvoiceStatus, InvoiceType } from '@health/db';
import { InMemoryEventPublisher } from '@health/events';
import { InvoicesService } from './invoices.service';
import { GstCalculationService } from '@/services/gst-calculation.service';
import { PricingService } from '@/services/pricing.service';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import { CreditLimitService } from '@/services/credit-limit.service';
import { OutstandingService } from '@/services/outstanding.service';
import { SurchargeService } from '@/services/surcharge.service';
import { KafkaEventPublisher } from '@/kafka/kafka-event.publisher';

describe('InvoicesService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const createdInvoice = {
    id: 'inv-1',
    invoiceNumber: 'INV-BR1-001',
    status: InvoiceStatus.DRAFT,
    totalAmount: 1180,
    balanceAmount: 1180,
    paidAmount: 0,
    corporateClientId: null,
    patientId: 'pat-1',
    dueDate: null,
    lines: [],
  };

  const prisma = {
    branch: { findFirst: jest.fn().mockResolvedValue({ id: ctx.branchId, code: 'BR1' }) },
    organization: { findFirst: jest.fn().mockResolvedValue({ gstin: '27AABCU9603R1ZM' }) },
    invoice: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
    gstLine: { create: jest.fn() },
    labOrder: { findFirst: jest.fn() },
  };

  const eventPublisher = new InMemoryEventPublisher();
  const kafkaPublisher = { onLabOrderCreated: jest.fn() } as unknown as KafkaEventPublisher;

  const gstService = new GstCalculationService();
  const pricingService = {
    resolveLine: jest.fn().mockResolvedValue({
      description: 'CBC Test',
      unitPrice: 1000,
      quantity: 1,
      discount: 0,
      taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false },
    }),
  };
  const sequenceService = {
    nextNumber: jest.fn().mockResolvedValue('INV-BR1-260608-00001'),
  };
  const creditLimitService = {
    assertAvailableCredit: jest.fn(),
    reserveCredit: jest.fn(),
    releaseCredit: jest.fn(),
  };
  const outstandingService = { onInvoiceIssued: jest.fn() };
  const surchargeService = { calculateSurcharges: jest.fn().mockResolvedValue([]) };

  let service: InvoicesService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.invoice.create.mockResolvedValue(createdInvoice);
    prisma.invoice.findFirst.mockResolvedValue({ ...createdInvoice, lines: [], payments: [] });

    service = new InvoicesService(
      prisma as never,
      eventPublisher,
      kafkaPublisher,
      gstService,
      pricingService as unknown as PricingService,
      sequenceService as unknown as BillingSequenceService,
      creditLimitService as unknown as CreditLimitService,
      outstandingService as unknown as OutstandingService,
      surchargeService as unknown as SurchargeService,
    );
  });

  it('creates invoice with GST calculation', async () => {
    const result = await service.createInvoice(ctx, {
      invoiceType: InvoiceType.LAB,
      patientId: 'pat-1',
      lines: [{ lineType: 'TEST', referenceId: 'test-1' }],
    });

    expect(result.invoiceNumber).toBe('INV-BR1-001');
    expect(prisma.invoice.create).toHaveBeenCalled();
    expect(sequenceService.nextNumber).toHaveBeenCalledWith(
      ctx.tenantId,
      ctx.branchId,
      'INV',
      'BR1',
    );
  });

  it('rejects empty invoice lines', async () => {
    await expect(
      service.createInvoice(ctx, { invoiceType: InvoiceType.LAB, lines: [] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('checks credit limit for corporate invoices', async () => {
    await service.createInvoice(ctx, {
      invoiceType: InvoiceType.CORPORATE,
      corporateClientId: 'corp-1',
      lines: [{ lineType: 'TEST', referenceId: 'test-1' }],
    });

    expect(creditLimitService.assertAvailableCredit).toHaveBeenCalled();
    expect(creditLimitService.reserveCredit).toHaveBeenCalled();
  });

  it('issues draft invoice and updates outstanding', async () => {
    prisma.invoice.update.mockResolvedValue({
      ...createdInvoice,
      status: InvoiceStatus.ISSUED,
      issuedAt: new Date(),
      balanceAmount: 1180,
    });

    await service.issueInvoice(ctx, 'inv-1');
    expect(outstandingService.onInvoiceIssued).toHaveBeenCalled();
  });

  it('rejects issuing non-draft invoice', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      ...createdInvoice,
      status: InvoiceStatus.ISSUED,
    });

    await expect(service.issueInvoice(ctx, 'inv-1')).rejects.toThrow(BadRequestException);
  });

  it('voids invoice and releases credit', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      ...createdInvoice,
      status: InvoiceStatus.DRAFT,
      paidAmount: 0,
      corporateClientId: 'corp-1',
      totalAmount: 1180,
    });
    prisma.invoice.update.mockResolvedValue({
      ...createdInvoice,
      status: InvoiceStatus.VOID,
      corporateClientId: 'corp-1',
      totalAmount: 1180,
    });

    await service.voidInvoice(ctx, 'inv-1', 'Duplicate entry');
    expect(creditLimitService.releaseCredit).toHaveBeenCalledWith('corp-1', 1180);
  });

  it('rejects voiding invoice with payments', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      ...createdInvoice,
      paidAmount: 500,
    });

    await expect(service.voidInvoice(ctx, 'inv-1', 'reason')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('supports referenceType lab_order on creation', async () => {
    await service.createInvoice(ctx, {
      invoiceType: InvoiceType.LAB,
      patientId: 'pat-1',
      referenceType: 'lab_order',
      referenceId: 'order-1',
      lines: [{ lineType: 'TEST', referenceId: 'test-1' }],
    });

    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceType: 'lab_order',
          referenceId: 'order-1',
        }),
      }),
    );
  });
});
