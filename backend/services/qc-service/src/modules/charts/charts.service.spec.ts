import { NotFoundException } from '@nestjs/common';
import { ChartsService } from './charts.service';

describe('ChartsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    qcMaterial: { findFirst: jest.fn() },
    qcDataPoint: { findMany: jest.fn() },
  };

  let service: ChartsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChartsService(prisma as never);
  });

  it('returns Levey-Jennings chart data with control limits', async () => {
    prisma.qcMaterial.findFirst.mockResolvedValue({
      id: 'mat-1',
      code: 'QC-L1',
      name: 'Level 1',
      analyte: 'GLU',
      level: 'L1',
      unit: 'mg/dL',
      targetMean: 100,
      targetSd: 5,
    });
    prisma.qcDataPoint.findMany.mockResolvedValue([
      {
        id: 'dp-1',
        value: 102,
        zScore: 0.4,
        isOutlier: false,
        recordedAt: new Date('2026-01-01'),
        run: { id: 'run-1', runNumber: 'QC-000001', runAt: new Date() },
      },
    ]);

    const result = await service.getLeveyJennings(ctx, 'mat-1');

    expect(result.controlLimits.mean).toBe(100);
    expect(result.controlLimits.plus2Sd).toBe(110);
    expect(result.controlLimits.minus2Sd).toBe(90);
    expect(result.dataPoints).toHaveLength(1);
  });

  it('throws NotFoundException when material is missing', async () => {
    prisma.qcMaterial.findFirst.mockResolvedValue(null);
    await expect(service.getLeveyJennings(ctx, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
