import { NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@health/db';
import { InMemoryEventPublisher } from '@health/events';
import { FranchiseSettlementService } from './franchise-settlement.service';
import { BillingSequenceService } from '@/services/billing-sequence.service';

describe('FranchiseSettlementService', () => {
  const ctx = {
    tenantId: 't1',
    organizationId: 'o1',
    branchId: 'b1',
    userId: 'u1',
  };

  const prisma = {
    revenueShareRule: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    invoice: { findMany: jest.fn() },
    branch: { findFirst: jest.fn().mockResolvedValue({ code: 'FR1' }) },
    franchiseSettlement: { create: jest.fn(), findMany: jest.fn() },
  };

  const sequenceService = {
    nextNumber: jest.fn().mockResolvedValue('SET-FR1-00001'),
  };

  const eventPublisher = new InMemoryEventPublisher();

  let service: FranchiseSettlementService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FranchiseSettlementService(
      prisma as never,
      eventPublisher,
      sequenceService as unknown as BillingSequenceService,
    );
  });

  it('calculates franchise share, royalty and commission', async () => {
    prisma.revenueShareRule.findFirst.mockResolvedValue({
      revenueSharePct: 70,
      royaltyPct: 5,
      commissionPct: 3,
    });
    prisma.invoice.findMany.mockResolvedValue([
      { totalAmount: 10000 },
      { totalAmount: 5000 },
    ]);
    prisma.franchiseSettlement.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'set-1', ...data }),
    );

    const result = await service.calculateSettlement(ctx, {
      franchiseBranchId: 'fr-b1',
      parentBranchId: 'hq-b1',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(result.grossRevenue).toBe(15000);
    expect(result.franchiseShare).toBe(10500);
    expect(result.hqShare).toBe(4500);
    expect(result.royaltyAmount).toBe(750);
    expect(result.commissionAmount).toBe(450);
    expect(result.netSettlement).toBe(9300);
  });

  it('throws when no revenue share rule found', async () => {
    prisma.revenueShareRule.findFirst.mockResolvedValue(null);

    await expect(
      service.calculateSettlement(ctx, {
        franchiseBranchId: 'fr-b1',
        parentBranchId: 'hq-b1',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates revenue share rule', async () => {
    prisma.revenueShareRule.create.mockResolvedValue({ id: 'rule-1' });

    await service.createRevenueShareRule(ctx, {
      franchiseBranchId: 'fr-b1',
      revenueSharePct: 70,
      royaltyPct: 5,
      effectiveFrom: '2026-01-01',
    });

    expect(prisma.revenueShareRule.create).toHaveBeenCalled();
  });

  it('queries invoices with issued status in period', async () => {
    prisma.revenueShareRule.findFirst.mockResolvedValue({
      revenueSharePct: 70,
      royaltyPct: 0,
      commissionPct: 0,
    });
    prisma.invoice.findMany.mockResolvedValue([]);
    prisma.franchiseSettlement.create.mockResolvedValue({ id: 'set-2' });

    await service.calculateSettlement(ctx, {
      franchiseBranchId: 'fr-b1',
      parentBranchId: 'hq-b1',
      periodStart: '2026-02-01',
      periodEnd: '2026-02-28',
    });

    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          branchId: 'fr-b1',
          status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] },
        }),
      }),
    );
  });
});
