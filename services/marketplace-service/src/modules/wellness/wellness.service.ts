import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateWellnessPackageDto, UpdateWellnessPackageDto } from './dto/wellness.dto';

@Injectable()
export class WellnessService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateWellnessPackageDto) {
    const existing = await this.prisma.wellnessPackage.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) throw new ConflictException('Wellness package code already exists');

    return this.prisma.wellnessPackage.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        testIds: (dto.testIds ?? []) as Prisma.InputJsonValue,
        price: dto.price,
        corporatePrice: dto.corporatePrice,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const where = { tenantId: ctx.tenantId, isActive: true };

    const [items, total] = await Promise.all([
      this.prisma.wellnessPackage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wellnessPackage.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const pkg = await this.prisma.wellnessPackage.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!pkg) throw new NotFoundException('Wellness package not found');
    return pkg;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateWellnessPackageDto) {
    await this.getById(ctx, id);
    return this.prisma.wellnessPackage.update({
      where: { id },
      data: {
        ...dto,
        testIds: dto.testIds as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.wellnessPackage.delete({ where: { id } });
    return { deleted: true };
  }
}
