import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AbhaStatus } from '@health/db';
import { AbhaService } from './abha.service';
import { PRISMA } from '@/database/database.module';

describe('AbhaService', () => {
  let service: AbhaService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      abhaProfile: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AbhaService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get<AbhaService>(AbhaService);
  });

  it('links ABHA to patient', async () => {
    prisma.abhaProfile.findFirst.mockResolvedValue(null);
    prisma.abhaProfile.create.mockResolvedValue({
      id: 'abha-1',
      abhaNumber: '12-3456-7890-1234',
      status: AbhaStatus.PENDING,
    });

    const result = await service.link(ctx, {
      patientId: 'pat-1',
      abhaNumber: '12-3456-7890-1234',
    });

    expect(result.status).toBe(AbhaStatus.PENDING);
  });

  it('throws ConflictException when patient already linked', async () => {
    prisma.abhaProfile.findFirst.mockResolvedValue({ id: 'abha-1' });

    await expect(
      service.link(ctx, { patientId: 'pat-1', abhaNumber: '12-3456-7890-1234' }),
    ).rejects.toThrow(ConflictException);
  });

  it('verifies ABHA profile', async () => {
    prisma.abhaProfile.findFirst.mockResolvedValue({
      id: 'abha-1',
      status: AbhaStatus.PENDING,
    });
    prisma.abhaProfile.update.mockResolvedValue({
      id: 'abha-1',
      status: AbhaStatus.VERIFIED,
    });

    const result = await service.verify(ctx, 'abha-1', { kycMethod: 'AADHAAR_OTP' });

    expect(result.status).toBe(AbhaStatus.VERIFIED);
  });

  it('throws NotFoundException when profile is missing', async () => {
    prisma.abhaProfile.findFirst.mockResolvedValue(null);

    await expect(service.get(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
