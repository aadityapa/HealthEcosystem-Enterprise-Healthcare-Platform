import { InvoiceStatus, InvoiceType, PaymentMethod, PaymentStatus } from '@health/db';
import { InMemoryEventPublisher } from '@health/events';
import { GstCalculationService } from '@/services/gst-calculation.service';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import { CreditLimitService } from '@/services/credit-limit.service';
import { OutstandingService } from '@/services/outstanding.service';
import { SurchargeService } from '@/services/surcharge.service';
import { PricingService } from '@/services/pricing.service';
import { InvoicesService } from '@/modules/invoices/invoices.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import { PaymentGatewayFactory } from '@/modules/payments/gateways/payment-gateway.factory';
import { KafkaEventPublisher } from '@/kafka/kafka-event.publisher';

describe('Invoice create to payment (integration)', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  let invoiceStore: Record<string, unknown>;
  let paymentStore: Record<string, unknown>;

  const prisma = {
    branch: { findFirst: jest.fn().mockResolvedValue({ id: ctx.branchId, code: 'LAB1' }) },
    organization: { findFirst: jest.fn().mockResolvedValue({ gstin: '27AABCU9603R1ZM' }) },
    invoice: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: { create: jest.fn(), findFirst: jest.fn() },
    gstLine: { create: jest.fn() },
    outstandingBalance: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(prisma)),
    labOrder: { findFirst: jest.fn() },
  };

  const eventPublisher = new InMemoryEventPublisher();
  const events: string[] = [];
  eventPublisher.on('billing.invoice.created', async () => { events.push('invoice.created'); });
  eventPublisher.on('billing.payment.received', async () => { events.push('payment.received'); });

  const kafkaPublisher = { onLabOrderCreated: jest.fn() } as unknown as KafkaEventPublisher;

  beforeEach(() => {
    jest.clearAllMocks();
    events.length = 0;
    invoiceStore = {
      id: 'inv-flow-1',
      invoiceNumber: 'INV-LAB1-00001',
      status: InvoiceStatus.DRAFT,
      subtotal: 1000,
      discountAmount: 0,
      taxableAmount: 1000,
      cgstAmount: 90,
      sgstAmount: 90,
      igstAmount: 0,
      totalAmount: 1180,
      paidAmount: 0,
      balanceAmount: 1180,
      corporateClientId: null,
      patientId: 'pat-1',
      dueDate: null,
      lines: [],
    };
    paymentStore = {};

    prisma.invoice.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...invoiceStore, ...data, id: 'inv-flow-1' }),
    );
    prisma.invoice.findFirst.mockImplementation(() => Promise.resolve({ ...invoiceStore, payments: [] }));
    prisma.invoice.update.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
      invoiceStore = { ...invoiceStore, ...data };
      return Promise.resolve(invoiceStore);
    });
    prisma.payment.create.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
      paymentStore = { id: 'pay-flow-1', ...data };
      return Promise.resolve({ ...paymentStore, transactions: [] });
    });
  });

  it('runs full flow: create invoice → issue → collect cash payment', async () => {
    const gstService = new GstCalculationService();
    const pricingService = {
      resolveLine: jest.fn().mockResolvedValue({
        description: 'Complete Blood Count',
        unitPrice: 1000,
        quantity: 1,
        discount: 0,
        taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false },
      }),
    };
    const sequenceService = {
      nextNumber: jest
        .fn()
        .mockResolvedValueOnce('INV-LAB1-00001')
        .mockResolvedValueOnce('PAY-LAB1-00001'),
    };
    const creditLimitService = {
      assertAvailableCredit: jest.fn(),
      reserveCredit: jest.fn(),
      releaseCredit: jest.fn(),
    };
    const outstandingService = new OutstandingService(prisma as never);
    const surchargeService = { calculateSurcharges: jest.fn().mockResolvedValue([]) };

    const invoicesService = new InvoicesService(
      prisma as never,
      eventPublisher,
      kafkaPublisher,
      gstService,
      pricingService as unknown as PricingService,
      sequenceService as unknown as BillingSequenceService,
      creditLimitService as unknown as CreditLimitService,
      outstandingService,
      surchargeService as unknown as SurchargeService,
    );

    const gatewayFactory = { create: jest.fn() } as unknown as PaymentGatewayFactory;
    const paymentsService = new PaymentsService(
      prisma as never,
      eventPublisher,
      sequenceService as unknown as BillingSequenceService,
      outstandingService,
      gatewayFactory,
    );

    const invoice = await invoicesService.createInvoice(ctx, {
      invoiceType: InvoiceType.LAB,
      patientId: 'pat-1',
      referenceType: 'lab_order',
      referenceId: '00000000-0000-4000-8000-000000000010',
      lines: [{ lineType: 'TEST', referenceId: 'test-cbc' }],
    });

    expect(invoice.invoiceNumber).toBe('INV-LAB1-00001');
    expect(events).toContain('invoice.created');

    invoiceStore = { ...invoiceStore, status: InvoiceStatus.DRAFT, balanceAmount: 1180 };
    const issued = await invoicesService.issueInvoice(ctx, 'inv-flow-1');
    expect(issued.status).toBe(InvoiceStatus.ISSUED);
    expect(prisma.outstandingBalance.create).toHaveBeenCalled();

    invoiceStore = {
      ...invoiceStore,
      status: InvoiceStatus.ISSUED,
      balanceAmount: 1180,
      paidAmount: 0,
      totalAmount: 1180,
    };

    const payment = await paymentsService.collectPayment(ctx, 'inv-flow-1', {
      method: PaymentMethod.CASH,
      amount: 1180,
    });

    expect(payment.status).toBe(PaymentStatus.SUCCESS);
    expect(invoiceStore.status).toBe(InvoiceStatus.PAID);
    expect(events).toContain('payment.received');
  });
});
