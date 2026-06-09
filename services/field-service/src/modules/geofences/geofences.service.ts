import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateGeoFenceDto,
  ListGeoFencesDto,
  UpdateGeoFenceDto,
} from './dto/geofences.dto';

@Injectable()
export class GeofencesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateGeoFenceDto) {
    return this.prisma.geoFence.create({
      data: {
        tenantId: ctx.tenantId,
        branchId: ctx.branchId,
        name: dto.name,
        centerLat: dto.centerLat,
        centerLng: dto.centerLng,
        radiusMeters: dto.radiusMeters,
      },
    });
  }

  async get(ctx: ServiceRequestContext, id: string) {
    const fence = await this.prisma.geoFence.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!fence) throw new NotFoundException('Geofence not found');
    return fence;
  }

  async list(ctx: ServiceRequestContext, query: ListGeoFencesDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.geoFence.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.geoFence.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateGeoFenceDto) {
    await this.get(ctx, id);
    return this.prisma.geoFence.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.get(ctx, id);
    await this.prisma.geoFence.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }
}
