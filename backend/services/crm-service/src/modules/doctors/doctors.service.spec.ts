import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { PRISMA } from '@/database/database.module';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      referringDoctor: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(DoctorsService);
  });

  it('creates referring doctor when code is available', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue(null);
    prisma.referringDoctor.create.mockResolvedValue({
      id: 'doctor-1',
      code: 'DR-001',
      name: 'Dr. Sharma',
      commissionPct: 10,
    });

    const result = await service.createDoctor(ctx, {
      code: 'DR-001',
      name: 'Dr. Sharma',
      commissionPct: 10,
    });

    expect(result.code).toBe('DR-001');
    expect(prisma.referringDoctor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: ctx.tenantId,
          code: 'DR-001',
          commissionPct: 10,
        }),
      }),
    );
  });

  it('throws ConflictException when doctor code exists', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.createDoctor(ctx, { code: 'DR-001', name: 'Dr. Sharma' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when doctor is missing', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue(null);

    await expect(service.getDoctor(ctx, 'missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
