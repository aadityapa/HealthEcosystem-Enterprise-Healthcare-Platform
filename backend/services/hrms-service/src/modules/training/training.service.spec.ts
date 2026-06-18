import { NotFoundException } from '@nestjs/common';
import { TrainingService } from './training.service';

describe('TrainingService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    employee: { findFirst: jest.fn() },
    trainingRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: TrainingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrainingService(prisma as never);
  });

  it('creates training record', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.trainingRecord.create.mockResolvedValue({ id: 'tr-1' });

    const result = await service.create(ctx, {
      employeeId: 'emp-1',
      trainingName: 'Biosafety',
    });

    expect(result.id).toBe('tr-1');
  });

  it('throws NotFoundException when employee missing', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);

    await expect(
      service.create(ctx, { employeeId: 'missing', trainingName: 'Test' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when record missing', async () => {
    prisma.trainingRecord.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
