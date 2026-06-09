import { NotFoundException } from '@nestjs/common';
import { FranchiseService } from './franchise.service';

describe('FranchiseService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    franchiseBrand: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: FranchiseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FranchiseService(prisma as never);
  });

  it('creates franchise brand', async () => {
    prisma.franchiseBrand.upsert.mockResolvedValue({ id: 'fb-1', brandName: 'Branch Lab' });
    const result = await service.create(ctx, {
      branchId: '22222222-2222-2222-2222-222222222222',
      brandName: 'Branch Lab',
    });
    expect(result.brandName).toBe('Branch Lab');
  });

  it('lists franchise brands', async () => {
    prisma.franchiseBrand.findMany.mockResolvedValue([{ id: 'fb-1' }]);
    const result = await service.list(ctx);
    expect(result.items).toHaveLength(1);
  });

  it('throws when franchise brand missing', async () => {
    prisma.franchiseBrand.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
