import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { PRISMA } from '@/database/database.module';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      dashboardConfig: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardsService);
  });

  it('creates dashboard configuration', async () => {
    prisma.dashboardConfig.updateMany.mockResolvedValue({ count: 0 });
    prisma.dashboardConfig.create.mockResolvedValue({
      id: 'dash-1',
      name: 'Executive Overview',
      dashboardType: 'executive',
    });

    const result = await service.create(ctx, {
      name: 'Executive Overview',
      dashboardType: 'executive',
      isDefault: true,
    });

    expect(result.name).toBe('Executive Overview');
    expect(prisma.dashboardConfig.create).toHaveBeenCalled();
  });

  it('throws NotFoundException when dashboard missing', async () => {
    prisma.dashboardConfig.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing-id')).rejects.toThrow(NotFoundException);
  });

  it('lists dashboards with pagination', async () => {
    prisma.dashboardConfig.findMany.mockResolvedValue([{ id: 'dash-1' }]);
    prisma.dashboardConfig.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
