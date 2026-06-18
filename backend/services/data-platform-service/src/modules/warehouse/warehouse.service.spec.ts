import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { PRISMA } from '@/database/database.module';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      warehouseTable: {
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WarehouseService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(WarehouseService);
  });

  it('lists warehouse tables', async () => {
    prisma.warehouseTable.findMany.mockResolvedValue([{ id: 'table-1' }]);
    prisma.warehouseTable.count.mockResolvedValue(1);

    const result = await service.listTables(ctx, {});

    expect(result.items).toHaveLength(1);
  });

  it('refreshes warehouse tables', async () => {
    prisma.warehouseTable.findMany.mockResolvedValue([
      { id: 'table-1', rowCount: BigInt(1000) },
    ]);
    prisma.warehouseTable.update.mockResolvedValue({
      id: 'table-1',
      rowCount: BigInt(1100),
      sparkJobId: 'refresh-table-1',
    });

    const result = await service.refresh(ctx, {});

    expect(result.refreshed).toBe(1);
    expect(result.status).toBe('stub');
  });

  it('throws when no tables to refresh', async () => {
    prisma.warehouseTable.findMany.mockResolvedValue([]);

    await expect(service.refresh(ctx, { tableName: 'missing' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
