import { NotFoundException } from '@nestjs/common';
import { QuotationsService } from './quotations.service';

describe('QuotationsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    quotation: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: QuotationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuotationsService(prisma as never);
  });

  it('creates quotation with generated number', async () => {
    prisma.quotation.count.mockResolvedValue(0);
    prisma.quotation.create.mockResolvedValue({
      id: 'qt-1',
      quoteNumber: 'QT000001',
      status: 'draft',
    });

    const result = await service.create(ctx, {
      prospectName: 'City Hospital',
      totalAmount: 250000,
      validUntil: '2026-12-31',
    });
    expect(result.quoteNumber).toBe('QT000001');
  });

  it('lists quotations for tenant', async () => {
    prisma.quotation.findMany.mockResolvedValue([{ id: 'qt-1' }]);
    prisma.quotation.count.mockResolvedValue(1);

    const result = await service.list(ctx, 1, 20);
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException when quotation missing', async () => {
    prisma.quotation.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
