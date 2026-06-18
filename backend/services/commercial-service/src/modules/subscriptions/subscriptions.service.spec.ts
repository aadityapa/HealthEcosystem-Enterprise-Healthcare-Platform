import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@health/db';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantSubscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
  };

  let service: SubscriptionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionsService(prisma as never);
  });

  it('creates subscription with license key', async () => {
    prisma.tenantSubscription.findUnique.mockResolvedValue(null);
    prisma.subscriptionPlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      isActive: true,
      monthlyPrice: 15000,
    });
    prisma.tenantSubscription.create.mockResolvedValue({
      id: 'sub-1',
      status: SubscriptionStatus.TRIAL,
      licenseKey: 'ABC123',
    });

    const result = await service.create(ctx, { planId: 'plan-1' });
    expect(result.status).toBe(SubscriptionStatus.TRIAL);
  });

  it('throws ConflictException when subscription exists', async () => {
    prisma.tenantSubscription.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(service.create(ctx, { planId: 'plan-1' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('throws NotFoundException when subscription missing', async () => {
    prisma.tenantSubscription.findUnique.mockResolvedValue(null);
    await expect(service.get(ctx)).rejects.toThrow(NotFoundException);
  });
});
