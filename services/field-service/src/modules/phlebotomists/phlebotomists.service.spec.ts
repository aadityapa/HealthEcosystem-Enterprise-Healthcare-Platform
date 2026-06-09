import { ConflictException } from '@nestjs/common';
import { PhlebotomistsService } from './phlebotomists.service';

describe('PhlebotomistsService', () => {
  const ctx = {
    tenantId: '00000000-0000-4000-8000-000000000001',
    organizationId: '00000000-0000-4000-8000-000000000002',
    branchId: '00000000-0000-4000-8000-000000000003',
    userId: '00000000-0000-4000-8000-000000000004',
  };

  const prisma = {
    phlebotomist: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: PhlebotomistsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PhlebotomistsService(prisma as never);
  });

  it('creates phlebotomist', async () => {
    prisma.phlebotomist.findFirst.mockResolvedValue(null);
    prisma.phlebotomist.create.mockResolvedValue({
      id: 'phleb-1',
      employeeCode: 'PH-001',
      name: 'Ravi Kumar',
    });

    const result = await service.create(ctx, {
      employeeCode: 'PH-001',
      name: 'Ravi Kumar',
      phone: '+919876543210',
    });

    expect(result.employeeCode).toBe('PH-001');
  });

  it('throws conflict for duplicate employee code', async () => {
    prisma.phlebotomist.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create(ctx, {
        employeeCode: 'PH-001',
        name: 'Ravi Kumar',
        phone: '+919876543210',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
