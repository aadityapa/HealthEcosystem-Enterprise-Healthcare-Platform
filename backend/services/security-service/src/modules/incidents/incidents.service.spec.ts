import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { PRISMA } from '@/database/database.module';

describe('IncidentsService', () => {
  let service: IncidentsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      securityIncident: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(IncidentsService);
  });

  it('creates incident with generated number', async () => {
    prisma.securityIncident.create.mockResolvedValue({
      id: 'inc-1',
      incidentNumber: 'INC-123',
      title: 'Unauthorized access',
    });

    const result = await service.create(ctx, { title: 'Unauthorized access' });
    expect(result.title).toBe('Unauthorized access');
    expect(prisma.securityIncident.create).toHaveBeenCalled();
  });

  it('lists incidents with pagination', async () => {
    prisma.securityIncident.findMany.mockResolvedValue([{ id: 'inc-1' }]);
    prisma.securityIncident.count.mockResolvedValue(1);

    const result = await service.list(ctx, { page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('throws NotFoundException for missing incident', async () => {
    prisma.securityIncident.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('sets resolvedAt when status is resolved', async () => {
    prisma.securityIncident.findFirst.mockResolvedValue({ id: 'inc-1' });
    prisma.securityIncident.update.mockResolvedValue({ id: 'inc-1', status: 'RESOLVED' });

    await service.update(ctx, 'inc-1', { status: 'RESOLVED' });

    expect(prisma.securityIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'RESOLVED', resolvedAt: expect.any(Date) }),
      }),
    );
  });
});
