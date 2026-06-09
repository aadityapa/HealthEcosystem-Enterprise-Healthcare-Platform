import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@health/db';
import { SalesService } from './sales.service';
import { PRISMA } from '@/database/database.module';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      salesTarget: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      salesLead: { groupBy: jest.fn() },
      doctorReferral: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      camp: { aggregate: jest.fn() },
      salesActivity: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(SalesService);
  });

  it('creates sales target when period is unique', async () => {
    prisma.salesTarget.findUnique.mockResolvedValue(null);
    prisma.salesTarget.create.mockResolvedValue({
      id: 'target-1',
      targetAmount: 100000,
      achievedAmount: 0,
    });

    const result = await service.createTarget(ctx, {
      userId: 'user-1',
      periodMonth: 6,
      periodYear: 2025,
      targetAmount: 100000,
    });

    expect(result.targetAmount).toBe(100000);
  });

  it('throws ConflictException when target already exists', async () => {
    prisma.salesTarget.findUnique.mockResolvedValue({ id: 'target-1' });

    await expect(
      service.createTarget(ctx, {
        userId: 'user-1',
        periodMonth: 6,
        periodYear: 2025,
        targetAmount: 100000,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns dashboard stats with lead counts and target attainment', async () => {
    prisma.salesLead.groupBy.mockResolvedValue([
      { status: LeadStatus.NEW, _count: { _all: 3 } },
      { status: LeadStatus.WON, _count: { _all: 1 } },
    ]);
    prisma.salesTarget.findMany.mockResolvedValue([
      { targetAmount: 100000, achievedAmount: 50000 },
      { targetAmount: 50000, achievedAmount: 25000 },
    ]);
    prisma.doctorReferral.count.mockResolvedValue(5);
    prisma.doctorReferral.aggregate.mockResolvedValue({
      _sum: { commissionAmount: 1200 },
    });
    prisma.camp.aggregate.mockResolvedValue({
      _count: { _all: 2 },
      _sum: { actualCount: 80, targetCount: 100 },
    });
    prisma.salesActivity.findMany.mockResolvedValue([]);

    const result = await service.getDashboard(ctx, {
      periodMonth: 6,
      periodYear: 2025,
    });

    expect(result.leads.total).toBeGreaterThan(0);
    expect(result.salesTargets.totalTarget).toBe(150000);
    expect(result.salesTargets.totalAchieved).toBe(75000);
    expect(result.salesTargets.attainmentPct).toBe(50);
    expect(result.referrals.count).toBe(5);
    expect(result.camps.totalRegistrations).toBe(80);
  });

  it('throws NotFoundException when updating missing target', async () => {
    prisma.salesTarget.findFirst.mockResolvedValue(null);

    await expect(
      service.updateTarget(ctx, 'missing', { achievedAmount: 1000 }),
    ).rejects.toThrow(NotFoundException);
  });
});
