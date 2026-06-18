import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ListHealthSnapshotsQueryDto } from './dto/health.dto';

@Injectable()
export class HealthService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async listSnapshots(
    ctx: ServiceRequestContext,
    query: ListHealthSnapshotsQueryDto,
  ) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {
      ...(query.serviceName && { serviceName: query.serviceName }),
      ...(ctx.tenantId && { tenantId: ctx.tenantId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.serviceHealthSnapshot.findMany({
        where,
        skip,
        take,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.serviceHealthSnapshot.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
