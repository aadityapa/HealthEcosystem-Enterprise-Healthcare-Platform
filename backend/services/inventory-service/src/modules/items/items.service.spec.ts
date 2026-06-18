import { InventoryItemType } from '@health/db';
import { ItemsService } from './items.service';

describe('ItemsService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    inventoryItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    vendor: { findFirst: jest.fn() },
  };

  let service: ItemsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ItemsService(prisma as never);
  });

  it('filters items by itemType', async () => {
    prisma.inventoryItem.findMany.mockResolvedValue([]);
    prisma.inventoryItem.count.mockResolvedValue(0);

    await service.list(ctx, { itemType: InventoryItemType.REAGENT, page: 1, limit: 20 });

    expect(prisma.inventoryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ itemType: InventoryItemType.REAGENT }),
      }),
    );
  });

  it('creates inventory item', async () => {
    prisma.inventoryItem.findFirst.mockResolvedValue(null);
    prisma.inventoryItem.create.mockResolvedValue({
      id: 'item-1',
      sku: 'R-001',
      itemType: InventoryItemType.REAGENT,
    });

    const result = await service.create(ctx, {
      itemType: InventoryItemType.REAGENT,
      sku: 'R-001',
      name: 'Glucose Reagent',
    });

    expect(result.sku).toBe('R-001');
  });
});
