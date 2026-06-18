import { Test, TestingModule } from '@nestjs/testing';
import { CapacityService } from './capacity.service';
import { PRISMA } from '@/database/database.module';

describe('CapacityService', () => {
  let service: CapacityService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      capacityMetric: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CapacityService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(CapacityService);
  });

  it('records capacity metric', async () => {
    prisma.capacityMetric.create.mockResolvedValue({ id: 'metric-1', usagePct: 75 });

    const result = await service.recordMetric(ctx, {
      resourceType: 'cpu',
      resourceName: 'lims-pod-1',
      usagePct: 75,
    });

    expect(result.usagePct).toBe(75);
  });

  it('lists capacity metrics', async () => {
    prisma.capacityMetric.findMany.mockResolvedValue([{ id: 'metric-1' }]);
    prisma.capacityMetric.count.mockResolvedValue(1);

    const result = await service.listMetrics(ctx, {});

    expect(result.items).toHaveLength(1);
  });
});
