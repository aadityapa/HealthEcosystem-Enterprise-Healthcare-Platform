import { NotFoundException } from '@nestjs/common';
import { QcRunStatus } from '@health/db';
import { RunsService } from './runs.service';
import { WestgardRulesService } from '@/services/westgard-rules.service';

describe('RunsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    qcMaterial: { findFirst: jest.fn() },
    qcRun: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    qcDataPoint: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    westgardViolation: { createMany: jest.fn() },
    qcFailure: { create: jest.fn() },
  };

  const westgardRules = new WestgardRulesService();
  let service: RunsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RunsService(prisma as never, westgardRules);
  });

  it('records a data point with z-score and Westgard evaluation', async () => {
    prisma.qcRun.findFirst.mockResolvedValue({
      id: 'run-1',
      status: QcRunStatus.IN_PROGRESS,
      materialId: 'mat-1',
      material: { targetMean: 100, targetSd: 5 },
    });
    prisma.qcDataPoint.findMany.mockResolvedValue([]);
    prisma.qcDataPoint.create.mockResolvedValue({
      id: 'dp-1',
      value: 111,
      zScore: 2.2,
    });
    prisma.qcRun.update.mockResolvedValue({});
    prisma.westgardViolation.createMany.mockResolvedValue({ count: 1 });

    const result = await service.recordDataPoint(ctx, 'run-1', { value: 111 });

    expect(result.zScore).toBe(2.2);
    expect(result.violations.some((v) => v.ruleCode === '1-2s')).toBe(true);
    expect(prisma.qcDataPoint.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        runId: 'run-1',
        value: 111,
        zScore: 2.2,
      }),
    });
  });

  it('creates QC failure when reject rule is violated', async () => {
    prisma.qcRun.findFirst.mockResolvedValue({
      id: 'run-1',
      status: QcRunStatus.IN_PROGRESS,
      materialId: 'mat-1',
      material: { targetMean: 100, targetSd: 5 },
    });
    prisma.qcDataPoint.findMany.mockResolvedValue([]);
    prisma.qcDataPoint.create.mockResolvedValue({ id: 'dp-1' });
    prisma.qcRun.update.mockResolvedValue({});
    prisma.westgardViolation.createMany.mockResolvedValue({ count: 1 });
    prisma.qcFailure.create.mockResolvedValue({ id: 'fail-1' });

    const result = await service.recordDataPoint(ctx, 'run-1', { value: 120 });

    expect(result.zScore).toBe(4);
    expect(result.failure).toEqual({ id: 'fail-1' });
    expect(prisma.qcFailure.create).toHaveBeenCalled();
  });

  it('throws NotFoundException when run is missing', async () => {
    prisma.qcRun.findFirst.mockResolvedValue(null);
    await expect(
      service.recordDataPoint(ctx, 'missing', { value: 100 }),
    ).rejects.toThrow(NotFoundException);
  });
});
