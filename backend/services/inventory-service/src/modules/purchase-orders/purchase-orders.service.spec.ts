import { BadRequestException } from '@nestjs/common';
import { PoStatus } from '@health/db';
import { PurchaseOrdersService } from './purchase-orders.service';

describe('PurchaseOrdersService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    vendor: { findFirst: jest.fn() },
    purchaseOrder: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    purchaseOrderLine: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    stockLot: { create: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(prisma)),
  };

  let service: PurchaseOrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PurchaseOrdersService(prisma as never);
  });

  it('generates INV-PO-{seq} on create', async () => {
    prisma.vendor.findFirst.mockResolvedValue({ id: 'vendor-1' });
    prisma.purchaseOrder.count.mockResolvedValue(2);
    prisma.purchaseOrder.create.mockResolvedValue({
      poNumber: 'INV-PO-00003',
      lines: [],
    });

    const result = await service.create(ctx, {
      vendorId: 'vendor-1',
      lines: [{ itemId: 'item-1', quantity: 10, unitPrice: 100 }],
    });

    expect(result.poNumber).toBe('INV-PO-00003');
    expect(prisma.purchaseOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ poNumber: 'INV-PO-00003' }),
      }),
    );
  });

  it('approves draft purchase order', async () => {
    prisma.purchaseOrder.findFirst.mockResolvedValue({
      id: 'po-1',
      status: PoStatus.DRAFT,
      lines: [],
    });
    prisma.purchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: PoStatus.APPROVED,
    });

    const result = await service.approve(ctx, 'po-1');

    expect(result.status).toBe(PoStatus.APPROVED);
  });

  it('rejects approve for already received PO', async () => {
    prisma.purchaseOrder.findFirst.mockResolvedValue({
      id: 'po-1',
      status: PoStatus.RECEIVED,
      lines: [],
    });

    await expect(service.approve(ctx, 'po-1')).rejects.toThrow(BadRequestException);
  });
});
