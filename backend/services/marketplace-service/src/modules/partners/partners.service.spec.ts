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
    partnerLab: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: PartnersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PartnersService(prisma as never);
  });

  it('creates partner lab', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue(null);
    prisma.partnerLab.create.mockResolvedValue({ id: 'partner-1', code: 'LAB01' });

    const result = await service.create(ctx, { code: 'LAB01', name: 'City Lab' });
    expect(result.code).toBe('LAB01');
  });

  it('throws ConflictException on duplicate code', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, { code: 'LAB01', name: 'City Lab' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when partner missing', async () => {
    prisma.partnerLab.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
