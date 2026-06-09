import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CampStatus } from '@health/db';
import { CampsService } from './camps.service';
import { PRISMA } from '@/database/database.module';

describe('CampsService', () => {
  let service: CampsService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let tx: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    tx = {
      campRegistration: { create: jest.fn() },
      camp: { update: jest.fn() },
    };

    prisma = {
      camp: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((fn: (client: typeof tx) => Promise<unknown>) =>
        fn(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CampsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(CampsService);
  });

  it('registers patient and increments camp actualCount', async () => {
    prisma.camp.findFirst.mockResolvedValue({
      id: 'camp-1',
      status: CampStatus.ACTIVE,
    });
    tx.campRegistration.create.mockResolvedValue({
      id: 'reg-1',
      campId: 'camp-1',
      name: 'Ravi Kumar',
    });
    tx.camp.update.mockResolvedValue({ actualCount: 1 });

    const result = await service.registerPatient(ctx, 'camp-1', {
      name: 'Ravi Kumar',
      phone: '9876543210',
    });

    expect(result.name).toBe('Ravi Kumar');
    expect(tx.camp.update).toHaveBeenCalledWith({
      where: { id: 'camp-1' },
      data: { actualCount: { increment: 1 } },
    });
  });

  it('throws when camp is cancelled', async () => {
    prisma.camp.findFirst.mockResolvedValue({
      id: 'camp-1',
      status: CampStatus.CANCELLED,
    });

    await expect(
      service.registerPatient(ctx, 'camp-1', { name: 'Ravi Kumar' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when camp is missing', async () => {
    prisma.camp.findFirst.mockResolvedValue(null);

    await expect(
      service.registerPatient(ctx, 'missing', { name: 'Ravi Kumar' }),
    ).rejects.toThrow(NotFoundException);
  });
});
