import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { PRISMA } from '@/database/database.module';

describe('EvidenceService', () => {
  let service: EvidenceService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      auditEvidence: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      complianceControl: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EvidenceService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(EvidenceService);
  });

  it('creates evidence and increments control count', async () => {
    prisma.complianceControl.findUnique.mockResolvedValue({ id: 'ctrl-1' });
    prisma.auditEvidence.create.mockResolvedValue({ id: 'ev-1', title: 'Audit log' });
    prisma.complianceControl.update.mockResolvedValue({});

    const result = await service.create(ctx, {
      controlId: 'ctrl-1',
      evidenceType: 'log',
      title: 'Audit log',
    });

    expect(result.title).toBe('Audit log');
    expect(prisma.complianceControl.update).toHaveBeenCalled();
  });

  it('lists evidence with pagination', async () => {
    prisma.auditEvidence.findMany.mockResolvedValue([{ id: 'ev-1' }]);
    prisma.auditEvidence.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
  });

  it('throws when control not found on create', async () => {
    prisma.complianceControl.findUnique.mockResolvedValue(null);

    await expect(
      service.create(ctx, {
        controlId: 'missing',
        evidenceType: 'log',
        title: 'Test',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
