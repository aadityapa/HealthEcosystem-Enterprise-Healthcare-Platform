import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TaxService } from './tax.service';
import { PRISMA } from '@/database/database.module';
import { CacheService } from '@/common/services/cache.service';
import { MasterEventsService } from '@/common/services/master-events.service';

describe('TaxService', () => {
  let service: TaxService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let cache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      taxMaster: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        { provide: PRISMA, useValue: prisma },
        { provide: CacheService, useValue: cache },
        {
          provide: MasterEventsService,
          useValue: { publishUpdated: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<TaxService>(TaxService);
  });

  it('creates tax when code is available', async () => {
    prisma.taxMaster.findFirst.mockResolvedValue(null);
    prisma.taxMaster.create.mockResolvedValue({
      id: 'tax-1',
      code: 'GST18',
      name: 'GST 18%',
    });

    const result = await service.create(ctx, { code: 'GST18', name: 'GST 18%' });

    expect(result.code).toBe('GST18');
    expect(cache.del).toHaveBeenCalledWith('master:tax:tenant-1');
  });

  it('throws ConflictException when tax code exists', async () => {
    prisma.taxMaster.findFirst.mockResolvedValue({ id: 'tax-1' });

    await expect(
      service.create(ctx, { code: 'GST18', name: 'GST 18%' }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns cached tax list on cache hit', async () => {
    const cached = { items: [{ id: 'tax-1' }], meta: { total: 1 } };
    cache.get.mockResolvedValue(cached);

    const result = await service.list(ctx, {});

    expect(result).toEqual(cached);
    expect(prisma.taxMaster.findMany).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when tax is missing', async () => {
    prisma.taxMaster.findFirst.mockResolvedValue(null);

    await expect(service.get(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
