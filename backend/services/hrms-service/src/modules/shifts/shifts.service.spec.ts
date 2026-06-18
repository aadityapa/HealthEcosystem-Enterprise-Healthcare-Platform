import { ConflictException, NotFoundException } from '@nestjs/common';
import { ShiftsService } from './shifts.service';

describe('ShiftsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    shift: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: { findFirst: jest.fn() },
    shiftAssignment: { findFirst: jest.fn(), create: jest.fn() },
  };

  let service: ShiftsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ShiftsService(prisma as never);
  });

  it('creates shift', async () => {
    prisma.shift.create.mockResolvedValue({ id: 'shift-1', name: 'Morning' });

    const result = await service.create(ctx, {
      name: 'Morning',
      startTime: '08:00',
      endTime: '16:00',
    });

    expect(result.name).toBe('Morning');
  });

  it('assigns shift to employee', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.shift.findFirst.mockResolvedValue({ id: 'shift-1' });
    prisma.shiftAssignment.findFirst.mockResolvedValue(null);
    prisma.shiftAssignment.create.mockResolvedValue({ id: 'assign-1' });

    const result = await service.assign(ctx, {
      employeeId: 'emp-1',
      shiftId: 'shift-1',
      date: '2024-06-01',
    });

    expect(result.id).toBe('assign-1');
  });

  it('throws ConflictException on duplicate assignment', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.shift.findFirst.mockResolvedValue({ id: 'shift-1' });
    prisma.shiftAssignment.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.assign(ctx, {
        employeeId: 'emp-1',
        shiftId: 'shift-1',
        date: '2024-06-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException for missing shift', async () => {
    prisma.shift.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
