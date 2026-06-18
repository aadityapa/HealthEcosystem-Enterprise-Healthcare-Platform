import { NotFoundException } from '@nestjs/common';
import { FeaturesService } from './features.service';

describe('FeaturesService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    featureToggle: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: FeaturesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeaturesService(prisma as never);
  });

  it('upserts a feature toggle', async () => {
    prisma.featureToggle.upsert.mockResolvedValue({ id: 'feat-1', featureKey: 'home_collection' });

    const result = await service.create(ctx, { featureKey: 'home_collection', enabled: true });
    expect(result.featureKey).toBe('home_collection');
  });

  it('lists feature toggles for tenant', async () => {
    prisma.featureToggle.findMany.mockResolvedValue([{ featureKey: 'ai_chat' }]);
    const result = await service.list(ctx);
    expect(result.items).toHaveLength(1);
  });

  it('throws when feature not found', async () => {
    prisma.featureToggle.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
