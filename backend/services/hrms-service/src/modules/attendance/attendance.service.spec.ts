import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    employee: { findFirst: jest.fn() },
    hrmsAttendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: AttendanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AttendanceService(prisma as never);
  });

  it('checks in employee', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.hrmsAttendance.findFirst.mockResolvedValue(null);
    prisma.hrmsAttendance.create.mockResolvedValue({ id: 'att-1', checkIn: new Date() });

    const result = await service.checkIn(ctx, { employeeId: 'emp-1' });
    expect(result.checkIn).toBeDefined();
  });

  it('throws when already checked in', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.hrmsAttendance.findFirst.mockResolvedValue({
      id: 'att-1',
      checkIn: new Date(),
    });

    await expect(service.checkIn(ctx, { employeeId: 'emp-1' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('checks out employee', async () => {
    prisma.hrmsAttendance.findFirst.mockResolvedValue({
      id: 'att-1',
      checkIn: new Date(),
      checkOut: null,
    });
    prisma.hrmsAttendance.update.mockResolvedValue({
      id: 'att-1',
      checkOut: new Date(),
    });

    const result = await service.checkOut(ctx, { employeeId: 'emp-1' });
    expect(result.checkOut).toBeDefined();
  });

  it('throws NotFoundException when no attendance record', async () => {
    prisma.hrmsAttendance.findFirst.mockResolvedValue(null);
    await expect(service.checkOut(ctx, { employeeId: 'emp-1' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
