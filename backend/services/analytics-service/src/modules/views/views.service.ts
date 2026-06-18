import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  CreateMaterializedViewDto,
  RefreshMaterializedViewDto,
} from './dto/views.dto';

@Injectable()
export class ViewsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list(ctx: ServiceRequestContext) {
    return this.prisma.materializedViewMeta.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { viewName: 'asc' },
    });
  }

  async register(ctx: ServiceRequestContext, dto: CreateMaterializedViewDto) {
    const existing = await this.prisma.materializedViewMeta.findUnique({
      where: {
        tenantId_viewName: {
          tenantId: ctx.tenantId,
          viewName: dto.viewName,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Materialized view "${dto.viewName}" already registered`);
    }

    return this.prisma.materializedViewMeta.create({
      data: {
        tenantId: ctx.tenantId,
        viewName: dto.viewName,
        sourceSchema: dto.sourceSchema,
        refreshCron: dto.refreshCron,
        clickhouseTable: dto.clickhouseTable,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async refresh(ctx: ServiceRequestContext, dto: RefreshMaterializedViewDto) {
    const view = await this.prisma.materializedViewMeta.findUnique({
      where: {
        tenantId_viewName: {
          tenantId: ctx.tenantId,
          viewName: dto.viewName,
        },
      },
    });
    if (!view) {
      throw new NotFoundException(`Materialized view "${dto.viewName}" not found`);
    }

    return this.prisma.materializedViewMeta.update({
      where: { id: view.id },
      data: {
        lastRefreshedAt: new Date(),
        rowCount: view.rowCount ?? BigInt(0),
      },
    });
  }
}
