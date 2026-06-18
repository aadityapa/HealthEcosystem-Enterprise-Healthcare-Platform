import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PRISMA } from '@/database/database.module';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      serviceHealthSnapshot: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(HealthService);
  });

  it('lists health snapshots with pagination', async () => {
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([{ id: 'snap-1' }]);
    prisma.serviceHealthSnapshot.count.mockResolvedValue(1);

    const result = await service.listSnapshots(ctx, { page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('filters by service name', async () => {
    prisma.serviceHealthSnapshot.findMany.mockResolvedValue([]);
    prisma.serviceHealthSnapshot.count.mockResolvedValue(0);

    await service.listSnapshots(ctx, { serviceName: 'lims-service' });

    expect(prisma.serviceHealthSnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ serviceName: 'lims-service' }),
      }),
    );
  });
});
