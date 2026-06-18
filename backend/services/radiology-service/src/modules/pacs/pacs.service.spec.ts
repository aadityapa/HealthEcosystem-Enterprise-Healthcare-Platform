import { ConflictException, NotFoundException } from '@nestjs/common';
import { PacsService } from './pacs.service';

describe('PacsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    pacsNode: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: PacsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PacsService(prisma as never);
  });

  it('creates PACS node', async () => {
    prisma.pacsNode.findFirst.mockResolvedValue(null);
    prisma.pacsNode.create.mockResolvedValue({ id: 'pacs-1', aeTitle: 'PACS1' });

    const result = await service.create(ctx, {
      name: 'Main PACS',
      aeTitle: 'PACS1',
      host: '10.0.0.1',
    });

    expect(result.aeTitle).toBe('PACS1');
  });

  it('throws ConflictException for duplicate AE title', async () => {
    prisma.pacsNode.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, { name: 'PACS', aeTitle: 'PACS1', host: '10.0.0.1' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when node missing', async () => {
    prisma.pacsNode.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
