import { NotFoundException } from '@nestjs/common';
import { TenantLocaleService } from './tenant-locale.service';

describe('TenantLocaleService', () => {
  const ctx = {
    tenantId: '11111111-1111-1111-1111-111111111111',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    tenantLocale: {
      updateMany: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: TenantLocaleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TenantLocaleService(prisma as never);
  });

  it('creates tenant locale', async () => {
    prisma.tenantLocale.upsert.mockResolvedValue({ countryCode: 'IN', currency: 'INR' });
    const result = await service.create(ctx, {
      countryCode: 'IN',
      currency: 'INR',
      locale: 'en-IN',
    });
    expect(result.countryCode).toBe('IN');
  });

  it('clears other primary flags when setting primary', async () => {
    prisma.tenantLocale.upsert.mockResolvedValue({ isPrimary: true });
    await service.create(ctx, {
      countryCode: 'IN',
      currency: 'INR',
      locale: 'en-IN',
      isPrimary: true,
    });
    expect(prisma.tenantLocale.updateMany).toHaveBeenCalled();
  });

  it('throws when tenant locale not found', async () => {
    prisma.tenantLocale.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
