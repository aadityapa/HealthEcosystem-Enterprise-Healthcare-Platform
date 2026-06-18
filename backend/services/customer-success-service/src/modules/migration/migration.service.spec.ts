import { NotFoundException } from '@nestjs/common';
import { MigrationService } from './migration.service';

describe('MigrationService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    dataImportJob: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: MigrationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MigrationService(prisma as never);
  });

  it('creates import job with generated number', async () => {
    prisma.dataImportJob.count.mockResolvedValue(0);
    prisma.dataImportJob.create.mockResolvedValue({
      id: 'job-1',
      jobNumber: 'IMP000001',
      importType: 'patients',
    });

    const result = await service.createJob(ctx, { importType: 'patients' });
    expect(result.jobNumber).toBe('IMP000001');
  });

  it('lists jobs for tenant', async () => {
    prisma.dataImportJob.findMany.mockResolvedValue([{ id: 'job-1' }]);
    prisma.dataImportJob.count.mockResolvedValue(1);

    const result = await service.listJobs(ctx, {}, 1, 20);
    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('throws NotFoundException when job missing', async () => {
    prisma.dataImportJob.findFirst.mockResolvedValue(null);
    await expect(service.getJob(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
