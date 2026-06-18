import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TestsService } from './tests.service';
import { PRISMA } from '@/database/database.module';
import { CacheService } from '@/common/services/cache.service';
import { MasterEventsService } from '@/common/services/master-events.service';

describe('TestsService', () => {
  let service: TestsService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let cache: { get: jest.Mock; set: jest.Mock; delByPrefix: jest.Mock };
  let events: { publishUpdated: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      testCategory: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      testMaster: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      testParameter: {
        create: jest.fn(),
      },
      testPricing: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    cache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delByPrefix: jest.fn(),
    };

    events = {
      publishUpdated: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsService,
        { provide: PRISMA, useValue: prisma },
        { provide: CacheService, useValue: cache },
        { provide: MasterEventsService, useValue: events },
      ],
    }).compile();

    service = module.get<TestsService>(TestsService);
  });

  describe('createCategory', () => {
    it('creates category when code is available', async () => {
      prisma.testCategory.findFirst.mockResolvedValue(null);
      prisma.testCategory.create.mockResolvedValue({
        id: 'cat-1',
        code: 'HEM',
        name: 'Hematology',
      });

      const result = await service.createCategory(ctx, { code: 'HEM', name: 'Hematology' });

      expect(result.code).toBe('HEM');
      expect(events.publishUpdated).toHaveBeenCalledWith(
        ctx,
        'TestCategory',
        'cat-1',
        'created',
        expect.any(Object),
      );
    });

    it('throws ConflictException when code exists', async () => {
      prisma.testCategory.findFirst.mockResolvedValue({ id: 'cat-1' });

      await expect(
        service.createCategory(ctx, { code: 'HEM', name: 'Hematology' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createTest', () => {
    it('creates test when code is available', async () => {
      prisma.testMaster.findFirst.mockResolvedValue(null);
      prisma.testCategory.findFirst.mockResolvedValue({ id: 'cat-1' });
      prisma.testMaster.create.mockResolvedValue({
        id: 'test-1',
        code: 'CBC',
        name: 'Complete Blood Count',
      });

      const result = await service.createTest(ctx, {
        categoryId: 'cat-1',
        code: 'CBC',
        name: 'Complete Blood Count',
        specimenType: 'blood',
      });

      expect(result.code).toBe('CBC');
      expect(cache.delByPrefix).toHaveBeenCalled();
    });

    it('throws ConflictException when test code exists', async () => {
      prisma.testMaster.findFirst.mockResolvedValue({ id: 'test-1' });

      await expect(
        service.createTest(ctx, {
          categoryId: 'cat-1',
          code: 'CBC',
          name: 'Complete Blood Count',
          specimenType: 'blood',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('listTests', () => {
    it('returns cached result when available', async () => {
      const cached = { items: [{ id: 'test-1' }], meta: { total: 1 } };
      cache.get.mockResolvedValue(cached);

      const result = await service.listTests(ctx, {});

      expect(result).toEqual(cached);
      expect(prisma.testMaster.findMany).not.toHaveBeenCalled();
    });

    it('queries database and caches result on cache miss', async () => {
      prisma.testMaster.findMany.mockResolvedValue([{ id: 'test-1', name: 'CBC' }]);
      prisma.testMaster.count.mockResolvedValue(1);

      const result = await service.listTests(ctx, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(cache.set).toHaveBeenCalled();
    });
  });

  describe('getTest', () => {
    it('throws NotFoundException when test is missing', async () => {
      prisma.testMaster.findFirst.mockResolvedValue(null);

      await expect(service.getTest(ctx, 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
