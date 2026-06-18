import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateQcMaterialDto,
  ListMaterialsQueryDto,
  UpdateQcMaterialDto,
} from './dto/materials.dto';

@Injectable()
export class MaterialsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateQcMaterialDto) {
    return this.prisma.qcMaterial.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        analyte: dto.analyte,
        level: dto.level,
        targetMean: dto.targetMean,
        targetSd: dto.targetSd,
        unit: dto.unit,
        lotNumber: dto.lotNumber,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListMaterialsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.analyte ? { analyte: filters.analyte } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.qcMaterial.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.qcMaterial.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const material = await this.prisma.qcMaterial.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!material) throw new NotFoundException('QC material not found');
    return material;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateQcMaterialDto) {
    await this.getById(ctx, id);
    return this.prisma.qcMaterial.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }
}
