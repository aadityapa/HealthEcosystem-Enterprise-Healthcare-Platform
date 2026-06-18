import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GeographyService } from './geography.service';
import { PRISMA } from '@/database/database.module';
import { MasterEventsService } from '@/common/services/master-events.service';
import { INDIAN_STATES } from './data/indian-states';

describe('GeographyService', () => {
  let service: GeographyService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      stateMaster: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
      cityMaster: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    (prisma as Record<string, unknown>).$transaction = jest.fn(
      (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeographyService,
        { provide: PRISMA, useValue: prisma },
        {
          provide: MasterEventsService,
          useValue: { publishUpdated: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<GeographyService>(GeographyService);
  });

  it('seeds all Indian states', async () => {
    prisma.stateMaster.upsert.mockImplementation(({ create }) => Promise.resolve(create));

    const result = await service.seedIndianStates(ctx);

    expect(result.seeded).toBe(INDIAN_STATES.length);
    expect(prisma.stateMaster.upsert).toHaveBeenCalledTimes(INDIAN_STATES.length);
  });

  it('throws ConflictException when state code exists', async () => {
    prisma.stateMaster.findUnique.mockResolvedValue({ id: 'state-1' });

    await expect(
      service.createState(ctx, { code: 'MH', name: 'Maharashtra' }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws NotFoundException when city is missing', async () => {
    prisma.cityMaster.findUnique.mockResolvedValue(null);

    await expect(service.getCity('missing')).rejects.toThrow(NotFoundException);
  });
});
