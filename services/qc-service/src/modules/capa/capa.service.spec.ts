import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CapaStatus } from '@health/db';
import { CapaService } from './capa.service';

describe('CapaService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    qcFailure: { findFirst: jest.fn() },
    capaRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: CapaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CapaService(prisma as never);
  });

  it('creates CAPA from QC failure', async () => {
    prisma.qcFailure.findFirst.mockResolvedValue({
      id: 'fail-1',
      capa: null,
    });
    prisma.capaRecord.count.mockResolvedValue(0);
    prisma.capaRecord.create.mockResolvedValue({
      id: 'capa-1',
      capaNumber: 'CAPA-000001',
    });

    const result = await service.create(ctx, { failureId: 'fail-1' });

    expect(result.capaNumber).toBe('CAPA-000001');
    expect(prisma.capaRecord.create).toHaveBeenCalled();
  });

  it('rejects duplicate CAPA for same failure', async () => {
    prisma.qcFailure.findFirst.mockResolvedValue({
      id: 'fail-1',
      capa: { id: 'capa-existing' },
    });

    await expect(service.create(ctx, { failureId: 'fail-1' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('sets closedAt when status is CLOSED', async () => {
    prisma.capaRecord.findFirst.mockResolvedValue({ id: 'capa-1' });
    prisma.capaRecord.update.mockResolvedValue({ id: 'capa-1', status: CapaStatus.CLOSED });

    await service.update(ctx, 'capa-1', { status: CapaStatus.CLOSED });

    expect(prisma.capaRecord.update).toHaveBeenCalledWith({
      where: { id: 'capa-1' },
      data: expect.objectContaining({
        status: CapaStatus.CLOSED,
        closedAt: expect.any(Date),
      }),
      include: { failure: true },
    });
  });

  it('throws NotFoundException when CAPA is missing', async () => {
    prisma.capaRecord.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
