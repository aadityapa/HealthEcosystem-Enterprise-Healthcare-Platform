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
import { MasterEventsService } from '@/common/services/master-events.service';

@Injectable()
export class PackagesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async createPackage(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      description?: string;
      packagePrice: number;
      testIds: string[];
    },
  ) {
    const existing = await this.prisma.packageMaster.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Package code "${dto.code}" already exists`);
    }

    const pkg = await this.prisma.$transaction(async (tx) => {
      const created = await tx.packageMaster.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          packagePrice: dto.packagePrice,
        },
      });

      if (dto.testIds.length > 0) {
        await tx.packageTest.createMany({
          data: dto.testIds.map((testId) => ({
            packageId: created.id,
            testId,
          })),
        });
      }

      return tx.packageMaster.findUniqueOrThrow({
        where: { id: created.id },
        include: { tests: { include: { test: true } } },
      });
    });

    await this.events.publishUpdated(ctx, 'PackageMaster', pkg.id, 'created', {
      code: pkg.code,
    });

    return pkg;
  }

  async getPackage(ctx: MasterRequestContext, packageId: string) {
    const pkg = await this.prisma.packageMaster.findFirst({
      where: { id: packageId, tenantId: ctx.tenantId },
      include: { tests: { include: { test: true } } },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async listPackages(
    ctx: MasterRequestContext,
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

  async updatePackage(
    ctx: MasterRequestContext,
    packageId: string,
    dto: {
      name?: string;
      description?: string;
      packagePrice?: number;
      testIds?: string[];
      isActive?: boolean;
    },
  ) {
    await this.getPackage(ctx, packageId);

    const pkg = await this.prisma.$transaction(async (tx) => {
      const { testIds, ...data } = dto;
      await tx.packageMaster.update({
        where: { id: packageId, tenantId: ctx.tenantId },
        data,
      });

      if (testIds) {
        await tx.packageTest.deleteMany({ where: { packageId } });
        if (testIds.length > 0) {
          await tx.packageTest.createMany({
            data: testIds.map((testId) => ({ packageId, testId })),
          });
        }
      }

      return tx.packageMaster.findUniqueOrThrow({
        where: { id: packageId },
        include: { tests: { include: { test: true } } },
      });
    });

    await this.events.publishUpdated(ctx, 'PackageMaster', pkg.id, 'updated');

    return pkg;
  }
}
