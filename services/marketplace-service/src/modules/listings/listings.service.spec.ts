import { ConflictException, NotFoundException } from '@nestjs/common';
import { ListingsService } from './listings.service';

describe('ListingsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    marketplaceListing: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: ListingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ListingsService(prisma as never);
  });

  it('creates listing', async () => {
    prisma.marketplaceListing.findFirst.mockResolvedValue(null);
    prisma.marketplaceListing.create.mockResolvedValue({ id: 'list-1' });

    const result = await service.create(ctx, {
      listingType: 'test',
      itemCode: 'CBC',
      name: 'Complete Blood Count',
      price: 500,
    });

    expect(result.id).toBe('list-1');
  });

  it('throws ConflictException on duplicate item code', async () => {
    prisma.marketplaceListing.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        listingType: 'test',
        itemCode: 'CBC',
        name: 'CBC',
        price: 500,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when listing missing', async () => {
    prisma.marketplaceListing.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
