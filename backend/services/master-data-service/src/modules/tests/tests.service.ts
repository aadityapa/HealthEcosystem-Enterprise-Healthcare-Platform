import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { MasterRequestContext } from '@/common/context/master-context';
import { CacheService } from '@/common/services/cache.service';
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class TestsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly cache: CacheService,
    private readonly events: MasterEventsService,
  ) {}

  private testsCacheKey(tenantId: string, filters: Record<string, unknown>): string {
    return `master:tests:${tenantId}:${JSON.stringify(filters)}`;
  }

  private async invalidateTestsCache(tenantId: string): Promise<void> {
    await this.cache.delByPrefix(`master:tests:${tenantId}:`);
  }

  async createCategory(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      parentId?: string;
      sortOrder?: number;
    },
  ) {
    const existing = await this.prisma.testCategory.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Category code "${dto.code}" already exists`);
    }

    const category = await this.prisma.testCategory.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.invalidateTestsCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TestCategory', category.id, 'created', {
      code: category.code,
    });

    return category;
  }

  async updateCategory(
    ctx: MasterRequestContext,
    categoryId: string,
    dto: {
      name?: string;
      parentId?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    await this.getCategoryOrThrow(ctx, categoryId);

    const category = await this.prisma.testCategory.update({
      where: { id: categoryId, tenantId: ctx.tenantId },
      data: dto,
    });

    await this.invalidateTestsCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TestCategory', category.id, 'updated');

    return category;
  }

  listCategories(ctx: MasterRequestContext) {
    return this.prisma.testCategory.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createTest(
    ctx: MasterRequestContext,
    dto: {
      categoryId: string;
      code: string;
      name: string;
      shortName?: string;
      specimenType: string;
      containerType?: string;
      tatHours?: number;
      methodology?: Record<string, unknown>;
      referenceRanges?: unknown[];
    },
  ) {
    const existing = await this.prisma.testMaster.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Test code "${dto.code}" already exists`);
    }

    await this.getCategoryOrThrow(ctx, dto.categoryId);

    const test = await this.prisma.testMaster.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        categoryId: dto.categoryId,
        code: dto.code,
        name: dto.name,
        shortName: dto.shortName,
        specimenType: dto.specimenType,
        containerType: dto.containerType,
        tatHours: dto.tatHours ?? 24,
        methodology: (dto.methodology ?? {}) as Prisma.InputJsonValue,
        referenceRanges: (dto.referenceRanges ?? []) as Prisma.InputJsonValue,
      },
      include: { category: true, parameters: true },
    });

    await this.invalidateTestsCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TestMaster', test.id, 'created', {
      code: test.code,
    });

    return test;
  }

  async getTest(ctx: MasterRequestContext, testId: string) {
    const test = await this.prisma.testMaster.findFirst({
      where: { id: testId, tenantId: ctx.tenantId },
      include: {
        category: true,
        parameters: { orderBy: { sortOrder: 'asc' } },
        pricing: true,
      },
    });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async listTests(
    ctx: MasterRequestContext,
    filters: {
      categoryId?: string;
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const cacheKey = this.testsCacheKey(ctx.tenantId, filters);
    const cached = await this.cache.get<{ items: unknown[]; meta: unknown }>(cacheKey);
    if (cached) return cached;

    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.TestMasterWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.testMaster.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.testMaster.count({ where }),
    ]);

    const result = { items, meta: paginationMeta(total, page, limit) };
    await this.cache.set(cacheKey, result);
    return result;
  }

  async updateTest(
    ctx: MasterRequestContext,
    testId: string,
    dto: {
      categoryId?: string;
      name?: string;
      shortName?: string;
      specimenType?: string;
      containerType?: string;
      tatHours?: number;
      methodology?: Record<string, unknown>;
      referenceRanges?: unknown[];
      isActive?: boolean;
    },
  ) {
    await this.getTestOrThrow(ctx, testId);

    if (dto.categoryId) {
      await this.getCategoryOrThrow(ctx, dto.categoryId);
    }

    const test = await this.prisma.testMaster.update({
      where: { id: testId, tenantId: ctx.tenantId },
      data: dto as Prisma.TestMasterUpdateInput,
      include: { category: true, parameters: true },
    });

    await this.invalidateTestsCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TestMaster', test.id, 'updated');

    return test;
  }

  async addParameter(
    ctx: MasterRequestContext,
    testId: string,
    dto: {
      code: string;
      name: string;
      unit?: string;
      dataType?: string;
      decimalPlaces?: number;
      sortOrder?: number;
    },
  ) {
    await this.getTestOrThrow(ctx, testId);

    const parameter = await this.prisma.testParameter.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        testId,
        code: dto.code,
        name: dto.name,
        unit: dto.unit,
        dataType: dto.dataType ?? 'numeric',
        decimalPlaces: dto.decimalPlaces,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.invalidateTestsCache(ctx.tenantId);
    await this.events.publishUpdated(ctx, 'TestParameter', parameter.id, 'created', {
      testId,
    });

    return parameter;
  }

  async createPricing(
    ctx: MasterRequestContext,
    dto: {
      testId: string;
      branchId?: string;
      basePrice: number;
      mrp?: number;
      corporatePrice?: number;
    },
  ) {
    await this.getTestOrThrow(ctx, dto.testId);

    const pricing = await this.prisma.testPricing.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: dto.branchId ?? ctx.branchId,
        testId: dto.testId,
        basePrice: dto.basePrice,
        mrp: dto.mrp,
        corporatePrice: dto.corporatePrice,
      },
      include: { test: true },
    });

    await this.events.publishUpdated(ctx, 'TestPricing', pricing.id, 'created', {
      testId: dto.testId,
    });

    return pricing;
  }

  listPricing(
    ctx: MasterRequestContext,
    filters: { branchId?: string; testId?: string },
  ) {
    return this.prisma.testPricing.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(filters.branchId && { branchId: filters.branchId }),
        ...(filters.testId && { testId: filters.testId }),
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      include: { test: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async updatePricing(
    ctx: MasterRequestContext,
    pricingId: string,
    dto: { basePrice?: number; mrp?: number; corporatePrice?: number },
  ) {
    const pricing = await this.prisma.testPricing.findFirst({
      where: { id: pricingId, tenantId: ctx.tenantId },
    });
    if (!pricing) throw new NotFoundException('Pricing not found');

    const updated = await this.prisma.testPricing.update({
      where: { id: pricingId },
      data: dto,
      include: { test: true },
    });

    await this.events.publishUpdated(ctx, 'TestPricing', updated.id, 'updated');

    return updated;
  }

  private async getCategoryOrThrow(ctx: MasterRequestContext, categoryId: string) {
    const category = await this.prisma.testCategory.findFirst({
      where: { id: categoryId, tenantId: ctx.tenantId },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  private async getTestOrThrow(ctx: MasterRequestContext, testId: string) {
    const test = await this.prisma.testMaster.findFirst({
      where: { id: testId, tenantId: ctx.tenantId },
    });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }
}
