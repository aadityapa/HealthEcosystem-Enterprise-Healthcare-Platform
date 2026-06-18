import { BadRequestException } from '@nestjs/common';
import { TransferStatus } from '@health/db';
import { StockTransfersService } from './stock-transfers.service';

describe('StockTransfersService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    branch: { findFirst: jest.fn() },
    stockTransfer: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    stockLot: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    inventoryItem: { findFirst: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
  };

  let service: StockTransfersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StockTransfersService(prisma as never);
  });

  it('rejects transfer to same branch', async () => {
    await expect(
      service.create(ctx, {
        toBranchId: ctx.branchId,
        lines: [{ itemId: 'item-1', lotNumber: 'LOT-1', quantity: 5 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('ships transfer and decrements source lot', async () => {
    prisma.stockTransfer.findFirst.mockResolvedValue({
      id: 'tr-1',
      fromBranchId: ctx.branchId,
      toBranchId: 'branch-2',
      status: TransferStatus.DRAFT,
      lines: [{ itemId: 'item-1', lotNumber: 'LOT-1', quantity: { toNumber: () => 5 } }],
    });
    prisma.stockLot.findFirst.mockResolvedValue({
      id: 'lot-1',
      availableQty: { toNumber: () => 20 },
      expiresAt: null,
      item: { reorderLevel: { toNumber: () => 10 } },
    });
    prisma.stockTransfer.update.mockResolvedValue({
      id: 'tr-1',
      status: TransferStatus.IN_TRANSIT,
    });

    const result = await service.ship(ctx, 'tr-1');

    expect(prisma.stockLot.update).toHaveBeenCalled();
    expect(result.status).toBe(TransferStatus.IN_TRANSIT);
  });
});
