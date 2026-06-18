import { ConflictException, NotFoundException } from '@nestjs/common';
import { WellnessService } from './wellness.service';

describe('WellnessService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    wellnessPackage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: WellnessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WellnessService(prisma as never);
  });

  it('creates wellness package', async () => {
    prisma.wellnessPackage.findFirst.mockResolvedValue(null);
    prisma.wellnessPackage.create.mockResolvedValue({ id: 'pkg-1', code: 'EXEC' });

    const result = await service.create(ctx, {
      code: 'EXEC',
      name: 'Executive Health',
      price: 15000,
    });

    expect(result.code).toBe('EXEC');
  });

  it('throws ConflictException on duplicate code', async () => {
    prisma.wellnessPackage.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, { code: 'EXEC', name: 'Executive', price: 1000 }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when package missing', async () => {
    prisma.wellnessPackage.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
