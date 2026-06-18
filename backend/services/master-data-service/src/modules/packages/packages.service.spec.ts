import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PRISMA } from '@/database/database.module';
import { MasterEventsService } from '@/common/services/master-events.service';

describe('PackagesService', () => {
  let service: PackagesService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      packageMaster: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      packageTest: {
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    (prisma as Record<string, unknown>).$transaction = jest.fn(
      (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        { provide: PRISMA, useValue: prisma },
        {
          provide: MasterEventsService,
          useValue: { publishUpdated: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
  });

  it('creates package when code is available', async () => {
    prisma.packageMaster.findFirst.mockResolvedValue(null);
    prisma.packageMaster.create.mockResolvedValue({
      id: 'pkg-1',
      code: 'HEALTH-CHECK',
      name: 'Basic Health Check',
    });
    prisma.packageMaster.findUniqueOrThrow.mockResolvedValue({
      id: 'pkg-1',
      code: 'HEALTH-CHECK',
      tests: [],
    });

    const result = await service.createPackage(ctx, {
      code: 'HEALTH-CHECK',
      name: 'Basic Health Check',
      packagePrice: 999,
      testIds: [],
    });

    expect(result.code).toBe('HEALTH-CHECK');
  });

  it('throws ConflictException when package code exists', async () => {
    prisma.packageMaster.findFirst.mockResolvedValue({ id: 'pkg-1' });

    await expect(
      service.createPackage(ctx, {
        code: 'HEALTH-CHECK',
        name: 'Basic Health Check',
        packagePrice: 999,
        testIds: [],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when package is missing', async () => {
    prisma.packageMaster.findFirst.mockResolvedValue(null);

    await expect(service.getPackage(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
