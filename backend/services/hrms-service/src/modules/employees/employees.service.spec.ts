import { ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    employee: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: EmployeesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmployeesService(prisma as never);
  });

  it('creates employee', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);
    prisma.employee.create.mockResolvedValue({ id: 'emp-1', employeeCode: 'E001' });

    const result = await service.create(ctx, {
      employeeCode: 'E001',
      firstName: 'Jane',
      joinDate: '2024-01-01',
    });

    expect(result.employeeCode).toBe('E001');
  });

  it('throws ConflictException on duplicate code', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        employeeCode: 'E001',
        firstName: 'Jane',
        joinDate: '2024-01-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when employee missing', async () => {
    prisma.employee.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
