import { ConflictException, NotFoundException } from '@nestjs/common';
import { PlansService } from './plans.service';

describe('PlansService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    subscriptionPlan: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: PlansService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlansService(prisma as never);
  });

  it('creates subscription plan', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
    prisma.subscriptionPlan.create.mockResolvedValue({
      id: 'plan-1',
      code: 'STARTER',
      name: 'Starter',
    });

    const result = await service.create(ctx, {
      code: 'STARTER',
      name: 'Starter',
      tier: 'starter',
      monthlyPrice: 9999,
    });
    expect(result.code).toBe('STARTER');
  });

  it('throws ConflictException on duplicate code', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        code: 'STARTER',
        name: 'Starter',
        tier: 'starter',
        monthlyPrice: 9999,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('soft-deletes plan', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue({ id: 'plan-1' });
    prisma.subscriptionPlan.update.mockResolvedValue({ id: 'plan-1', isActive: false });

    const result = await service.remove(ctx, 'plan-1');
    expect(result.deleted).toBe(true);
  });

  it('throws NotFoundException when plan missing', async () => {
    prisma.subscriptionPlan.findUnique.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
