import { NotFoundException } from '@nestjs/common';
import { ContractsService } from './contracts.service';

describe('ContractsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    partnerContract: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: ContractsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContractsService(prisma as never);
  });

  it('creates partner contract', async () => {
    prisma.partnerContract.count.mockResolvedValue(0);
    prisma.partnerContract.create.mockResolvedValue({
      id: 'ctr-1',
      contractNumber: 'CTR000001',
      partnerType: 'franchise',
    });

    const result = await service.create(ctx, {
      partnerType: 'franchise',
      partnerName: 'Metro Labs',
      startDate: '2026-01-01',
      value: 500000,
    });
    expect(result.contractNumber).toBe('CTR000001');
  });

  it('lists contracts for tenant', async () => {
    prisma.partnerContract.findMany.mockResolvedValue([{ id: 'ctr-1' }]);
    prisma.partnerContract.count.mockResolvedValue(1);

    const result = await service.list(ctx, 1, 20);
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException when contract missing', async () => {
    prisma.partnerContract.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
