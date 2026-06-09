import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClickHouseService } from './clickhouse.service';
import { PRISMA } from '@/database/database.module';

describe('ClickHouseService', () => {
  let service: ClickHouseService;
  let prisma: { analyticsQueryLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      analyticsQueryLog: { create: jest.fn().mockResolvedValue({}) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickHouseService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(ClickHouseService);
    await service.onModuleInit();
  });

  it('reports ClickHouse unavailable when CLICKHOUSE_URL is not set', () => {
    expect(service.isClickHouseAvailable()).toBe(false);
  });

  it('falls back to PostgreSQL when ClickHouse is unavailable', async () => {
    const fallback = jest.fn().mockResolvedValue({ revenue: 5000 });

    const result = await service.queryWithFallback(
      { tenantId: 'tenant-1', userId: 'user-1' },
      'test_query',
      'SELECT 1',
      {},
      fallback,
    );

    expect(result.source).toBe('postgresql');
    expect(result.data).toEqual({ revenue: 5000 });
    expect(fallback).toHaveBeenCalled();
  });

  it('logs analytics query after execution', async () => {
    await service.queryWithFallback(
      { tenantId: 'tenant-1', userId: 'user-1' },
      'test_query',
      'SELECT 1',
      {},
      async () => ({ value: 1 }),
    );

    expect(prisma.analyticsQueryLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          queryType: 'test_query',
          source: 'postgresql',
        }),
      }),
    );
  });

  it('continues when query log write fails', async () => {
    prisma.analyticsQueryLog.create.mockRejectedValue(new Error('db down'));

    const result = await service.queryWithFallback(
      { tenantId: 'tenant-1' },
      'test_query',
      'SELECT 1',
      {},
      async () => ({ ok: true }),
    );

    expect(result.data).toEqual({ ok: true });
  });
});
