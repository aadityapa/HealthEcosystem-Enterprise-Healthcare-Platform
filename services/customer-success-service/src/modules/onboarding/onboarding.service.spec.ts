import { ConflictException, NotFoundException } from '@nestjs/common';
import { OnboardingStatus } from '@health/db';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantOnboarding: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: OnboardingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OnboardingService(prisma as never);
  });

  it('creates onboarding for tenant', async () => {
    prisma.tenantOnboarding.findUnique.mockResolvedValue(null);
    prisma.tenantOnboarding.create.mockResolvedValue({
      id: 'onb-1',
      tenantId: ctx.tenantId,
      status: OnboardingStatus.NOT_STARTED,
    });

    const result = await service.create(ctx, { currentStep: 'setup' });
    expect(result.status).toBe(OnboardingStatus.NOT_STARTED);
  });

  it('throws ConflictException when onboarding exists', async () => {
    prisma.tenantOnboarding.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(service.create(ctx, {})).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when onboarding missing', async () => {
    prisma.tenantOnboarding.findUnique.mockResolvedValue(null);
    await expect(service.get(ctx)).rejects.toThrow(NotFoundException);
  });
});
