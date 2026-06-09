import { ConflictException, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brands.service';

describe('BrandsService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantBrand: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: BrandsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BrandsService(prisma as never);
  });

  it('creates a tenant brand', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue(null);
    prisma.tenantBrand.create.mockResolvedValue({ id: 'brand-1', brandName: 'Acme Lab' });

    const result = await service.create(ctx, { brandName: 'Acme Lab' });

    expect(prisma.tenantBrand.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: ctx.tenantId, brandName: 'Acme Lab' }),
    });
    expect(result.id).toBe('brand-1');
  });

  it('throws ConflictException when brand exists', async () => {
    prisma.tenantBrand.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(service.create(ctx, { brandName: 'Acme' })).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when brand is missing', async () => {
    prisma.tenantBrand.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('deletes a brand', async () => {
    prisma.tenantBrand.findFirst.mockResolvedValue({ id: 'brand-1' });
    prisma.tenantBrand.delete.mockResolvedValue({});

    const result = await service.remove(ctx, 'brand-1');
    expect(result.deleted).toBe(true);
  });
});
