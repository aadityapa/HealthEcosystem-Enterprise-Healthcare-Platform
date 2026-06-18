import { ConflictException, NotFoundException } from '@nestjs/common';
import { VendorsService } from './vendors.service';

describe('VendorsService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    vendor: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: VendorsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VendorsService(prisma as never);
  });

  it('creates a vendor', async () => {
    prisma.vendor.findFirst.mockResolvedValue(null);
    prisma.vendor.create.mockResolvedValue({ id: 'v-1', code: 'V001', name: 'Acme' });

    const result = await service.create(ctx, { code: 'V001', name: 'Acme' });

    expect(result.code).toBe('V001');
    expect(prisma.vendor.create).toHaveBeenCalled();
  });

  it('rejects duplicate vendor code', async () => {
    prisma.vendor.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, { code: 'V001', name: 'Acme' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when vendor not found', async () => {
    prisma.vendor.findFirst.mockResolvedValue(null);

    await expect(service.get(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('lists vendors with pagination', async () => {
    prisma.vendor.findMany.mockResolvedValue([{ id: 'v-1' }]);
    prisma.vendor.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
