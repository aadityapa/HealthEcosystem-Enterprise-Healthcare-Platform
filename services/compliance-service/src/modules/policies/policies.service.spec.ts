import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PRISMA } from '@/database/database.module';

describe('PoliciesService', () => {
  let service: PoliciesService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      policyDocument: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PoliciesService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(PoliciesService);
  });

  it('creates policy document', async () => {
    prisma.policyDocument.create.mockResolvedValue({
      id: 'pol-1',
      policyCode: 'POL-001',
      title: 'Information Security Policy',
    });

    const result = await service.create(ctx, {
      policyCode: 'POL-001',
      title: 'Information Security Policy',
      category: 'Security',
      effectiveFrom: '2026-01-01',
    });

    expect(result.policyCode).toBe('POL-001');
  });

  it('updates policy status', async () => {
    prisma.policyDocument.findFirst.mockResolvedValue({ id: 'pol-1' });
    prisma.policyDocument.update.mockResolvedValue({ id: 'pol-1', status: 'archived' });

    const result = await service.update(ctx, 'pol-1', { status: 'archived' });
    expect(result.status).toBe('archived');
  });

  it('throws NotFoundException for missing policy', async () => {
    prisma.policyDocument.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
