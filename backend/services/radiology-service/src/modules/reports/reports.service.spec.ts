import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { StudyStatus } from '@health/db';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    radiologyStudy: { findFirst: jest.fn() },
    radiologyReport: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService(prisma as never);
  });

  it('creates report for completed study', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.COMPLETED,
      report: null,
    });
    prisma.radiologyReport.create.mockResolvedValue({ id: 'rep-1' });

    const result = await service.create(ctx, 'study-1', { reportNumber: 'RPT-001' });
    expect(result.id).toBe('rep-1');
  });

  it('throws ConflictException when report exists', async () => {
    prisma.radiologyStudy.findFirst.mockResolvedValue({
      id: 'study-1',
      status: StudyStatus.COMPLETED,
      report: { id: 'rep-1' },
    });

    await expect(
      service.create(ctx, 'study-1', { reportNumber: 'RPT-001' }),
    ).rejects.toThrow(ConflictException);
  });

  it('verifies report', async () => {
    prisma.radiologyReport.findFirst.mockResolvedValue({
      id: 'rep-1',
      verifiedAt: null,
      findings: 'Normal',
    });
    prisma.radiologyReport.update.mockResolvedValue({
      id: 'rep-1',
      verifiedAt: new Date(),
    });

    const result = await service.verify(ctx, 'rep-1', {});
    expect(result.verifiedAt).toBeDefined();
  });

  it('requires verification before release', async () => {
    prisma.radiologyReport.findFirst.mockResolvedValue({
      id: 'rep-1',
      verifiedAt: null,
      studyId: 'study-1',
      study: {},
    });

    await expect(
      service.release(ctx, 'rep-1', { pdfS3Key: 's3://bucket/report.pdf' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when report missing', async () => {
    prisma.radiologyReport.findFirst.mockResolvedValue(null);
    await expect(service.getByStudy(ctx, 'study-1')).rejects.toThrow(NotFoundException);
  });
});
