import { ConflictException, NotFoundException } from '@nestjs/common';
import { PartnersService } from './partners.service';

describe('PartnersService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    partnerAccount: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: PartnersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PartnersService(prisma as never);
  });

  it('creates partner account', async () => {
    prisma.partnerAccount.findFirst.mockResolvedValue(null);
    prisma.partnerAccount.create.mockResolvedValue({
      id: 'pa-1',
      accountCode: 'HOSP01',
      partnerType: 'hospital',
    });

    const result = await service.create(ctx, {
      accountCode: 'HOSP01',
      name: 'City Hospital',
      partnerType: 'hospital',
    });
    expect(result.accountCode).toBe('HOSP01');
  });

  it('throws ConflictException on duplicate account code', async () => {
    prisma.partnerAccount.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        accountCode: 'HOSP01',
        name: 'City Hospital',
        partnerType: 'hospital',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when partner missing', async () => {
    prisma.partnerAccount.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
