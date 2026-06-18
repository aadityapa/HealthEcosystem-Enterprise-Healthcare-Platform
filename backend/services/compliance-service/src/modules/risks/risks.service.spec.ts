import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RisksService } from './risks.service';
import { PRISMA } from '@/database/database.module';

describe('RisksService', () => {
  let service: RisksService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      riskRegisterEntry: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RisksService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(RisksService);
  });

  it('creates risk register entry', async () => {
    prisma.riskRegisterEntry.create.mockResolvedValue({
      id: 'risk-1',
      title: 'Data breach risk',
      riskScore: 15,
    });

    const result = await service.create(ctx, {
      title: 'Data breach risk',
      category: 'Security',
      likelihood: 'medium',
      impact: 'high',
      riskScore: 15,
    });

    expect(result.riskScore).toBe(15);
  });

  it('lists risks ordered by score', async () => {
    prisma.riskRegisterEntry.findMany.mockResolvedValue([{ id: 'risk-1', riskScore: 20 }]);
    prisma.riskRegisterEntry.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException for missing risk', async () => {
    prisma.riskRegisterEntry.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
