import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { PRISMA } from '@/database/database.module';

describe('ReferralsService', () => {
  let service: ReferralsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      referringDoctor: { findFirst: jest.fn() },
      doctorReferral: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(ReferralsService);
  });

  it('creates referral with commission from doctor commissionPct', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue({
      id: 'doctor-1',
      commissionPct: 10,
      isActive: true,
    });
    prisma.doctorReferral.create.mockResolvedValue({
      id: 'ref-1',
      referralNumber: 'REF000001',
      orderAmount: 1500,
      commissionAmount: 150,
    });

    const result = await service.createReferral(ctx, {
      doctorId: 'doctor-1',
      orderAmount: 1500,
    });

    expect(result.commissionAmount).toBe(150);
    expect(prisma.doctorReferral.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          doctorId: 'doctor-1',
          orderAmount: 1500,
          commissionAmount: 150,
          referralNumber: 'REF000001',
        }),
      }),
    );
  });

  it('throws NotFoundException when doctor is missing', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue(null);

    await expect(
      service.createReferral(ctx, {
        doctorId: 'doctor-1',
        orderAmount: 1000,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects zero order amount', async () => {
    prisma.referringDoctor.findFirst.mockResolvedValue({
      id: 'doctor-1',
      commissionPct: 10,
      isActive: true,
    });

    await expect(
      service.createReferral(ctx, {
        doctorId: 'doctor-1',
        orderAmount: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
