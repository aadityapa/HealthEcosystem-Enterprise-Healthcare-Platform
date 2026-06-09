import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateFeatureDto, UpdateFeatureDto } from './dto/features.dto';

@Injectable()
export class FeaturesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateFeatureDto) {
    return this.prisma.featureToggle.upsert({
      where: {
        tenantId_featureKey: { tenantId: ctx.tenantId, featureKey: dto.featureKey },
      },
      create: {
        tenantId: ctx.tenantId,
        featureKey: dto.featureKey,
        enabled: dto.enabled ?? true,
        config: (dto.config ?? {}) as object,
      },
      update: {
        enabled: dto.enabled ?? true,
        config: (dto.config ?? {}) as object,
      },
    });
  }

  async list(ctx: ServiceRequestContext) {
    const items = await this.prisma.featureToggle.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { featureKey: 'asc' },
    });
    return { items };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const feature = await this.prisma.featureToggle.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!feature) throw new NotFoundException('Feature toggle not found');
    return feature;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateFeatureDto) {
    await this.getById(ctx, id);
    return this.prisma.featureToggle.update({
      where: { id },
      data: {
        featureKey: dto.featureKey,
        enabled: dto.enabled,
        config: dto.config as object | undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.featureToggle.delete({ where: { id } });
    return { deleted: true };
  }
}
