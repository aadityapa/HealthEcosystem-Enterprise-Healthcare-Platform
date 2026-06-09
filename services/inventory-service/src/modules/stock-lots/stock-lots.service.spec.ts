import { LotStatus } from '@health/db';
import { StockLotsService } from './stock-lots.service';

describe('StockLotsService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    inventoryItem: { findFirst: jest.fn() },
    stockLot: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: StockLotsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StockLotsService(prisma as never);
  });

  it('creates lot with LOW_STOCK when qty <= reorderLevel', async () => {
    prisma.inventoryItem.findFirst.mockResolvedValue({
      id: 'item-1',
      reorderLevel: { toNumber: () => 10 },
    });
    prisma.stockLot.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.create(ctx, {
      itemId: 'item-1',
      lotNumber: 'LOT-1',
      quantity: 5,
    });

    expect(result.status).toBe(LotStatus.LOW_STOCK);
  });

  it('auto-updates expired lot status on get', async () => {
    const expiredLot = {
      id: 'lot-1',
      availableQty: { toNumber: () => 50 },
      expiresAt: new Date('2020-01-01'),
      status: LotStatus.AVAILABLE,
      item: { reorderLevel: { toNumber: () => 10 } },
    };
    prisma.stockLot.findFirst.mockResolvedValue(expiredLot);
    prisma.stockLot.update.mockResolvedValue({
      ...expiredLot,
      status: LotStatus.EXPIRED,
    });

    const result = await service.get(ctx, 'lot-1');

    expect(prisma.stockLot.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: LotStatus.EXPIRED } }),
    );
    expect(result.status).toBe(LotStatus.EXPIRED);
  });
});
