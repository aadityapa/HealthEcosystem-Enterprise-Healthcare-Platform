import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ViewsService } from './views.service';
import { PRISMA } from '@/database/database.module';

describe('ViewsService', () => {
  let service: ViewsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      materializedViewMeta: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ViewsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(ViewsService);
  });

  it('registers a new materialized view', async () => {
    prisma.materializedViewMeta.findUnique.mockResolvedValue(null);
    prisma.materializedViewMeta.create.mockResolvedValue({
      id: 'view-1',
      viewName: 'mv_daily_revenue',
    });

    const result = await service.register(ctx, {
      viewName: 'mv_daily_revenue',
      sourceSchema: 'billing',
    });

    expect(result.viewName).toBe('mv_daily_revenue');
  });

  it('throws ConflictException when view already exists', async () => {
    prisma.materializedViewMeta.findUnique.mockResolvedValue({ id: 'view-1' });

    await expect(
      service.register(ctx, {
        viewName: 'mv_daily_revenue',
        sourceSchema: 'billing',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when refreshing unknown view', async () => {
    prisma.materializedViewMeta.findUnique.mockResolvedValue(null);

    await expect(
      service.refresh(ctx, { viewName: 'missing_view' }),
    ).rejects.toThrow(NotFoundException);
  });
});
