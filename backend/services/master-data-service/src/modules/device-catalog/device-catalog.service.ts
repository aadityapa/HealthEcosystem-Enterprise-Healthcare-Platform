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
export class DeviceCatalogService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly events: MasterEventsService,
  ) {}

  async create(
    ctx: MasterRequestContext,
    dto: {
      code: string;
      name: string;
      vendor: string;
      model?: string;
      deviceType: string;
      protocol?: string;
    },
  ) {
    const existing = await this.prisma.deviceCatalog.findFirst({
      where: { tenantId: ctx.tenantId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Device catalog code "${dto.code}" already exists`);
    }

    const catalog = await this.prisma.deviceCatalog.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        vendor: dto.vendor,
        model: dto.model,
        deviceType: dto.deviceType,
        protocol: dto.protocol,
      },
    });

    await this.events.publishUpdated(ctx, 'DeviceCatalog', catalog.id, 'created', {
      code: catalog.code,
    });

    return catalog;
  }

  async get(ctx: MasterRequestContext, catalogId: string) {
    const catalog = await this.prisma.deviceCatalog.findFirst({
      where: { id: catalogId, tenantId: ctx.tenantId },
    });
    if (!catalog) throw new NotFoundException('Device catalog entry not found');
    return catalog;
  }

  async list(
    ctx: MasterRequestContext,
    filters: {
      vendor?: string;
      deviceType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.DeviceCatalogWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.vendor && { vendor: filters.vendor }),
      ...(filters.deviceType && { deviceType: filters.deviceType }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.deviceCatalog.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.deviceCatalog.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async update(
    ctx: MasterRequestContext,
    catalogId: string,
    dto: {
      name?: string;
      vendor?: string;
      model?: string;
      deviceType?: string;
      protocol?: string;
      isActive?: boolean;
    },
  ) {
    await this.get(ctx, catalogId);

    const catalog = await this.prisma.deviceCatalog.update({
      where: { id: catalogId, tenantId: ctx.tenantId },
      data: dto,
    });

    await this.events.publishUpdated(ctx, 'DeviceCatalog', catalog.id, 'updated');

    return catalog;
  }
}
