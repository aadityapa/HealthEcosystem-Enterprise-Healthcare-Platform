import { Test, TestingModule } from '@nestjs/testing';
import { QcRunStatus } from '@health/db';
import { QcAnalyticsService } from './qc.service';
import { PRISMA } from '@/database/database.module';
import { ClickHouseService } from '@/services/clickhouse.service';

describe('QcAnalyticsService', () => {
  let service: QcAnalyticsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      qcRun: { count: jest.fn() },
      westgardViolation: { count: jest.fn(), groupBy: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QcAnalyticsService,
        { provide: PRISMA, useValue: prisma },
        {
          provide: ClickHouseService,
          useValue: {
            queryWithFallback: jest.fn((_c, _t, _s, _p, fallback) =>
              fallback().then((data: unknown) => ({ data, source: 'postgresql' })),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(QcAnalyticsService);
  });

  it('calculates QC failure rate from PostgreSQL', async () => {
    prisma.qcRun.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(5);
    prisma.westgardViolation.count.mockResolvedValue(12);
    prisma.westgardViolation.groupBy.mockResolvedValue([
      { ruleCode: '1-3s', _count: { _all: 7 } },
    ]);

    const result = await service.getQcAnalytics(ctx, {});

    expect(result.totalRuns).toBe(100);
    expect(result.failedRuns).toBe(5);
    expect(result.failureRate).toBe(5);
    expect(prisma.qcRun.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: QcRunStatus.FAILED }),
      }),
    );
  });
});
