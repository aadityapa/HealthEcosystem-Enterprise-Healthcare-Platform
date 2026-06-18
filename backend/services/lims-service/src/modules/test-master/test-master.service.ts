import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { PrismaClient } from '@health/db';
import type { LimsRequestContext } from '@/common/context/lims-context';

@Injectable()
export class TestMasterService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  createCategory(ctx: LimsRequestContext, dto: {
    code: string;
    name: string;
    parentId?: string;
    sortOrder?: number;
  }) {
    return this.prisma.testCategory.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  updateCategory(ctx: LimsRequestContext, categoryId: string, dto: {
    name?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.testCategory.update({
      where: { id: categoryId, tenantId: ctx.tenantId },
      data: dto,
    });
  }

  listCategories(ctx: LimsRequestContext) {
    return this.prisma.testCategory.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  createTest(ctx: LimsRequestContext, dto: {
    categoryId: string;
    code: string;
    name: string;
    shortName?: string;
    specimenType: string;
    containerType?: string;
    tatHours?: number;
    methodology?: Record<string, unknown>;
    referenceRanges?: unknown[];
  }) {
    return this.prisma.testMaster.create({
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
  }

  async getTest(ctx: LimsRequestContext, testId: string) {
    const test = await this.prisma.testMaster.findFirst({
      where: { id: testId, tenantId: ctx.tenantId },
      include: { category: true, parameters: { orderBy: { sortOrder: 'asc' } }, pricing: true },
    });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async listTests(
    ctx: LimsRequestContext,
    filters: { categoryId?: string; search?: string; isActive?: boolean; page?: number; limit?: number },
  ) {
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

    return { items, meta: paginationMeta(total, page, limit) };
  }

  updateTest(ctx: LimsRequestContext, testId: string, dto: {
    categoryId?: string;
    name?: string;
    shortName?: string;
    specimenType?: string;
    containerType?: string;
    tatHours?: number;
    methodology?: Record<string, unknown>;
    referenceRanges?: unknown[];
    isActive?: boolean;
  }) {
    return this.prisma.testMaster.update({
      where: { id: testId, tenantId: ctx.tenantId },
      data: dto as Prisma.TestMasterUpdateInput,
      include: { category: true, parameters: true },
    });
  }

  addParameter(ctx: LimsRequestContext, testId: string, dto: {
    code: string;
    name: string;
    unit?: string;
    dataType?: string;
    decimalPlaces?: number;
    sortOrder?: number;
  }) {
    return this.prisma.testParameter.create({
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
  }

  createPackage(ctx: LimsRequestContext, dto: {
    code: string;
    name: string;
    description?: string;
    packagePrice: number;
    testIds: string[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.packageMaster.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          packagePrice: dto.packagePrice,
        },
      });

      await tx.packageTest.createMany({
        data: dto.testIds.map((testId) => ({
          packageId: pkg.id,
          testId,
        })),
      });

      return tx.packageMaster.findUniqueOrThrow({
        where: { id: pkg.id },
        include: { tests: { include: { test: true } } },
      });
    });
  }

  async getPackage(ctx: LimsRequestContext, packageId: string) {
    const pkg = await this.prisma.packageMaster.findFirst({
      where: { id: packageId, tenantId: ctx.tenantId },
      include: { tests: { include: { test: true } } },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async listPackages(
    ctx: LimsRequestContext,
    filters: { isActive?: boolean; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.PackageMasterWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.packageMaster.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { tests: { include: { test: true } } },
      }),
      this.prisma.packageMaster.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  updatePackage(ctx: LimsRequestContext, packageId: string, dto: {
    name?: string;
    description?: string;
    packagePrice?: number;
    testIds?: string[];
    isActive?: boolean;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const { testIds, ...data } = dto;
      await tx.packageMaster.update({
        where: { id: packageId, tenantId: ctx.tenantId },
        data,
      });

      if (testIds) {
        await tx.packageTest.deleteMany({ where: { packageId } });
        await tx.packageTest.createMany({
          data: testIds.map((testId) => ({ packageId, testId })),
        });
      }

      return tx.packageMaster.findUniqueOrThrow({
        where: { id: packageId },
        include: { tests: { include: { test: true } } },
      });
    });
  }

  createPricing(ctx: LimsRequestContext, dto: {
    testId: string;
    branchId?: string;
    basePrice: number;
    mrp?: number;
    corporatePrice?: number;
  }) {
    return this.prisma.testPricing.create({
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
  }

  listPricing(ctx: LimsRequestContext, filters: { branchId?: string; testId?: string }) {
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

  updatePricing(ctx: LimsRequestContext, pricingId: string, dto: {
    basePrice?: number;
    mrp?: number;
    corporatePrice?: number;
  }) {
    return this.prisma.testPricing.update({
      where: { id: pricingId, tenantId: ctx.tenantId },
      data: dto,
      include: { test: true },
    });
  }
}
