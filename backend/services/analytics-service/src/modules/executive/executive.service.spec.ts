import { Test, TestingModule } from '@nestjs/testing';
import { ExecutiveService } from './executive.service';
import { PRISMA } from '@/database/database.module';
import { ClickHouseService } from '@/services/clickhouse.service';

describe('ExecutiveService', () => {
  let service: ExecutiveService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let clickhouse: { queryWithFallback: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      invoice: { aggregate: jest.fn() },
      labOrder: { count: jest.fn() },
      patient: { count: jest.fn() },
      branch: { count: jest.fn() },
    };
    clickhouse = {
      queryWithFallback: jest.fn((_ctx, _type, _sql, _params, fallback) =>
        fallback().then((data: unknown) => ({ data, source: 'postgresql' })),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveService,
        { provide: PRISMA, useValue: prisma },
        { provide: ClickHouseService, useValue: clickhouse },
      ],
    }).compile();

    service = module.get(ExecutiveService);
  });

  it('returns executive KPIs from PostgreSQL fallback', async () => {
    prisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 250000 } });
    prisma.labOrder.count.mockResolvedValue(120);
    prisma.patient.count.mockResolvedValue(85);
    prisma.branch.count.mockResolvedValue(4);

    const result = await service.getKpis(ctx, {});

    expect(result.kpis).toEqual({
      revenue: 250000,
      orders: 120,
      patients: 85,
      branches: 4,
    });
    expect(result.source).toBe('postgresql');
  });

  it('scopes queries to tenant and organization', async () => {
    prisma.invoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 0 } });
    prisma.labOrder.count.mockResolvedValue(0);
    prisma.patient.count.mockResolvedValue(0);
    prisma.branch.count.mockResolvedValue(0);

    await service.getKpis(ctx, { from: '2025-01-01', to: '2025-01-31' });

    expect(prisma.labOrder.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          organizationId: 'org-1',
        }),
      }),
    );
  });
});
