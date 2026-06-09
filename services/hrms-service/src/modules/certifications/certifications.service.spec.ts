import { NotFoundException } from '@nestjs/common';
import { CertificationsService } from './certifications.service';

describe('CertificationsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    employee: { findFirst: jest.fn() },
    certification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  let service: CertificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CertificationsService(prisma as never);
  });

  it('creates certification', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'emp-1' });
    prisma.certification.create.mockResolvedValue({ id: 'cert-1' });

    const result = await service.create(ctx, {
      employeeId: 'emp-1',
      certName: 'NABL Auditor',
    });

    expect(result.id).toBe('cert-1');
  });

  it('lists certifications for employee', async () => {
    prisma.certification.findMany.mockResolvedValue([{ id: 'cert-1' }]);
    prisma.certification.count.mockResolvedValue(1);

    const result = await service.list(ctx, { employeeId: 'emp-1' });
    expect(result.items).toHaveLength(1);
  });

  it('throws NotFoundException when certification missing', async () => {
    prisma.certification.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
