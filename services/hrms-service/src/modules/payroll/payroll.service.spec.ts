import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmploymentStatus, PayrollStatus } from '@health/db';
import { PayrollService } from './payroll.service';

describe('PayrollService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    payrollRun: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    employee: { findMany: jest.fn() },
    payrollLine: { deleteMany: jest.fn(), createMany: jest.fn(), findMany: jest.fn() },
  };

  let service: PayrollService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PayrollService(prisma as never);
  });

  it('creates payroll run', async () => {
    prisma.payrollRun.count.mockResolvedValue(0);
    prisma.payrollRun.create.mockResolvedValue({
      id: 'run-1',
      status: PayrollStatus.DRAFT,
    });

    const result = await service.createRun(ctx, { periodMonth: 6, periodYear: 2024 });
    expect(result.status).toBe(PayrollStatus.DRAFT);
  });

  it('processes draft payroll run', async () => {
    prisma.payrollRun.findFirst.mockResolvedValue({
      id: 'run-1',
      status: PayrollStatus.DRAFT,
    });
    prisma.employee.findMany.mockResolvedValue([
      { id: 'emp-1', salary: 50000, status: EmploymentStatus.ACTIVE },
    ]);
    prisma.payrollLine.deleteMany.mockResolvedValue({ count: 0 });
    prisma.payrollLine.createMany.mockResolvedValue({ count: 1 });
    prisma.payrollRun.update.mockResolvedValue({
      id: 'run-1',
      status: PayrollStatus.PROCESSED,
      lines: [],
    });

    const result = await service.processRun(ctx, 'run-1');
    expect(result.status).toBe(PayrollStatus.PROCESSED);
  });

  it('rejects processing non-draft run', async () => {
    prisma.payrollRun.findFirst.mockResolvedValue({
      id: 'run-1',
      status: PayrollStatus.PROCESSED,
    });

    await expect(service.processRun(ctx, 'run-1')).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException for missing run lines', async () => {
    prisma.payrollRun.findFirst.mockResolvedValue(null);
    await expect(service.getLines(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
