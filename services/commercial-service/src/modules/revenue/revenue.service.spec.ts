import { SubscriptionStatus } from '@health/db';
import { RevenueService } from './revenue.service';

describe('RevenueService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantSubscription: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let service: RevenueService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RevenueService(prisma as never);
  });

  it('computes MRR and ARR from active subscriptions', async () => {
    prisma.tenantSubscription.findMany.mockResolvedValue([
      {
        mrr: 10000,
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'PRO', name: 'Professional' },
      },
      {
        mrr: 5000,
        status: SubscriptionStatus.TRIAL,
        plan: { code: 'STARTER', name: 'Starter' },
      },
    ]);
    prisma.tenantSubscription.count.mockResolvedValue(0);

    const result = await service.getDashboard(ctx);
    expect(result.mrr).toBe(15000);
    expect(result.arr).toBe(180000);
    expect(result.activeSubscriptions).toBe(2);
  });

  it('groups revenue by plan', async () => {
    prisma.tenantSubscription.findMany.mockResolvedValue([
      {
        mrr: 10000,
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'PRO', name: 'Professional' },
      },
      {
        mrr: 10000,
        status: SubscriptionStatus.ACTIVE,
        plan: { code: 'PRO', name: 'Professional' },
      },
    ]);
    prisma.tenantSubscription.count.mockResolvedValue(0);

    const result = await service.getDashboard(ctx);
    expect(result.byPlan).toHaveLength(1);
    expect(result.byPlan[0].count).toBe(2);
    expect(result.byPlan[0].mrr).toBe(20000);
  });

  it('includes subscription status breakdown', async () => {
    prisma.tenantSubscription.findMany.mockResolvedValue([
      {
        mrr: 5000,
        status: SubscriptionStatus.TRIAL,
        plan: { code: 'STARTER', name: 'Starter' },
      },
    ]);
    prisma.tenantSubscription.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const result = await service.getDashboard(ctx);
    expect(result.byStatus.trial).toBe(1);
    expect(result.byStatus.suspended).toBe(1);
    expect(result.byStatus.cancelled).toBe(2);
  });
});
