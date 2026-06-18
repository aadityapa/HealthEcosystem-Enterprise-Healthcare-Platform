import { NotFoundException } from '@nestjs/common';
import { PartnerOrderStatus } from '@health/db';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    partnerLab: { findFirst: jest.fn() },
    partnerOrder: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(prisma as never);
  });

  it('books B2C test order', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue({ id: 'partner-1' });
    prisma.partnerOrder.count.mockResolvedValue(0);
    prisma.partnerOrder.create.mockResolvedValue({
      id: 'order-1',
      orderType: 'B2C',
      status: PartnerOrderStatus.PENDING,
    });

    const result = await service.bookTest(ctx, {
      partnerLabId: 'partner-1',
      patientId: 'pat-1',
      totalAmount: 999,
    });

    expect(result.orderType).toBe('B2C');
  });

  it('creates B2B order', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue({ id: 'partner-1' });
    prisma.partnerOrder.count.mockResolvedValue(1);
    prisma.partnerOrder.create.mockResolvedValue({
      id: 'order-2',
      orderType: 'B2B',
      status: PartnerOrderStatus.CONFIRMED,
    });

    const result = await service.createB2BOrder(ctx, {
      partnerLabId: 'partner-1',
      corporateId: 'corp-1',
      totalAmount: 50000,
    });

    expect(result.status).toBe(PartnerOrderStatus.CONFIRMED);
  });

  it('throws NotFoundException when partner missing', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue(null);

    await expect(
      service.bookTest(ctx, {
        partnerLabId: 'missing',
        patientId: 'pat-1',
        totalAmount: 100,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when order missing', async () => {
    prisma.partnerOrder.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
