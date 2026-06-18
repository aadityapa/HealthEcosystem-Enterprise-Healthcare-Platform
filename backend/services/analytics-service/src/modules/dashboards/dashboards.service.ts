import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ListDashboardsQueryDto } from '@/common/dto/analytics-query.dto';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
} from './dto/dashboards.dto';

@Injectable()
export class DashboardsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext, query: ListDashboardsQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      ...(query.dashboardType && { dashboardType: query.dashboardType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.dashboardConfig.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dashboardConfig.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const dashboard = await this.prisma.dashboardConfig.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async create(ctx: ServiceRequestContext, dto: CreateDashboardDto) {
    if (dto.isDefault) {
      await this.prisma.dashboardConfig.updateMany({
        where: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          dashboardType: dto.dashboardType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.dashboardConfig.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        name: dto.name,
        dashboardType: dto.dashboardType,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        supersetId: dto.supersetId,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateDashboardDto) {
    await this.getById(ctx, id);

    if (dto.isDefault) {
      const existing = await this.prisma.dashboardConfig.findUnique({ where: { id } });
      if (existing) {
        await this.prisma.dashboardConfig.updateMany({
          where: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            dashboardType: existing.dashboardType,
            isDefault: true,
            id: { not: id },
          },
          data: { isDefault: false },
        });
      }
    }

    return this.prisma.dashboardConfig.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.config !== undefined && { config: dto.config as Prisma.InputJsonValue }),
        ...(dto.supersetId !== undefined && { supersetId: dto.supersetId }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.dashboardConfig.delete({ where: { id } });
    return { deleted: true };
  }
}
