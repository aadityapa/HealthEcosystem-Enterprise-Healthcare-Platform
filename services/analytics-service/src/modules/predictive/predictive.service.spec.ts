import { Test, TestingModule } from '@nestjs/testing';
import { PredictiveService } from './predictive.service';
import { PRISMA } from '@/database/database.module';
import { ClickHouseService } from '@/services/clickhouse.service';

describe('PredictiveService', () => {
  let service: PredictiveService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      predictiveModel: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictiveService,
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

    service = module.get(PredictiveService);
  });

  it('generates forecasts from active predictive models', async () => {
    prisma.predictiveModel.findMany.mockResolvedValue([
      {
        id: 'model-1',
        modelType: 'REVENUE_FORECAST',
        name: 'Revenue Model',
        version: '1.0',
        accuracy: 92.5,
        lastTrainedAt: new Date('2025-06-01'),
        config: { baseValue: 10000, growthRate: 0.01 },
        isActive: true,
      },
    ]);

    const result = await service.getForecasts(ctx, {
      from: '2025-06-01',
      to: '2025-06-07',
    });

    expect(result.models).toHaveLength(1);
    expect(result.forecasts.length).toBeGreaterThan(0);
    expect(result.forecasts[0].predictedValue).toBeGreaterThan(0);
  });
});
