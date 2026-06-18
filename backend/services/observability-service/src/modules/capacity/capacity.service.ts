import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  ListCapacityQueryDto,
  RecordCapacityMetricDto,
} from './dto/capacity.dto';

@Injectable()
export class CapacityService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listMetrics(ctx: ServiceRequestContext, query: ListCapacityQueryDto) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      ...(ctx.tenantId && { tenantId: ctx.tenantId }),
      ...(query.resourceType && { resourceType: query.resourceType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.capacityMetric.findMany({
        where,
        skip,
        take,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.capacityMetric.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async recordMetric(ctx: ServiceRequestContext, dto: RecordCapacityMetricDto) {
    return this.prisma.capacityMetric.create({
      data: {
        tenantId: ctx.tenantId,
        resourceType: dto.resourceType,
        resourceName: dto.resourceName,
        usagePct: dto.usagePct,
        forecastPct: dto.forecastPct,
      },
    });
  }
}
